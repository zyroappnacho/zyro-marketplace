import React, { useState, useEffect } from 'react';
import MinimalistIcons from './MinimalistIcons';
import CompanyRegistrationWithStripe from './CompanyRegistrationWithStripe';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    SafeAreaView,
    StatusBar as RNStatusBar,
    TextInput,
    Modal,
    FlatList,
    Image,
    Switch,
    Dimensions,
    Platform,
    Animated,
    Easing,
    Linking,
    AppState
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logoutUser, setUser } from '../store/slices/authSlice';
import {
    setCurrentScreen,
    setActiveTab,
    setSelectedCity,
    setSelectedCategory,
    toggleModal,
    setHistoryTab
} from '../store/slices/uiSlice';
import {
    fetchCollaborations,
    setSelectedCollaboration,
    requestCollaboration,
    setCollaborations
} from '../store/slices/collaborationsSlice';
import {
    markNotificationAsRead,
    addNotification
} from '../store/slices/notificationsSlice';
import StorageService from '../services/StorageService';
import CampaignSyncService from '../services/CampaignSyncService';
import CitiesService from '../services/CitiesService';
import CategoriesService, { CATEGORIES_EVENTS } from '../services/CategoriesService';
import EventBusService, { CITIES_EVENTS } from '../services/EventBusService';
import PasswordRecoveryService from '../services/PasswordRecoveryService';
import NotificationManager from './NotificationManager';
import { ChatList, ChatScreen } from './ChatSystem';
import InteractiveMapNew from './InteractiveMapNew';
import CollaborationDetailScreenNew from './CollaborationDetailScreenNew';
import AdminPanel from './AdminPanel';
import UserRequestsManager from './UserRequestsManager';
import CompanyNavigator from './CompanyNavigator';
import CompanyDataScreen from './CompanyDataScreen';
import CompanyDashboardMain from './CompanyDashboardMain';
import CompanyRequests from './CompanyRequests';
import CompanyLocationsScreen from './CompanyLocationsScreen';
import { initializeCompanyTestUser } from '../utils/companyInit';
import { syncFollowersOnLogin, updateFollowersFromPersonalData } from '../sync-followers-on-login';
import { saveCompanyRegistrationData } from '../sync-company-registration-data';

// Admin campaigns will be loaded from storage - no mock data needed

// CITIES array will be loaded dynamically from CitiesService
let CITIES = [
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao',
    'Málaga', 'Zaragoza', 'Murcia', 'Palma', 'Las Palmas'
]; // Default fallback cities

// CATEGORIES array will be loaded dynamically from CategoriesService
let CATEGORIES = [
    'restaurantes', 'movilidad', 'ropa', 'eventos', 'delivery',
    'salud-belleza', 'alojamiento', 'discotecas'
]; // Default fallback categories

const { width, height } = Dimensions.get('window');


// Funciones de Persistencia Permanente de Seguidores
const STORAGE_KEYS = {
    FOLLOWERS_MASTER: 'followers_master_data',
    FOLLOWERS_BACKUP: 'followers_backup_data',
    FOLLOWERS_HISTORY: 'followers_history_data',
    LAST_UPDATE: 'followers_last_update'
};

const saveFollowersPermanently = async (userId, email, followersData) => {
    try {
        console.log(`💾 [PERSISTENCE] Guardando seguidores permanentemente para: ${email}`);

        const timestamp = new Date().toISOString();
        const followersRecord = {
            userId,
            email,
            instagramFollowers: followersData.instagramFollowers,
            tiktokFollowers: followersData.tiktokFollowers || 0,
            instagramUsername: followersData.instagramUsername,
            tiktokUsername: followersData.tiktokUsername || '',
            lastUpdated: timestamp,
            source: 'permanent_persistence_system'
        };

        // Guardar en datos maestros
        const masterData = await StorageService.getData(STORAGE_KEYS.FOLLOWERS_MASTER) || {};
        masterData[userId] = followersRecord;
        await StorageService.saveData(STORAGE_KEYS.FOLLOWERS_MASTER, masterData);

        // Crear backup inmediato
        const backupData = await StorageService.getData(STORAGE_KEYS.FOLLOWERS_BACKUP) || {};
        backupData[userId] = { ...followersRecord, backupTimestamp: timestamp };
        await StorageService.saveData(STORAGE_KEYS.FOLLOWERS_BACKUP, backupData);

        // Sincronizar con todos los almacenamientos
        await syncWithAllStoragesPermanent(userId, followersRecord);

        console.log(`✅ [PERSISTENCE] Seguidores guardados permanentemente: ${followersData.instagramFollowers}`);
        return true;

    } catch (error) {
        console.error(`❌ [PERSISTENCE] Error guardando seguidores para ${email}:`, error);
        return false;
    }
};

const loadFollowersPermanently = async (userId, email) => {
    try {
        console.log(`🔍 [PERSISTENCE] Cargando seguidores permanentes para: ${email}`);

        // Intentar cargar desde datos maestros
        const masterData = await StorageService.getData(STORAGE_KEYS.FOLLOWERS_MASTER) || {};
        let followersData = masterData[userId];

        // Si no existe, intentar desde backup
        if (!followersData) {
            const backupData = await StorageService.getData(STORAGE_KEYS.FOLLOWERS_BACKUP) || {};
            followersData = backupData[userId];
        }

        // Si no existe, intentar desde almacenamientos alternativos
        if (!followersData) {
            followersData = await loadFromAlternativeStoragesPermanent(userId, email);
        }

        if (followersData) {
            console.log(`✅ [PERSISTENCE] Seguidores cargados: ${followersData.instagramFollowers}`);
            return followersData;
        } else {
            console.log(`⚠️ [PERSISTENCE] No se encontraron datos de seguidores para ${email}`);
            return null;
        }

    } catch (error) {
        console.error(`❌ [PERSISTENCE] Error cargando seguidores para ${email}:`, error);
        return null;
    }
};

const syncFollowersOnLoginPermanent = async (user) => {
    try {
        console.log(`🔄 [PERSISTENCE] Sincronizando seguidores al login para: ${user.email}`);

        if (user.role !== 'influencer') {
            return user;
        }

        // Cargar datos permanentes
        const permanentData = await loadFollowersPermanently(user.id, user.email);

        if (permanentData) {
            // Actualizar usuario con datos permanentes
            const updatedUser = {
                ...user,
                instagramFollowers: permanentData.instagramFollowers,
                tiktokFollowers: permanentData.tiktokFollowers,
                instagramUsername: permanentData.instagramUsername,
                tiktokUsername: permanentData.tiktokUsername,
                lastFollowersSync: new Date().toISOString()
            };

            // Guardar datos actualizados
            await saveFollowersPermanently(user.id, user.email, updatedUser);

            console.log(`✅ [PERSISTENCE] Usuario sincronizado con datos permanentes`);
            return updatedUser;
        } else {
            // Si no hay datos permanentes, crear registro inicial
            await saveFollowersPermanently(user.id, user.email, user);
            console.log(`📝 [PERSISTENCE] Registro inicial creado para ${user.email}`);
            return user;
        }

    } catch (error) {
        console.error(`❌ [PERSISTENCE] Error sincronizando al login:`, error);
        return user;
    }
};

const syncWithAllStoragesPermanent = async (userId, data) => {
    try {
        // Actualizar datos de influencer
        await StorageService.saveInfluencerData(data);

        // Actualizar en lista de influencers aprobados
        const approvedInfluencers = await StorageService.getData('approved_influencers') || [];
        const updatedApproved = approvedInfluencers.map(inf => {
            if (inf.id === userId || inf.email === data.email) {
                return {
                    ...inf,
                    instagramFollowers: data.instagramFollowers,
                    tiktokFollowers: data.tiktokFollowers,
                    instagramUsername: data.instagramUsername,
                    tiktokUsername: data.tiktokUsername,
                    lastUpdated: data.lastUpdated
                };
            }
            return inf;
        });
        await StorageService.saveData('approved_influencers', updatedApproved);

        // Actualizar usuario actual si coincide
        const currentUser = await StorageService.getUser();
        if (currentUser && (currentUser.id === userId || currentUser.email === data.email)) {
            const updatedUser = {
                ...currentUser,
                instagramFollowers: data.instagramFollowers,
                tiktokFollowers: data.tiktokFollowers,
                instagramUsername: data.instagramUsername,
                tiktokUsername: data.tiktokUsername,
                lastUpdated: data.lastUpdated
            };
            await StorageService.saveUser(updatedUser);
        }

    } catch (error) {
        console.error(`❌ [PERSISTENCE] Error sincronizando almacenamientos:`, error);
    }
};

const loadFromAlternativeStoragesPermanent = async (userId, email) => {
    try {
        // Intentar desde datos de influencer
        let data = await StorageService.getInfluencerData(userId);
        if (data && data.instagramFollowers) {
            return data;
        }

        // Intentar desde lista de influencers aprobados
        const approvedInfluencers = await StorageService.getData('approved_influencers') || [];
        const approvedUser = approvedInfluencers.find(inf =>
            inf.id === userId || inf.email === email
        );
        if (approvedUser && approvedUser.instagramFollowers) {
            return approvedUser;
        }

        return null;

    } catch (error) {
        console.error(`❌ [PERSISTENCE] Error cargando desde almacenamientos alternativos:`, error);
        return null;
    }
};


const ZyroAppNew = () => {
    // Redux state
    const dispatch = useDispatch();
    const { user: currentUser, isAuthenticated } = useSelector(state => state.auth);
    const {
        currentScreen,
        activeTab,
        selectedCity,
        selectedCategory,
        modals,
        historyTab
    } = useSelector(state => state.ui);
    const { collaborations, selectedCollaboration } = useSelector(state => state.collaborations);
    const { notifications } = useSelector(state => state.notifications);

    // Local state
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        birthDate: '',
        city: '',
        instagramUsername: '',
        tiktokUsername: '',
        instagramFollowers: '',
        tiktokFollowers: '',
        userType: 'influencer',
        acceptTerms: false,
        // Company fields
        companyName: '',
        cifNif: '',
        companyAddress: '',
        companyPhone: '',
        companyEmail: '',
        representativeName: '',
        representativeEmail: '',
        representativePosition: '',
        businessType: '',
        businessDescription: '',
        website: ''
    });
    const [showRegister, setShowRegister] = useState(false);
    const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
    const [showStripeSubscription, setShowStripeSubscription] = useState(false);

    // Dynamic cities state
    const [dynamicCities, setDynamicCities] = useState(CITIES);
    const [citiesUpdateTrigger, setCitiesUpdateTrigger] = useState(0);

    // Dynamic categories state
    const [dynamicCategories, setDynamicCategories] = useState(CATEGORIES);
    const [categoriesUpdateTrigger, setCategoriesUpdateTrigger] = useState(0);
    const [showPaymentScreen, setShowPaymentScreen] = useState(false);
    const [instagramCapturesUploaded, setInstagramCapturesUploaded] = useState(false);
    const [tiktokCapturesUploaded, setTiktokCapturesUploaded] = useState(false);
    const [instagramImages, setInstagramImages] = useState([]);
    const [tiktokImages, setTiktokImages] = useState([]);
    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        bankAccount: '',
        bankCode: '',
        accountHolder: ''
    });
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(height));
    const [rotateAnim] = useState(new Animated.Value(0));

    // Profile editing state
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [profileImageUri, setProfileImageUri] = useState(null);
    const [editProfileForm, setEditProfileForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        birthDate: '',
        city: '',
        instagramUsername: '',
        tiktokUsername: '',
        instagramFollowers: '',
        tiktokFollowers: ''
    });

    // Terms of Service state
    const [termsContent, setTermsContent] = useState('');
    const [isTermsLoading, setIsTermsLoading] = useState(true);

    // Privacy Policy state
    const [privacyContent, setPrivacyContent] = useState('');
    const [isPrivacyLoading, setIsPrivacyLoading] = useState(true);

    // Password Change state
    const [changePasswordForm, setChangePasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Password Recovery state
    const [forgotPasswordForm, setForgotPasswordForm] = useState({
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [recoveryStep, setRecoveryStep] = useState(1); // 1: email, 2: code, 3: new password
    const [isRecovering, setIsRecovering] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');



    // Animation effects
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 20000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            )
        ]).start();
    }, []);

    // Load user data on app start
    useEffect(() => {
        loadUserData();
        loadAdminCampaigns();
        loadDynamicCities();
        loadDynamicCategories();
        console.log('🔄 App initialized - Collaborations from Redux:', collaborations?.length || 0);

        // Initialize company test user
        initializeCompanyTestUser();

        // Set up automatic sync monitoring
        setupAutoSync();

        // Set up cities event listeners for real-time updates
        setupCitiesEventListeners();

        // Set up categories event listeners for real-time updates
        setupCategoriesEventListeners();

        // Cleanup function
        return () => {
            cleanupCitiesEventListeners();
            cleanupCategoriesEventListeners();
        };
    }, []);

    // React to cities updates trigger for immediate UI refresh
    useEffect(() => {
        if (citiesUpdateTrigger > 0) {
            console.log('🔄 [ZyroAppNew] Trigger de actualización de ciudades activado:', citiesUpdateTrigger);
            // Force component to acknowledge the cities change
            // The state change will automatically trigger re-render
        }
    }, [citiesUpdateTrigger]);

    // React to categories updates trigger for immediate UI refresh
    useEffect(() => {
        if (categoriesUpdateTrigger > 0) {
            console.log('🔄 [ZyroAppNew] Trigger de actualización de categorías activado:', categoriesUpdateTrigger);
            // Force component to acknowledge the categories change
            // The state change will automatically trigger re-render
        }
    }, [categoriesUpdateTrigger]);

    // Initialize profile image and data when user changes
    useEffect(() => {
        const initializeUserProfile = async () => {
            // Clear previous user's image first to ensure isolation
            setProfileImageUri(null);

            if (currentUser?.id) {
                console.log(`🔄 Initializing profile for user: ${currentUser.email} (${currentUser.id})`);

                // Load profile image with enhanced recovery
                if (currentUser.profileImage) {
                    setProfileImageUri(currentUser.profileImage);
                    console.log(`✅ Profile image loaded for user: ${currentUser.email}`);
                } else {
                    // Try to load from other sources if not in current user data
                    console.log(`🔍 Profile image not in user data, attempting recovery for: ${currentUser.email}`);
                    await loadProfileImageWithRecovery(currentUser);
                }

                // Special handling for nayades@gmail.com
                if (currentUser.email === 'nayades@gmail.com') {
                    console.log('🔍 nayades@gmail.com profile initialization:', {
                        fullName: currentUser.fullName,
                        instagramFollowers: currentUser.instagramFollowers,
                        profileImage: currentUser.profileImage ? 'PRESENT' : 'MISSING',
                        profileImageUri: profileImageUri ? 'SET' : 'NOT SET'
                    });

                    // Force reload from storage if data seems incomplete
                    if (!currentUser.instagramFollowers || !currentUser.profileImage) {
                        console.log('⚠️ nayades@gmail.com data incomplete, forcing reload...');
                        const influencerData = await StorageService.getInfluencerData(currentUser.id);
                        if (influencerData) {
                            const updatedUser = {
                                ...currentUser,
                                ...influencerData,
                                id: currentUser.id,
                                role: currentUser.role
                            };
                            dispatch(setUser(updatedUser));

                            if (influencerData.profileImage) {
                                setProfileImageUri(influencerData.profileImage);
                            }

                            console.log('✅ nayades@gmail.com data reloaded from influencer storage');
                        }
                    }
                }
            } else {
                console.log(`ℹ️ No user data available`);
            }
        };

        if (currentUser) {
            initializeUserProfile();
        }
    }, [currentUser]);

    // Auto-sync campaigns every 5 seconds to detect admin changes
    useEffect(() => {
        const syncInterval = setInterval(() => {
            if (currentUser && currentUser.role !== 'admin') {
                loadAdminCampaigns();
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(syncInterval);
    }, [currentUser]);

    // Monitor app state changes to sync when app becomes active
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'active' && currentUser && currentUser.role !== 'admin') {
                console.log('📱 App became active - syncing campaigns...');
                loadAdminCampaigns();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [currentUser]);

    // Cargar seguidores permanentes cuando cambia el usuario
    useEffect(() => {
        const loadPermanentFollowers = async () => {
            if (currentUser && currentUser.role === 'influencer') {
                console.log('🔍 Cargando seguidores permanentes para:', currentUser.email);

                const permanentData = await loadFollowersPermanently(currentUser.id, currentUser.email);

                if (permanentData && permanentData.instagramFollowers !== currentUser.instagramFollowers) {
                    console.log('📊 Actualizando con seguidores permanentes:', permanentData.instagramFollowers);

                    const updatedUser = {
                        ...currentUser,
                        instagramFollowers: permanentData.instagramFollowers,
                        tiktokFollowers: permanentData.tiktokFollowers,
                        instagramUsername: permanentData.instagramUsername,
                        tiktokUsername: permanentData.tiktokUsername,
                        lastFollowersSync: new Date().toISOString()
                    };

                    dispatch(setUser(updatedUser));
                }
            }
        };

        if (currentUser) {
            loadPermanentFollowers();
        }
    }, [currentUser?.id, currentUser?.email]);

    // Cargar seguidores permanentes cuando cambia el usuario
    useEffect(() => {
        const loadPermanentFollowers = async () => {
            if (currentUser && currentUser.role === 'influencer') {
                console.log('🔍 Cargando seguidores permanentes para:', currentUser.email);

                const permanentData = await loadFollowersPermanently(currentUser.id, currentUser.email);

                if (permanentData && permanentData.instagramFollowers !== currentUser.instagramFollowers) {
                    console.log('📊 Actualizando con seguidores permanentes:', permanentData.instagramFollowers);

                    const updatedUser = {
                        ...currentUser,
                        instagramFollowers: permanentData.instagramFollowers,
                        tiktokFollowers: permanentData.tiktokFollowers,
                        instagramUsername: permanentData.instagramUsername,
                        tiktokUsername: permanentData.tiktokUsername,
                        lastFollowersSync: new Date().toISOString()
                    };

                    dispatch(setUser(updatedUser));
                }
            }
        };

        if (currentUser) {
            loadPermanentFollowers();
        }
    }, [currentUser?.id, currentUser?.email]);

    // Helper function to check if current screen is a company screen
    const isCompanyScreen = () => {
        return currentScreen === 'company' || 
               currentScreen === 'company-data' || 
               currentScreen === 'company-dashboard-main' || 
               currentScreen === 'company-requests' ||
               currentScreen === 'company-locations';
    };

    const setupAutoSync = () => {
        console.log('🔄 Setting up auto-sync for admin campaigns...');
        // Initial load
        loadAdminCampaigns();
    };

    // Helper function to format follower numbers
    const formatFollowerCount = (count) => {
        if (!count || count === 0) return '0';

        const num = parseInt(count);

        if (num >= 1000000) {
            // For millions: 1,300,000 → "1.3M"
            const millions = num / 1000000;
            return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
        } else if (num >= 1000) {
            // For thousands: 15,000 → "15K"
            const thousands = num / 1000;
            return `${thousands.toFixed(0)}K`;
        } else {
            // For less than 1000: show as is
            return num.toString();
        }
    };

    const loadAdminCampaigns = async () => {
        try {
            console.log('🔄 Loading admin campaigns into Redux...');

            // Get admin campaigns from storage
            const adminCampaigns = await StorageService.getData('admin_campaigns') || [];
            console.log(`📊 Found ${adminCampaigns.length} admin campaigns in storage`);

            // Load only admin campaigns into Redux (no mock campaigns)
            dispatch(setCollaborations(adminCampaigns));
            console.log('✅ Admin campaigns loaded into Redux successfully');

            // Log campaign details for debugging
            if (adminCampaigns.length > 0) {
                console.log('📋 Admin campaigns loaded:');
                adminCampaigns.forEach(campaign => {
                    console.log(`  - ${campaign.title} (${campaign.business}) - ${campaign.city}`);
                });
            } else {
                console.log('📋 No admin campaigns found - empty state will be shown');
            }
        } catch (error) {
            console.error('❌ Error loading admin campaigns into Redux:', error);
            // Set empty array on error
            dispatch(setCollaborations([]));
        }
    };

    const loadUserData = async () => {
        try {
            console.log('🔄 Loading user data with enhanced persistence...');

            const userData = await StorageService.getUser();
            if (userData) {
                console.log(`👤 Loading profile for user: ${userData.fullName} (${userData.id})`);

                // Load complete profile data for influencers
                let completeUserData = userData;

                if (userData.role === 'influencer') {
                    const influencerData = await StorageService.getInfluencerData(userData.id);

                    if (influencerData && influencerData.id === userData.id) {
                        // Merge influencer data with user data, prioritizing more recent data
                        const userLastUpdated = new Date(userData.lastUpdated || 0);
                        const influencerLastUpdated = new Date(influencerData.lastUpdated || 0);

                        if (influencerLastUpdated >= userLastUpdated) {
                            // Influencer data is more recent, use it as primary source
                            completeUserData = {
                                ...userData,
                                ...influencerData,
                                // Ensure critical user fields are preserved
                                id: userData.id,
                                role: userData.role,
                                // Use most recent data for each field
                                fullName: influencerData.fullName || userData.fullName,
                                email: influencerData.email || userData.email,
                                phone: influencerData.phone || userData.phone,
                                city: influencerData.city || userData.city,
                                instagramUsername: influencerData.instagramUsername || userData.instagramUsername,
                                instagramFollowers: influencerData.instagramFollowers || userData.instagramFollowers,
                                profileImage: influencerData.profileImage || userData.profileImage
                            };

                            console.log('✅ Merged with influencer data (more recent)');
                        } else {
                            // User data is more recent, merge influencer data into it
                            completeUserData = {
                                ...influencerData,
                                ...userData,
                                // Preserve additional influencer fields
                                phone: influencerData.phone || userData.phone,
                                city: influencerData.city || userData.city,
                                tiktokUsername: influencerData.tiktokUsername,
                                tiktokFollowers: influencerData.tiktokFollowers
                            };

                            console.log('✅ Merged with user data (more recent)');
                        }
                    }
                }

                // Try to recover from backup if main data seems incomplete
                if (!completeUserData.fullName || !completeUserData.instagramUsername) {
                    console.log('⚠️ Main data incomplete, trying backup recovery...');

                    const backupUserData = await StorageService.getData(`user_backup_${userData.id}`);
                    const backupInfluencerData = await StorageService.getData(`influencer_backup_${userData.id}`);

                    if (backupInfluencerData && backupInfluencerData.fullName) {
                        completeUserData = {
                            ...completeUserData,
                            ...backupInfluencerData,
                            id: userData.id, // Ensure ID is preserved
                            role: userData.role // Ensure role is preserved
                        };
                        console.log('✅ Recovered data from backup');

                        // Save recovered data back to main storage
                        await StorageService.saveUser(completeUserData);
                        if (userData.role === 'influencer') {
                            await StorageService.saveInfluencerData(completeUserData);
                        }
                    }
                }

                // Sincronizar seguidores automáticamente al iniciar sesión
                // Sincronizar seguidores con sistema de persistencia permanente
                const userWithPermanentFollowers = await syncFollowersOnLoginPermanent(completeUserData);

                // Update Redux state with complete data including permanent followers
                dispatch(setUser(userWithPermanentFollowers));

                // Set currentScreen based on user role
                if (completeUserData.role === 'company') {
                    dispatch(setCurrentScreen('company'));
                    console.log('🏢 Setting screen to company dashboard');
                } else if (completeUserData.role === 'admin') {
                    dispatch(setCurrentScreen('admin'));
                    console.log('👨‍💼 Setting screen to admin panel');
                } else {
                    dispatch(setCurrentScreen('main'));
                    console.log('👤 Setting screen to main (influencer)');
                }

                // Load profile image with enhanced recovery and force update
                await loadProfileImageWithRecovery(completeUserData);

                // Force update of profile image URI to ensure it displays correctly
                if (completeUserData.profileImage) {
                    setProfileImageUri(completeUserData.profileImage);
                    console.log('🖼️ Profile image URI updated for display');
                }

                console.log('✅ User data loaded successfully:', {
                    name: completeUserData.fullName,
                    email: completeUserData.email,
                    instagram: completeUserData.instagramUsername,
                    followers: completeUserData.instagramFollowers,
                    hasProfileImage: !!completeUserData.profileImage,
                    profileImageSet: !!profileImageUri,
                    lastUpdated: completeUserData.lastUpdated
                });

                // Additional verification for specific user
                if (completeUserData.email === 'nayades@gmail.com') {
                    console.log('🔍 Special verification for nayades@gmail.com:', {
                        fullName: completeUserData.fullName,
                        instagramFollowers: completeUserData.instagramFollowers,
                        profileImage: completeUserData.profileImage ? 'PRESENT' : 'MISSING',
                        profileImageUri: profileImageUri ? 'SET' : 'NOT SET'
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error loading user data:', error);
        }
    };

    const loadProfileImageWithRecovery = async (userData) => {
        try {
            let profileImageLoaded = false;

            // Ensure we have a valid user ID
            if (!userData.id) {
                console.warn('⚠️ No user ID found, cannot load profile image');
                setProfileImageUri(null);
                return;
            }

            console.log(`🔍 Loading profile image for user: ${userData.email} (${userData.id})`);

            // 1. Try to load from user data first (most reliable source)
            if (userData.profileImage) {
                setProfileImageUri(userData.profileImage);
                console.log(`✅ Profile image loaded from user data for user: ${userData.email}`);
                profileImageLoaded = true;
            }

            // 2. Try to load from influencer data if not found in user data
            if (!profileImageLoaded && userData.role === 'influencer') {
                const influencerData = await StorageService.getInfluencerData(userData.id);
                if (influencerData?.profileImage && influencerData.id === userData.id) {
                    setProfileImageUri(influencerData.profileImage);
                    console.log(`✅ Profile image loaded from influencer data for user: ${userData.email}`);
                    profileImageLoaded = true;

                    // Update user data with found image
                    const updatedUserData = { ...userData, profileImage: influencerData.profileImage };
                    await StorageService.saveUser(updatedUserData);
                    dispatch(setUser(updatedUserData));
                }
            }

            // 3. Try to recover from backup if still not found
            if (!profileImageLoaded) {
                console.log(`🔄 Attempting backup recovery for user: ${userData.email}`);
                const recoveredImage = await recoverProfileImageFromBackup();
                if (recoveredImage) {
                    setProfileImageUri(recoveredImage);

                    // Update user data with recovered image
                    const updatedUserData = { ...userData, profileImage: recoveredImage };
                    await StorageService.saveUser(updatedUserData);
                    dispatch(setUser(updatedUserData));

                    console.log(`✅ Profile image recovered from backup and restored for user: ${userData.email}`);
                    profileImageLoaded = true;
                }
            }

            // 4. Try to search in registered users list as last resort
            if (!profileImageLoaded) {
                console.log(`🔄 Searching in registered users for: ${userData.email}`);
                try {
                    const registeredUsers = await StorageService.getData('registered_users') || [];
                    const userInList = registeredUsers.find(u => u.email === userData.email || u.id === userData.id);

                    if (userInList && userInList.profileImage) {
                        setProfileImageUri(userInList.profileImage);

                        // Update main user data with found image
                        const updatedUserData = { ...userData, profileImage: userInList.profileImage };
                        await StorageService.saveUser(updatedUserData);
                        dispatch(setUser(updatedUserData));

                        console.log(`✅ Profile image found in registered users for: ${userData.email}`);
                        profileImageLoaded = true;
                    }
                } catch (error) {
                    console.warn('⚠️ Could not search registered users:', error);
                }
            }

            // 5. If no image found, ensure state is clean
            if (!profileImageLoaded) {
                setProfileImageUri(null);
                console.log(`ℹ️ No profile image found for user: ${userData.email} - showing default placeholder`);
            }

            // Special logging for nayades@gmail.com
            if (userData.email === 'nayades@gmail.com') {
                console.log('🔍 nayades@gmail.com image loading result:', {
                    imageFound: profileImageLoaded,
                    imageUri: profileImageLoaded ? 'SET' : 'NOT SET',
                    userDataHasImage: !!userData.profileImage
                });
            }
        } catch (error) {
            console.error('❌ Error loading profile image:', error);
            setProfileImageUri(null);
        }
    };

    // Profile editing functions
    const loadProfileData = async () => {
        try {
            if (currentUser && currentUser.role === 'influencer') {
                // Get full influencer data from storage
                const influencerData = await StorageService.getInfluencerData(currentUser.id);
                if (influencerData) {
                    setEditProfileForm({
                        fullName: influencerData.fullName || currentUser.fullName || '',
                        email: influencerData.email || currentUser.email || '',
                        phone: influencerData.phone || '',
                        birthDate: influencerData.birthDate || '',
                        city: influencerData.city || '',
                        instagramUsername: influencerData.instagramUsername || currentUser.instagramUsername || '',
                        tiktokUsername: influencerData.tiktokUsername || '',
                        instagramFollowers: influencerData.instagramFollowers?.toString() || currentUser.instagramFollowers?.toString() || '',
                        tiktokFollowers: influencerData.tiktokFollowers?.toString() || ''
                    });

                    // Load profile image
                    if (influencerData.profileImage || currentUser.profileImage) {
                        setProfileImageUri(influencerData.profileImage || currentUser.profileImage);
                    }
                } else {
                    // Fallback to current user data
                    setEditProfileForm({
                        fullName: currentUser.fullName || '',
                        email: currentUser.email || '',
                        phone: '',
                        birthDate: '',
                        city: '',
                        instagramUsername: currentUser.instagramUsername || '',
                        tiktokUsername: '',
                        instagramFollowers: currentUser.instagramFollowers?.toString() || '',
                        tiktokFollowers: ''
                    });

                    // Load profile image
                    if (currentUser.profileImage) {
                        setProfileImageUri(currentUser.profileImage);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    };

    const handleEditProfile = () => {
        loadProfileData();
        setShowEditProfile(true);
    };

    const handleSaveProfile = async () => {
        try {
            console.log('💾 Saving profile data with enhanced persistence...');

            // Validate required fields
            if (!editProfileForm.fullName || !editProfileForm.email || !editProfileForm.instagramUsername) {
                Alert.alert('Error', 'Por favor completa los campos obligatorios: Nombre, Email e Instagram');
                return;
            }

            // Validate followers count
            const instagramFollowers = parseInt(editProfileForm.instagramFollowers) || 0;
            if (instagramFollowers < 0) {
                Alert.alert('Error', 'El número de seguidores debe ser mayor a 0');
                return;
            }

            // Create updated user data with timestamp
            const updatedUserData = {
                ...currentUser,
                fullName: editProfileForm.fullName,
                email: editProfileForm.email,
                phone: editProfileForm.phone,
                city: editProfileForm.city,
                instagramUsername: editProfileForm.instagramUsername,
                instagramFollowers: instagramFollowers,
                profileImage: profileImageUri || currentUser.profileImage,
                lastUpdated: new Date().toISOString()
            };

            // Create complete influencer data
            const updatedInfluencerData = {
                id: currentUser.id,
                fullName: editProfileForm.fullName,
                email: editProfileForm.email,
                phone: editProfileForm.phone,
                birthDate: editProfileForm.birthDate,
                city: editProfileForm.city,
                instagramUsername: editProfileForm.instagramUsername,
                tiktokUsername: editProfileForm.tiktokUsername,
                instagramFollowers: instagramFollowers,
                tiktokFollowers: parseInt(editProfileForm.tiktokFollowers) || 0,
                profileImage: profileImageUri || currentUser.profileImage,
                role: 'influencer',
                status: 'approved',
                lastUpdated: new Date().toISOString()
            };

            // Enhanced persistence - Save to multiple locations for reliability
            console.log('💾 Saving to primary storage locations...');

            // 1. Save user data (primary location)
            await StorageService.saveUser(updatedUserData);

            // 2. Save influencer data (detailed profile)
            await StorageService.saveInfluencerData(updatedInfluencerData);

            // 3. Create backup copies with user-specific keys
            const backupUserKey = `user_backup_${currentUser.id}`;
            const backupInfluencerKey = `influencer_backup_${currentUser.id}`;

            await StorageService.saveData(backupUserKey, {
                ...updatedUserData,
                backupTimestamp: new Date().toISOString(),
                backupType: 'user_profile'
            });

            await StorageService.saveData(backupInfluencerKey, {
                ...updatedInfluencerData,
                backupTimestamp: new Date().toISOString(),
                backupType: 'influencer_profile'
            });

            // 4. Update registered users list if exists
            try {
                const registeredUsers = await StorageService.getData('registered_users') || [];
                const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id);

                if (userIndex !== -1) {
                    registeredUsers[userIndex] = updatedInfluencerData;
                    await StorageService.saveData('registered_users', registeredUsers);
                    console.log('✅ Updated user in registered users list');
                }
            } catch (error) {
                console.warn('⚠️ Could not update registered users list:', error);
            }

            // 5. Create profile image backup if exists
            if (profileImageUri) {
                await createProfileImageBackup(profileImageUri);
            }

            // 6. Update Redux state
            dispatch(setUser(updatedUserData));

            // 7. Verify data was saved correctly
            const verifyUser = await StorageService.getUser();
            const verifyInfluencer = await StorageService.getInfluencerData(currentUser.id);

            if (verifyUser && verifyInfluencer) {
                console.log('✅ Profile data saved and verified successfully');
                console.log('📊 Updated data:', {
                    name: verifyUser.fullName,
                    instagram: verifyUser.instagramUsername,
                    followers: verifyUser.instagramFollowers,
                    hasProfileImage: !!verifyUser.profileImage
                });

                setShowEditProfile(false);
                Alert.alert('¡Éxito!', 'Tu perfil ha sido actualizado y guardado correctamente. Los cambios se mantendrán al reiniciar la aplicación.');
            } else {
                throw new Error('Verification failed - data not saved correctly');
            }

        } catch (error) {
            console.error('❌ Error saving profile:', error);
            Alert.alert('Error', 'No se pudo guardar el perfil. Inténtalo de nuevo.');
        }
    };

    // Profile image backup function - User-specific isolation
    const createProfileImageBackup = async (base64Image) => {
        try {
            if (!currentUser?.id) {
                console.error('❌ Cannot create backup: No user ID available');
                return;
            }

            // Create multiple backup keys with user isolation
            const backupKeys = [
                `profileImage_${currentUser.id}`,
                `backup_profileImage_${currentUser.id}`,
                `user_${currentUser.id}_profileImage`
            ];

            const backupData = {
                image: base64Image,
                timestamp: new Date().toISOString(),
                userId: currentUser.id,
                userEmail: currentUser.email, // Additional identifier
                userRole: currentUser.role
            };

            for (const key of backupKeys) {
                await StorageService.saveData(key, backupData);
            }

            console.log(`✅ Profile image backup created for user: ${currentUser.id}`);
        } catch (error) {
            console.error('❌ Error creating profile image backup:', error);
        }
    };

    // Profile image recovery function
    const recoverProfileImageFromBackup = async () => {
        try {
            if (!currentUser?.id) {
                console.error('❌ Cannot recover backup: No user ID available');
                return null;
            }

            const backupKeys = [
                `profileImage_${currentUser.id}`,
                `backup_profileImage_${currentUser.id}`,
                `user_${currentUser.id}_profileImage`
            ];

            for (const key of backupKeys) {
                const backupData = await StorageService.getData(key);

                // Validate that the backup belongs to the current user
                if (backupData?.image && backupData?.userId === currentUser.id) {
                    console.log(`✅ Profile image recovered from backup: ${key} for user: ${currentUser.id}`);
                    return backupData.image;
                } else if (backupData?.image && backupData?.userId !== currentUser.id) {
                    console.warn(`⚠️ Backup found but belongs to different user: ${backupData.userId} vs ${currentUser.id}`);
                }
            }

            console.log(`ℹ️ No profile image backup found for user: ${currentUser.id}`);
            return null;
        } catch (error) {
            console.error('❌ Error recovering profile image from backup:', error);
            return null;
        }
    };

    // Image picker functions
    const handleImagePicker = async () => {
        try {
            // Request permission to access media library
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu galería para cambiar la foto de perfil');
                return;
            }

            // Show action sheet to choose between camera and gallery
            Alert.alert(
                'Cambiar foto de perfil',
                'Selecciona una opción',
                [
                    {
                        text: 'Galería',
                        onPress: () => pickImageFromGallery()
                    },
                    {
                        text: 'Cámara',
                        onPress: () => pickImageFromCamera()
                    },
                    {
                        text: 'Cancelar',
                        style: 'cancel'
                    }
                ]
            );
        } catch (error) {
            console.error('Error requesting permissions:', error);
            Alert.alert('Error', 'No se pudo acceder a la galería');
        }
    };

    const pickImageFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio for profile picture
                quality: 0.8,
                base64: true, // Get base64 data for permanent storage
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageAsset = result.assets[0];
                const imageUri = imageAsset.uri;
                const base64Image = `data:image/jpeg;base64,${imageAsset.base64}`;

                console.log('📸 Saving profile image with enhanced persistence...');

                // Update local state with base64 for immediate display and persistence
                setProfileImageUri(base64Image);

                // Create updated user data with timestamp
                const updatedUser = {
                    ...currentUser,
                    profileImage: base64Image,
                    lastUpdated: new Date().toISOString()
                };

                // Enhanced persistence - Save to multiple locations
                console.log('💾 Saving profile image to multiple storage locations...');

                // 1. Save to primary user data
                await StorageService.saveUser(updatedUser);

                // 2. Save to influencer data if applicable
                if (currentUser.role === 'influencer') {
                    const influencerData = await StorageService.getInfluencerData(currentUser.id) || {};
                    const updatedInfluencerData = {
                        ...influencerData,
                        id: currentUser.id,
                        profileImage: base64Image,
                        lastUpdated: new Date().toISOString()
                    };
                    await StorageService.saveInfluencerData(updatedInfluencerData);
                }

                // 3. Create backup copies with user-specific keys
                await createProfileImageBackup(base64Image);

                // 4. Update registered users list if exists
                try {
                    const registeredUsers = await StorageService.getData('registered_users') || [];
                    const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id);

                    if (userIndex !== -1) {
                        registeredUsers[userIndex] = {
                            ...registeredUsers[userIndex],
                            profileImage: base64Image,
                            lastUpdated: new Date().toISOString()
                        };
                        await StorageService.saveData('registered_users', registeredUsers);
                        console.log('✅ Updated profile image in registered users list');
                    }
                } catch (error) {
                    console.warn('⚠️ Could not update registered users list:', error);
                }

                // 5. Update Redux state
                dispatch(setUser(updatedUser));

                // 6. Verify the image was saved correctly
                const verifyUser = await StorageService.getUser();
                const verifyInfluencer = currentUser.role === 'influencer'
                    ? await StorageService.getInfluencerData(currentUser.id)
                    : null;

                if (verifyUser?.profileImage === base64Image) {
                    console.log('✅ Profile image saved and verified successfully');
                    Alert.alert('✅ Éxito', 'Foto de perfil actualizada y guardada permanentemente. Se mantendrá al reiniciar la aplicación.');
                } else {
                    throw new Error('Image verification failed');
                }
            }
        } catch (error) {
            console.error('❌ Error picking/saving image from gallery:', error);
            Alert.alert('Error', 'No se pudo seleccionar o guardar la imagen. Inténtalo de nuevo.');
        }
    };

    const pickImageFromCamera = async () => {
        try {
            // Request camera permission
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

            if (cameraPermission.granted === false) {
                Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu cámara para tomar una foto');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio for profile picture
                quality: 0.8,
                base64: true, // Get base64 data for permanent storage
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageAsset = result.assets[0];
                const imageUri = imageAsset.uri;
                const base64Image = `data:image/jpeg;base64,${imageAsset.base64}`;

                // Update local state with URI for immediate display
                setProfileImageUri(imageUri);

                // Save both URI and base64 for permanent storage
                const updatedUser = {
                    ...currentUser,
                    profileImage: base64Image, // Save base64 for persistence
                    profileImageUri: imageUri  // Keep URI for current session
                };

                // Save to both user data and influencer data for redundancy
                await StorageService.saveUser(updatedUser);

                if (currentUser.role === 'influencer') {
                    const influencerData = await StorageService.getInfluencerData(currentUser.id) || {};
                    const updatedInfluencerData = {
                        ...influencerData,
                        id: currentUser.id,
                        profileImage: base64Image,
                        profileImageUri: imageUri,
                        lastUpdated: new Date().toISOString()
                    };
                    await StorageService.saveInfluencerData(updatedInfluencerData);
                }

                dispatch(setUser(updatedUser));

                // Create backup copies for extra security
                await createProfileImageBackup(base64Image);

                console.log('✅ Profile image saved permanently with backup');
                Alert.alert('✅ Éxito', 'Foto de perfil actualizada y guardada permanentemente');
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'No se pudo tomar la foto');
        }
    };
    const pickInstagramImages = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería para subir las capturas');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                aspect: [4, 3],
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => ({
                    uri: asset.uri,
                    type: 'instagram',
                    timestamp: new Date().toISOString()
                }));

                const updatedImages = [...instagramImages, ...newImages];
                setInstagramImages(updatedImages);
                setInstagramCapturesUploaded(true);

                // Save automatically
                await saveFormData();

                Alert.alert('¡Éxito!', `${newImages.length} captura(s) de Instagram subidas correctamente`);
            }
        } catch (error) {
            console.error('Error picking Instagram images:', error);
            Alert.alert('Error', 'No se pudieron subir las capturas');
        }
    };

    const pickTiktokImages = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería para subir las capturas');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                aspect: [4, 3],
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => ({
                    uri: asset.uri,
                    type: 'tiktok',
                    timestamp: new Date().toISOString()
                }));

                const updatedImages = [...tiktokImages, ...newImages];
                setTiktokImages(updatedImages);
                setTiktokCapturesUploaded(true);

                // Save automatically
                await saveFormData();

                Alert.alert('¡Éxito!', `${newImages.length} captura(s) de TikTok subidas correctamente`);
            }
        } catch (error) {
            console.error('Error picking TikTok images:', error);
            Alert.alert('Error', 'No se pudieron subir las capturas');
        }
    };

    // Auto-save form data
    const saveFormData = async () => {
        try {
            const formData = {
                ...registerForm,
                instagramImages,
                tiktokImages,
                instagramCapturesUploaded,
                tiktokCapturesUploaded,
                lastSaved: new Date().toISOString()
            };

            await StorageService.saveFormData(formData);
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    };

    // Clear form data completely
    const clearFormData = async () => {
        try {
            console.log('🧹 Limpiando datos del formulario...');
            
            // Reset form state to initial values
            setRegisterForm({
                email: '',
                password: '',
                fullName: '',
                phone: '',
                birthDate: '',
                city: '',
                instagramUsername: '',
                tiktokUsername: '',
                instagramFollowers: '',
                tiktokFollowers: '',
                userType: 'influencer',
                acceptTerms: false,
                // Company fields
                companyName: '',
                cifNif: '',
                companyAddress: '',
                companyPhone: '',
                companyEmail: '',
                representativeName: '',
                representativeEmail: '',
                representativePosition: '',
                businessType: '',
                businessDescription: '',
                website: ''
            });

            // Reset image states
            setInstagramImages([]);
            setTiktokImages([]);
            setInstagramCapturesUploaded(false);
            setTiktokCapturesUploaded(false);

            // Clear saved form data from storage
            await StorageService.clearFormData();
            
            console.log('✅ Datos del formulario limpiados exitosamente');
        } catch (error) {
            console.error('❌ Error limpiando datos del formulario:', error);
        }
    };

    // Load saved form data on component mount (only if no user is authenticated)
    useEffect(() => {
        // Only load saved data if no user is currently authenticated
        // This prevents loading previous registration data when starting a new registration
        if (!isAuthenticated && !currentUser) {
            loadSavedFormData();
        }
    }, [isAuthenticated, currentUser]);

    const loadSavedFormData = async () => {
        try {
            // Additional check: only load if we're actually in registration mode
            if (isAuthenticated || currentUser) {
                console.log('🚫 Usuario autenticado detectado, no cargando datos guardados del formulario');
                return;
            }

            const savedData = await StorageService.getFormData();
            if (savedData) {
                console.log('📋 Cargando datos guardados del formulario...');
                setRegisterForm({
                    email: savedData.email || '',
                    password: savedData.password || '',
                    fullName: savedData.fullName || '',
                    phone: savedData.phone || '',
                    birthDate: savedData.birthDate || '',
                    city: savedData.city || '',
                    instagramUsername: savedData.instagramUsername || '',
                    tiktokUsername: savedData.tiktokUsername || '',
                    instagramFollowers: savedData.instagramFollowers || '',
                    tiktokFollowers: savedData.tiktokFollowers || '',
                    userType: savedData.userType || 'influencer',
                    acceptTerms: savedData.acceptTerms || false,
                    // Company fields
                    companyName: savedData.companyName || '',
                    cifNif: savedData.cifNif || '',
                    companyAddress: savedData.companyAddress || '',
                    companyPhone: savedData.companyPhone || '',
                    companyEmail: savedData.companyEmail || '',
                    representativeName: savedData.representativeName || '',
                    representativeEmail: savedData.representativeEmail || '',
                    representativePosition: savedData.representativePosition || '',
                    businessType: savedData.businessType || '',
                    businessDescription: savedData.businessDescription || '',
                    website: savedData.website || ''
                });

                setInstagramImages(savedData.instagramImages || []);
                setTiktokImages(savedData.tiktokImages || []);
                setInstagramCapturesUploaded(savedData.instagramCapturesUploaded || false);
                setTiktokCapturesUploaded(savedData.tiktokCapturesUploaded || false);
                console.log('✅ Datos del formulario cargados');
            } else {
                console.log('ℹ️ No hay datos guardados del formulario');
            }
        } catch (error) {
            console.error('❌ Error cargando datos guardados del formulario:', error);
        }
    };

    // Delete image functions
    const deleteInstagramImage = async (indexToDelete) => {
        try {
            const updatedImages = instagramImages.filter((_, index) => index !== indexToDelete);
            setInstagramImages(updatedImages);

            // Update upload status
            if (updatedImages.length === 0) {
                setInstagramCapturesUploaded(false);
            }

            // Save automatically
            await saveFormData();

            Alert.alert('Imagen eliminada', 'La captura de Instagram ha sido eliminada correctamente');
        } catch (error) {
            console.error('Error deleting Instagram image:', error);
            Alert.alert('Error', 'No se pudo eliminar la imagen');
        }
    };

    const deleteTiktokImage = async (indexToDelete) => {
        try {
            const updatedImages = tiktokImages.filter((_, index) => index !== indexToDelete);
            setTiktokImages(updatedImages);

            // Update upload status
            if (updatedImages.length === 0) {
                setTiktokCapturesUploaded(false);
            }

            // Save automatically
            await saveFormData();

            Alert.alert('Imagen eliminada', 'La captura de TikTok ha sido eliminada correctamente');
        } catch (error) {
            console.error('Error deleting TikTok image:', error);
            Alert.alert('Error', 'No se pudo eliminar la imagen');
        }
    };

    // Auto-save when form data changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            saveFormData();
        }, 1000); // Save after 1 second of inactivity

        return () => clearTimeout(timeoutId);
    }, [registerForm, instagramImages, tiktokImages, instagramCapturesUploaded, tiktokCapturesUploaded]);

    // Load terms content on component mount
    useEffect(() => {
        loadTermsContent();
    }, []);

    // Load privacy policy content on component mount
    useEffect(() => {
        loadPrivacyContent();
    }, []);

    // Load dynamic cities from admin configuration
    const loadDynamicCities = async () => {
        try {
            console.log('🏙️ [ZyroAppNew] Cargando ciudades dinámicas...');

            const activeCityNames = await CitiesService.getActiveCityNames();

            if (activeCityNames && activeCityNames.length > 0) {
                setDynamicCities(activeCityNames);
                // Update global CITIES array for compatibility
                CITIES.length = 0;
                CITIES.push(...activeCityNames);

                console.log('✅ [ZyroAppNew] Ciudades dinámicas cargadas:', activeCityNames.length);
                console.log('🏙️ [ZyroAppNew] Ciudades disponibles:', activeCityNames);
            } else {
                console.log('⚠️ [ZyroAppNew] No se encontraron ciudades activas, usando ciudades por defecto');
            }
        } catch (error) {
            console.error('❌ [ZyroAppNew] Error cargando ciudades dinámicas:', error);
            // Keep default cities on error
        }
    };

    // Load dynamic categories from admin configuration
    const loadDynamicCategories = async () => {
        try {
            console.log('🏷️ [ZyroAppNew] Cargando categorías dinámicas...');

            const activeCategoryNames = await CategoriesService.getCategoriesAsStringArray();

            if (activeCategoryNames && activeCategoryNames.length > 0) {
                setDynamicCategories(activeCategoryNames);
                // Update global CATEGORIES array for compatibility
                CATEGORIES.length = 0;
                CATEGORIES.push(...activeCategoryNames);

                console.log('✅ [ZyroAppNew] Categorías dinámicas cargadas:', activeCategoryNames.length);
                console.log('🏷️ [ZyroAppNew] Categorías disponibles:', activeCategoryNames);
            } else {
                console.log('⚠️ [ZyroAppNew] No se encontraron categorías activas, usando categorías por defecto');
            }
        } catch (error) {
            console.error('❌ [ZyroAppNew] Error cargando categorías dinámicas:', error);
            // Keep default categories on error
        }
    };

    // Set up event listeners for real-time cities updates
    const setupCitiesEventListeners = () => {
        console.log('📡 [ZyroAppNew] Configurando listeners de eventos de ciudades...');

        // Listen for any cities updates
        const unsubscribeCitiesUpdated = EventBusService.subscribe(
            CITIES_EVENTS.CITIES_UPDATED,
            handleCitiesUpdated
        );

        // Listen for city additions
        const unsubscribeCityAdded = EventBusService.subscribe(
            CITIES_EVENTS.CITY_ADDED,
            handleCityAdded
        );

        // Listen for city deletions
        const unsubscribeCityDeleted = EventBusService.subscribe(
            CITIES_EVENTS.CITY_DELETED,
            handleCityDeleted
        );

        // Listen for city status changes
        const unsubscribeCityStatusChanged = EventBusService.subscribe(
            CITIES_EVENTS.CITY_STATUS_CHANGED,
            handleCityStatusChanged
        );

        // Store unsubscribe functions for cleanup
        window.citiesEventUnsubscribers = [
            unsubscribeCitiesUpdated,
            unsubscribeCityAdded,
            unsubscribeCityDeleted,
            unsubscribeCityStatusChanged
        ];

        console.log('✅ [ZyroAppNew] Event listeners configurados para ciudades');
    };

    // Set up event listeners for real-time categories updates
    const setupCategoriesEventListeners = () => {
        console.log('📡 [ZyroAppNew] Configurando listeners de eventos de categorías...');

        // Listen for any categories updates
        const unsubscribeCategoriesUpdated = EventBusService.subscribe(
            CATEGORIES_EVENTS.CATEGORIES_UPDATED,
            handleCategoriesUpdated
        );

        // Listen for category additions
        const unsubscribeCategoryAdded = EventBusService.subscribe(
            CATEGORIES_EVENTS.CATEGORY_ADDED,
            handleCategoryAdded
        );

        // Listen for category deletions
        const unsubscribeCategoryDeleted = EventBusService.subscribe(
            CATEGORIES_EVENTS.CATEGORY_DELETED,
            handleCategoryDeleted
        );

        // Listen for category updates
        const unsubscribeCategoryUpdated = EventBusService.subscribe(
            CATEGORIES_EVENTS.CATEGORY_UPDATED,
            handleCategoryUpdated
        );

        // Store unsubscribe functions for cleanup
        window.categoriesEventUnsubscribers = [
            unsubscribeCategoriesUpdated,
            unsubscribeCategoryAdded,
            unsubscribeCategoryDeleted,
            unsubscribeCategoryUpdated
        ];

        console.log('✅ [ZyroAppNew] Event listeners configurados para categorías');
    };

    // Clean up event listeners
    const cleanupCitiesEventListeners = () => {
        console.log('🧹 [ZyroAppNew] Limpiando event listeners de ciudades...');

        if (window.citiesEventUnsubscribers) {
            window.citiesEventUnsubscribers.forEach(unsubscribe => {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            });
            window.citiesEventUnsubscribers = null;
        }
    };

    const cleanupCategoriesEventListeners = () => {
        console.log('🧹 [ZyroAppNew] Limpiando event listeners de categorías...');

        if (window.categoriesEventUnsubscribers) {
            window.categoriesEventUnsubscribers.forEach(unsubscribe => {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            });
            window.categoriesEventUnsubscribers = null;
        }
    };

    // Handle cities updated event
    const handleCitiesUpdated = async (eventData) => {
        console.log('🔄 [ZyroAppNew] Evento recibido: Ciudades actualizadas', eventData);

        try {
            const { activeCities } = eventData;
            const activeCityNames = activeCities.map(city => city.name);

            // Update state immediately
            setDynamicCities(activeCityNames);

            // Update global CITIES array for compatibility
            CITIES.length = 0;
            CITIES.push(...activeCityNames);

            console.log('✅ [ZyroAppNew] Ciudades actualizadas en tiempo real:', activeCityNames);

            // Force re-render by updating trigger state
            setCitiesUpdateTrigger(prev => prev + 1);

            // This ensures the UI reflects the changes immediately
        } catch (error) {
            console.error('❌ [ZyroAppNew] Error actualizando ciudades:', error);
        }
    };

    // Handle city added event
    const handleCityAdded = (eventData) => {
        console.log('➕ [ZyroAppNew] Evento recibido: Ciudad añadida', eventData);
        // The CITIES_UPDATED event will handle the actual update
    };

    // Handle city deleted event
    const handleCityDeleted = (eventData) => {
        console.log('🗑️ [ZyroAppNew] Evento recibido: Ciudad eliminada', eventData);
        // The CITIES_UPDATED event will handle the actual update
    };

    // Handle city status changed event
    const handleCityStatusChanged = (eventData) => {
        console.log('🔄 [ZyroAppNew] Evento recibido: Estado de ciudad cambiado', eventData);
        // The CITIES_UPDATED event will handle the actual update
    };

    // Handle categories updated event
    const handleCategoriesUpdated = async (eventData) => {
        console.log('🔄 [ZyroAppNew] Evento recibido: Categorías actualizadas', eventData);

        try {
            // eventData is the array of categories
            const activeCategories = eventData.filter(category => category.isActive);
            const activeCategoryNames = activeCategories.map(category => category.name);

            // Update state immediately
            setDynamicCategories(activeCategoryNames);

            // Update global CATEGORIES array for compatibility
            CATEGORIES.length = 0;
            CATEGORIES.push(...activeCategoryNames);

            console.log('✅ [ZyroAppNew] Categorías actualizadas en tiempo real:', activeCategoryNames);

            // Force re-render by updating trigger state
            setCategoriesUpdateTrigger(prev => prev + 1);

            // This ensures the UI reflects the changes immediately
        } catch (error) {
            console.error('❌ [ZyroAppNew] Error actualizando categorías:', error);
        }
    };

    // Handle category added event
    const handleCategoryAdded = (eventData) => {
        console.log('➕ [ZyroAppNew] Evento recibido: Categoría añadida', eventData);
        // The CATEGORIES_UPDATED event will handle the actual update
    };

    // Handle category deleted event
    const handleCategoryDeleted = (eventData) => {
        console.log('🗑️ [ZyroAppNew] Evento recibido: Categoría eliminada', eventData);
        // The CATEGORIES_UPDATED event will handle the actual update
    };

    // Handle category updated event
    const handleCategoryUpdated = (eventData) => {
        console.log('🔄 [ZyroAppNew] Evento recibido: Categoría actualizada', eventData);
        // The CATEGORIES_UPDATED event will handle the actual update
    };

    // Authentication handlers
    const handleLogin = async () => {
        try {
            console.log('🔐 Iniciando proceso de login para:', loginForm.email);

            // Validar campos obligatorios
            if (!loginForm.email || !loginForm.password) {
                Alert.alert('Error', 'Por favor ingresa email y contraseña');
                return;
            }

            // 1. Verificación de administrador eliminada - ahora se maneja a través del sistema de usuarios aprobados

            // 2. Verificación de empresa eliminada - ahora se maneja a través del sistema de usuarios aprobados

            // 3. Buscar en usuarios aprobados (sistema principal)
            console.log('🔍 Buscando en usuarios aprobados...');
            const approvedUser = await StorageService.getApprovedUserByEmail(loginForm.email);

            if (approvedUser && approvedUser.password === loginForm.password) {
                console.log('✅ Usuario aprobado encontrado:', approvedUser.role);

                let userData = {
                    id: approvedUser.id,
                    email: approvedUser.email,
                    role: approvedUser.role,
                    name: approvedUser.name,
                    fullName: approvedUser.name,
                    companyName: approvedUser.companyName,
                    subscriptionPlan: approvedUser.subscriptionPlan,
                    plan: approvedUser.plan,
                    status: 'approved',
                    verified: true,
                    profileImage: approvedUser.profileImage
                };

                // Si es una empresa, cargar datos completos
                if (approvedUser.role === 'company') {
                    console.log('🏢 Cargando datos completos de empresa aprobada:', approvedUser.companyName);
                    const companyData = await StorageService.getCompanyData(approvedUser.id);
                    if (companyData) {
                        userData = {
                            ...userData,
                            companyEmail: companyData.companyEmail,
                            // Incluir todos los datos del formulario de registro
                            cifNif: companyData.cifNif,
                            companyAddress: companyData.companyAddress,
                            companyPhone: companyData.companyPhone,
                            representativeName: companyData.representativeName,
                            representativeEmail: companyData.representativeEmail,
                            representativePosition: companyData.representativePosition,
                            businessType: companyData.businessType,
                            businessDescription: companyData.businessDescription,
                            website: companyData.website,
                            subscriptionActive: companyData.subscriptionActive
                        };
                        console.log('✅ Datos completos de empresa aprobada cargados');
                    }
                }

                await StorageService.saveUser(userData);
                dispatch(setUser(userData));

                // Redirigir según el rol del usuario
                if (userData.role === 'company') {
                    console.log('🏢 Redirigiendo a dashboard de empresa');
                    dispatch(setCurrentScreen('company'));
                } else if (userData.role === 'influencer') {
                    dispatch(setCurrentScreen('main'));
                    dispatch(setActiveTab('home'));
                } else {
                    dispatch(setCurrentScreen('main'));
                }

                Alert.alert('¡Bienvenido!', `Hola ${userData.name}!`);
                return;
            }

            // 4. Buscar en credenciales de login (sistema secundario)
            const loginCredentials = await StorageService.getData('login_credentials') || {};
            const userCredential = loginCredentials[loginForm.email];

            if (userCredential && userCredential.password === loginForm.password) {
                console.log('✅ Credenciales encontradas en sistema principal');

                // Cargar datos completos del usuario
                let userData = null;

                if (userCredential.role === 'influencer') {
                    const influencerData = await StorageService.getInfluencerData(userCredential.userId);
                    if (influencerData) {
                        userData = {
                            id: influencerData.id,
                            email: influencerData.email,
                            role: 'influencer',
                            fullName: influencerData.fullName,
                            instagramUsername: influencerData.instagramUsername,
                            instagramFollowers: influencerData.instagramFollowers,
                            tiktokUsername: influencerData.tiktokUsername,
                            tiktokFollowers: influencerData.tiktokFollowers,
                            phone: influencerData.phone,
                            city: influencerData.city,
                            profileImage: influencerData.profileImage,
                            status: 'approved',
                            password: loginForm.password
                        };
                    }
                } else if (userCredential.role === 'company') {
                    const companyData = await StorageService.getCompanyData(userCredential.userId);
                    if (companyData) {
                        console.log('🏢 Cargando datos completos de empresa para login:', companyData.companyName);
                        userData = {
                            id: companyData.id,
                            email: companyData.companyEmail,
                            companyEmail: companyData.companyEmail, // Asegurar que esté disponible
                            role: 'company',
                            fullName: companyData.companyName,
                            companyName: companyData.companyName,
                            status: 'approved',
                            password: loginForm.password,
                            // Incluir todos los datos del formulario de registro
                            cifNif: companyData.cifNif,
                            companyAddress: companyData.companyAddress,
                            companyPhone: companyData.companyPhone,
                            representativeName: companyData.representativeName,
                            representativeEmail: companyData.representativeEmail,
                            representativePosition: companyData.representativePosition,
                            businessType: companyData.businessType,
                            businessDescription: companyData.businessDescription,
                            website: companyData.website,
                            subscriptionPlan: companyData.selectedPlan,
                            subscriptionActive: companyData.subscriptionActive
                        };
                        console.log('✅ Datos completos de empresa cargados para login');
                    }
                }

                if (userData) {
                    await StorageService.saveUser(userData);
                    dispatch(setUser(userData));

                    // Redirigir según el rol del usuario
                    if (userData.role === 'company') {
                        dispatch(setCurrentScreen('company'));
                    } else {
                        dispatch(setCurrentScreen('main'));
                        if (userData.role === 'influencer') {
                            dispatch(setActiveTab('home'));
                        }
                    }

                    Alert.alert('¡Bienvenido!', `Hola ${userData.fullName}!`);
                    return;
                }
            }

            // 5. Buscar en lista de usuarios registrados (fallback)
            const registeredUsers = await StorageService.getData('registered_users') || [];
            const foundUser = registeredUsers.find(user =>
                user.email === loginForm.email && user.password === loginForm.password
            );

            if (foundUser) {
                console.log('✅ Usuario encontrado en lista de registrados');

                let userData = null;

                if (foundUser.role === 'influencer') {
                    // Cargar datos completos del influencer
                    const influencerData = await StorageService.getInfluencerData(foundUser.id);
                    userData = influencerData || foundUser;
                } else if (foundUser.role === 'company') {
                    // Cargar datos completos de la empresa
                    const companyData = await StorageService.getCompanyData(foundUser.id);
                    userData = companyData || foundUser;
                } else {
                    userData = foundUser;
                }

                // Actualizar credenciales de login para próximas veces
                loginCredentials[loginForm.email] = {
                    email: loginForm.email,
                    password: loginForm.password,
                    userId: userData.id,
                    role: userData.role,
                    lastUpdated: new Date().toISOString()
                };
                await StorageService.saveData('login_credentials', loginCredentials);

                await StorageService.saveUser(userData);
                dispatch(setUser(userData));

                // Set currentScreen based on user role
                if (userData.role === 'company') {
                    dispatch(setCurrentScreen('company'));
                } else if (userData.role === 'admin') {
                    dispatch(setCurrentScreen('admin'));
                } else {
                    dispatch(setCurrentScreen('main'));
                    dispatch(setActiveTab('home'));
                }

                Alert.alert('¡Bienvenido!', `Hola ${userData.fullName || userData.companyName}!`);
                return;
            }

            // 6. Buscar en listas específicas (compatibilidad con sistema anterior)
            try {
                // Buscar en lista de influencers
                const influencersList = await StorageService.getInfluencersList() || [];
                const influencer = influencersList.find(i => i.email === loginForm.email);

                if (influencer) {
                    const influencerData = await StorageService.getInfluencerData(influencer.id);
                    if (influencerData && influencerData.password === loginForm.password) {
                        console.log('✅ Influencer encontrado en lista específica');

                        const userData = {
                            id: influencerData.id,
                            email: influencerData.email,
                            role: 'influencer',
                            fullName: influencerData.fullName,
                            instagramUsername: influencerData.instagramUsername,
                            instagramFollowers: influencerData.instagramFollowers,
                            tiktokUsername: influencerData.tiktokUsername,
                            tiktokFollowers: influencerData.tiktokFollowers,
                            phone: influencerData.phone,
                            city: influencerData.city,
                            profileImage: influencerData.profileImage,
                            status: 'approved',
                            password: loginForm.password
                        };

                        // Actualizar credenciales de login
                        loginCredentials[loginForm.email] = {
                            email: loginForm.email,
                            password: loginForm.password,
                            userId: userData.id,
                            role: userData.role,
                            lastUpdated: new Date().toISOString()
                        };
                        await StorageService.saveData('login_credentials', loginCredentials);

                        await StorageService.saveUser(userData);
                        dispatch(setUser(userData));

                        // Set currentScreen based on user role
                        if (userData.role === 'company') {
                            dispatch(setCurrentScreen('company'));
                        } else if (userData.role === 'admin') {
                            dispatch(setCurrentScreen('admin'));
                        } else {
                            dispatch(setCurrentScreen('main'));
                            dispatch(setActiveTab('home'));
                        }

                        Alert.alert('¡Bienvenido!', `Hola ${userData.fullName}!`);
                        return;
                    }
                }

                // Buscar en lista de empresas
                const companiesList = await StorageService.getCompaniesList() || [];
                const company = companiesList.find(c => c.email === loginForm.email);

                if (company) {
                    const companyData = await StorageService.getCompanyData(company.id);
                    if (companyData && companyData.password === loginForm.password) {
                        console.log('✅ Empresa encontrada en lista específica');
                        console.log('🏢 Cargando datos completos de empresa:', companyData.companyName);

                        const userData = {
                            id: companyData.id,
                            email: companyData.companyEmail,
                            companyEmail: companyData.companyEmail, // Asegurar que esté disponible
                            role: 'company',
                            fullName: companyData.companyName,
                            companyName: companyData.companyName,
                            status: 'approved',
                            password: loginForm.password,
                            // Incluir todos los datos del formulario de registro
                            cifNif: companyData.cifNif,
                            companyAddress: companyData.companyAddress,
                            companyPhone: companyData.companyPhone,
                            representativeName: companyData.representativeName,
                            representativeEmail: companyData.representativeEmail,
                            representativePosition: companyData.representativePosition,
                            businessType: companyData.businessType,
                            businessDescription: companyData.businessDescription,
                            website: companyData.website,
                            subscriptionPlan: companyData.selectedPlan,
                            subscriptionActive: companyData.subscriptionActive
                        };
                        console.log('✅ Datos completos de empresa cargados desde lista específica');

                        // Actualizar credenciales de login
                        loginCredentials[loginForm.email] = {
                            email: loginForm.email,
                            password: loginForm.password,
                            userId: userData.id,
                            role: userData.role,
                            lastUpdated: new Date().toISOString()
                        };
                        await StorageService.saveData('login_credentials', loginCredentials);

                        await StorageService.saveUser(userData);
                        dispatch(setUser(userData));
                        dispatch(setCurrentScreen('company'));

                        Alert.alert('¡Bienvenido!', `Acceso de empresa: ${userData.companyName}`);
                        return;
                    }
                }
            } catch (error) {
                console.warn('⚠️ Error buscando en listas específicas:', error);
            }

            // Si llegamos aquí, las credenciales son incorrectas
            console.log('❌ Credenciales incorrectas para:', loginForm.email);
            Alert.alert(
                'Credenciales Incorrectas',
                'El email o la contraseña son incorrectos. Por favor verifica tus datos e inténtalo de nuevo.',
                [{ text: 'OK' }]
            );

        } catch (error) {
            console.error('❌ Error en proceso de login:', error);
            Alert.alert(
                'Error de Conexión',
                'Hubo un problema al iniciar sesión. Por favor inténtalo de nuevo.',
                [{ text: 'OK' }]
            );
        }
    };

    // Password Recovery handlers
    const handleForgotPasswordStep1 = async () => {
        try {
            if (!forgotPasswordForm.email) {
                Alert.alert('Error', 'Por favor ingresa tu email');
                return;
            }

            setIsRecovering(true);
            console.log('🔐 Iniciando recuperación de contraseña para:', forgotPasswordForm.email);

            // Verificar si el email existe en el sistema usando el servicio
            const emailVerification = await PasswordRecoveryService.verifyEmailExists(forgotPasswordForm.email);

            if (!emailVerification.exists) {
                Alert.alert('Error', 'No se encontró una cuenta con este email');
                setIsRecovering(false);
                return;
            }

            // Generar código de verificación usando el servicio
            const code = PasswordRecoveryService.generateVerificationCode(forgotPasswordForm.email);
            setGeneratedCode(code);

            // Simular envío de email
            await PasswordRecoveryService.sendRecoveryEmail(forgotPasswordForm.email, code);

            Alert.alert(
                'Código Enviado',
                `Se ha enviado un código de verificación a ${forgotPasswordForm.email}. Revisa tu bandeja de entrada y carpeta de spam.`,
                [{ text: 'OK', onPress: () => setRecoveryStep(2) }]
            );

            setIsRecovering(false);
        } catch (error) {
            console.error('❌ Error en recuperación paso 1:', error);
            Alert.alert('Error', error.message || 'Hubo un problema al enviar el código. Inténtalo de nuevo.');
            setIsRecovering(false);
        }
    };

    const handleForgotPasswordStep2 = async () => {
        try {
            if (!forgotPasswordForm.verificationCode) {
                Alert.alert('Error', 'Por favor ingresa el código de verificación');
                return;
            }

            // Verificar código usando el servicio
            PasswordRecoveryService.verifyCode(forgotPasswordForm.email, forgotPasswordForm.verificationCode);
            setRecoveryStep(3);
        } catch (error) {
            console.error('❌ Error en recuperación paso 2:', error);
            Alert.alert('Error', error.message || 'Hubo un problema al verificar el código.');
        }
    };

    const handleForgotPasswordStep3 = async () => {
        try {
            if (!forgotPasswordForm.newPassword || !forgotPasswordForm.confirmPassword) {
                Alert.alert('Error', 'Por favor completa todos los campos');
                return;
            }

            if (forgotPasswordForm.newPassword.length < 6) {
                Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
                return;
            }

            if (forgotPasswordForm.newPassword !== forgotPasswordForm.confirmPassword) {
                Alert.alert('Error', 'Las contraseñas no coinciden');
                return;
            }

            setIsRecovering(true);
            console.log('🔐 Actualizando contraseña para:', forgotPasswordForm.email);

            // Actualizar contraseña usando el servicio
            const result = await PasswordRecoveryService.updatePassword(forgotPasswordForm.email, forgotPasswordForm.newPassword);

            Alert.alert(
                'Contraseña Actualizada',
                `Tu contraseña ha sido actualizada exitosamente en ${result.updatedSystems.length} sistemas. Ahora puedes iniciar sesión con tu nueva contraseña.`,
                [{
                    text: 'OK',
                    onPress: () => {
                        // Resetear formulario y volver al login
                        setForgotPasswordForm({
                            email: '',
                            verificationCode: '',
                            newPassword: '',
                            confirmPassword: ''
                        });
                        setRecoveryStep(1);
                        setGeneratedCode('');
                        dispatch(setCurrentScreen('login'));
                    }
                }]
            );

            setIsRecovering(false);
        } catch (error) {
            console.error('❌ Error en recuperación paso 3:', error);
            Alert.alert('Error', error.message || 'Hubo un problema al actualizar la contraseña.');
            setIsRecovering(false);
        }
    };



    const handleRegister = async () => {
        try {
            // Basic validation for influencers
            if (registerForm.userType === 'influencer') {
                const requiredInfluencerFields = [
                    'fullName', 'email', 'phone', 'birthDate', 'city',
                    'instagramUsername', 'tiktokUsername', 'instagramFollowers', 'password'
                ];

                const missingFields = requiredInfluencerFields.filter(field => !registerForm[field]);

                if (missingFields.length > 0) {
                    Alert.alert('Error', 'Por favor completa todos los campos obligatorios marcados con *');
                    return;
                }

                // Validate Instagram captures upload
                if (!instagramCapturesUploaded) {
                    Alert.alert('Error', 'Debes subir las capturas de Instagram obligatorias');
                    return;
                }

                // Validate terms acceptance for influencers
                if (!registerForm.acceptTerms) {
                    Alert.alert('Error', 'Debes aceptar los términos y condiciones para continuar');
                    return;
                }
            }

            // Basic validation for companies
            if (registerForm.userType === 'company') {
                if (!registerForm.password) {
                    Alert.alert('Error', 'Por favor ingresa una contraseña');
                    return;
                }
            }

            // Additional validation for companies
            if (registerForm.userType === 'company') {
                const requiredCompanyFields = [
                    'companyName', 'cifNif', 'companyAddress', 'companyPhone', 'companyEmail',
                    'representativeName', 'representativeEmail', 'representativePosition',
                    'businessType', 'businessDescription'
                ];

                const missingFields = requiredCompanyFields.filter(field => !registerForm[field]);

                if (missingFields.length > 0) {
                    Alert.alert('Error', 'Por favor completa todos los campos obligatorios del formulario de empresa');
                    return;
                }

                // Validate terms acceptance
                if (!registerForm.acceptTerms) {
                    Alert.alert('Error', 'Debes aceptar los Términos y Condiciones para continuar');
                    return;
                }
            }

            // For companies, redirect to Stripe subscription selection
            if (registerForm.userType === 'company') {
                console.log('🏢 Procesando registro de empresa...');
                console.log('📋 Datos de empresa:', registerForm);
                
                // NUEVO: Guardar datos del formulario de registro para sincronización
                console.log('💾 [SYNC] Guardando datos del formulario de registro para sincronización...');
                const syncResult = await saveCompanyRegistrationData(registerForm);
                
                if (syncResult.success) {
                    console.log('✅ [SYNC] Datos del formulario guardados para sincronización exitosamente');
                } else {
                    console.log('⚠️ [SYNC] Error guardando datos para sincronización:', syncResult.error);
                }
                
                // Store company data temporarily (método anterior)
                await StorageService.saveData('temp_company_registration', registerForm);
                console.log('💾 Datos guardados temporalmente');
                
                // Navigate to Stripe subscription plans
                console.log('🚀 Redirigiendo a Stripe...');
                setShowStripeSubscription(true);
                setShowRegister(false);
                return;
            }

            // For influencers, complete registration directly
            const influencerData = {
                id: `influencer_${Date.now()}`,
                ...registerForm,
                instagramImages,
                tiktokImages,
                instagramCapturesUploaded,
                tiktokCapturesUploaded,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            // Save influencer data permanently
            await StorageService.saveInfluencerData(influencerData);

            // Clear form data after successful registration
            await clearFormData();

            Alert.alert(
                'Registro Exitoso',
                'Tu solicitud ha sido enviada. Recibirás una notificación cuando sea aprobada (24-48 horas).',
                [{ text: 'OK', onPress: () => setShowRegister(false) }]
            );
        } catch (error) {
            Alert.alert('Error', 'No se pudo completar el registro');
        }
    };

    const handleLogout = async () => {
        try {
            // Clear profile image state to ensure no cross-user contamination
            setProfileImageUri(null);
            console.log('✅ Profile image state cleared for logout');

            await StorageService.clearUser();
            dispatch(logoutUser());
            dispatch(setCurrentScreen('welcome'));
            dispatch(setActiveTab(0));
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const handleLogoutWithConfirmation = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: handleLogout
                }
            ]
        );
    };

    const handleDeleteAccount = async () => {
        try {
            if (!currentUser?.id) {
                console.error('❌ Cannot delete account: No user ID available');
                return;
            }

            // Clear profile image state
            setProfileImageUri(null);

            // Delete all user-specific profile image backups
            const backupKeys = [
                `profileImage_${currentUser.id}`,
                `backup_profileImage_${currentUser.id}`,
                `user_${currentUser.id}_profileImage`
            ];

            for (const key of backupKeys) {
                await StorageService.removeData(key);
            }

            // Delete influencer data if exists
            if (currentUser.role === 'influencer') {
                await StorageService.removeData(`influencer_${currentUser.id}`);
            }

            console.log(`✅ All data deleted for user: ${currentUser.id}`);

            // Clear user session
            await StorageService.clearUser();
            dispatch(logoutUser());
            dispatch(setCurrentScreen('welcome'));
            dispatch(setActiveTab(0));

            Alert.alert('✅ Cuenta Eliminada', 'Todos tus datos han sido eliminados permanentemente');
        } catch (error) {
            console.error('Error deleting account:', error);
            Alert.alert('Error', 'No se pudo eliminar la cuenta completamente');
        }
    };



    // Terms of Service functions
    const loadTermsContent = async () => {
        try {
            // En una implementación real, cargarías desde un archivo o API
            const terms = `# Normas de Uso - Zyro Marketplace

## 1. Introducción

Bienvenido a Zyro Marketplace, una plataforma exclusiva que conecta influencers cualificados con empresas para colaboraciones basadas en intercambio de productos y servicios. Al utilizar nuestra aplicación, aceptas cumplir con estas normas de uso.

## 2. Definiciones

• **Zyro**: La plataforma y aplicación móvil
• **Usuario**: Cualquier persona que utilice la aplicación
• **Influencer**: Creador de contenido aprobado en la plataforma
• **Empresa**: Marca o negocio con suscripción activa
• **Administrador**: Gestor exclusivo de la plataforma
• **Colaboración**: Intercambio de productos/servicios por contenido

## 3. Registro y Aprobación

### 3.1 Proceso de Registro
• Todos los usuarios deben completar un proceso de registro detallado
• Los influencers requieren aprobación manual del administrador
• Las empresas deben suscribirse a un plan de pago
• La información proporcionada debe ser veraz y actualizada

### 3.2 Criterios de Aprobación para Influencers
• Mínimo de seguidores según categoría
• Contenido de calidad y apropiado
• Audiencia real y engagement auténtico
• Cumplimiento de políticas de redes sociales

## 4. Uso de la Plataforma

### 4.1 Comportamiento Esperado
• Mantener un comportamiento profesional y respetuoso
• Proporcionar información veraz en solicitudes
• Cumplir con los compromisos de contenido acordados
• Respetar los plazos establecidos para las colaboraciones

### 4.2 Contenido Obligatorio
• Los influencers deben crear el contenido comprometido
• Formato mínimo: 2 historias de Instagram (1 en video) o 1 TikTok
• Plazo máximo: 72 horas después de recibir el producto/servicio
• El contenido debe mostrar claramente al influencer

## 5. Colaboraciones

### 5.1 Proceso de Solicitud
• Solo influencers aprobados pueden solicitar colaboraciones
• Las solicitudes deben incluir propuesta de contenido detallada
• Para restaurantes: fecha, hora y número de acompañantes
• Para productos: dirección completa de entrega

### 5.2 Compromisos del Influencer
• Crear contenido de calidad que represente fielmente el producto/servicio
• Publicar en los plazos establecidos
• Mantener el contenido visible por un mínimo de 24 horas
• No realizar contenido negativo sobre la marca

## 6. Prohibiciones

### 6.1 Está Estrictamente Prohibido:
• Crear cuentas falsas o proporcionar información falsa
• Vender, transferir o compartir credenciales de acceso
• Utilizar la plataforma para actividades ilegales
• Hacer spam o enviar contenido no solicitado
• Intentar acceder a cuentas de otros usuarios

### 6.2 Contenido Prohibido:
• Contenido ofensivo, discriminatorio o de odio
• Material sexual explícito o inapropiado
• Promoción de actividades ilegales
• Violación de derechos de autor
• Información falsa o engañosa

## 7. Gestión de Datos

### 7.1 Información Personal
• Zyro recopila solo la información necesaria para el funcionamiento
• Los datos se utilizan exclusivamente para gestionar colaboraciones
• No se comparten datos con terceros sin consentimiento
• Los usuarios pueden solicitar la eliminación de sus datos

## 8. Responsabilidades

### 8.1 Responsabilidad de Zyro
• Facilitar la conexión entre influencers y empresas
• Mantener la plataforma funcionando correctamente
• Proteger los datos de los usuarios
• Mediar en disputas cuando sea necesario

### 8.2 Limitaciones de Responsabilidad
• Zyro no garantiza el éxito de las colaboraciones
• No somos responsables de disputas entre usuarios
• Los usuarios actúan bajo su propia responsabilidad

## 9. Contacto y Soporte

Para cualquier consulta sobre estas normas, contacta con nuestro equipo de soporte a través de la aplicación.

---

**Última actualización:** 22 de septiembre de 2025
**Versión:** 1.0`;

            setTermsContent(terms);
            setIsTermsLoading(false);
        } catch (error) {
            console.error('Error loading terms:', error);
            setIsTermsLoading(false);
        }
    };

    const loadPrivacyContent = async () => {
        try {
            // En una implementación real, cargarías desde un archivo o API
            const privacy = `# Política de Privacidad - Zyro Marketplace

## 1. Introducción

En Zyro Marketplace, nos comprometemos a proteger y respetar tu privacidad. Esta Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos tu información personal cuando utilizas nuestra aplicación móvil y servicios.

## 2. Información que Recopilamos

### 2.1 Información Personal
• **Datos de registro**: Nombre completo, dirección de correo electrónico, número de teléfono
• **Información de perfil**: Foto de perfil, biografía, ubicación, fecha de nacimiento
• **Datos de redes sociales**: Nombres de usuario de Instagram y TikTok, número de seguidores
• **Información empresarial**: Para empresas, datos fiscales, información de contacto, detalles del negocio

### 2.2 Información de Uso
• **Actividad en la aplicación**: Colaboraciones solicitadas, mensajes enviados, preferencias
• **Datos técnicos**: Dirección IP, tipo de dispositivo, sistema operativo, versión de la aplicación
• **Información de ubicación**: Ciudad seleccionada para filtrar colaboraciones

### 2.3 Contenido Generado
• **Imágenes y videos**: Capturas de pantalla de redes sociales, contenido de colaboraciones
• **Comunicaciones**: Mensajes en el chat integrado, solicitudes de colaboración

## 3. Cómo Utilizamos tu Información

### 3.1 Prestación de Servicios
• Facilitar conexiones entre influencers y empresas
• Procesar solicitudes de colaboración
• Gestionar pagos y suscripciones
• Proporcionar soporte al cliente

### 3.2 Mejora de la Plataforma
• Analizar el uso de la aplicación para mejorar funcionalidades
• Personalizar la experiencia del usuario
• Desarrollar nuevas características y servicios

## 4. Base Legal para el Tratamiento

Procesamos tu información personal basándonos en:

### 4.1 Consentimiento
• Registro voluntario en la plataforma
• Aceptación de términos y condiciones
• Consentimiento para comunicaciones de marketing

### 4.2 Ejecución de Contrato
• Prestación de servicios de marketplace
• Gestión de colaboraciones y pagos
• Cumplimiento de obligaciones contractuales

## 5. Compartir Información

### 5.1 Con Otros Usuarios
• **Influencers**: Información de perfil visible para empresas
• **Empresas**: Datos de contacto compartidos tras aprobación de colaboración
• **Administrador**: Acceso completo para gestión de la plataforma

### 5.2 Con Terceros
• **Proveedores de servicios**: Procesamiento de pagos, almacenamiento en la nube
• **Autoridades**: Cuando sea requerido por ley
• **Nunca vendemos** tu información personal a terceros

## 6. Seguridad de los Datos

### 6.1 Medidas Técnicas
• Encriptación de datos sensibles en tránsito y reposo
• Autenticación segura con tokens JWT
• Copias de seguridad regulares y redundancia de datos
• Monitoreo continuo de seguridad

## 7. Tus Derechos (GDPR)

### 7.1 Derecho de Acceso
• Solicitar una copia de todos tus datos personales
• Información sobre cómo procesamos tus datos
• Detalles sobre con quién compartimos tu información

### 7.2 Derecho de Rectificación
• Corregir datos personales inexactos o incompletos
• Actualizar información desactualizada
• Modificar preferencias de comunicación

### 7.3 Derecho de Supresión ("Derecho al Olvido")
• Solicitar la eliminación de tus datos personales
• Eliminación automática al borrar tu cuenta
• Excepciones por requisitos legales o contractuales

### 7.4 Derecho de Portabilidad
• Recibir tus datos en formato estructurado y legible
• Transferir datos a otro servicio cuando sea técnicamente posible
• Exportación de datos de perfil y actividad

## 8. Contacto y Consultas

### 8.1 Autoridad de Control
• Puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD)
• **Web**: www.aepd.es
• **Teléfono**: 901 100 099

## 9. ¿Quién es responsable de procesar tus datos?

### 9.1 Responsable del Tratamiento
• **Nombre de la empresa**: Influence Media Lab
• **APP**: ZYRO MARKETPLACE
• **Tax ID (CIF)**: B87932869
• **Oficina de registro**: C/ Ríos Rosas, 44 6ºA, 28003, Madrid, Spain
• **Email de contacto**: nacho.borbon@wearemi6.com

### 9.2 Contacto para Asuntos de Privacidad
Para cualquier consulta relacionada con el tratamiento de tus datos personales, ejercicio de derechos GDPR, o cuestiones de privacidad, puedes contactarnos directamente a través del email de contacto proporcionado.

---

**Última actualización:** 22 de septiembre de 2025
**Versión:** 1.0`;

            setPrivacyContent(privacy);
            setIsPrivacyLoading(false);
        } catch (error) {
            console.error('Error loading privacy policy:', error);
            setIsPrivacyLoading(false);
        }
    };

    // Password Change functions
    const handleChangePassword = async () => {
        try {
            setIsChangingPassword(true);

            // Validaciones
            if (!changePasswordForm.currentPassword || !changePasswordForm.newPassword || !changePasswordForm.confirmPassword) {
                Alert.alert('Error', 'Por favor completa todos los campos');
                setIsChangingPassword(false);
                return;
            }

            if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
                Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
                setIsChangingPassword(false);
                return;
            }

            if (changePasswordForm.newPassword.length < 6) {
                Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
                setIsChangingPassword(false);
                return;
            }

            // Verificar contraseña actual
            if (currentUser.password && currentUser.password !== changePasswordForm.currentPassword) {
                Alert.alert('Error', 'La contraseña actual es incorrecta');
                setIsChangingPassword(false);
                return;
            }

            console.log('🔐 Iniciando cambio de contraseña para usuario:', currentUser.email);

            // Actualizar contraseña del usuario actual
            const updatedUser = {
                ...currentUser,
                password: changePasswordForm.newPassword,
                lastPasswordChange: new Date().toISOString()
            };

            // 1. Actualizar en Redux
            dispatch(setUser(updatedUser));

            // 2. Actualizar en storage principal
            await StorageService.saveUser(updatedUser);

            // 3. Actualizar en datos de influencer si existe
            if (currentUser.role === 'influencer') {
                const influencerData = await StorageService.getInfluencerData(currentUser.id);
                if (influencerData) {
                    const updatedInfluencerData = {
                        ...influencerData,
                        password: changePasswordForm.newPassword,
                        lastPasswordChange: new Date().toISOString()
                    };
                    await StorageService.saveInfluencerData(updatedInfluencerData);
                }
            }

            // 4. Actualizar en lista de usuarios registrados
            try {
                const registeredUsers = await StorageService.getData('registered_users') || [];
                const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id || u.email === currentUser.email);

                if (userIndex !== -1) {
                    registeredUsers[userIndex] = {
                        ...registeredUsers[userIndex],
                        password: changePasswordForm.newPassword,
                        lastPasswordChange: new Date().toISOString()
                    };
                    await StorageService.saveData('registered_users', registeredUsers);
                    console.log('✅ Contraseña actualizada en lista de usuarios registrados');
                }
            } catch (error) {
                console.warn('⚠️ No se pudo actualizar en lista de usuarios registrados:', error);
            }

            // 5. Crear backup de seguridad con nueva contraseña
            const backupUserKey = `user_backup_${currentUser.id}`;
            await StorageService.saveData(backupUserKey, {
                ...updatedUser,
                backupTimestamp: new Date().toISOString(),
                backupType: 'password_change'
            });

            // 6. Actualizar credenciales de login para persistencia
            const loginCredentials = await StorageService.getData('login_credentials') || {};
            loginCredentials[currentUser.email] = {
                email: currentUser.email,
                password: changePasswordForm.newPassword,
                userId: currentUser.id,
                role: currentUser.role,
                lastUpdated: new Date().toISOString()
            };
            await StorageService.saveData('login_credentials', loginCredentials);

            console.log('✅ Contraseña actualizada exitosamente en todas las ubicaciones');

            // Limpiar formulario
            setChangePasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setIsChangingPassword(false);

            Alert.alert(
                '✅ Contraseña Actualizada',
                'Tu contraseña ha sido cambiada exitosamente. La nueva contraseña se ha guardado permanentemente y podrás usarla para iniciar sesión.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigateToScreen('profile')
                    }
                ]
            );

        } catch (error) {
            console.error('❌ Error cambiando contraseña:', error);
            setIsChangingPassword(false);
            Alert.alert(
                'Error',
                'No se pudo cambiar la contraseña. Inténtalo de nuevo.',
                [{ text: 'OK' }]
            );
        }
    };



    const handlePaymentSubmit = async () => {
        try {
            // Validate payment data based on payment method
            if (registerForm.paymentMethod === 'credit' || registerForm.paymentMethod === 'debit') {
                if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
                    Alert.alert('Error', 'Por favor completa todos los campos de la tarjeta');
                    return;
                }
            } else if (registerForm.paymentMethod === 'transfer') {
                if (!paymentData.bankAccount || !paymentData.bankCode || !paymentData.accountHolder) {
                    Alert.alert('Error', 'Por favor completa todos los campos bancarios');
                    return;
                }
            }

            // Create complete company registration data
            const companyData = {
                id: `company_${Date.now()}`,
                ...registerForm,
                paymentInfo: paymentData,
                totalAmount: calculateTotalAmount(),
                monthlyAmount: getMonthlyPrice(),
                setupFee: 150,
                status: 'payment_completed',
                registrationDate: new Date().toISOString(),
                nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            };

            // Save company data permanently
            await StorageService.saveCompanyData(companyData);

            // Create subscription data from registration form
            const planMapping = {
                '3months': {
                    id: '3-months',
                    name: 'Plan 3 Meses',
                    price: 499,
                    duration: 3,
                    totalPrice: 1497,
                    description: 'Perfecto para campañas cortas'
                },
                '6months': {
                    id: '6-months',
                    name: 'Plan 6 Meses',
                    price: 399,
                    duration: 6,
                    totalPrice: 2394,
                    description: 'Ideal para estrategias a medio plazo'
                },
                '12months': {
                    id: '12-months',
                    name: 'Plan 12 Meses',
                    price: 299,
                    duration: 12,
                    totalPrice: 3588,
                    description: 'Máximo ahorro para estrategias anuales'
                }
            };

            const paymentMethodMapping = {
                'credit': {
                    id: 'credit-card',
                    name: 'Tarjeta de Crédito',
                    icon: 'card',
                    description: 'Visa, Mastercard, American Express'
                },
                'debit': {
                    id: 'debit-card',
                    name: 'Tarjeta de Débito',
                    icon: 'card',
                    description: 'Pago directo desde tu cuenta bancaria'
                },
                'transfer': {
                    id: 'bank-transfer',
                    name: 'Transferencia Bancaria',
                    icon: 'business',
                    description: 'Transferencia directa a nuestra cuenta'
                }
            };

            // Save subscription data
            const subscriptionData = {
                userId: companyData.id,
                plan: planMapping[registerForm.selectedPlan] || planMapping['12months'],
                paymentMethod: paymentMethodMapping[registerForm.paymentMethod] || paymentMethodMapping['debit'],
                updatedAt: new Date().toISOString(),
                nextBillingDate: companyData.nextPaymentDate,
                registrationSource: 'company_registration'
            };

            await StorageService.saveCompanySubscription(subscriptionData);

            // Also save as current user for immediate login
            const userData = {
                id: companyData.id,
                email: registerForm.companyEmail,  // Email corporativo como credencial de acceso
                password: registerForm.password,   // Contraseña establecida en el registro
                role: 'company',
                fullName: registerForm.companyName,
                companyName: registerForm.companyName,
                status: 'approved'
            };

            await StorageService.saveUser(userData);
            dispatch(loginUser(userData));

            // Reset forms and navigate to company dashboard
            setShowPaymentScreen(false);
            setShowRegister(false);
            dispatch(setCurrentScreen('company'));

            Alert.alert(
                '¡Pago Completado!',
                `Bienvenido a ZYRO. Tu empresa ha sido registrada exitosamente.\n\nPróximo pago: €${getMonthlyPrice()} el ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
            );
        } catch (error) {
            Alert.alert('Error', 'No se pudo procesar el pago. Inténtalo de nuevo.');
        }
    };

    const handleTabPress = (tabIndex) => {
        dispatch(setActiveTab(tabIndex));

        const screens = ['home', 'map', 'history', 'profile'];
        dispatch(setCurrentScreen(screens[tabIndex]));
    };

    // Screen navigation helper
    const navigateToScreen = (screen) => {
        dispatch(setCurrentScreen(screen));
    };

    // Collaboration handlers
    const handleCollaborationPress = (collaboration) => {
        dispatch(setSelectedCollaboration(collaboration));
        dispatch(setCurrentScreen('collaboration-detail'));
    };

    const handleRequestCollaboration = async (collaborationId, requestData) => {
        try {
            const request = {
                id: `req_${Date.now()}`,
                collaborationId,
                userId: currentUser.id,
                ...requestData,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            dispatch(requestCollaboration(request));

            // Add notification
            dispatch(addNotification({
                id: `notif_${Date.now()}`,
                type: 'collaboration_request',
                title: 'Solicitud Enviada',
                message: 'Tu solicitud de colaboración ha sido enviada correctamente',
                timestamp: new Date().toISOString(),
                read: false
            }));

            Alert.alert('¡Éxito!', 'Tu solicitud ha sido enviada correctamente');
            dispatch(setCurrentScreen('home'));
        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar la solicitud');
        }
    };

    // Filter collaborations from Redux state
    const getFilteredCollaborations = () => {
        // Use collaborations directly from Redux state
        const reduxCollaborations = collaborations || [];

        console.log('🔍 Filtering Redux collaborations:', reduxCollaborations.length);
        console.log('🔍 Current filters - City:', selectedCity, 'Category:', selectedCategory);

        const filtered = reduxCollaborations.filter(collab => {
            // City filter
            const cityMatch = !selectedCity || selectedCity === 'all' || selectedCity === '' || collab.city === selectedCity;

            // Category filter
            const categoryMatch = !selectedCategory || selectedCategory === 'all' || selectedCategory === '' || collab.category === selectedCategory;

            // Followers filter - DISABLED: Show all campaigns regardless of follower count
            const followersMatch = true; // Always show all campaigns

            // Status filter - only show active campaigns
            const statusMatch = !collab.status || collab.status === 'active';

            const matches = cityMatch && categoryMatch && followersMatch && statusMatch;

            if (!matches) {
                console.log(`🚫 Campaign filtered out: ${collab.title} - City: ${cityMatch}, Category: ${categoryMatch}, Followers: ${followersMatch}, Status: ${statusMatch}`);
            }

            return matches;
        });

        console.log('✅ Filtered Redux collaborations result:', filtered.length);

        // Log filtered campaigns for debugging
        if (filtered.length > 0) {
            console.log('📋 Campaigns shown to user:');
            filtered.forEach(campaign => {
                console.log(`  - ${campaign.title} (${campaign.business}) - ${campaign.city} - ${campaign.category}`);
            });
        }

        return filtered;
    };

    // Render methods
    const renderWelcomeScreen = () => (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor="#000000" />
            <LinearGradient
                colors={['#000000', '#111111', '#000000']}
                style={styles.welcomeContainer}
            >
                <Animated.View
                    style={[
                        styles.welcomeContent,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {/* Logo with super size according to LOGO_SUPER_SIZE_UPDATE.md */}
                    <View style={styles.logoWelcomeContainer}>
                        <Image
                            source={require('../assets/logozyrotransparente.png')}
                            style={styles.logoWelcome}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.welcomeTitle}>Bienvenido</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Conectamos influencers con marcas premium
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={async () => {
                                // Clear form data to ensure clean start for new influencer registration
                                await clearFormData();
                                setRegisterForm({ ...registerForm, userType: 'influencer' });
                                setShowRegister(true);
                            }}
                        >
                            <LinearGradient
                                colors={['#C9A961', '#D4AF37', '#C9A961']}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>SOY INFLUENCER</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={async () => {
                                // Clear form data to ensure clean start for new company registration
                                await clearFormData();
                                setRegisterForm({ ...registerForm, userType: 'company' });
                                setShowRegister(true);
                            }}
                        >
                            <LinearGradient
                                colors={['#C9A961', '#D4AF37', '#C9A961']}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>SOY EMPRESA</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => dispatch(setCurrentScreen('login'))}
                        >
                            <Text style={styles.loginLinkText}>¿Ya tienes cuenta? Inicia sesión</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );

    const renderLoginScreen = () => (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor="#000000" />
            <LinearGradient
                colors={['#000000', '#111111', '#000000']}
                style={styles.loginContainer}
            >
                <ScrollView contentContainerStyle={styles.loginContent}>
                    {/* Logo with super size according to LOGO_SUPER_SIZE_UPDATE.md */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/logozyrotransparente.png')}
                            style={styles.logoWelcome}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.loginTitle}>Iniciar Sesión</Text>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email o Usuario"
                                placeholderTextColor="#666"
                                value={loginForm.email}
                                onChangeText={(text) => setLoginForm({ ...loginForm, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Contraseña"
                                placeholderTextColor="#666"
                                value={loginForm.password}
                                onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleLogin}
                        >
                            <LinearGradient
                                colors={['#C9A961', '#D4AF37', '#C9A961']}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.forgotPasswordButton}
                            onPress={() => dispatch(setCurrentScreen('forgotPassword'))}
                        >
                            <Text style={styles.forgotPasswordText}>¿Has olvidado tu contraseña?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => dispatch(setCurrentScreen('welcome'))}
                        >
                            <Text style={styles.backButtonText}>← Volver</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );

    // Forgot Password Screen
    const renderForgotPasswordScreen = () => (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor="#000000" />
            <LinearGradient
                colors={['#000000', '#111111', '#000000']}
                style={styles.loginContainer}
            >
                <ScrollView contentContainerStyle={styles.loginContent}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/logozyrotransparente.png')}
                            style={styles.logoWelcome}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.loginTitle}>
                        {recoveryStep === 1 && 'Recuperar Contraseña'}
                        {recoveryStep === 2 && 'Verificar Código'}
                        {recoveryStep === 3 && 'Nueva Contraseña'}
                    </Text>

                    <View style={styles.formContainer}>
                        {recoveryStep === 1 && (
                            <>
                                <Text style={styles.recoveryDescription}>
                                    Ingresa tu email para recibir un código de verificación
                                </Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor="#666"
                                        value={forgotPasswordForm.email}
                                        onChangeText={(text) => setForgotPasswordForm({ ...forgotPasswordForm, email: text })}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={handleForgotPasswordStep1}
                                    disabled={isRecovering}
                                >
                                    <LinearGradient
                                        colors={['#C9A961', '#D4AF37', '#C9A961']}
                                        style={styles.gradientButton}
                                    >
                                        <Text style={styles.buttonText}>
                                            {isRecovering ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {recoveryStep === 2 && (
                            <>
                                <Text style={styles.recoveryDescription}>
                                    Ingresa el código de 6 dígitos que enviamos a {forgotPasswordForm.email}
                                </Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Código de verificación"
                                        placeholderTextColor="#666"
                                        value={forgotPasswordForm.verificationCode}
                                        onChangeText={(text) => setForgotPasswordForm({ ...forgotPasswordForm, verificationCode: text })}
                                        keyboardType="numeric"
                                        maxLength={6}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={handleForgotPasswordStep2}
                                >
                                    <LinearGradient
                                        colors={['#C9A961', '#D4AF37', '#C9A961']}
                                        style={styles.gradientButton}
                                    >
                                        <Text style={styles.buttonText}>VERIFICAR CÓDIGO</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={handleForgotPasswordStep1}
                                >
                                    <Text style={styles.secondaryButtonText}>Reenviar código</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {recoveryStep === 3 && (
                            <>
                                <Text style={styles.recoveryDescription}>
                                    Ingresa tu nueva contraseña
                                </Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nueva contraseña"
                                        placeholderTextColor="#666"
                                        value={forgotPasswordForm.newPassword}
                                        onChangeText={(text) => setForgotPasswordForm({ ...forgotPasswordForm, newPassword: text })}
                                        secureTextEntry
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirmar nueva contraseña"
                                        placeholderTextColor="#666"
                                        value={forgotPasswordForm.confirmPassword}
                                        onChangeText={(text) => setForgotPasswordForm({ ...forgotPasswordForm, confirmPassword: text })}
                                        secureTextEntry
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={handleForgotPasswordStep3}
                                    disabled={isRecovering}
                                >
                                    <LinearGradient
                                        colors={['#C9A961', '#D4AF37', '#C9A961']}
                                        style={styles.gradientButton}
                                    >
                                        <Text style={styles.buttonText}>
                                            {isRecovering ? 'ACTUALIZANDO...' : 'ACTUALIZAR CONTRASEÑA'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => {
                                setForgotPasswordForm({
                                    email: '',
                                    verificationCode: '',
                                    newPassword: '',
                                    confirmPassword: ''
                                });
                                setRecoveryStep(1);
                                setGeneratedCode('');
                                dispatch(setCurrentScreen('login'));
                            }}
                        >
                            <Text style={styles.backButtonText}>← Volver al Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );

    // Payment screens
    const renderCreditCardPayment = () => (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor="#000000" />
            <LinearGradient
                colors={['#000000', '#111111', '#000000']}
                style={styles.paymentContainer}
            >
                <ScrollView contentContainerStyle={styles.paymentContent}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/logozyrotransparente.png')}
                            style={styles.logoSmall}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.paymentTitle}>Pago con Tarjeta de Crédito</Text>

                    {/* Payment Summary */}
                    <View style={styles.paymentSummary}>
                        <Text style={styles.summaryTitle}>Resumen del Pago</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Plan mensual:</Text>
                            <Text style={styles.summaryValue}>€{getMonthlyPrice()}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Setup Fee (único):</Text>
                            <Text style={styles.summaryValue}>€150</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.summaryTotal]}>
                            <Text style={styles.summaryTotalLabel}>Total primer pago:</Text>
                            <Text style={styles.summaryTotalValue}>€{calculateTotalAmount()}</Text>
                        </View>
                    </View>

                    {/* Card Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Número de tarjeta *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1234 5678 9012 3456"
                                placeholderTextColor="#666"
                                value={paymentData.cardNumber}
                                onChangeText={(text) => setPaymentData({ ...paymentData, cardNumber: text })}
                                keyboardType="numeric"
                                maxLength={19}
                            />
                        </View>

                        <View style={styles.rowContainer}>
                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <Text style={styles.inputLabel}>Fecha vencimiento *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="MM/AA"
                                    placeholderTextColor="#666"
                                    value={paymentData.expiryDate}
                                    onChangeText={(text) => setPaymentData({ ...paymentData, expiryDate: text })}
                                    keyboardType="numeric"
                                    maxLength={5}
                                />
                            </View>
                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <Text style={styles.inputLabel}>CVV *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="123"
                                    placeholderTextColor="#666"
                                    value={paymentData.cvv}
                                    onChangeText={(text) => setPaymentData({ ...paymentData, cvv: text })}
                                    keyboardType="numeric"
                                    maxLength={4}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nombre del titular *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre como aparece en la tarjeta"
                                placeholderTextColor="#666"
                                value={paymentData.cardholderName}
                                onChangeText={(text) => setPaymentData({ ...paymentData, cardholderName: text })}
                                autoCapitalize="words"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handlePaymentSubmit}
                        >
                            <LinearGradient
                                colors={['#C9A961', '#D4AF37', '#C9A961']}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>PROCESAR PAGO - €{calculateTotalAmount()}</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButtonCenter}
                            onPress={() => setShowPaymentScreen(false)}
                        >
                            <Text style={styles.backButtonCenterText}>← Volver</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );

    const renderDebitCardPayment = () => (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor="#000000" />
            <LinearGradient
                colors={['#000000', '#111111', '#000000']}
                style={styles.paymentContainer}
            >
                <ScrollView contentContainerStyle={styles.paymentContent}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/logozyrotransparente.png')}
                            style={styles.logoSmall}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.paymentTitle}>Pago con Tarjeta de Débito</Text>

                    {/* Payment Summary */}
                    <View style={styles.paymentSummary}>
                        <Text style={styles.summaryTitle}>Resumen del Pago</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Plan mensual:</Text>
                            <Text style={styles.summaryValue}>€{getMonthlyPrice()}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Setup Fee (único):</Text>
                            <Text style={styles.summaryValue}>€150</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.summaryTotal]}>
                            <Text style={styles.summaryTotalLabel}>Total primer pago:</Text>
                            <Text style={styles.summaryTotalValue}>€{calculateTotalAmount()}</Text>
                        </View>
                    </View>

                    {/* Card Form - Same as credit card */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Número de tarjeta *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1234 5678 9012 3456"
                                placeholderTextColor="#666"
                                value={paymentData.cardNumber}
                                onChangeText={(text) => setPaymentData({ ...paymentData, cardNumber: text })}
                                keyboardType="numeric"
                                maxLength={19}
                            />
                        </View>

                        <View style={styles.rowContainer}>
                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <Text style={styles.inputLabel}>Fecha vencimiento *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="MM/AA"
                                    placeholderTextColor="#666"
                                    value={paymentData.expiryDate}
                                    onChangeText={(text) => setPaymentData({ ...paymentData, expiryDate: text })}
                                    keyboardType="numeric"
                                    maxLength={5}
                                />
                            </View>
                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <Text style={styles.inputLabel}>CVV *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="123"
                                    placeholderTextColor="#666"
                                    value={paymentData.cvv}
                                    onChangeText={(text) => setPaymentData({ ...paymentData, cvv: text })}
                                    keyboardType="numeric"
                                    maxLength={4}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nombre del titular *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre como aparece en la tarjeta"
                                placeholderTextColor="#666"
                                value={paymentData.cardholderName}
                                onChangeText={(text) => setPaymentData({ ...paymentData, cardholderName: text })}
                                autoCapitalize="words"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handlePaymentSubmit}
                        >
                            <LinearGradient
                                colors={['#C9A961', '#D4AF37', '#C9A961']}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>PROCESAR PAGO - €{calculateTotalAmount()}</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButtonCenter}
                            onPress={() => setShowPaymentScreen(false)}
                        >
                            <Text style={styles.backButtonCenterText}>← Volver</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );

    const renderBankTransferPayment = () => (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor="#000000" />
            <LinearGradient
                colors={['#000000', '#111111', '#000000']}
                style={styles.paymentContainer}
            >
                <ScrollView contentContainerStyle={styles.paymentContent}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/logozyrotransparente.png')}
                            style={styles.logoSmall}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.paymentTitle}>Pago por Transferencia Bancaria</Text>

                    {/* Payment Summary */}
                    <View style={styles.paymentSummary}>
                        <Text style={styles.summaryTitle}>Resumen del Pago</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Plan mensual:</Text>
                            <Text style={styles.summaryValue}>€{getMonthlyPrice()}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Setup Fee (único):</Text>
                            <Text style={styles.summaryValue}>€150</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.summaryTotal]}>
                            <Text style={styles.summaryTotalLabel}>Total primer pago:</Text>
                            <Text style={styles.summaryTotalValue}>€{calculateTotalAmount()}</Text>
                        </View>
                    </View>

                    {/* Bank Transfer Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Número de cuenta (IBAN) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ES12 3456 7890 1234 5678 9012"
                                placeholderTextColor="#666"
                                value={paymentData.bankAccount}
                                onChangeText={(text) => setPaymentData({ ...paymentData, bankAccount: text })}
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Código del banco (BIC/SWIFT) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="CAIXESBBXXX"
                                placeholderTextColor="#666"
                                value={paymentData.bankCode}
                                onChangeText={(text) => setPaymentData({ ...paymentData, bankCode: text })}
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Titular de la cuenta *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre del titular de la cuenta"
                                placeholderTextColor="#666"
                                value={paymentData.accountHolder}
                                onChangeText={(text) => setPaymentData({ ...paymentData, accountHolder: text })}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.transferInfo}>
                            <Text style={styles.transferInfoTitle}>Información importante:</Text>


                            <Text style={styles.transferInfoText}>
                                • El pago se procesará automáticamente desde tu cuenta
                            </Text>
                            <Text style={styles.transferInfoText}>
                                • Recibirás confirmación por email en 24-48 horas
                            </Text>
                            <Text style={styles.transferInfoText}>
                                • Los pagos mensuales se cobrarán automáticamente
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handlePaymentSubmit}
                        >
                            <LinearGradient
                                colors={['#C9A961', '#D4AF37', '#C9A961']}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>AUTORIZAR PAGO - €{calculateTotalAmount()}</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButtonCenter}
                            onPress={() => setShowPaymentScreen(false)}
                        >
                            <Text style={styles.backButtonCenterText}>← Volver</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );

    const renderPaymentScreen = () => {
        switch (registerForm.paymentMethod) {
            case 'credit':
                return renderCreditCardPayment();
            case 'debit':
                return renderDebitCardPayment();
            case 'transfer':
                return renderBankTransferPayment();
            default:
                return renderCreditCardPayment();
        }
    };

    const renderRegisterScreen = () => (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor="#000000" />
            <LinearGradient
                colors={['#000000', '#111111', '#000000']}
                style={styles.registerContainer}
            >
                <ScrollView contentContainerStyle={styles.registerContent}>
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/logozyrotransparente.png')}
                            style={styles.logoSmall}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.registerTitle}>
                        Registro {registerForm.userType === 'influencer' ? 'Influencer' : 'Empresa'}
                    </Text>

                    <View style={styles.formContainer}>
                        {registerForm.userType === 'influencer' && (
                            <>
                                {/* Información Personal */}
                                <Text style={styles.sectionTitle}>Información Personal</Text>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Nombre completo *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Tu nombre completo"
                                        placeholderTextColor="#666"
                                        value={registerForm.fullName}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, fullName: text })}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Email *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="tu@email.com"
                                        placeholderTextColor="#666"
                                        value={registerForm.email}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, email: text })}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Teléfono *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Tu teléfono"
                                        placeholderTextColor="#666"
                                        value={registerForm.phone}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, phone: text })}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Fecha de nacimiento *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="DD/MM/YYYY"
                                        placeholderTextColor="#666"
                                        value={registerForm.birthDate}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, birthDate: text })}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Ciudad de residencia *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Tu ciudad"
                                        placeholderTextColor="#666"
                                        value={registerForm.city}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, city: text })}
                                    />
                                </View>

                                {/* Redes Sociales */}
                                <Text style={styles.sectionTitle}>Redes Sociales</Text>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Usuario de Instagram *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="@tuusuario"
                                        placeholderTextColor="#666"
                                        value={registerForm.instagramUsername}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, instagramUsername: text })}
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Usuario de TikTok *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="@tuusuario"
                                        placeholderTextColor="#666"
                                        value={registerForm.tiktokUsername}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, tiktokUsername: text })}
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Seguidores en Instagram *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Número de seguidores"
                                        placeholderTextColor="#666"
                                        value={registerForm.instagramFollowers}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, instagramFollowers: text })}
                                        keyboardType="numeric"
                                    />
                                </View>

                                {/* Verificación */}
                                <Text style={styles.sectionTitle}>Verificación</Text>

                                <View style={styles.verificationSection}>
                                    <Text style={styles.verificationTitle}>Capturas de pantalla requeridas</Text>
                                    <Text style={styles.verificationSubtitle}>
                                        Sube capturas de pantalla de las estadísticas de los últimos 30 días de tus redes sociales:
                                    </Text>

                                    <View style={styles.verificationCard}>
                                        <Text style={styles.verificationCardTitle}>📸 Instagram (requerido) *:</Text>
                                        <Text style={styles.verificationItem}>• Estadísticas detalladas de los últimos 30 días</Text>
                                        <Text style={styles.verificationItem}>• Visualizaciones de stories</Text>
                                        <Text style={styles.verificationItem}>• Países/ciudades principales de audiencia</Text>
                                        <Text style={styles.verificationItem}>• Rangos de edad con porcentajes</Text>

                                        <TouchableOpacity
                                            style={[styles.uploadButton, instagramCapturesUploaded && styles.uploadButtonCompleted]}
                                            onPress={pickInstagramImages}
                                        >
                                            <Text style={[styles.uploadButtonText, instagramCapturesUploaded && styles.uploadButtonTextCompleted]}>
                                                {instagramCapturesUploaded ? `✅ ${instagramImages.length} capturas de Instagram subidas` : '📷 Subir capturas de Instagram *'}
                                            </Text>
                                        </TouchableOpacity>

                                        {instagramImages.length > 0 && (
                                            <View style={styles.imagePreviewContainer}>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                    {instagramImages.map((image, index) => (
                                                        <View key={index} style={styles.imagePreviewWrapper}>
                                                            <Image
                                                                source={{ uri: image.uri }}
                                                                style={styles.imagePreview}
                                                            />
                                                            <TouchableOpacity
                                                                style={styles.deleteImageButton}
                                                                onPress={() => deleteInstagramImage(index)}
                                                            >
                                                                <MinimalistIcons name="close" size={24} color={'#888888'} isActive={false} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.verificationCard}>
                                        <Text style={styles.verificationCardTitle}>🎵 TikTok (opcional):</Text>
                                        <Text style={styles.verificationItem}>• Estadísticas de los últimos 30 días</Text>
                                        <Text style={styles.verificationItem}>• Visualizaciones y engagement</Text>
                                        <Text style={styles.verificationItem}>• Demografía de audiencia</Text>

                                        <TouchableOpacity
                                            style={[styles.uploadButton, tiktokCapturesUploaded && styles.uploadButtonCompleted]}
                                            onPress={pickTiktokImages}
                                        >
                                            <Text style={[styles.uploadButtonText, tiktokCapturesUploaded && styles.uploadButtonTextCompleted]}>
                                                {tiktokCapturesUploaded ? `✅ ${tiktokImages.length} capturas de TikTok subidas` : '🎬 Subir capturas de TikTok (opcional)'}
                                            </Text>
                                        </TouchableOpacity>

                                        {tiktokImages.length > 0 && (
                                            <View style={styles.imagePreviewContainer}>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                    {tiktokImages.map((image, index) => (
                                                        <View key={index} style={styles.imagePreviewWrapper}>
                                                            <Image
                                                                source={{ uri: image.uri }}
                                                                style={styles.imagePreview}
                                                            />
                                                            <TouchableOpacity
                                                                style={styles.deleteImageButton}
                                                                onPress={() => deleteTiktokImage(index)}
                                                            >
                                                                <MinimalistIcons name="close" size={24} color={'#888888'} isActive={false} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* IMPORTANTE: Email + Contraseña = Credenciales de acceso para influencers */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Contraseña *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Tu contraseña"
                                        placeholderTextColor="#666"
                                        value={registerForm.password}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
                                        secureTextEntry
                                    />
                                </View>

                                {/* Términos y Condiciones para Influencers */}
                                <View style={styles.termsSection}>
                                    <TouchableOpacity
                                        style={styles.termsContainer}
                                        onPress={() => setRegisterForm({ ...registerForm, acceptTerms: !registerForm.acceptTerms })}
                                    >
                                        <View style={[styles.checkbox, registerForm.acceptTerms && styles.checkboxChecked]}>
                                            {registerForm.acceptTerms && <MinimalistIcons name="check" size={24} color={'#888888'} isActive={false} />}
                                        </View>
                                        <Text style={styles.termsText}>
                                            Acepto los{' '}
                                            <Text style={styles.termsLink}>términos y condiciones</Text>
                                            {' '}de ZYRO
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {registerForm.userType === 'company' && (
                            <>
                                {/* Información de la Empresa */}
                                <Text style={styles.sectionTitle}>Información de la Empresa</Text>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Nombre de la empresa *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nombre de tu empresa"
                                        placeholderTextColor="#666"
                                        value={registerForm.companyName}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, companyName: text })}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>CIF/NIF *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="CIF de la empresa"
                                        placeholderTextColor="#666"
                                        value={registerForm.cifNif}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, cifNif: text })}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Dirección completa *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Dirección de la empresa"
                                        placeholderTextColor="#666"
                                        value={registerForm.companyAddress}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, companyAddress: text })}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Teléfono de la empresa *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Teléfono corporativo"
                                        placeholderTextColor="#666"
                                        value={registerForm.companyPhone}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, companyPhone: text })}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Email corporativo *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="email@empresa.com"
                                        placeholderTextColor="#666"
                                        value={registerForm.companyEmail}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, companyEmail: text })}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                {/* IMPORTANTE: Email corporativo + Contraseña = Credenciales de acceso para empresas */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Contraseña *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Contraseña para acceder a la plataforma"
                                        placeholderTextColor="#666"
                                        value={registerForm.password}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
                                        secureTextEntry
                                    />
                                </View>

                                {/* Contacto y Representante */}
                                <Text style={styles.sectionTitle}>Contacto y Representante</Text>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Nombre del representante *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nombre del contacto principal"
                                        placeholderTextColor="#666"
                                        value={registerForm.representativeName}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, representativeName: text })}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Email del representante *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="contacto@empresa.com"
                                        placeholderTextColor="#666"
                                        value={registerForm.representativeEmail}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, representativeEmail: text })}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Cargo del representante *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Director de Marketing, CEO, etc."
                                        placeholderTextColor="#666"
                                        value={registerForm.representativePosition}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, representativePosition: text })}
                                    />
                                </View>

                                {/* Información del Negocio */}
                                <Text style={styles.sectionTitle}>Información del Negocio</Text>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Tipo de negocio *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Restaurante, Tienda de moda, Spa, etc."
                                        placeholderTextColor="#666"
                                        value={registerForm.businessType}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, businessType: text })}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Descripción del negocio *</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Describe tu negocio y qué tipo de colaboraciones buscas..."
                                        placeholderTextColor="#666"
                                        value={registerForm.businessDescription}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, businessDescription: text })}
                                        multiline
                                        numberOfLines={4}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Sitio web</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="https://www.tuempresa.com (opcional)"
                                        placeholderTextColor="#666"
                                        value={registerForm.website}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, website: text })}
                                        keyboardType="url"
                                        autoCapitalize="none"
                                    />
                                </View>





                                {/* Términos y Condiciones */}
                                <View style={styles.termsSection}>
                                    <TouchableOpacity
                                        style={styles.termsContainer}
                                        onPress={() => setRegisterForm({ ...registerForm, acceptTerms: !registerForm.acceptTerms })}
                                    >
                                        <View style={[styles.checkbox, registerForm.acceptTerms && styles.checkboxChecked]}>
                                            {registerForm.acceptTerms && <MinimalistIcons name="check" size={24} color={'#888888'} isActive={false} />}
                                        </View>
                                        <Text style={styles.termsText}>
                                            Acepto los{' '}
                                            <Text style={styles.termsLink}>Términos y Condiciones</Text>
                                            {' '}de ZYRO *
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleRegister}
                        >
                            <LinearGradient
                                colors={['#C9A961', '#D4AF37', '#C9A961']}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>
                                    {registerForm.userType === 'company' ? 'PROCEDER AL PAGO' : 'Enviar Solicitud'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {registerForm.userType === 'company' && (
                            <TouchableOpacity
                                style={styles.backButtonCenter}
                                onPress={() => setShowRegister(false)}
                            >
                                <Text style={styles.backButtonCenterText}>← Volver</Text>
                            </TouchableOpacity>
                        )}

                        {registerForm.userType !== 'company' && (
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => setShowRegister(false)}
                            >
                                <Text style={styles.backButtonText}>← Volver</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );

    const renderMainApp = () => {
        if (currentScreen === 'collaboration-detail') {
            return (
                <CollaborationDetailScreenNew
                    collaboration={selectedCollaboration}
                    onBack={() => dispatch(setCurrentScreen('home'))}
                    onRequest={handleRequestCollaboration}
                    currentUser={currentUser}
                />
            );
        }

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" backgroundColor="#000000" />

                {/* Header */}
                <View style={styles.header}>
                    {/* Left side: Logo + City Selector */}
                    <View style={styles.headerLeft}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../assets/logozyrotransparente.png')}
                                style={styles.logoSmall}
                                resizeMode="contain"
                            />
                        </View>

                        {/* City Selector - Only visible on home tab and NOT for company users */}
                        {activeTab === 'home' && !isCompanyScreen() && (
                            <TouchableOpacity
                                style={styles.citySelector}
                                onPress={() => dispatch(toggleModal({ modalName: 'citySelector', isOpen: true }))}
                            >
                                <Text style={styles.cityText}>
                                    {selectedCity === 'all' ? 'TODAS' : (selectedCity ? selectedCity.toUpperCase() : 'MADRID')}
                                </Text>
                                <Text style={styles.dropdownIcon}>▼</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Right side: Notifications - Solo para usuarios NO empresa */}
                    {!isCompanyScreen() && (
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() => navigateToScreen('notifications')}
                            >
                                <MinimalistIcons name="notification" size={24} color={'#888888'} isActive={false} />
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <View style={styles.notificationBadge}>
                                        <Text style={styles.badgeText}>
                                            {notifications.filter(n => !n.read).length}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {renderCurrentScreen()}
                </View>

                {/* Bottom Navigation - Solo para usuarios influencers (NO empresa) */}
                {currentUser?.role !== 'company' && !isCompanyScreen() && (
                    <View style={styles.bottomNav}>
                        {renderBottomNavigation()}
                    </View>
                )}

                {/* Modals */}
                {renderModals()}

                {/* Edit Profile Modal */}
                <Modal
                    visible={showEditProfile}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <SafeAreaView style={styles.modalContainer}>
                        <LinearGradient
                            colors={['#000000', '#111111', '#000000']}
                            style={styles.modalGradient}
                        >
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={() => setShowEditProfile(false)}
                                >
                                    <MinimalistIcons name="close" size={24} color={'#888888'} isActive={false} />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Editar Perfil</Text>
                                <TouchableOpacity
                                    style={styles.modalSaveButton}
                                    onPress={handleSaveProfile}
                                >
                                    <Text style={styles.modalSaveText}>Guardar</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Modal Content */}
                            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                                {/* Personal Information Section */}
                                <View style={styles.formSection}>
                                    <Text style={styles.sectionTitle}>Información Personal</Text>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Nombre Completo *</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={editProfileForm.fullName}
                                            onChangeText={(text) => setEditProfileForm({ ...editProfileForm, fullName: text })}
                                            placeholder="Tu nombre completo"
                                            placeholderTextColor="#666666"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Email *</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={editProfileForm.email}
                                            onChangeText={(text) => setEditProfileForm({ ...editProfileForm, email: text })}
                                            placeholder="tu@email.com"
                                            placeholderTextColor="#666666"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Teléfono</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={editProfileForm.phone}
                                            onChangeText={(text) => setEditProfileForm({ ...editProfileForm, phone: text })}
                                            placeholder="+34 600 000 000"
                                            placeholderTextColor="#666666"
                                            keyboardType="phone-pad"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Fecha de Nacimiento</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={editProfileForm.birthDate}
                                            onChangeText={(text) => setEditProfileForm({ ...editProfileForm, birthDate: text })}
                                            placeholder="DD/MM/AAAA"
                                            placeholderTextColor="#666666"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Ciudad</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={editProfileForm.city}
                                            onChangeText={(text) => setEditProfileForm({ ...editProfileForm, city: text })}
                                            placeholder="Madrid, Barcelona, etc."
                                            placeholderTextColor="#666666"
                                        />
                                    </View>
                                </View>

                                {/* Social Media Section */}
                                <View style={styles.formSection}>
                                    <Text style={styles.sectionTitle}>Redes Sociales</Text>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Instagram *</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={editProfileForm.instagramUsername}
                                            onChangeText={(text) => setEditProfileForm({ ...editProfileForm, instagramUsername: text })}
                                            placeholder="@tu_usuario"
                                            placeholderTextColor="#666666"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Seguidores Instagram *</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={editProfileForm.instagramFollowers}
                                            onChangeText={(text) => setEditProfileForm({ ...editProfileForm, instagramFollowers: text })}
                                            placeholder="10000"
                                            placeholderTextColor="#666666"
                                            keyboardType="numeric"
                                        />
                                        <Text style={styles.inputHelper}>
                                            Número actual de seguidores en Instagram
                                        </Text>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>TikTok</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={editProfileForm.tiktokUsername}
                                            onChangeText={(text) => setEditProfileForm({ ...editProfileForm, tiktokUsername: text })}
                                            placeholder="@tu_usuario"
                                            placeholderTextColor="#666666"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Seguidores TikTok</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={editProfileForm.tiktokFollowers}
                                            onChangeText={(text) => setEditProfileForm({ ...editProfileForm, tiktokFollowers: text })}
                                            placeholder="5000"
                                            placeholderTextColor="#666666"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                {/* Info Section */}
                                <View style={styles.infoSection}>
                                    <Text style={styles.infoText}>
                                        * Campos obligatorios
                                    </Text>
                                    <Text style={styles.infoText}>
                                        Los cambios se guardarán permanentemente y se actualizarán en tiempo real.
                                    </Text>
                                </View>
                            </ScrollView>
                        </LinearGradient>
                    </SafeAreaView>
                </Modal>
            </SafeAreaView>
        );
    };


    // Función para guardar perfil con persistencia permanente
    const handleSaveProfilePermanent = async () => {
        try {
            console.log('💾 Guardando perfil con persistencia permanente...');

            // Validar campos obligatorios
            if (!editProfileForm.fullName || !editProfileForm.email || !editProfileForm.instagramUsername) {
                Alert.alert('Error', 'Por favor completa los campos obligatorios: Nombre, Email e Instagram');
                return;
            }

            // Validar número de seguidores
            const instagramFollowers = parseInt(editProfileForm.instagramFollowers) || 0;
            if (instagramFollowers < 0) {
                Alert.alert('Error', 'El número de seguidores debe ser mayor a 0');
                return;
            }

            // Crear datos actualizados del usuario
            const updatedUserData = {
                ...currentUser,
                fullName: editProfileForm.fullName,
                email: editProfileForm.email,
                phone: editProfileForm.phone,
                birthDate: editProfileForm.birthDate,
                city: editProfileForm.city,
                instagramUsername: editProfileForm.instagramUsername,
                instagramFollowers: instagramFollowers,
                tiktokUsername: editProfileForm.tiktokUsername,
                tiktokFollowers: parseInt(editProfileForm.tiktokFollowers) || 0,
                lastUpdated: new Date().toISOString()
            };

            console.log('📊 Actualizando seguidores con persistencia permanente:', {
                anterior: currentUser.instagramFollowers,
                nuevo: instagramFollowers,
                usuario: currentUser.email
            });

            // Guardar con sistema de persistencia permanente
            await saveFollowersPermanently(currentUser.id, currentUser.email, updatedUserData);

            // Actualizar estado de Redux
            dispatch(setUser(updatedUserData));

            // Cerrar modal de edición
            setShowEditProfile(false);

            console.log('✅ Perfil guardado con persistencia permanente');

            Alert.alert(
                '✅ Perfil Actualizado',
                'Tus datos han sido guardados permanentemente. Los seguidores se mantendrán incluso después de cerrar la app, reiniciar el servidor o cerrar sesión.',
                [{ text: 'OK' }]
            );

        } catch (error) {
            console.error('❌ Error guardando perfil:', error);
            Alert.alert('Error', 'No se pudo guardar el perfil. Inténtalo de nuevo.');
        }
    };



    const renderCurrentScreen = () => {
        switch (currentScreen) {
            case 'home':
                return renderHomeScreen();
            case 'map':
                return renderMapScreen();
            case 'history':
                return renderHistoryScreen();
            case 'profile':
                return renderProfileScreen();
            case 'settings':
                return renderSettingsScreen();
            case 'notifications':
                return renderNotificationsScreen();
            case 'help':
                return renderHelpScreen();
            case 'terms-of-service':
                return renderTermsOfServiceScreen();
            case 'privacy-policy':
                return renderPrivacyPolicyScreen();
            case 'change-password':
                return renderChangePasswordScreen();
            case 'company-data':
                return <CompanyDataScreen />;
            case 'company-dashboard-main':
                return <CompanyDashboardMain />;
            case 'company-requests':
                return <CompanyRequests />;
            case 'company-locations':
                return <CompanyLocationsScreen onBack={() => dispatch(setCurrentScreen('company'))} />;
            case 'company':
                return <CompanyNavigator />;
            default:
                return renderHomeScreen();
        }
    };

    const renderHomeScreen = () => {
        const filteredCollaborations = getFilteredCollaborations();

        console.log('🏠 Admin campaigns from Redux:', collaborations?.length || 0);
        console.log('🏠 Filtered admin campaigns:', filteredCollaborations?.length || 0);

        return (
            <ScrollView style={styles.screenContainer}>
                {/* Filters */}
                {/* Categories Filter */}
                <View style={styles.categoriesSection}>
                    <Text style={styles.categoriesTitle}>Categorías</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                        <TouchableOpacity
                            style={[styles.categoryChip, (!selectedCategory || selectedCategory === 'all') && styles.categoryChipActive]}
                            onPress={() => dispatch(setSelectedCategory('all'))}
                        >
                            <Text style={[styles.categoryChipText, (!selectedCategory || selectedCategory === 'all') && styles.categoryChipTextActive]}>
                                Todos
                            </Text>
                        </TouchableOpacity>
                        {dynamicCategories.map((category) => (
                            <TouchableOpacity
                                key={category}
                                style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
                                onPress={() => dispatch(setSelectedCategory(category))}
                            >
                                <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Collaborations List */}
                <View style={styles.collaborationsContainer}>
                    {filteredCollaborations.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                No hay campañas disponibles
                            </Text>
                            <Text style={styles.emptyStateSubtext}>
                                {collaborations?.length === 0
                                    ? 'El administrador aún no ha creado ninguna campaña'
                                    : 'No hay campañas que coincidan con los filtros seleccionados'
                                }
                            </Text>
                            <Text style={styles.emptyStateInfo}>
                                Las campañas se actualizan automáticamente
                            </Text>
                        </View>
                    ) : (
                        filteredCollaborations.map((collaboration) => (
                            <TouchableOpacity
                                key={collaboration.id}
                                style={styles.collaborationCard}
                                onPress={() => handleCollaborationPress(collaboration)}
                            >
                                {/* Background Image */}
                                <View style={styles.cardImageContainer}>
                                    <Image
                                        source={{ uri: collaboration.images[0] }}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                                        style={styles.cardOverlay}
                                    />

                                    {/* Category Badge */}
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryBadgeText}>
                                            {collaboration.category.charAt(0).toUpperCase() + collaboration.category.slice(1)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Card Content */}
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{collaboration.business}</Text>
                                    <Text style={styles.cardBusiness}>{collaboration.title}</Text>

                                    <Text style={styles.cardDescription} numberOfLines={2}>
                                        {collaboration.description}
                                    </Text>

                                    <View style={styles.cardFooter}>
                                        <View style={styles.compactStats}>
                                            <View style={styles.compactStatBox}>
                                                <Text style={styles.compactStatValue}>
                                                    {collaboration.minFollowers ? collaboration.minFollowers.toLocaleString() : '1K'}
                                                </Text>
                                                <Text style={styles.compactStatLabel}>seguidores</Text>
                                            </View>
                                            <View style={styles.compactStatBox}>
                                                <Text style={styles.compactStatValue}>
                                                    {collaboration.companions ? collaboration.companions.replace('+', '') : '2'}
                                                </Text>
                                                <Text style={styles.compactStatLabel}>acompañantes</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.detailsButton}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                handleCollaborationPress(collaboration);
                                            }}
                                        >
                                            <Text style={styles.detailsButtonText}>Ver Detalles</Text>
                                            <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        );
    };

    const renderMapScreen = () => (
        <View style={styles.screenContainer}>
            <InteractiveMapNew
                collaborations={collaborations}
                onMarkerPress={handleCollaborationPress}
                currentUser={currentUser}
            />
        </View>
    );

    const renderHistoryScreen = () => (
        <View style={styles.screenContainer}>
            {/* History Tabs */}
            <View style={styles.historyTabs}>
                {['PRÓXIMOS', 'PASADOS', 'CANCELADOS'].map((tab, index) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.historyTab,
                            historyTab === index && styles.activeHistoryTab
                        ]}
                        onPress={() => dispatch(setHistoryTab(index))}
                    >
                        <Text style={[
                            styles.historyTabText,
                            historyTab === index && styles.activeHistoryTabText
                        ]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* History Content */}
            <View style={styles.historyContent}>
                {historyTab === 0 && (
                    <UserRequestsManager
                        userId={currentUser?.id}
                        activeTab="upcoming"
                    />
                )}
                {historyTab === 1 && (
                    <UserRequestsManager
                        userId={currentUser?.id}
                        activeTab="past"
                    />
                )}
                {historyTab === 2 && (
                    <UserRequestsManager
                        userId={currentUser?.id}
                        activeTab="cancelled"
                    />
                )}
            </View>
        </View>
    );

    const renderProfileScreen = () => (
        <ScrollView style={styles.screenContainer}>
            <View style={styles.profileContainer}>
                {/* Profile Card with Photo */}
                <View style={styles.profileCard}>
                    <LinearGradient
                        colors={['#C9A961', '#D4AF37', '#C9A961']}
                        style={styles.profileCardGradient}
                    >
                        <TouchableOpacity
                            style={styles.profileImageContainer}
                            onPress={handleImagePicker}
                        >
                            <Image
                                source={{
                                    uri: profileImageUri || currentUser?.profileImage || 'https://via.placeholder.com/80x80/CCCCCC/000000?text=👤'
                                }}
                                style={styles.profileImage}
                            />
                            <View style={styles.cameraIcon}>
                                <MinimalistIcons name="circle" size={24} color={'#888888'} isActive={false} />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.profileName}>{currentUser?.fullName || 'Usuario'}</Text>
                        <Text style={styles.profileRole}>Influencer</Text>
                    </LinearGradient>
                </View>

                {/* Stats Section - Only Followers */}
                <View style={styles.followersContainer}>
                    <View style={styles.followersItem}>
                        <Text style={styles.followersNumber}>
                            {formatFollowerCount(currentUser?.instagramFollowers)}
                        </Text>
                        <Text style={styles.followersLabel}>Seguidores</Text>
                    </View>
                </View>

                {/* Menu Options */}
                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleImagePicker}>
                        <Text style={styles.menuText}>Actualizar Foto de Perfil</Text>
                        <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
                        <Text style={styles.menuText}>Datos Personales</Text>
                        <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateToScreen('terms-of-service')}
                    >
                        <Text style={styles.menuText}>Normas de Uso</Text>
                        <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateToScreen('privacy-policy')}
                    >
                        <Text style={styles.menuText}>Política de Privacidad</Text>
                        <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateToScreen('change-password')}
                    >
                        <Text style={styles.menuText}>Contraseña y Seguridad</Text>
                        <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                    </TouchableOpacity>





                    <TouchableOpacity
                        style={[styles.menuItem, styles.logoutItem]}
                        onPress={handleLogoutWithConfirmation}
                    >
                        <Text style={[styles.menuText, styles.logoutText]}>Cerrar Sesión</Text>
                        <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, styles.deleteItem]}
                        onPress={() => {
                            Alert.alert(
                                'Borrar Cuenta (GDPR)',
                                '¿Estás seguro? Esta acción eliminará permanentemente todos tus datos.',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    { text: 'Borrar', style: 'destructive', onPress: handleDeleteAccount }
                                ]
                            );
                        }}
                    >
                        <Text style={[styles.menuText, styles.deleteText]}>Borrar Cuenta (GDPR)</Text>
                        <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
    const renderSettingsScreen = () => (
        <ScrollView style={styles.screenContainer}>
            <View style={styles.settingsContainer}>
                <View style={styles.settingsHeader}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigateToScreen('profile')}
                    >
                        <Text style={styles.backButtonText}>← Volver</Text>
                    </TouchableOpacity>
                    <Text style={styles.settingsTitle}>Configuración</Text>
                </View>

                <View style={styles.settingsContent}>
                    <View style={styles.settingGroup}>
                        <Text style={styles.settingGroupTitle}>Cuenta</Text>

                        <TouchableOpacity style={styles.settingItem}>
                            <Text style={styles.settingText}>Editar perfil</Text>
                            <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem}>
                            <Text style={styles.settingText}>Cambiar contraseña</Text>
                            <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.settingGroup}>
                        <Text style={styles.settingGroupTitle}>Notificaciones</Text>

                        <View style={styles.settingItem}>
                            <Text style={styles.settingText}>Notificaciones push</Text>
                            <Switch
                                value={true}
                                onValueChange={() => { }}
                                trackColor={{ false: '#333', true: '#C9A961' }}
                                thumbColor="#fff"
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <Text style={styles.settingText}>Notificaciones por email</Text>
                            <Switch
                                value={true}
                                onValueChange={() => { }}
                                trackColor={{ false: '#333', true: '#C9A961' }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>

                    <View style={styles.settingGroup}>
                        <Text style={styles.settingGroupTitle}>Privacidad</Text>

                        <TouchableOpacity style={styles.settingItem}>
                            <Text style={styles.settingText}>Política de privacidad</Text>
                            <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem}>
                            <Text style={styles.settingText}>Términos de servicio</Text>
                            <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    const renderNotificationsScreen = () => (
        <ScrollView style={styles.screenContainer}>
            <View style={styles.notificationsContainer}>
                <View style={styles.notificationsHeader}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigateToScreen('home')}
                    >
                        <Text style={styles.backButtonText}>← Volver</Text>
                    </TouchableOpacity>
                    <Text style={styles.notificationsTitle}>Notificaciones</Text>
                </View>

                <View style={styles.notificationsContent}>
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <TouchableOpacity
                                key={notification.id}
                                style={[
                                    styles.notificationItem,
                                    !notification.read && styles.unreadNotification
                                ]}
                                onPress={() => dispatch(markNotificationAsRead(notification.id))}
                            >
                                <View style={styles.notificationContent}>
                                    <Text style={styles.notificationTitle}>
                                        {notification.title}
                                    </Text>
                                    <Text style={styles.notificationMessage}>
                                        {notification.message}
                                    </Text>
                                    <Text style={styles.notificationTime}>
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </Text>
                                </View>
                                {!notification.read && (
                                    <View style={styles.unreadDot} />
                                )}
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                No tienes notificaciones
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );

    const renderHelpScreen = () => (
        <ScrollView style={styles.screenContainer}>
            <View style={styles.helpContainer}>
                <View style={styles.helpHeader}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigateToScreen('profile')}
                    >
                        <Text style={styles.backButtonText}>← Volver</Text>
                    </TouchableOpacity>
                    <Text style={styles.helpTitle}>Ayuda y Soporte</Text>
                </View>

                <View style={styles.helpContent}>
                    <View style={styles.helpSection}>
                        <Text style={styles.helpSectionTitle}>Preguntas Frecuentes</Text>

                        <TouchableOpacity style={styles.helpItem}>
                            <Text style={styles.helpQuestion}>¿Cómo solicitar una colaboración?</Text>
                            <Text style={styles.helpAnswer}>
                                Navega por las colaboraciones disponibles, selecciona una que te interese
                                y pulsa "Solicitar Colaboración". Completa el formulario con tus datos.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.helpItem}>
                            <Text style={styles.helpQuestion}>¿Cuánto tiempo tarda la aprobación?</Text>
                            <Text style={styles.helpAnswer}>
                                Las solicitudes se revisan en 24-48 horas. Recibirás una notificación
                                cuando tu solicitud sea aprobada o rechazada.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.helpItem}>
                            <Text style={styles.helpQuestion}>¿Qué contenido debo crear?</Text>
                            <Text style={styles.helpAnswer}>
                                Cada colaboración especifica el contenido requerido. Generalmente son
                                2 historias de Instagram (1 en video) o 1 TikTok, con un plazo de 72 horas.
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.helpSection}>
                        <Text style={styles.helpSectionTitle}>Contacto</Text>

                        <TouchableOpacity
                            style={styles.contactButton}
                            onPress={() => Linking.openURL('mailto:soporte@zyro.com')}
                        >
                            <Text style={styles.contactButtonText}>◉ Enviar Email</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.contactButton}
                            onPress={() => Linking.openURL('tel:+34900123456')}
                        >
                            <Text style={styles.contactButtonText}>◉ Llamar Soporte</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    const renderTermsOfServiceScreen = () => {

        return (
            <ScrollView style={styles.screenContainer}>
                <View style={styles.termsContainer}>
                    <View style={styles.termsHeader}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigateToScreen('profile')}
                        >
                            <Text style={styles.backButtonText}>← Volver</Text>
                        </TouchableOpacity>
                        <Text style={styles.termsTitle}>Normas de Uso</Text>
                    </View>

                    {isTermsLoading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Cargando normas de uso...</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.termsIconContainer}>
                                <LinearGradient
                                    colors={['#C9A961', '#D4AF37']}
                                    style={styles.termsIconGradient}
                                >
                                    <Text style={styles.termsIcon}>📋</Text>
                                </LinearGradient>
                                <Text style={styles.termsSubtitle}>
                                    Lee atentamente nuestras normas para usar Zyro de forma correcta
                                </Text>
                            </View>

                            <View style={styles.termsTextContainer}>
                                <Text style={styles.termsText}>
                                    {termsContent}
                                </Text>
                            </View>

                            <View style={styles.termsFooter}>
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => {
                                        Alert.alert(
                                            '✅ Normas Aceptadas',
                                            'Has confirmado que has leído y aceptas nuestras normas de uso.',
                                            [
                                                {
                                                    text: 'OK',
                                                    onPress: () => navigateToScreen('profile')
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <LinearGradient
                                        colors={['#C9A961', '#D4AF37']}
                                        style={styles.buttonGradient}
                                    >
                                        <Text style={styles.acceptButtonText}>✓ He leído y acepto</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.backToProfileButton}
                                    onPress={() => navigateToScreen('profile')}
                                >
                                    <Text style={styles.backToProfileButtonText}>← Volver al perfil</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        );
    };

    const renderPrivacyPolicyScreen = () => {
        return (
            <ScrollView style={styles.screenContainer}>
                <View style={styles.termsContainer}>
                    <View style={styles.termsHeader}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigateToScreen('profile')}
                        >
                            <Text style={styles.backButtonText}>← Volver</Text>
                        </TouchableOpacity>
                        <Text style={styles.termsTitle}>Política de Privacidad</Text>
                    </View>

                    {isPrivacyLoading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Cargando política de privacidad...</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.termsIconContainer}>
                                <LinearGradient
                                    colors={['#C9A961', '#D4AF37']}
                                    style={styles.termsIconGradient}
                                >
                                    <Text style={styles.termsIcon}>🔒</Text>
                                </LinearGradient>
                                <Text style={styles.termsSubtitle}>
                                    Conoce cómo protegemos y utilizamos tu información personal
                                </Text>
                            </View>

                            <View style={styles.termsTextContainer}>
                                <Text style={styles.termsText}>
                                    {privacyContent}
                                </Text>
                            </View>

                            <View style={styles.termsFooter}>
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => {
                                        Alert.alert(
                                            '✅ Política Aceptada',
                                            'Has confirmado que has leído y aceptas nuestra política de privacidad.',
                                            [
                                                {
                                                    text: 'OK',
                                                    onPress: () => navigateToScreen('profile')
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <LinearGradient
                                        colors={['#C9A961', '#D4AF37']}
                                        style={styles.buttonGradient}
                                    >
                                        <Text style={styles.acceptButtonText}>✓ He leído y acepto</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.backToProfileButton}
                                    onPress={() => navigateToScreen('profile')}
                                >
                                    <Text style={styles.backToProfileButtonText}>← Volver al perfil</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        );
    };

    const renderChangePasswordScreen = () => {
        return (
            <ScrollView style={styles.screenContainer}>
                <View style={styles.changePasswordContainer}>
                    <View style={styles.changePasswordHeader}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigateToScreen('profile')}
                        >
                            <Text style={styles.backButtonText}>← Volver</Text>
                        </TouchableOpacity>
                        <Text style={styles.changePasswordTitle}>Contraseña y Seguridad</Text>
                    </View>

                    <View style={styles.changePasswordIconContainer}>
                        <LinearGradient
                            colors={['#C9A961', '#D4AF37']}
                            style={styles.changePasswordIconGradient}
                        >
                            <Text style={styles.changePasswordIcon}>🔐</Text>
                        </LinearGradient>
                        <Text style={styles.changePasswordSubtitle}>
                            Cambia tu contraseña para mantener tu cuenta segura
                        </Text>
                    </View>

                    <View style={styles.changePasswordForm}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Contraseña Actual</Text>
                            <TextInput
                                style={styles.textInput}
                                value={changePasswordForm.currentPassword}
                                onChangeText={(text) => setChangePasswordForm({
                                    ...changePasswordForm,
                                    currentPassword: text
                                })}
                                placeholder="Ingresa tu contraseña actual"
                                placeholderTextColor="#666"
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nueva Contraseña</Text>
                            <TextInput
                                style={styles.textInput}
                                value={changePasswordForm.newPassword}
                                onChangeText={(text) => setChangePasswordForm({
                                    ...changePasswordForm,
                                    newPassword: text
                                })}
                                placeholder="Ingresa tu nueva contraseña"
                                placeholderTextColor="#666"
                                secureTextEntry
                                autoCapitalize="none"
                            />
                            <Text style={styles.passwordHint}>
                                La contraseña debe tener al menos 6 caracteres
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Confirmar Nueva Contraseña</Text>
                            <TextInput
                                style={styles.textInput}
                                value={changePasswordForm.confirmPassword}
                                onChangeText={(text) => setChangePasswordForm({
                                    ...changePasswordForm,
                                    confirmPassword: text
                                })}
                                placeholder="Confirma tu nueva contraseña"
                                placeholderTextColor="#666"
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.changePasswordActions}>
                            <TouchableOpacity
                                style={[styles.changePasswordButton, isChangingPassword && styles.changePasswordButtonDisabled]}
                                onPress={handleChangePassword}
                                disabled={isChangingPassword}
                            >
                                <LinearGradient
                                    colors={isChangingPassword ? ['#666', '#888'] : ['#C9A961', '#D4AF37']}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.changePasswordButtonText}>
                                        {isChangingPassword ? '🔄 Cambiando...' : '🔐 Cambiar Contraseña'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelPasswordButton}
                                onPress={() => {
                                    setChangePasswordForm({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    });
                                    navigateToScreen('profile');
                                }}
                                disabled={isChangingPassword}
                            >
                                <Text style={styles.cancelPasswordButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.securityInfo}>
                            <Text style={styles.securityInfoTitle}>🛡️ Información de Seguridad</Text>
                            <Text style={styles.securityInfoText}>
                                • Tu nueva contraseña se guardará de forma permanente{'\n'}
                                • Podrás usar la nueva contraseña para iniciar sesión{'\n'}
                                • Se mantendrá incluso si cierras la aplicación{'\n'}
                                • Recomendamos usar una contraseña segura y única
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    };

    // Componente de iconos minimalistas premium para ZYRO
    const ZyroIcon = ({ type, isActive, size = 24 }) => {
        const color = isActive ? '#D4AF37' : '#888888';
        const strokeWidth = isActive ? 2.5 : 2;

        switch (type) {
            case 'home':
                return (
                    <View style={[styles.iconWrapper, { width: size, height: size }]}>
                        {/* Casa minimalista - outline elegante */}
                        <View style={[styles.homeBase, {
                            borderColor: color,
                            borderWidth: strokeWidth,
                            backgroundColor: isActive ? 'transparent' : 'transparent'
                        }]} />
                        <View style={[styles.homeRoof, {
                            borderBottomColor: color,
                            borderBottomWidth: strokeWidth
                        }]} />
                        <View style={[styles.homeDoor, {
                            backgroundColor: color,
                            opacity: isActive ? 1 : 0.7
                        }]} />
                    </View>
                );

            case 'map':
                return (
                    <View style={[styles.iconWrapper, { width: size, height: size }]}>
                        {/* Mapa minimalista - plegado elegante */}
                        <View style={[styles.mapBase, {
                            borderColor: color,
                            borderWidth: strokeWidth
                        }]} />
                        <View style={[styles.mapFold1, {
                            borderRightColor: color,
                            borderRightWidth: strokeWidth
                        }]} />
                        <View style={[styles.mapFold2, {
                            borderRightColor: color,
                            borderRightWidth: strokeWidth
                        }]} />
                    </View>
                );

            case 'history':
                return (
                    <View style={[styles.iconWrapper, { width: size, height: size }]}>
                        {/* Reloj minimalista - elegante */}
                        <View style={[styles.clockCircle, {
                            borderColor: color,
                            borderWidth: strokeWidth
                        }]} />
                        <View style={[styles.clockHourHand, {
                            backgroundColor: color
                        }]} />
                        <View style={[styles.clockMinuteHand, {
                            backgroundColor: color
                        }]} />
                        <View style={[styles.clockCenter, {
                            backgroundColor: color
                        }]} />
                    </View>
                );

            case 'profile':
                return (
                    <View style={[styles.iconWrapper, { width: size, height: size }]}>
                        {/* Persona minimalista - elegante */}
                        <View style={[styles.profileHead, {
                            borderColor: color,
                            borderWidth: strokeWidth,
                            backgroundColor: isActive ? color : 'transparent'
                        }]} />
                        <View style={[styles.profileBody, {
                            borderColor: color,
                            borderWidth: strokeWidth,
                            backgroundColor: isActive ? color : 'transparent'
                        }]} />
                    </View>
                );

            default:
                return <View style={{ width: size, height: size }} />;
        }
    };

    const renderBottomNavigation = () => {
        const tabs = [
            { type: 'home', label: 'Inicio' },
            { type: 'map', label: 'Mapa' },
            { type: 'history', label: 'Historial' },
            { type: 'profile', label: 'Perfil' }
        ];

        return (
            <View style={styles.tabContainer}>
                {tabs.map((tab, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.tab,
                            activeTab === index && styles.activeTab
                        ]}
                        onPress={() => handleTabPress(index)}
                        activeOpacity={0.7}
                    >
                        <View style={[
                            styles.tabIconContainer,
                            activeTab === index && styles.activeTabIconContainer
                        ]}>
                            <MinimalistIcons
                                name={tab.type}
                                size={22}
                                color={activeTab === index ? '#C9A961' : '#888888'}
                                isActive={activeTab === index}
                                strokeWidth={activeTab === index ? 2.5 : 2}
                            />
                        </View>
                        <Text style={[
                            styles.tabLabel,
                            activeTab === index && styles.activeTabLabel
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    // Navigation handler



    const renderModals = () => (
        <>
            {/* Elegant City Selector Modal - Bottom Sheet */}
            <Modal
                visible={modals.citySelector}
                transparent={true}
                animationType="slide"
                onRequestClose={() => dispatch(toggleModal({ modalName: 'citySelector', isOpen: false }))}
            >
                <View style={styles.elegantModalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => dispatch(toggleModal({ modalName: 'citySelector', isOpen: false }))}
                    />
                    <View style={styles.elegantModalContent}>
                        {/* Handle bar */}
                        <View style={styles.modalHandle} />

                        {/* Header */}
                        <View style={styles.elegantModalHeader}>
                            <Text style={styles.elegantModalTitle}>Seleccionar Ciudad</Text>
                            <Text style={styles.modalSubtitle}>Elige tu ubicación preferida</Text>
                        </View>

                        {/* Cities list */}
                        <View style={{ paddingHorizontal: 20, maxHeight: 400 }}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                            >
                                {/* All cities option */}
                                <TouchableOpacity
                                    style={[
                                        styles.elegantCityItem,
                                        selectedCity === 'all' && styles.elegantCityItemSelected
                                    ]}
                                    onPress={() => {
                                        dispatch(setSelectedCity('all'));
                                        dispatch(toggleModal({ modalName: 'citySelector', isOpen: false }));
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={selectedCity === 'all' ?
                                            ['#C9A961', '#D4AF37'] :
                                            ['transparent', 'transparent']
                                        }
                                        style={styles.cityItemGradient}
                                    >
                                        <View style={styles.cityItemContent}>
                                            <MinimalistIcons name="world" size={18} color={'#888888'} isActive={false} />
                                            <Text style={[
                                                styles.elegantCityText,
                                                selectedCity === 'all' && styles.elegantCityTextSelected
                                            ]}>
                                                Todas las ciudades
                                            </Text>
                                            {selectedCity === 'all' && (
                                                <MinimalistIcons name="check" size={18} color={'#C9A961'} isActive={true} />
                                            )}
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Individual cities */}
                                {dynamicCities.map((city, index) => (
                                    <TouchableOpacity
                                        key={city}
                                        style={[
                                            styles.elegantCityItem,
                                            selectedCity === city && styles.elegantCityItemSelected
                                        ]}
                                        onPress={() => {
                                            dispatch(setSelectedCity(city));
                                            dispatch(toggleModal({ modalName: 'citySelector', isOpen: false }));
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <LinearGradient
                                            colors={selectedCity === city ?
                                                ['#C9A961', '#D4AF37'] :
                                                ['transparent', 'transparent']
                                            }
                                            style={styles.cityItemGradient}
                                        >
                                            <View style={styles.cityItemContent}>
                                                <MinimalistIcons name="location" size={18} color={'#888888'} isActive={false} />
                                                <Text style={[
                                                    styles.elegantCityText,
                                                    selectedCity === city && styles.elegantCityTextSelected
                                                ]}>
                                                    {city}
                                                </Text>
                                                {selectedCity === city && (
                                                    <MinimalistIcons name="check" size={18} color={'#C9A961'} isActive={true} />
                                                )}
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Footer */}
                        <View style={styles.elegantModalFooter}>
                            <TouchableOpacity
                                style={styles.elegantCloseButton}
                                onPress={() => dispatch(toggleModal({ modalName: 'citySelector', isOpen: false }))}
                            >
                                <Text style={styles.elegantCloseButtonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Category Selector Modal */}
            <Modal
                visible={modals.categorySelector}
                transparent={true}
                animationType="slide"
                onRequestClose={() => dispatch(toggleModal({ modalName: 'categorySelector' }))}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Categoría</Text>

                        <ScrollView style={styles.modalList}>
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    dispatch(setSelectedCategory(null));
                                    dispatch(toggleModal({ modalName: 'categorySelector' }));
                                }}
                            >
                                <Text style={styles.modalItemText}>Todas las categorías</Text>
                                {!selectedCategory && (
                                    <MinimalistIcons name="check" size={24} color={'#C9A961'} isActive={true} />
                                )}
                            </TouchableOpacity>

                            {dynamicCategories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        dispatch(setSelectedCategory(category));
                                        dispatch(toggleModal({ modalName: 'categorySelector' }));
                                    }}
                                >
                                    <Text style={styles.modalItemText}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </Text>
                                    {selectedCategory === category && (
                                        <MinimalistIcons name="check" size={24} color={'#C9A961'} isActive={true} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => dispatch(toggleModal({ modalName: 'categorySelector' }))}
                        >
                            <Text style={styles.modalCloseText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );

    // Main render
    if (showStripeSubscription) {
        console.log('🎯 Renderizando componente de Stripe');
        return (
            <CompanyRegistrationWithStripe
                onBack={() => {
                    setShowStripeSubscription(false);
                    setShowRegister(true);
                }}
                onSuccess={async (subscriptionData) => {
                    try {
                        // Get stored company data
                        const companyData = await StorageService.getData('temp_company_registration');
                        
                        // Create complete company profile with subscription
                        const completeCompanyData = {
                            ...companyData,
                            ...subscriptionData,
                            id: `company_${Date.now()}`,
                            role: 'company',
                            status: 'active', // Companies with paid subscription are immediately active
                            registrationDate: new Date().toISOString(),
                            subscriptionActive: true
                        };

                        // Store company data using the correct method
                        console.log('💾 Guardando datos completos de empresa con ID:', completeCompanyData.id);
                        console.log('📋 Datos de empresa a guardar:', {
                            companyName: completeCompanyData.companyName,
                            companyEmail: completeCompanyData.companyEmail,
                            cifNif: completeCompanyData.cifNif
                        });
                        
                        await StorageService.saveCompanyData(completeCompanyData);
                        console.log('✅ Datos de empresa guardados correctamente con saveCompanyData');

                        // Clean up temporary data
                        await StorageService.removeData('temp_company_registration');

                        // Clear form data after successful company registration
                        await clearFormData();

                        // Login the company user with complete data
                        console.log('🔐 Iniciando sesión de empresa con ID:', completeCompanyData.id);
                        dispatch(loginUser({
                            id: completeCompanyData.id,
                            email: completeCompanyData.companyEmail,
                            companyEmail: completeCompanyData.companyEmail, // Asegurar que esté disponible
                            role: 'company',
                            companyName: completeCompanyData.companyName,
                            fullName: completeCompanyData.companyName, // Para compatibilidad
                            subscriptionPlan: completeCompanyData.selectedPlan,
                            subscriptionActive: true,
                            // Incluir todos los datos del formulario de registro
                            cifNif: completeCompanyData.cifNif,
                            companyAddress: completeCompanyData.companyAddress,
                            companyPhone: completeCompanyData.companyPhone,
                            representativeName: completeCompanyData.representativeName,
                            representativeEmail: completeCompanyData.representativeEmail,
                            representativePosition: completeCompanyData.representativePosition,
                            businessType: completeCompanyData.businessType,
                            businessDescription: completeCompanyData.businessDescription,
                            website: completeCompanyData.website
                        }));
                        console.log('✅ Sesión de empresa iniciada correctamente');

                        setShowStripeSubscription(false);
                        Alert.alert('¡Éxito!', 'Registro completado. Bienvenido a Zyro Marketplace.');
                        
                    } catch (error) {
                        console.error('Error completing company registration:', error);
                        Alert.alert('Error', 'Hubo un problema completando el registro. Por favor contacta soporte.');
                    }
                }}
            />
        );
    }

    if (showPaymentScreen) {
        return renderPaymentScreen();
    }

    if (showRegister) {
        return renderRegisterScreen();
    }

    if (!isAuthenticated && currentScreen === 'login') {
        return renderLoginScreen();
    }

    if (!isAuthenticated && currentScreen === 'forgotPassword') {
        return renderForgotPasswordScreen();
    }

    if (isAuthenticated) {
        // Show admin panel for admin users
        if (currentUser?.role === 'admin') {
            return <AdminPanel />;
        }
        return renderMainApp();
    }

    if (!isAuthenticated && currentScreen === 'welcome') {
        return renderWelcomeScreen();
    }

    return renderWelcomeScreen();
};

// Styles with super logo sizes according to LOGO_SUPER_SIZE_UPDATE.md
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },

    // Welcome Screen Styles
    welcomeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    welcomeContent: {
        alignItems: 'center',
        width: '100%',
    },
    logoWelcomeContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    // Logo sizes according to LOGO_SUPER_SIZE_UPDATE.md
    logoWelcome: {
        width: 280,  // Super size: 280x280px (+56% larger)
        height: 280,
    },
    logoSmall: {
        width: 70,   // Reduced size for compact header
        height: 70,
    },
    logoLarge: {
        width: 130,  // Super size: 130px height (+44% larger)
        height: 130,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 0,  // No margin in header
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Cinzel' : 'serif',
        letterSpacing: 3,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#CCCCCC',
        textAlign: 'center',
        marginBottom: 40,
        fontFamily: 'Inter',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    primaryButton: {
        width: '100%',
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradientButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#C9A961',
        alignItems: 'center',
        marginBottom: 20,
    },
    secondaryButtonText: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },
    loginLink: {
        marginTop: 10,
    },
    loginLinkText: {
        color: '#CCCCCC',
        fontSize: 14,
        textDecorationLine: 'underline',
        fontFamily: 'Inter',
    },

    // Login Screen Styles
    loginContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    loginContent: {
        alignItems: 'center',
    },
    loginTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 30,
        textAlign: 'center',
        fontFamily: 'Inter',
    },

    // Register Screen Styles
    registerContainer: {
        flex: 1,
        padding: 20,
    },
    registerContent: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    registerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 30,
        textAlign: 'center',
        fontFamily: 'Inter',
    },

    // Form Styles
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter',
    },

    // Statistics Section
    statisticsSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 10,
        fontFamily: 'Inter',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#CCCCCC',
        marginBottom: 15,
        fontFamily: 'Inter',
    },
    uploadButton: {
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#C9A961',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 10,
        alignItems: 'center',
    },
    uploadButtonText: {
        color: '#C9A961',
        fontSize: 14,
        fontFamily: 'Inter',
    },
    uploadButtonCompleted: {
        backgroundColor: '#1A4A1A',
        borderColor: '#4CAF50',
    },
    uploadButtonTextCompleted: {
        color: '#4CAF50',
    },
    imagePreviewContainer: {
        marginTop: 10,
        marginBottom: 10,
    },
    imagePreviewWrapper: {
        position: 'relative',
        marginRight: 8,
    },
    imagePreview: {
        width: 60,
        height: 60,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C9A961',
    },
    deleteImageButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF4444',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    deleteImageText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        lineHeight: 14,
    },

    // Subscription Section
    subscriptionSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    planOption: {
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        position: 'relative',
    },
    popularPlan: {
        borderColor: '#C9A961',
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        left: 16,
        backgroundColor: '#C9A961',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    planTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },
    planPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        fontFamily: 'Inter',
    },
    planDescription: {
        fontSize: 14,
        color: '#CCCCCC',
        fontFamily: 'Inter',
    },

    // Company Form Styles
    inputLabel: {
        fontSize: 14,
        color: '#C9A961',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    selectedPlan: {
        borderColor: '#C9A961',
        backgroundColor: '#1A1A1A',
    },
    planDuration: {
        fontSize: 12,
        color: '#CCCCCC',
        fontFamily: 'Inter',
    },
    planFeatures: {
        marginTop: 10,
    },
    planFeature: {
        fontSize: 12,
        color: '#CCCCCC',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    selectedPayment: {
        borderColor: '#C9A961',
        backgroundColor: '#1A1A1A',
    },
    paymentIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    paymentText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },

    // Setup Fee Styles
    setupFeeSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    setupFeeContainer: {
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#C9A961',
        borderRadius: 12,
        padding: 16,
    },
    setupFeeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    setupFeePrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#C9A961',
        marginRight: 10,
        fontFamily: 'Inter',
    },
    setupFeeLabel: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    setupFeeDescription: {
        fontSize: 13,
        color: '#CCCCCC',
        lineHeight: 18,
        fontFamily: 'Inter',
    },

    // Terms and Conditions Styles
    termsSection: {
        marginTop: 20,
        marginBottom: 10,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 5,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#C9A961',
        borderRadius: 4,
        marginRight: 12,
        marginTop: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxChecked: {
        backgroundColor: '#C9A961',
    },
    checkmark: {
        color: '#000000',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },
    termsText: {
        fontSize: 14,
        color: '#CCCCCC',
        flex: 1,
        lineHeight: 20,
        fontFamily: 'Inter',
    },
    termsLink: {
        color: '#C9A961',
        textDecorationLine: 'underline',
        fontWeight: '600',
    },

    // Payment Screen Styles
    paymentContainer: {
        flex: 1,
        padding: 20,
    },
    paymentContent: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    paymentTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 30,
        textAlign: 'center',
        fontFamily: 'Inter',
    },
    paymentSummary: {
        width: '100%',
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#C9A961',
        borderRadius: 12,
        padding: 16,
        marginBottom: 30,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 15,
        fontFamily: 'Inter',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#CCCCCC',
        fontFamily: 'Inter',
    },
    summaryValue: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },
    summaryTotal: {
        borderTopWidth: 1,
        borderTopColor: '#333333',
        paddingTop: 12,
        marginTop: 8,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C9A961',
        fontFamily: 'Inter',
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        fontFamily: 'Inter',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    transferInfo: {
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
    },
    transferInfoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 10,
        fontFamily: 'Inter',
    },
    transferInfoText: {
        fontSize: 13,
        color: '#CCCCCC',
        marginBottom: 5,
        fontFamily: 'Inter',
    },

    // Influencer Form Styles
    verificationSection: {
        marginTop: 10,
        marginBottom: 20,
    },
    verificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    verificationSubtitle: {
        fontSize: 13,
        color: '#CCCCCC',
        marginBottom: 15,
        lineHeight: 18,
        fontFamily: 'Inter',
    },
    verificationCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333333',
    },
    verificationCardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    verificationItem: {
        fontSize: 12,
        color: '#CCCCCC',
        marginBottom: 4,
        fontFamily: 'Inter',
        paddingLeft: 8,
    },

    backButton: {
        alignSelf: 'flex-start',
        marginTop: 20,
    },
    backButtonText: {
        color: '#C9A961',
        fontSize: 16,
        fontFamily: 'Inter',
    },
    forgotPasswordButton: {
        alignSelf: 'center',
        marginTop: 15,
        marginBottom: 10,
    },
    forgotPasswordText: {
        color: '#C9A961',
        fontSize: 14,
        textDecorationLine: 'underline',
        fontFamily: 'Inter',
    },
    recoveryDescription: {
        color: '#CCCCCC',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
        fontFamily: 'Inter',
    },
    secondaryButton: {
        alignSelf: 'center',
        marginTop: 15,
    },
    secondaryButtonText: {
        color: '#CCCCCC',
        fontSize: 14,
        textDecorationLine: 'underline',
        fontFamily: 'Inter',
    },
    backButtonCenter: {
        alignSelf: 'center',
        marginTop: 20,
    },
    backButtonCenterText: {
        color: '#CCCCCC',
        fontSize: 16,
        fontFamily: 'Inter',
    },

    // Main App Styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,  // Reduced for smaller header
        backgroundColor: '#000000',
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    citySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111111',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#C9A961',
        marginLeft: 12,
    },
    cityText: {
        color: '#C9A961',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 8,
        fontFamily: 'Inter',
    },
    dropdownIcon: {
        color: '#C9A961',
        fontSize: 12,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        marginLeft: 15,
        position: 'relative',
    },
    headerButtonText: {
        fontSize: 20,
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#C9A961',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },

    content: {
        flex: 1,
    },
    screenContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },

    // Home Screen Styles
    categoriesSection: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    categoriesTitle: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    categoriesScroll: {
        flexDirection: 'row',
    },
    categoryChip: {
        backgroundColor: '#333333',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#555555',
    },
    categoryChipActive: {
        backgroundColor: '#C9A961',
        borderColor: '#C9A961',
    },
    categoryChipText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    categoryChipTextActive: {
        color: '#000000',
        fontWeight: 'bold',
    },
    filterText: {
        color: '#C9A961',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },

    collaborationsContainer: {
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyStateText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        color: '#CCCCCC',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    emptyStateInfo: {
        color: '#C9A961',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 15,
        fontWeight: '600',
        fontStyle: 'italic',
    },
    syncButton: {
        backgroundColor: '#C9A961',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    syncButtonText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    debugButton: {
        backgroundColor: '#333333',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        marginTop: 10,
    },
    debugButtonText: {
        color: '#CCCCCC',
        fontSize: 12,
        textAlign: 'center',
    },
    aardeButton: {
        backgroundColor: '#C9A961',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        marginTop: 10,
    },
    aardeButtonText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    collaborationCard: {
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        width: '100%',
    },
    cardImageContainer: {
        height: 160,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
    },
    categoryBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#C9A961',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryBadgeText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 16,
        backgroundColor: '#2a2a2a',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 4,
    },
    cardBusiness: {
        fontSize: 12,
        color: '#CCCCCC',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 13,
        color: '#CCCCCC',
        lineHeight: 18,
        marginBottom: 12,
    },
    cardStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#333333',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    statLabel: {
        fontSize: 10,
        color: '#CCCCCC',
        marginBottom: 2,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    compactStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactStatBox: {
        backgroundColor: '#333333',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignItems: 'center',
        marginRight: 8,
        minWidth: 50,
    },
    compactStatValue: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    compactStatLabel: {
        fontSize: 8,
        color: '#CCCCCC',
        textAlign: 'center',
        marginTop: 1,
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C9A961',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    detailsButtonText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 4,
    },
    detailsArrow: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 'bold',
    },

    // History Screen Styles
    historyTabs: {
        flexDirection: 'row',
        backgroundColor: '#111111',
        margin: 20,
        borderRadius: 12,
        padding: 4,
    },
    historyTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeHistoryTab: {
        backgroundColor: '#C9A961',
    },
    historyTabText: {
        fontSize: 12,
        color: '#CCCCCC',
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },
    activeHistoryTabText: {
        color: '#000000',
    },
    historyContent: {
        flex: 1,
    },
    emptyStateContainer: {
        flex: 1,
        padding: 20,
    },

    // Profile Screen Styles - Exact replica from screenshots
    profileContainer: {
        flex: 1,
        backgroundColor: '#000000',
        paddingHorizontal: 20,
        paddingTop: 10,
    },

    // Profile Card with Golden Background
    profileCard: {
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    profileCardGradient: {
        padding: 30,
        alignItems: 'center',
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#000000',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraIconText: {
        fontSize: 12,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    profileRole: {
        fontSize: 14,
        color: '#000000',
        opacity: 0.7,
        fontFamily: 'Inter',
    },

    // Followers Container (Simplified)
    followersContainer: {
        backgroundColor: '#111111',
        borderRadius: 12,
        marginBottom: 20,
        paddingVertical: 20,
        alignItems: 'center',
    },
    followersItem: {
        alignItems: 'center',
    },
    followersNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 6,
        fontFamily: 'Inter',
    },
    followersLabel: {
        fontSize: 14,
        color: '#CCCCCC',
        fontFamily: 'Inter',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // Menu Container
    menuContainer: {
        backgroundColor: '#111111',
        borderRadius: 12,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    menuIcon: {
        fontSize: 16,
        marginRight: 15,
        width: 20,
        color: '#C9A961',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },
    menuArrow: {
        fontSize: 16,
        color: '#C9A961',
    },
    logoutItem: {
        // Special styling for logout
    },
    logoutText: {
        color: '#FF6B6B',
    },
    deleteItem: {
        borderBottomWidth: 0,
    },
    deleteText: {
        color: '#FF6B6B',
    },

    // Settings Styles
    settingsSection: {
        backgroundColor: '#111111',
        borderRadius: 12,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    settingText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter',
    },
    settingArrow: {
        color: '#C9A961',
        fontSize: 16,
    },
    dangerItem: {
        borderBottomWidth: 0,
    },
    dangerText: {
        color: '#FF6B6B',
    },

    // Settings Screen Styles
    settingsContainer: {
        flex: 1,
        padding: 20,
    },
    settingsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    settingsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#C9A961',
        marginLeft: 20,
        fontFamily: 'Inter',
    },
    settingsContent: {
        flex: 1,
    },
    settingGroup: {
        marginBottom: 30,
    },
    settingGroupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 15,
        fontFamily: 'Inter',
    },

    // Notifications Screen Styles
    notificationsContainer: {
        flex: 1,
        padding: 20,
    },
    notificationsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    notificationsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#C9A961',
        marginLeft: 20,
        fontFamily: 'Inter',
    },
    notificationsContent: {
        flex: 1,
    },
    notificationItem: {
        backgroundColor: '#111111',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    unreadNotification: {
        borderWidth: 1,
        borderColor: '#C9A961',
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    notificationMessage: {
        fontSize: 14,
        color: '#CCCCCC',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    notificationTime: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#C9A961',
        marginLeft: 12,
    },

    // Help Screen Styles
    helpContainer: {
        flex: 1,
        padding: 20,
    },
    helpHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    helpTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#C9A961',
        marginLeft: 20,
        fontFamily: 'Inter',
    },
    helpContent: {
        flex: 1,
    },
    helpSection: {
        marginBottom: 30,
    },
    helpSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 15,
        fontFamily: 'Inter',
    },
    helpItem: {
        backgroundColor: '#111111',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    helpQuestion: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    helpAnswer: {
        fontSize: 14,
        color: '#CCCCCC',
        lineHeight: 20,
        fontFamily: 'Inter',
    },
    contactButton: {
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#C9A961',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    contactButtonText: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },

    // Empty State
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        fontFamily: 'Inter',
    },

    // Bottom Navigation - EXACTO como en la imagen
    bottomNav: {
        backgroundColor: '#000000',
        borderTopWidth: 0,
        paddingBottom: Platform.OS === 'ios' ? 25 : 15,
        paddingTop: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#000000',
        paddingHorizontal: 20,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    tabLabel: {
        fontSize: 12, // Tamaño exacto como en la imagen
        color: '#888888', // Gris más claro como en la imagen
        textAlign: 'center',
        fontWeight: '400',
    },
    activeTabLabel: {
        color: '#C9A961',
        fontWeight: '500',
    },
    tabIcon: {
        fontSize: 20,
        color: '#888888',
        marginBottom: 4,
    },
    activeTabIcon: {
        color: '#C9A961',
    },

    // Estilos para iconos minimalistas premium de ZYRO
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        position: 'relative',
    },

    // Icono HOME - Casa minimalista
    homeBase: {
        width: 16,
        height: 12,
        borderTopWidth: 0,
        borderRadius: 1,
        position: 'absolute',
        bottom: 0,
    },
    homeRoof: {
        width: 0,
        height: 0,
        borderLeftWidth: 9,
        borderRightWidth: 9,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        position: 'absolute',
        top: 2,
    },
    homeDoor: {
        width: 2,
        height: 6,
        position: 'absolute',
        bottom: 1,
        left: 7,
    },

    // Icono MAP - Mapa plegado minimalista
    mapBase: {
        width: 18,
        height: 14,
        borderRadius: 2,
    },
    mapFold1: {
        width: 0,
        height: 10,
        position: 'absolute',
        left: 6,
        top: 2,
    },
    mapFold2: {
        width: 0,
        height: 8,
        position: 'absolute',
        left: 12,
        top: 3,
    },

    // Icono HISTORY - Reloj minimalista
    clockCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    clockHourHand: {
        width: 1.5,
        height: 5,
        position: 'absolute',
        top: 4,
        left: 8.25,
        borderRadius: 1,
    },
    clockMinuteHand: {
        width: 1,
        height: 7,
        position: 'absolute',
        top: 2,
        left: 8.5,
        borderRadius: 1,
    },
    clockCenter: {
        width: 2,
        height: 2,
        borderRadius: 1,
        position: 'absolute',
        top: 8,
        left: 8,
    },

    // Icono PROFILE - Persona minimalista
    profileHead: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        position: 'absolute',
        top: 1,
        left: 6.5,
    },
    profileBody: {
        width: 12,
        height: 8,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderBottomWidth: 0,
        position: 'absolute',
        bottom: 1,
        left: 3,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        maxHeight: height * 0.7,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#C9A961',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Inter',
    },
    modalList: {
        maxHeight: height * 0.5,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    modalItemText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },
    selectedIcon: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalCloseButton: {
        backgroundColor: '#C9A961',
        marginHorizontal: 20,
        marginVertical: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },

    // Elegant Modal Styles for City Selector
    elegantModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        flex: 1,
    },
    elegantModalContent: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        maxHeight: '75%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 20,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    elegantModalHeader: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    elegantModalTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    modalSubtitle: {
        color: '#CCCCCC',
        fontSize: 13,
        textAlign: 'center',
        opacity: 0.8,
        fontFamily: 'Inter',
    },
    elegantModalScrollView: {
        flex: 1,
    },
    citiesContainer: {
        padding: 20,
        paddingBottom: 10,
    },
    elegantCityItem: {
        marginBottom: 10,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    elegantCityItemSelected: {
        borderColor: '#C9A961',
        shadowColor: '#C9A961',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    cityItemGradient: {
        padding: 14,
    },
    cityItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cityIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    elegantCityText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        marginLeft: 12,
        fontFamily: 'Inter',
    },
    elegantCityTextSelected: {
        color: '#000',
        fontWeight: '700',
    },
    elegantModalFooter: {
        paddingHorizontal: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    elegantCloseButton: {
        backgroundColor: '#333',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    elegantCloseButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Inter',
    },

    // Edit Profile Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    modalGradient: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    modalCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalSaveButton: {
        backgroundColor: '#C9A961',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    modalSaveText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    formSection: {
        marginBottom: 30,
        marginTop: 20,
    },
    sectionTitle: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#FFFFFF',
        fontSize: 16,
        minHeight: 48,
    },
    inputHelper: {
        color: '#CCCCCC',
        fontSize: 12,
        marginTop: 5,
        fontStyle: 'italic',
    },
    infoSection: {
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 12,
        marginBottom: 30,
    },
    infoText: {
        color: '#CCCCCC',
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 5,
    },

    // Main Content Styles
    mainContent: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    tempContent: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Inter',
    },

    // Navigation Styles - Optimized for Minimalist Icons
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderTopWidth: 1,
        borderTopColor: '#333333',
        paddingBottom: Platform.OS === 'ios' ? 20 : 8, // Reducido significativamente
        paddingTop: 6, // Reducido de 10 a 6
        minHeight: Platform.OS === 'ios' ? 70 : 56, // Altura mínima más compacta
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4, // Reducido de 8 a 4
        justifyContent: 'center',
    },
    activeTab: {
        transform: [{ scale: 1.02 }], // Sutil efecto de escala
    },
    tabIconContainer: {
        marginBottom: 2, // Reducido de 4 a 2
        alignItems: 'center',
        justifyContent: 'center',
        height: 24, // Reducido de 28 a 24 para ajustarse al tamaño del icono
        width: 24,
    },
    activeTabIconContainer: {
        backgroundColor: 'rgba(201, 169, 97, 0.1)', // Fondo sutil para icono activo
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        height: 28,
        width: 40,
    },
    tabIcon: {
        fontSize: 24,
        color: '#888888',
        marginBottom: 4,
    },
    activeTabIcon: {
        color: '#C9A961',
    },
    tabLabel: {
        fontSize: 11, // Reducido de 12 a 11
        color: '#888888',
        fontFamily: 'Inter',
        marginTop: 1, // Pequeño margen para separar del icono
        lineHeight: 13, // Altura de línea compacta
    },
    activeTabLabel: {
        color: '#C9A961',
        fontWeight: '600', // Cambiado de 'bold' a '600' para menos peso visual
    },

    // Additional Navigation Styles for Enhanced UX
    activeTab: {
        transform: [{ scale: 1.02 }], // Sutil efecto de escala
    },
    activeTabIconContainer: {
        backgroundColor: 'rgba(201, 169, 97, 0.1)', // Fondo sutil para icono activo
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },

    // Terms of Service Screen Styles
    termsContainer: {
        flex: 1,
        padding: 20,
    },
    termsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    termsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 20,
        fontFamily: 'Inter',
    },
    termsIconContainer: {
        alignItems: 'center',
        marginBottom: 30,
        paddingVertical: 20,
    },
    termsIconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    termsIcon: {
        fontSize: 32,
        color: '#000',
    },
    termsSubtitle: {
        color: '#CCCCCC',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        fontFamily: 'Inter',
    },
    termsTextContainer: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#333',
    },
    termsText: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'left',
        fontFamily: 'Inter',
    },
    termsFooter: {
        alignItems: 'center',
        gap: 16,
        paddingBottom: 40,
    },
    acceptButton: {
        borderRadius: 12,
        overflow: 'hidden',
        width: '100%',
    },
    acceptButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        fontFamily: 'Inter',
    },
    backToProfileButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    backToProfileButtonText: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: 'Inter',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        color: '#CCCCCC',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Inter',
    },

    // Change Password Screen Styles
    changePasswordContainer: {
        flex: 1,
        padding: 20,
    },
    changePasswordHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    changePasswordTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 20,
        fontFamily: 'Inter',
    },
    changePasswordIconContainer: {
        alignItems: 'center',
        marginBottom: 30,
        paddingVertical: 20,
    },
    changePasswordIconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    changePasswordIcon: {
        fontSize: 32,
        color: '#000',
    },
    changePasswordSubtitle: {
        color: '#CCCCCC',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        fontFamily: 'Inter',
    },
    changePasswordForm: {
        flex: 1,
    },
    passwordHint: {
        color: '#888',
        fontSize: 12,
        marginTop: 5,
        fontFamily: 'Inter',
    },
    changePasswordActions: {
        marginTop: 30,
        gap: 16,
    },
    changePasswordButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    changePasswordButtonDisabled: {
        opacity: 0.6,
    },
    changePasswordButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        fontFamily: 'Inter',
    },
    cancelPasswordButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    cancelPasswordButtonText: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: 'Inter',
    },
    securityInfo: {
        marginTop: 30,
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    securityInfoTitle: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        fontFamily: 'Inter',
    },
    securityInfoText: {
        color: '#CCCCCC',
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Inter',
    },
});

export default ZyroAppNew;