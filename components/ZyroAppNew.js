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
import InteractiveMapNew from './InteractiveMapNew';
import CollaborationDetailScreenNew from './CollaborationDetailScreenNew';

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
        expiresAt: '2025-02-15T23:59:59Z',
        coordinates: { latitude: 40.4168, longitude: -3.7038 }
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
        expiresAt: '2025-02-28T23:59:59Z',
        coordinates: { latitude: 40.4168, longitude: -3.7038 }
    },
    {
        id: 3,
        title: 'Colección Primavera',
        business: 'Boutique Chic',
        category: 'ropa',
        city: 'Barcelona',
        description: 'Presenta la nueva colección primavera-verano con piezas exclusivas de diseñadores emergentes.',
        requirements: 'Min. 15K seguidores IG',
        companions: 'Solo influencer',
        whatIncludes: '2 outfits completos, sesión de fotos profesional, descuento 50%',
        contentRequired: '3 historias Instagram + 2 posts en feed',
        deadline: '1 semana después de la sesión',
        address: 'Passeig de Gràcia 85, Barcelona',
        phone: '+34 93 456 7890',
        email: 'info@boutiquechic.com',
        images: ['https://via.placeholder.com/400x300/C9A961/000000?text=Boutique+Chic'],
        status: 'active',
        minFollowers: 15000,
        estimatedReach: '20K-35K',
        engagement: '5.1%',
        createdAt: '2025-01-13T09:15:00Z',
        expiresAt: '2025-03-15T23:59:59Z',
        coordinates: { latitude: 41.3851, longitude: 2.1734 }
    }
];

const CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];
const CATEGORIES = [
    'restaurantes', 'movilidad', 'ropa', 'eventos', 'delivery', 
    'salud-belleza', 'alojamiento', 'discotecas'
];

const { width, height } = Dimensions.get('window');

const ZyroAppNew = () => {
    // Redux state
    const dispatch = useDispatch();
    const { currentUser, isAuthenticated } = useSelector(state => state.auth);
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
        instagramUsername: '',
        tiktokUsername: '',
        instagramFollowers: '',
        tiktokFollowers: '',
        userType: 'influencer'
    });
    const [showRegister, setShowRegister] = useState(false);
    const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(height));
    const [rotateAnim] = useState(new Animated.Value(0));

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
        dispatch(fetchCollaborations(MOCK_COLLABORATIONS));
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await StorageService.getUser();
            if (userData) {
                dispatch(setUser(userData));
                dispatch(setCurrentScreen('main'));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    // Authentication handlers
    const handleLogin = async () => {
        try {
            // Check for admin credentials
            if (loginForm.email === 'admin_zyro' && loginForm.password === 'ZyroAdmin2024!') {
                const adminUser = {
                    id: 'admin_001',
                    email: 'admin_zyro',
                    role: 'admin',
                    fullName: 'Administrador ZYRO',
                    status: 'approved'
                };
                
                await StorageService.saveUser(adminUser);
                dispatch(loginUser(adminUser));
                dispatch(setCurrentScreen('main'));
                dispatch(setActiveTab(0));
                
                Alert.alert('¡Bienvenido!', 'Acceso de administrador concedido');
                return;
            }

            // Regular user login simulation
            const mockUser = {
                id: 'user_001',
                email: loginForm.email,
                role: registerForm.userType || 'influencer',
                fullName: 'Usuario Demo',
                instagramUsername: '@usuario_demo',
                instagramFollowers: 15000,
                status: 'approved'
            };

            await StorageService.saveUser(mockUser);
            dispatch(loginUser(mockUser));
            dispatch(setCurrentScreen('main'));
            dispatch(setActiveTab(0));
            
            Alert.alert('¡Bienvenido!', 'Inicio de sesión exitoso');
        } catch (error) {
            Alert.alert('Error', 'Credenciales incorrectas');
        }
    };

    const handleRegister = async () => {
        try {
            if (!registerForm.email || !registerForm.password || !registerForm.fullName) {
                Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
                return;
            }

            const newUser = {
                id: `user_${Date.now()}`,
                ...registerForm,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            await StorageService.saveUser(newUser);
            
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
            await StorageService.clearUser();
            dispatch(logoutUser());
            dispatch(setCurrentScreen('welcome'));
            dispatch(setActiveTab(0));
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Screen navigation
    const navigateToScreen = (screen) => {
        dispatch(setCurrentScreen(screen));
    };

    const handleTabPress = (tabIndex) => {
        dispatch(setActiveTab(tabIndex));
        
        const screens = ['home', 'map', 'history', 'profile'];
        dispatch(setCurrentScreen(screens[tabIndex]));
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

    // Filter collaborations
    const getFilteredCollaborations = () => {
        return MOCK_COLLABORATIONS.filter(collab => {
            const cityMatch = !selectedCity || selectedCity === 'all' || collab.city === selectedCity;
            const categoryMatch = !selectedCategory || selectedCategory === 'all' || collab.category === selectedCategory;
            const followersMatch = !currentUser || collab.minFollowers <= (currentUser.instagramFollowers || 0);
            
            return cityMatch && categoryMatch && followersMatch;
        });
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
                            source={require('../assets/logozyrotransparente.PNG')} 
                            style={styles.logoWelcome}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.welcomeTitle}>Bienvenido a ZYRO</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Conectamos influencers con marcas premium
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => {
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
                            style={styles.secondaryButton}
                            onPress={() => {
                                setRegisterForm({ ...registerForm, userType: 'company' });
                                setShowRegister(true);
                            }}
                        >
                            <Text style={styles.secondaryButtonText}>SOY EMPRESA</Text>
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
                            source={require('../assets/logozyrotransparente.PNG')} 
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
                            source={require('../assets/logozyrotransparente.PNG')} 
                            style={styles.logoSmall}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.registerTitle}>
                        Registro {registerForm.userType === 'influencer' ? 'Influencer' : 'Empresa'}
                    </Text>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre completo"
                                placeholderTextColor="#666"
                                value={registerForm.fullName}
                                onChangeText={(text) => setRegisterForm({ ...registerForm, fullName: text })}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#666"
                                value={registerForm.email}
                                onChangeText={(text) => setRegisterForm({ ...registerForm, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Contraseña"
                                placeholderTextColor="#666"
                                value={registerForm.password}
                                onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
                                secureTextEntry
                            />
                        </View>

                        {registerForm.userType === 'influencer' && (
                            <>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Usuario de Instagram (sin @)"
                                        placeholderTextColor="#666"
                                        value={registerForm.instagramUsername}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, instagramUsername: text })}
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Seguidores de Instagram"
                                        placeholderTextColor="#666"
                                        value={registerForm.instagramFollowers}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, instagramFollowers: text })}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Usuario de TikTok (opcional)"
                                        placeholderTextColor="#666"
                                        value={registerForm.tiktokUsername}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, tiktokUsername: text })}
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Seguidores de TikTok (opcional)"
                                        placeholderTextColor="#666"
                                        value={registerForm.tiktokFollowers}
                                        onChangeText={(text) => setRegisterForm({ ...registerForm, tiktokFollowers: text })}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.statisticsSection}>
                                    <Text style={styles.sectionTitle}>Estadísticas de Instagram (últimos 30 días)</Text>
                                    <Text style={styles.sectionSubtitle}>
                                        Sube capturas de pantalla de tus estadísticas para verificación
                                    </Text>
                                    
                                    <TouchableOpacity style={styles.uploadButton}>
                                        <Text style={styles.uploadButtonText}>📸 Subir Visualizaciones de Stories</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity style={styles.uploadButton}>
                                        <Text style={styles.uploadButtonText}>📊 Subir Datos de Audiencia (Edades)</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity style={styles.uploadButton}>
                                        <Text style={styles.uploadButtonText}>🌍 Subir Países/Ciudades Principales</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {registerForm.userType === 'company' && (
                            <View style={styles.subscriptionSection}>
                                <Text style={styles.sectionTitle}>Selecciona tu Plan</Text>
                                
                                <TouchableOpacity style={styles.planOption}>
                                    <View style={styles.planHeader}>
                                        <Text style={styles.planTitle}>Plan 3 Meses</Text>
                                        <Text style={styles.planPrice}>499€/mes</Text>
                                    </View>
                                    <Text style={styles.planDescription}>Perfecto para campañas cortas</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.planOption, styles.popularPlan]}>
                                    <View style={styles.popularBadge}>
                                        <Text style={styles.popularText}>Más Popular</Text>
                                    </View>
                                    <View style={styles.planHeader}>
                                        <Text style={styles.planTitle}>Plan 6 Meses</Text>
                                        <Text style={styles.planPrice}>399€/mes</Text>
                                    </View>
                                    <Text style={styles.planDescription}>Ideal para estrategias a medio plazo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.planOption}>
                                    <View style={styles.planHeader}>
                                        <Text style={styles.planTitle}>Plan 12 Meses</Text>
                                        <Text style={styles.planPrice}>299€/mes</Text>
                                    </View>
                                    <Text style={styles.planDescription}>Máximo ahorro para estrategias anuales</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleRegister}
                        >
                            <LinearGradient
                                colors={['#C9A961', '#D4AF37', '#C9A961']}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>REGISTRARSE</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setShowRegister(false)}
                        >
                            <Text style={styles.backButtonText}>← Volver</Text>
                        </TouchableOpacity>
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
                    {/* Logo with super size according to LOGO_SUPER_SIZE_UPDATE.md */}
                    <View style={styles.logoContainer}>
                        <Image 
                            source={require('../assets/logozyrotransparente.PNG')} 
                            style={styles.logoSmall}
                            resizeMode="contain"
                        />
                    </View>

                    {/* City Selector */}
                    {activeTab === 0 && (
                        <TouchableOpacity 
                            style={styles.citySelector}
                            onPress={() => dispatch(toggleModal('citySelector'))}
                        >
                            <Text style={styles.cityText}>
                                {selectedCity ? selectedCity.toUpperCase() : 'MADRID'}
                            </Text>
                            <Text style={styles.dropdownIcon}>▼</Text>
                        </TouchableOpacity>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.headerActions}>
                        <TouchableOpacity 
                            style={styles.headerButton}
                            onPress={() => navigateToScreen('settings')}
                        >
                            <Text style={styles.headerButtonText}>⚙️</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.headerButton}
                            onPress={() => navigateToScreen('notifications')}
                        >
                            <Text style={styles.headerButtonText}>🔔</Text>
                            {notifications.filter(n => !n.read).length > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.badgeText}>
                                        {notifications.filter(n => !n.read).length}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {renderCurrentScreen()}
                </View>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    {renderBottomNavigation()}
                </View>

                {/* Modals */}
                {renderModals()}
            </SafeAreaView>
        );
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
            default:
                return renderHomeScreen();
        }
    };

    const renderHomeScreen = () => {
        const filteredCollaborations = getFilteredCollaborations();

        return (
            <ScrollView style={styles.screenContainer}>
                {/* Filters */}
                <View style={styles.filtersContainer}>
                    <TouchableOpacity 
                        style={styles.filterButton}
                        onPress={() => dispatch(toggleModal('categorySelector'))}
                    >
                        <Text style={styles.filterText}>
                            {selectedCategory ? selectedCategory.toUpperCase() : 'TODAS LAS CATEGORÍAS'}
                        </Text>
                        <Text style={styles.dropdownIcon}>▼</Text>
                    </TouchableOpacity>
                </View>

                {/* Collaborations List */}
                <View style={styles.collaborationsContainer}>
                    {filteredCollaborations.map((collaboration) => (
                        <TouchableOpacity
                            key={collaboration.id}
                            style={styles.collaborationCard}
                            onPress={() => handleCollaborationPress(collaboration)}
                        >
                            <LinearGradient
                                colors={['#111111', '#1a1a1a', '#111111']}
                                style={styles.cardGradient}
                            >
                                {/* Background Image */}
                                <View style={styles.cardImageContainer}>
                                    <Image
                                        source={{ uri: collaboration.images[0] }}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                                        style={styles.cardOverlay}
                                    />
                                </View>

                                {/* Card Content */}
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{collaboration.title}</Text>
                                    <Text style={styles.cardBusiness}>{collaboration.business}</Text>
                                    
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardRequirement}>
                                            👥 {collaboration.requirements}
                                        </Text>
                                        <Text style={styles.cardCompanions}>
                                            👫 {collaboration.companions}
                                        </Text>
                                    </View>

                                    {/* Check if user meets requirements */}
                                    {currentUser && currentUser.instagramFollowers < collaboration.minFollowers && (
                                        <View style={styles.requirementWarning}>
                                            <Text style={styles.warningText}>
                                                Necesitas {collaboration.minFollowers} seguidores mínimo
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        );
    };

    const renderMapScreen = () => (
        <View style={styles.screenContainer}>
            <InteractiveMapNew
                collaborations={MOCK_COLLABORATIONS}
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
            <ScrollView style={styles.historyContent}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                        {historyTab === 0 && 'No tienes colaboraciones próximas'}
                        {historyTab === 1 && 'No tienes colaboraciones pasadas'}
                        {historyTab === 2 && 'No tienes colaboraciones canceladas'}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );

    const renderProfileScreen = () => (
        <ScrollView style={styles.screenContainer}>
            <View style={styles.profileContainer}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileLogoContainer}>
                        <Image 
                            source={require('../assets/logozyrotransparente.PNG')} 
                            style={styles.logoLarge}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Profile Info */}
                <View style={styles.profileInfo}>
                    <TouchableOpacity style={styles.profileImageContainer}>
                        <View style={styles.profileImagePlaceholder}>
                            <Text style={styles.profileImageText}>📷</Text>
                        </View>
                        <Text style={styles.profileImageLabel}>Subir foto de perfil</Text>
                    </TouchableOpacity>

                    <View style={styles.profileDetails}>
                        <Text style={styles.profileName}>{currentUser?.fullName || 'Usuario'}</Text>
                        <Text style={styles.profileUsername}>
                            {currentUser?.instagramUsername || '@usuario'}
                        </Text>
                        
                        <TouchableOpacity style={styles.followersButton}>
                            <Text style={styles.followersText}>
                                {currentUser?.instagramFollowers || 0} seguidores
                            </Text>
                            <Text style={styles.updateText}>Actualizar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Actions */}
                <View style={styles.profileActions}>
                    <TouchableOpacity 
                        style={styles.profileActionButton}
                        onPress={() => navigateToScreen('personal-data')}
                    >
                        <Text style={styles.profileActionText}>DATOS PERSONALES</Text>
                    </TouchableOpacity>

                    {currentUser?.role === 'influencer' && (
                        <TouchableOpacity 
                            style={styles.profileActionButton}
                            onPress={() => handleCollaborationPress(MOCK_COLLABORATIONS[0])}
                        >
                            <Text style={styles.profileActionText}>VER DETALLES</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Settings Sections */}
                <View style={styles.settingsSection}>
                    <TouchableOpacity 
                        style={styles.settingItem}
                        onPress={() => navigateToScreen('terms')}
                    >
                        <Text style={styles.settingText}>Normas de uso</Text>
                        <Text style={styles.settingArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.settingItem}
                        onPress={() => navigateToScreen('privacy')}
                    >
                        <Text style={styles.settingText}>Política de privacidad</Text>
                        <Text style={styles.settingArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.settingItem}
                        onPress={() => navigateToScreen('security')}
                    >
                        <Text style={styles.settingText}>Contraseña y seguridad</Text>
                        <Text style={styles.settingArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.settingItem}
                        onPress={handleLogout}
                    >
                        <Text style={styles.settingText}>Cerrar sesión</Text>
                        <Text style={styles.settingArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.settingItem, styles.dangerItem]}
                        onPress={() => {
                            Alert.alert(
                                'Eliminar Cuenta',
                                '¿Estás seguro? Esta acción no se puede deshacer.',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    { text: 'Eliminar', style: 'destructive', onPress: handleLogout }
                                ]
                            );
                        }}
                    >
                        <Text style={[styles.settingText, styles.dangerText]}>Borrar cuenta</Text>
                        <Text style={styles.settingArrow}>→</Text>
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
                            <Text style={styles.settingArrow}>→</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.settingItem}>
                            <Text style={styles.settingText}>Cambiar contraseña</Text>
                            <Text style={styles.settingArrow}>→</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.settingGroup}>
                        <Text style={styles.settingGroupTitle}>Notificaciones</Text>
                        
                        <View style={styles.settingItem}>
                            <Text style={styles.settingText}>Notificaciones push</Text>
                            <Switch
                                value={true}
                                onValueChange={() => {}}
                                trackColor={{ false: '#333', true: '#C9A961' }}
                                thumbColor="#fff"
                            />
                        </View>
                        
                        <View style={styles.settingItem}>
                            <Text style={styles.settingText}>Notificaciones por email</Text>
                            <Switch
                                value={true}
                                onValueChange={() => {}}
                                trackColor={{ false: '#333', true: '#C9A961' }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>

                    <View style={styles.settingGroup}>
                        <Text style={styles.settingGroupTitle}>Privacidad</Text>
                        
                        <TouchableOpacity style={styles.settingItem}>
                            <Text style={styles.settingText}>Política de privacidad</Text>
                            <Text style={styles.settingArrow}>→</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.settingItem}>
                            <Text style={styles.settingText}>Términos de servicio</Text>
                            <Text style={styles.settingArrow}>→</Text>
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
                            <Text style={styles.contactButtonText}>📧 Enviar Email</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.contactButton}
                            onPress={() => Linking.openURL('tel:+34900123456')}
                        >
                            <Text style={styles.contactButtonText}>📞 Llamar Soporte</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    const renderBottomNavigation = () => {
        const tabs = [
            { icon: '🏠', label: 'Inicio' },
            { icon: '🗺️', label: 'Mapa' },
            { icon: '📅', label: 'Historial' },
            { icon: '👤', label: 'Perfil' }
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
                    >
                        <Text style={[
                            styles.tabIcon,
                            activeTab === index && styles.activeTabIcon
                        ]}>
                            {tab.icon}
                        </Text>
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

    const renderModals = () => (
        <>
            {/* City Selector Modal */}
            <Modal
                visible={modals.citySelector}
                transparent={true}
                animationType="slide"
                onRequestClose={() => dispatch(toggleModal('citySelector'))}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Ciudad</Text>
                        
                        <ScrollView style={styles.modalList}>
                            {CITIES.map((city) => (
                                <TouchableOpacity
                                    key={city}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        dispatch(setSelectedCity(city));
                                        dispatch(toggleModal('citySelector'));
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{city}</Text>
                                    {selectedCity === city && (
                                        <Text style={styles.selectedIcon}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => dispatch(toggleModal('citySelector'))}
                        >
                            <Text style={styles.modalCloseText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Category Selector Modal */}
            <Modal
                visible={modals.categorySelector}
                transparent={true}
                animationType="slide"
                onRequestClose={() => dispatch(toggleModal('categorySelector'))}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
                        
                        <ScrollView style={styles.modalList}>
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    dispatch(setSelectedCategory(null));
                                    dispatch(toggleModal('categorySelector'));
                                }}
                            >
                                <Text style={styles.modalItemText}>Todas las categorías</Text>
                                {!selectedCategory && (
                                    <Text style={styles.selectedIcon}>✓</Text>
                                )}
                            </TouchableOpacity>
                            
                            {CATEGORIES.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        dispatch(setSelectedCategory(category));
                                        dispatch(toggleModal('categorySelector'));
                                    }}
                                >
                                    <Text style={styles.modalItemText}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </Text>
                                    {selectedCategory === category && (
                                        <Text style={styles.selectedIcon}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => dispatch(toggleModal('categorySelector'))}
                        >
                            <Text style={styles.modalCloseText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );

    // Main render
    if (!isAuthenticated && currentScreen === 'welcome') {
        return renderWelcomeScreen();
    }

    if (!isAuthenticated && currentScreen === 'login') {
        return renderLoginScreen();
    }

    if (showRegister) {
        return renderRegisterScreen();
    }

    if (isAuthenticated) {
        return renderMainApp();
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
        width: 95,   // Super size: 95x95px (+46% larger)
        height: 95,
    },
    logoLarge: {
        width: 130,  // Super size: 130px height (+44% larger)
        height: 130,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
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

    backButton: {
        alignSelf: 'flex-start',
        marginTop: 20,
    },
    backButtonText: {
        color: '#C9A961',
        fontSize: 16,
        fontFamily: 'Inter',
    },

    // Main App Styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 25,  // Increased for larger logo
        backgroundColor: '#000000',
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    citySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111111',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C9A961',
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
    filtersContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#111111',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C9A961',
    },
    filterText: {
        color: '#C9A961',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },

    collaborationsContainer: {
        padding: 20,
    },
    collaborationCard: {
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardGradient: {
        borderRadius: 16,
    },
    cardImageContainer: {
        height: 200,
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
        height: '50%',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    cardBusiness: {
        fontSize: 14,
        color: '#C9A961',
        marginBottom: 12,
        fontFamily: 'Inter',
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardRequirement: {
        fontSize: 12,
        color: '#CCCCCC',
        fontFamily: 'Inter',
    },
    cardCompanions: {
        fontSize: 12,
        color: '#CCCCCC',
        fontFamily: 'Inter',
    },
    requirementWarning: {
        marginTop: 8,
        padding: 8,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
    warningText: {
        color: '#FF6B6B',
        fontSize: 12,
        textAlign: 'center',
        fontFamily: 'Inter',
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
        padding: 20,
    },

    // Profile Screen Styles
    profileContainer: {
        padding: 20,
    },
    profileHeader: {
        alignItems: 'flex-start',
        marginBottom: 30,
    },
    profileLogoContainer: {
        marginBottom: 20,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#111111',
        borderWidth: 2,
        borderColor: '#C9A961',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    profileImageText: {
        fontSize: 30,
    },
    profileImageLabel: {
        color: '#C9A961',
        fontSize: 14,
        fontFamily: 'Inter',
    },
    profileDetails: {
        alignItems: 'center',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    profileUsername: {
        fontSize: 16,
        color: '#C9A961',
        marginBottom: 12,
        fontFamily: 'Inter',
    },
    followersButton: {
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#C9A961',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'center',
    },
    followersText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },
    updateText: {
        color: '#C9A961',
        fontSize: 12,
        fontFamily: 'Inter',
    },

    profileActions: {
        marginBottom: 30,
    },
    profileActionButton: {
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#C9A961',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    profileActionText: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter',
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

    // Bottom Navigation
    bottomNav: {
        backgroundColor: '#000000',
        borderTopWidth: 1,
        borderTopColor: '#333333',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    activeTab: {
        backgroundColor: 'rgba(201, 169, 97, 0.1)',
        borderRadius: 12,
    },
    tabIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    activeTabIcon: {
        color: '#C9A961',
    },
    tabLabel: {
        fontSize: 10,
        color: '#666666',
        fontFamily: 'Inter',
    },
    activeTabLabel: {
        color: '#C9A961',
        fontWeight: 'bold',
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
});

export default ZyroAppNew;