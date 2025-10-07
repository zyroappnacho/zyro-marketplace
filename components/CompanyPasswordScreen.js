import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import MinimalistIcons from './MinimalistIcons';
import StorageService from '../services/StorageService';

const CompanyPasswordScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const validatePasswords = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    
    // Validar que todos los campos estén completos
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña actual');
      return false;
    }
    
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Por favor ingresa una nueva contraseña');
      return false;
    }
    
    if (!confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor confirma tu nueva contraseña');
      return false;
    }
    
    // Validar que la nueva contraseña tenga al menos 6 caracteres
    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    // Validar que las contraseñas nuevas coincidan
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return false;
    }
    
    // Validar que la nueva contraseña sea diferente a la actual
    if (currentPassword === newPassword) {
      Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async () => {
    try {
      if (!validatePasswords()) {
        return;
      }

      setIsLoading(true);

      // Verificar contraseña actual
      const currentUserData = await StorageService.getApprovedUserByEmail(user.email);
      if (!currentUserData || currentUserData.password !== passwordForm.currentPassword) {
        setIsLoading(false);
        Alert.alert('Error', 'La contraseña actual es incorrecta');
        return;
      }

      // Actualizar contraseña en datos del usuario aprobado
      const updatedUserData = {
        ...currentUserData,
        password: passwordForm.newPassword,
        lastPasswordChange: new Date().toISOString()
      };

      // Guardar usuario actualizado
      await StorageService.saveApprovedUser(updatedUserData);

      // Actualizar datos de empresa si existen
      const companyData = await StorageService.getCompanyData(user.id);
      if (companyData) {
        const updatedCompanyData = {
          ...companyData,
          password: passwordForm.newPassword,
          lastPasswordChange: new Date().toISOString()
        };
        await StorageService.saveCompanyData(updatedCompanyData);
      }

      // Actualizar credenciales de login para persistencia
      const loginCredentials = await StorageService.getData('login_credentials') || {};
      if (loginCredentials[user.email]) {
        loginCredentials[user.email] = {
          ...loginCredentials[user.email],
          password: passwordForm.newPassword,
          lastUpdated: new Date().toISOString()
        };
        await StorageService.saveData('login_credentials', loginCredentials);
      }

      // Marcar que este usuario ha cambiado su contraseña para evitar sobrescritura
      const passwordChangeFlag = `password_changed_${user.id}`;
      await StorageService.saveData(passwordChangeFlag, {
        userId: user.id,
        email: user.email,
        passwordChanged: true,
        changedAt: new Date().toISOString(),
        newPassword: passwordForm.newPassword
      });

      // Crear backup de seguridad
      const backupKey = `company_password_backup_${user.id}`;
      await StorageService.saveData(backupKey, {
        userId: user.id,
        email: user.email,
        newPassword: passwordForm.newPassword,
        changedAt: new Date().toISOString(),
        backupType: 'company_password_change'
      });

      setIsLoading(false);

      // Limpiar formulario
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      Alert.alert(
        '✅ Contraseña Actualizada',
        'Tu contraseña ha sido cambiada exitosamente. La nueva contraseña se ha guardado permanentemente y podrás usarla para iniciar sesión.',
        [
          { 
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error cambiando contraseña de empresa:', error);
      setIsLoading(false);
      Alert.alert(
        'Error',
        'No se pudo cambiar la contraseña. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderPasswordInput = (
    label, 
    value, 
    onChangeText, 
    placeholder, 
    field,
    isRequired = true
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {isRequired && '*'}
      </Text>
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#666666"
          secureTextEntry={!showPasswords[field]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => togglePasswordVisibility(field)}
        >
          <Ionicons 
            name={showPasswords[field] ? "eye-off" : "eye"} 
            size={20} 
            color="#C9A961" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MinimalistIcons name="back" size={24} color="#C9A961" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contraseña y Seguridad</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Información del usuario */}
        <View style={styles.userInfoCard}>
          <View style={styles.userInfoHeader}>
            <MinimalistIcons name="business" size={32} color="#C9A961" />
            <View style={styles.userInfo}>
              <Text style={styles.companyName}>{user.companyName || user.fullName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        </View>

        {/* Formulario de cambio de contraseña */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Cambiar Contraseña</Text>
          <Text style={styles.formSubtitle}>
            Para tu seguridad, necesitamos verificar tu contraseña actual antes de establecer una nueva.
          </Text>

          {renderPasswordInput(
            'Contraseña Actual',
            passwordForm.currentPassword,
            (text) => setPasswordForm(prev => ({ ...prev, currentPassword: text })),
            'Ingresa tu contraseña actual',
            'current'
          )}

          {renderPasswordInput(
            'Nueva Contraseña',
            passwordForm.newPassword,
            (text) => setPasswordForm(prev => ({ ...prev, newPassword: text })),
            'Mínimo 6 caracteres',
            'new'
          )}

          {renderPasswordInput(
            'Confirmar Nueva Contraseña',
            passwordForm.confirmPassword,
            (text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text })),
            'Repite la nueva contraseña',
            'confirm'
          )}
        </View>

        {/* Información de seguridad */}
        <View style={styles.securityInfo}>
          <View style={styles.securityCard}>
            <MinimalistIcons name="check" size={24} color="#34C759" />
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Seguridad de la Contraseña</Text>
              <Text style={styles.securityText}>
                • Usa al menos 6 caracteres{'\n'}
                • Combina letras, números y símbolos{'\n'}
                • No uses información personal{'\n'}
                • Mantén tu contraseña privada
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <MinimalistIcons name="help" size={24} color="#C9A961" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Importante</Text>
              <Text style={styles.infoText}>
                Al cambiar tu contraseña, la nueva contraseña se guardará permanentemente 
                y será necesaria para iniciar sesión en el futuro.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botón de cambiar contraseña fijo */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.changePasswordButton, isLoading && styles.disabledButton]}
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          <Text style={[styles.changePasswordButtonText, isLoading && styles.disabledButtonText]}>
            {isLoading ? 'Cambiando Contraseña...' : 'Cambiar Contraseña'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C9A961',
  },
  scrollView: {
    flex: 1,
  },
  userInfoCard: {
    backgroundColor: '#1A1A1A',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#C9A961',
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 25,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 48,
  },
  eyeButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  securityInfo: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  securityContent: {
    flex: 1,
    marginLeft: 15,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  changePasswordButton: {
    backgroundColor: '#C9A961',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#333333',
  },
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  disabledButtonText: {
    color: '#666666',
  },
});

export default CompanyPasswordScreen;