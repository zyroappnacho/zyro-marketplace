import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../styles/theme';
import { PremiumButton } from '../components/PremiumButton';
import { useCurrentInfluencer } from '../hooks/useCurrentInfluencer';

export const SecuritySettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const influencer = useCurrentInfluencer();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement password reset API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Email Enviado',
        `Se ha enviado un enlace para cambiar tu contraseña a ${email}. Revisa tu bandeja de entrada y spam.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setEmail('');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el email. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorAuth = () => {
    Alert.alert(
      'Autenticación de Dos Factores',
      'Esta funcionalidad estará disponible próximamente para mayor seguridad de tu cuenta.',
      [{ text: 'OK' }]
    );
  };

  const handleLoginHistory = () => {
    Alert.alert(
      'Historial de Accesos',
      'Esta funcionalidad te permitirá ver todos los accesos a tu cuenta.',
      [{ text: 'OK' }]
    );
  };

  const handleActiveDevices = () => {
    Alert.alert(
      'Dispositivos Activos',
      'Esta funcionalidad te permitirá gestionar los dispositivos con acceso a tu cuenta.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.goldElegant} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contraseña y Seguridad</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Password Reset Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
          <Text style={styles.sectionDescription}>
            Ingresa tu email para recibir un enlace y cambiar tu contraseña de forma segura.
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email de la cuenta</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder={influencer?.email || "tu@email.com"}
              placeholderTextColor={colors.mediumGray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <PremiumButton
            title={isLoading ? "ENVIANDO..." : "ENVIAR ENLACE"}
            onPress={handlePasswordReset}
            disabled={isLoading}
            style={styles.resetButton}
          />
        </View>

        {/* Security Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones de Seguridad</Text>
          
          <TouchableOpacity style={styles.securityItem} onPress={handleTwoFactorAuth}>
            <View style={styles.securityItemLeft}>
              <Icon name="security" size={24} color={colors.goldElegant} />
              <View style={styles.securityItemText}>
                <Text style={styles.securityItemTitle}>Autenticación de Dos Factores</Text>
                <Text style={styles.securityItemDescription}>
                  Añade una capa extra de seguridad a tu cuenta
                </Text>
              </View>
            </View>
            <View style={styles.securityItemRight}>
              <Text style={styles.comingSoonText}>Próximamente</Text>
              <Icon name="chevron-right" size={24} color={colors.mediumGray} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.securityItem} onPress={handleLoginHistory}>
            <View style={styles.securityItemLeft}>
              <Icon name="history" size={24} color={colors.goldElegant} />
              <View style={styles.securityItemText}>
                <Text style={styles.securityItemTitle}>Historial de Accesos</Text>
                <Text style={styles.securityItemDescription}>
                  Ve cuándo y desde dónde has accedido
                </Text>
              </View>
            </View>
            <View style={styles.securityItemRight}>
              <Text style={styles.comingSoonText}>Próximamente</Text>
              <Icon name="chevron-right" size={24} color={colors.mediumGray} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.securityItem} onPress={handleActiveDevices}>
            <View style={styles.securityItemLeft}>
              <Icon name="devices" size={24} color={colors.goldElegant} />
              <View style={styles.securityItemText}>
                <Text style={styles.securityItemTitle}>Dispositivos Activos</Text>
                <Text style={styles.securityItemDescription}>
                  Gestiona los dispositivos con acceso a tu cuenta
                </Text>
              </View>
            </View>
            <View style={styles.securityItemRight}>
              <Text style={styles.comingSoonText}>Próximamente</Text>
              <Icon name="chevron-right" size={24} color={colors.mediumGray} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Security Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consejos de Seguridad</Text>
          
          <View style={styles.tipItem}>
            <Icon name="lightbulb" size={20} color={colors.goldElegant} />
            <Text style={styles.tipText}>
              Usa una contraseña única y fuerte que no uses en otras cuentas.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Icon name="lightbulb" size={20} color={colors.goldElegant} />
            <Text style={styles.tipText}>
              Nunca compartas tu contraseña con nadie, ni siquiera con el equipo de Zyro.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Icon name="lightbulb" size={20} color={colors.goldElegant} />
            <Text style={styles.tipText}>
              Cierra sesión cuando uses dispositivos compartidos o públicos.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Icon name="lightbulb" size={20} color={colors.goldElegant} />
            <Text style={styles.tipText}>
              Mantén actualizada la aplicación para recibir las últimas mejoras de seguridad.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.goldElegant,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontSize: fontSizes.md,
    color: colors.lightGray,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    ...shadows.small,
  },
  resetButton: {
    marginTop: spacing.sm,
  },
  securityItem: {
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mediumGray,
    ...shadows.small,
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityItemText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  securityItemTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.white,
    marginBottom: 2,
  },
  securityItemDescription: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
  },
  securityItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: fontSizes.xs,
    color: colors.mediumGray,
    marginRight: spacing.xs,
    fontStyle: 'italic',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.goldElegant}10`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.goldElegant}30`,
  },
  tipText: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});