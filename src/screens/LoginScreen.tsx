import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, clearError } from '../store/slices/authSlice';
import { ZyroLogo } from '../components/ZyroLogo';
import { FormInput } from '../components/FormInput';
import { PremiumButton } from '../components/PremiumButton';
import PendingApprovalMessage from '../components/PendingApprovalMessage';
import { theme } from '../styles/theme';
import { validateAdminCredentials } from '../utils/validation';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, loginAttempts } = useAppSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showPendingMessage, setShowPendingMessage] = useState(false);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Handle authentication success
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        // Navigate to admin panel
        navigation.navigate('AdminPanel');
      } else if (user.status === 'approved') {
        // Navigate to main app
        navigation.navigate('MainApp');
      } else if (user.status === 'pending') {
        // Show pending approval message
        setShowPendingMessage(true);
      } else if (user.status === 'rejected') {
        Alert.alert(
          'Cuenta Rechazada',
          'Tu solicitud de registro ha sido rechazada. Por favor, contacta con soporte para más información.',
          [{ text: 'OK', onPress: () => dispatch(clearError()) }]
        );
      } else if (user.status === 'suspended') {
        Alert.alert(
          'Cuenta Suspendida',
          'Tu cuenta ha sido suspendida temporalmente. Contacta con soporte para más detalles.',
          [{ text: 'OK', onPress: () => dispatch(clearError()) }]
        );
      }
    }
  }, [isAuthenticated, user, navigation, dispatch]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Check if user is trying to enter admin credentials
    if (field === 'email' && value === 'admin_zyrovip') {
      setIsAdminLogin(true);
    } else if (field === 'email' && value !== 'admin_zyrovip') {
      setIsAdminLogin(false);
    }

    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  // Handle login submission
  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    // Check if this is an admin login attempt
    if (isAdminLogin) {
      const isValidAdmin = await validateAdminCredentials({
        username: formData.email,
        password: formData.password
      });

      if (!isValidAdmin) {
        Alert.alert(
          'Credenciales Incorrectas',
          'Las credenciales de administrador no son válidas'
        );
        return;
      }
    }

    // Dispatch login action
    dispatch(loginUser({
      email: formData.email,
      password: formData.password
    }));
  };

  // Handle navigation to registration
  const handleGoToRegistration = () => {
    navigation.navigate('Welcome');
  };

  // Handle back from pending message
  const handleBackFromPending = () => {
    setShowPendingMessage(false);
    setFormData({ email: '', password: '' });
    dispatch(clearError());
  };

  // Show pending approval message
  if (showPendingMessage && user) {
    return (
      <PendingApprovalMessage
        userRole={user.role as 'influencer' | 'company'}
        registrationDate={user.createdAt}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <ZyroLogo size="large" />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isAdminLogin ? 'Panel de Administrador' : 'Iniciar Sesión'}
          </Text>
          
          {isAdminLogin && (
            <Text style={styles.adminSubtitle}>
              Acceso exclusivo para administradores
            </Text>
          )}

          <FormInput
            label={isAdminLogin ? "Usuario de Administrador" : "Email"}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder={isAdminLogin ? "admin_zyrovip" : "tu@email.com"}
            keyboardType={isAdminLogin ? "default" : "email-address"}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <FormInput
            label="Contraseña"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Tu contraseña"
            secureTextEntry
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {loginAttempts > 2 && (
            <Text style={styles.warningText}>
              Múltiples intentos fallidos. Verifica tus credenciales.
            </Text>
          )}

          <PremiumButton
            title={isAdminLogin ? "Acceder al Panel" : "Iniciar Sesión"}
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          {!isAdminLogin && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              <PremiumButton
                title="Crear Cuenta"
                onPress={handleGoToRegistration}
                variant="outline"
                style={styles.registerButton}
              />
            </>
          )}
        </View>

        {isAdminLogin && (
          <View style={styles.adminInfo}>
            <Text style={styles.adminInfoText}>
              Solo usuarios autorizados pueden acceder al panel de administración
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: width - 48,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Cinzel',
  },
  adminSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Inter',
  },
  loginButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter',
  },
  warningText: {
    color: theme.colors.accent,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter',
  },
  adminInfo: {
    marginTop: 32,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  adminInfoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});

export default LoginScreen;