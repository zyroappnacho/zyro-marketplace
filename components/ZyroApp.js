import React, { useState, useEffect } from 'react';
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
    Linking
} from 'react-native';
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
    requestCollaboration
} from '../store/slices/collaborationsSlice';
import {
    markNotificationAsRead,
    addNotification
} from '../store/slices/notificationsSlice';
import StorageService from '../services/StorageService';
import NotificationManager from './NotificationManager';
import { ChatList, ChatScreen } from './ChatSystem';
import InteractiveMap from './InteractiveMap';
import CollaborationDetailScreen from './CollaborationDetailScreen';

// Enhanced Mock Data with more realistic content
const MOCK_COLLABORATIONS = [
    {
        id: 1,
        title: 'Degustación Premium',
        business: 'Restaurante Elegance',
        category: 'restaurantes',
        city: 'Madrid',
        description: 'Experiencia gastronómica exclusiva con menú degustación de 7 platos. Ambiente elegante perfecto para contenido de alta calidad.',
        requirements: 'Min. 10K seguidores IG',
        companions: '+2 acompañantes',
        whatIncludes: 'Menú degustación completo para 3 personas, bebidas incluidas, postre especial',
        contentRequired: '2 historias Instagram (1 en video) + 1 post en feed',
        deadline: '72 horas después de la visita',
        address: 'Calle Serrano 45, Madrid',
        phone: '+34 91 123 4567',
        email: 'reservas@elegance.com',
        images: ['https://via.placeholder.com/400x300/C9A961/000000?text=Restaurante+Elegance'],
        status: 'active',
        minFollowers: 10000,
        estimatedReach: '15K-25K',
        engagement: '4.2%',
        createdAt: '2025-01-15T10:00:00Z',
        expiresAt: '2025-02-15T23:59:59Z'
    },
    {
        id: 2,
        title: 'Cena Romántica',
        business: 'Restaurante Elegance',
        category: 'restaurantes',
        city: 'Madrid',
        description: 'Velada romántica con menú especial para parejas. Decoración única y ambiente íntimo.',
        requirements: 'Min. 25K seguidores IG',
        companions: '+1 acompañante',
        whatIncludes: 'Cena romántica para 2 personas, vino incluido, decoración especial',
        contentRequired: '2 historias Instagram + 1 TikTok',
        deadline: '48 horas después de la cena',
        address: 'Calle Serrano 45, Madrid',
        phone: '+34 91 123 4567',
        email: 'reservas@elegance.com',
        images: ['https://via.placeholder.com/400x300/C9A961/000000?text=Cena+Romantica'],
        status: 'active',
        minFollowers: 25000,
        estimatedReach: '30K-50K',
        engagement: '3.8%',
        createdAt: '2025-01-14T15:30:00Z',
        expiresAt: '2025-02-28T23:59:59Z'
    },
    {
        id: 3,
        title: 'Colección Primavera',
        business: 'Boutique Chic',
        category: 'ropa',
        city: 'Barcelona',
        description: 'Presentación de la nueva colección primavera-verano. Prendas exclusivas y tendencias.',
        requirements: 'Min. 15K seguidores IG',
        companions: 'Solo influencer',
        whatIncludes: '3 prendas de la nueva colección, sesión de fotos profesional',
        contentRequired: '3 historias Instagram + 2 posts en feed',
        deadline: '1 semana después de recibir las prendas',
        address: 'Passeig de Gràcia 123, Barcelona',
        phone: '+34 93 456 7890',
        email: 'info@boutiquechic.com',
        images: ['https://via.placeholder.com/400x300/C9A961/000000?text=Boutique+Chic'],
        status: 'active',
        minFollowers: 15000,
        estimatedReach: '20K-35K',
        engagement: '5.1%',
        createdAt: '2025-01-13T09:15:00Z',
        expiresAt: '2025-03-15T23:59:59Z'
    }
];

const CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza', 'Murcia'];

const CATEGORIES = [
    { id: 'all', name: 'TODAS LAS CATEGORÍAS', icon: '🏪' },
    { id: 'restaurantes', name: 'RESTAURANTES', icon: '🍽️' },
    { id: 'ropa', name: 'ROPA', icon: '👗' },
    { id: 'belleza', name: 'SALUD Y BELLEZA', icon: '💄' },
    { id: 'eventos', name: 'EVENTOS', icon: '🎉' },
    { id: 'movilidad', name: 'MOVILIDAD', icon: '🚗' },
    { id: 'delivery', name: 'DELIVERY', icon: '🛵' },
    { id: 'alojamiento', name: 'ALOJAMIENTO', icon: '🏨' },
    { id: 'discotecas', name: 'DISCOTECAS', icon: '🎵' }
];

export default function ZyroApp() {
    const dispatch = useDispatch();

    // Redux selectors
    const { user, isAuthenticated, isLoading } = useSelector(state => state.auth);
    const {
        currentScreen,
        activeTab,
        selectedCity,
        selectedCategory,
        modals,
        historyTab
    } = useSelector(state => state.ui);
    const {
        collaborations,
        selectedCollaboration
    } = useSelector(state => state.collaborations);
    const {
        notifications,
        unreadCount
    } = useSelector(state => state.notifications);

    // Local state for forms
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [selectedRole, setSelectedRole] = useState('influencer');

    // Animation values
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    // Load user data on app start
    useEffect(() => {
        loadUserData();
        startAnimations();
    }, []);

    const startAnimations = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.back(1.1)),
                useNativeDriver: true,
            })
        ]).start();
    };

    const loadUserData = async () => {
        try {
            const userData = await StorageService.getUser();
            const userSettings = await StorageService.getSettings();

            if (userData) {
                dispatch(setUser(userData));
                const screen = userData.role === 'admin' ? 'admin' :
                    userData.role === 'company' ? 'company' : 'home';
                dispatch(setCurrentScreen(screen));
                if (userData.role === 'influencer') {
                    dispatch(setActiveTab('home'));
                }
            }

            if (userSettings) {
                dispatch(setSelectedCity(userSettings.city || 'Madrid'));
            }
        } catch (error) {
            console.log('Error loading user data:', error);
        }
    };

    // Enhanced login with Redux
    const handleLogin = async () => {
        if (!loginForm.email || !loginForm.password) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        try {
            const result = await dispatch(loginUser({
                email: loginForm.email,
                password: loginForm.password,
                role: selectedRole
            })).unwrap();

            const screen = result.role === 'admin' ? 'admin' :
                result.role === 'company' ? 'company' : 'home';
            dispatch(setCurrentScreen(screen));

            if (result.role === 'influencer') {
                dispatch(setActiveTab('home'));
            }
        } catch (error) {
            Alert.alert('Error de Login', error);
        }
    };

    // Enhanced collaboration filtering
    const getFilteredCollaborations = () => {
        return MOCK_COLLABORATIONS.filter(collab => {
            const cityMatch = selectedCity === 'all' || collab.city === selectedCity;
            const categoryMatch = selectedCategory === 'all' || collab.category === selectedCategory;
            const followersMatch = !user || user.followers >= collab.minFollowers;
            const isActive = collab.status === 'active';
            const notExpired = new Date(collab.expiresAt) > new Date();

            return cityMatch && categoryMatch && followersMatch && isActive && notExpired;
        });
    };

    // Handle notification received
    const handleNotificationReceived = (notification) => {
        dispatch(addNotification({
            id: Date.now(),
            type: notification.request.content.data?.type || 'general',
            title: notification.request.content.title,
            message: notification.request.content.body,
            timestamp: new Date(),
            read: false,
            icon: '🔔'
        }));
    };

    // ENHANCED WELCOME SCREEN with animations
    const WelcomeScreen = () => (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.welcomeContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../assets/logozyrotransparente.PNG')} 
                        style={styles.welcomeLogo} 
                        resizeMode="contain"
                    />
                    <Text style={styles.welcomeSubtitle}>
                        Conectamos influencers con marcas{'\\n'}para colaboraciones exclusivas
                    </Text>
                </View>

                <View style={styles.roleButtonsContainer}>
                    <TouchableOpacity
                        style={styles.roleButton}
                        onPress={() => {
                            dispatch(setCurrentScreen('influencer-register'));
                        }}
                    >
                        <LinearGradient
                            colors={['#C9A961', '#D4AF37']}
                            style={styles.roleButtonGradient}
                        >
                            <Text style={styles.roleButtonText}>SOY INFLUENCER</Text>
                            <Text style={styles.roleButtonSubtext}>Descubre colaboraciones exclusivas</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.roleButton}
                        onPress={() => {
                            dispatch(setCurrentScreen('company-register'));
                        }}
                    >
                        <LinearGradient
                            colors={['#C9A961', '#D4AF37']}
                            style={styles.roleButtonGradient}
                        >
                            <Text style={styles.roleButtonText}>SOY EMPRESA</Text>
                            <Text style={styles.roleButtonSubtext}>Gestiona tus campañas y colaboraciones</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => dispatch(setCurrentScreen('login'))}
                >
                    <Text style={styles.loginLinkText}>¿Ya tienes cuenta? Iniciar Sesión</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );

    // ENHANCED LOGIN SCREEN
    const LoginScreen = () => (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => dispatch(setCurrentScreen('welcome'))}
                    >
                        <Text style={styles.backButtonText}>← Volver</Text>
                    </TouchableOpacity>

                    <Text style={styles.formTitle}>Iniciar Sesión</Text>

                    <View style={styles.roleSelector}>
                        <TouchableOpacity
                            style={[styles.roleTab, selectedRole === 'influencer' && styles.roleTabActive]}
                            onPress={() => setSelectedRole('influencer')}
                        >
                            <Text style={[styles.roleTabText, selectedRole === 'influencer' && styles.roleTabTextActive]}>
                                Influencer
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleTab, selectedRole === 'company' && styles.roleTabActive]}
                            onPress={() => setSelectedRole('company')}
                        >
                            <Text style={[styles.roleTabText, selectedRole === 'company' && styles.roleTabTextActive]}>
                                Empresa
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.textInput}
                            value={loginForm.email}
                            onChangeText={(text) => setLoginForm({ ...loginForm, email: text })}
                            placeholder="tu@email.com"
                            placeholderTextColor="#666"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Contraseña</Text>
                        <TextInput
                            style={styles.textInput}
                            value={loginForm.password}
                            onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
                            placeholder="Tu contraseña"
                            placeholderTextColor="#666"
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                        <LinearGradient
                            colors={['#C9A961', '#D4AF37']}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.primaryButtonText}>INICIAR SESIÓN</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.testCredentials}>
                        <Text style={styles.testTitle}>🚀 Credenciales de prueba:</Text>
                        <Text style={styles.testText}>Admin: admin_zyro / ZyroAdmin2024!</Text>
                        <Text style={styles.testText}>Influencer: cualquier email / cualquier contraseña</Text>
                        <Text style={styles.testText}>Empresa: cualquier email / cualquier contraseña</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );

    // ENHANCED HEADER COMPONENT
    const Header = ({ title, showCitySelector = false, showBack = false, onBack }) => (
        <View style={styles.header}>
            {showBack ? (
                <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
                    <Text style={styles.headerBackText}>← Volver</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../assets/logozyrotransparente.PNG')} 
                        style={styles.logoSmall} 
                        resizeMode="contain"
                    />
                </View>
            )}

            {title && <Text style={styles.headerTitle}>{title}</Text>}

            {showCitySelector && (
                <TouchableOpacity
                    style={styles.citySelector}
                    onPress={() => dispatch(toggleModal({ modalName: 'cityModal', isOpen: true }))}
                >
                    <Text style={styles.citySelectorText}>{selectedCity.toUpperCase()}</Text>
                    <Text style={styles.citySelectorArrow}>▼</Text>
                </TouchableOpacity>
            )}

            <View style={styles.headerActions}>
                <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={() => dispatch(setCurrentScreen('notifications'))}
                >
                    <View style={styles.headerIcon}>
                        <Text style={styles.headerIconText}>🔔</Text>
                        {unreadCount > 0 && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    // COLLABORATION CARD COMPONENT
    const CollaborationCard = ({ collaboration }) => (
        <TouchableOpacity
            style={styles.collaborationCard}
            onPress={() => {
                dispatch(setSelectedCollaboration(collaboration));
                dispatch(setCurrentScreen('collaboration-detail'));
            }}
        >
            <View style={styles.cardImageContainer}>
                <LinearGradient
                    colors={['#C9A961', '#D4AF37', '#B8860B']}
                    style={styles.cardImage}
                >
                    <Text style={styles.cardImagePlaceholder}>📸</Text>
                </LinearGradient>

                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                        {CATEGORIES.find(cat => cat.id === collaboration.category)?.icon} {collaboration.category.toUpperCase()}
                    </Text>
                </View>

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.cardImageOverlay}
                >
                    <Text style={styles.cardImageText}>{collaboration.title}</Text>
                    <Text style={styles.cardBusinessName}>{collaboration.business}</Text>
                </LinearGradient>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{collaboration.title}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                    {collaboration.description}
                </Text>

                <View style={styles.cardInfo}>
                    <Text style={styles.infoItem}>📍 {collaboration.city}</Text>
                    <Text style={styles.infoItem}>👥 {collaboration.requirements}</Text>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.companionsInfo}>{collaboration.companions}</Text>
                    <TouchableOpacity
                        style={styles.viewDetailsBtn}
                        onPress={() => {
                            dispatch(setSelectedCollaboration(collaboration));
                            dispatch(setCurrentScreen('collaboration-detail'));
                        }}
                    >
                        <LinearGradient
                            colors={['#C9A961', '#D4AF37']}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.viewDetailsBtnText}>Ver Detalles</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    // HOME SCREEN
    const HomeScreen = () => (
        <View style={styles.container}>
            <Header showCitySelector={true} />

            <View style={styles.categoryFilter}>
                <TouchableOpacity
                    style={styles.categoryDropdown}
                    onPress={() => dispatch(toggleModal({ modalName: 'categoryModal', isOpen: true }))}
                >
                    <Text style={styles.categoryDropdownText}>
                        {CATEGORIES.find(cat => cat.id === selectedCategory)?.icon} {' '}
                        {CATEGORIES.find(cat => cat.id === selectedCategory)?.name || 'TODAS LAS CATEGORÍAS'}
                    </Text>
                    <Text style={styles.categoryDropdownArrow}>▼</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {getFilteredCollaborations().length > 0 ? (
                    getFilteredCollaborations().map(collaboration => (
                        <CollaborationCard key={collaboration.id} collaboration={collaboration} />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>🔍</Text>
                        <Text style={styles.emptyStateTitle}>No hay colaboraciones disponibles</Text>
                        <Text style={styles.emptyStateText}>
                            Prueba cambiando la ciudad o categoría seleccionada
                        </Text>
                    </View>
                )}
            </ScrollView>

            <BottomNavigation />
        </View>
    );

    // BOTTOM NAVIGATION
    const BottomNavigation = () => (
        <View style={styles.bottomNav}>
            <TouchableOpacity
                style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
                onPress={() => dispatch(setActiveTab('home'))}
            >
                <View style={[styles.navIconContainer, activeTab === 'home' && styles.navIconContainerActive]}>
                    <Text style={[styles.navIcon, activeTab === 'home' && styles.navIconActive]}>🏠</Text>
                </View>
                <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navItem, activeTab === 'map' && styles.navItemActive]}
                onPress={() => dispatch(setActiveTab('map'))}
            >
                <View style={[styles.navIconContainer, activeTab === 'map' && styles.navIconContainerActive]}>
                    <Text style={[styles.navIcon, activeTab === 'map' && styles.navIconActive]}>🗺️</Text>
                </View>
                <Text style={[styles.navLabel, activeTab === 'map' && styles.navLabelActive]}>Mapa</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navItem, activeTab === 'history' && styles.navItemActive]}
                onPress={() => dispatch(setActiveTab('history'))}
            >
                <View style={[styles.navIconContainer, activeTab === 'history' && styles.navIconContainerActive]}>
                    <Text style={[styles.navIcon, activeTab === 'history' && styles.navIconActive]}>📋</Text>
                </View>
                <Text style={[styles.navLabel, activeTab === 'history' && styles.navLabelActive]}>Historial</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navItem, activeTab === 'profile' && styles.navItemActive]}
                onPress={() => dispatch(setActiveTab('profile'))}
            >
                <View style={[styles.navIconContainer, activeTab === 'profile' && styles.navIconContainerActive]}>
                    <Text style={[styles.navIcon, activeTab === 'profile' && styles.navIconActive]}>👤</Text>
                </View>
                <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>Perfil</Text>
            </TouchableOpacity>
        </View>
    );

    // CITY MODAL
    const CityModal = () => (
        <Modal
            visible={modals.cityModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => dispatch(toggleModal({ modalName: 'cityModal', isOpen: false }))}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Seleccionar Ciudad</Text>
                    <ScrollView>
                        {CITIES.map(city => (
                            <TouchableOpacity
                                key={city}
                                style={[styles.modalItem, selectedCity === city && styles.modalItemSelected]}
                                onPress={() => {
                                    dispatch(setSelectedCity(city));
                                    dispatch(toggleModal({ modalName: 'cityModal', isOpen: false }));
                                }}
                            >
                                <Text style={[styles.modalItemText, selectedCity === city && styles.modalItemTextSelected]}>
                                    {city}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    // CATEGORY MODAL
    const CategoryModal = () => (
        <Modal
            visible={modals.categoryModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => dispatch(toggleModal({ modalName: 'categoryModal', isOpen: false }))}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
                    <ScrollView>
                        {CATEGORIES.map(category => (
                            <TouchableOpacity
                                key={category.id}
                                style={[styles.modalItem, selectedCategory === category.id && styles.modalItemSelected]}
                                onPress={() => {
                                    dispatch(setSelectedCategory(category.id));
                                    dispatch(toggleModal({ modalName: 'categoryModal', isOpen: false }));
                                }}
                            >
                                <Text style={[styles.modalItemText, selectedCategory === category.id && styles.modalItemTextSelected]}>
                                    {category.icon} {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    // RENDER SCREEN FUNCTION
    const renderScreen = () => {
        switch (currentScreen) {
            case 'welcome':
                return <WelcomeScreen />;
            case 'login':
                return <LoginScreen />;
            case 'home':
                return <HomeScreen />;
            case 'collaboration-detail':
                return <CollaborationDetailScreen />;
            case 'map':
                return <InteractiveMap />;
            case 'history':
                return <View style={styles.container}><Text style={styles.comingSoon}>Historial - Próximamente</Text></View>;
            case 'profile':
                return <View style={styles.container}><Text style={styles.comingSoon}>Perfil - Próximamente</Text></View>;
            default:
                return <WelcomeScreen />;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <RNStatusBar barStyle="light-content" backgroundColor="#000" />
            <NotificationManager onNotificationReceived={handleNotificationReceived} />
            {renderScreen()}
            <CityModal />
            <CategoryModal />
        </SafeAreaView>
    );
}

// ENHANCED STYLES with premium aesthetics
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContainer: {
        flex: 1,
    },
    // Welcome Screen with enhanced logo
    welcomeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#000',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 15,
        marginBottom: 20,
    },
    welcomeLogo: {
        width: 280,
        height: 280,
        marginBottom: 20,
    },
    logoSmall: {
        width: 95,
        height: 95,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#CCCCCC',
        textAlign: 'center',
        lineHeight: 24,
    },
    roleButtonsContainer: {
        width: '100%',
        marginBottom: 40,
    },
    roleButton: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    roleButtonGradient: {
        padding: 24,
        alignItems: 'center',
    },
    roleButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    roleButtonSubtext: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.7)',
        textAlign: 'center',
    },
    loginLink: {
        marginTop: 20,
    },
    loginLinkText: {
        color: '#C9A961',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    // Form styles
    formContainer: {
        padding: 24,
        paddingTop: 60,
    },
    backButton: {
        marginBottom: 20,
    },
    backButtonText: {
        color: '#C9A961',
        fontSize: 16,
    },
    formTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 30,
        textAlign: 'center',
    },
    roleSelector: {
        flexDirection: 'row',
        marginBottom: 30,
        backgroundColor: '#111',
        borderRadius: 8,
        padding: 4,
    },
    roleTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    roleTabActive: {
        backgroundColor: '#C9A961',
    },
    roleTabText: {
        color: '#CCCCCC',
        fontWeight: '600',
    },
    roleTabTextActive: {
        color: '#000',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#CCCCCC',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    textInput: {
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 16,
        color: '#FFFFFF',
        fontSize: 16,
    },
    primaryButton: {
        marginTop: 20,
        borderRadius: 8,
        overflow: 'hidden',
    },
    buttonGradient: {
        padding: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    testCredentials: {
        marginTop: 30,
        padding: 16,
        backgroundColor: '#111',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    testTitle: {
        color: '#C9A961',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    testText: {
        color: '#CCCCCC',
        fontSize: 12,
        marginBottom: 4,
    },
    // Header styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 25,
        backgroundColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    logo: {
        fontSize: 24,
        fontWeight: '700',
        color: '#C9A961',
        letterSpacing: 3,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    citySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    citySelectorText: {
        color: '#C9A961',
        fontSize: 12,
        fontWeight: '600',
        marginRight: 4,
    },
    citySelectorArrow: {
        color: '#C9A961',
        fontSize: 10,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerBtn: {
        marginLeft: 12,
    },
    headerIcon: {
        position: 'relative',
    },
    headerIconText: {
        fontSize: 20,
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    // Category filter
    categoryFilter: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    categoryDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#111',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    categoryDropdownText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    categoryDropdownArrow: {
        color: '#C9A961',
        fontSize: 12,
    },
    // Content
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    // Collaboration card
    collaborationCard: {
        backgroundColor: '#111',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    cardImageContainer: {
        position: 'relative',
        height: 200,
    },
    cardImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardImagePlaceholder: {
        fontSize: 48,
        opacity: 0.3,
    },
    categoryBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(201, 169, 97, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryBadgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '600',
    },
    cardImageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    cardImageText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardBusinessName: {
        color: '#CCCCCC',
        fontSize: 14,
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    cardDescription: {
        color: '#CCCCCC',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    cardInfo: {
        marginBottom: 12,
    },
    infoItem: {
        color: '#CCCCCC',
        fontSize: 12,
        marginBottom: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    companionsInfo: {
        color: '#C9A961',
        fontSize: 12,
        fontWeight: '500',
    },
    viewDetailsBtn: {
        borderRadius: 6,
        overflow: 'hidden',
    },
    viewDetailsBtnText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyStateTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyStateText: {
        color: '#CCCCCC',
        fontSize: 14,
        textAlign: 'center',
    },
    // Bottom navigation
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingVertical: 8,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    navIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    navIconContainerActive: {
        backgroundColor: '#C9A961',
    },
    navIcon: {
        fontSize: 16,
    },
    navIconActive: {
        fontSize: 16,
    },
    navLabel: {
        color: '#CCCCCC',
        fontSize: 10,
        fontWeight: '500',
    },
    navLabelActive: {
        color: '#C9A961',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        maxHeight: '70%',
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalItem: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalItemSelected: {
        backgroundColor: '#C9A961',
    },
    modalItemText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    modalItemTextSelected: {
        color: '#000',
        fontWeight: '600',
    },
    // Coming soon
    comingSoon: {
        color: '#CCCCCC',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 100,
    },
});