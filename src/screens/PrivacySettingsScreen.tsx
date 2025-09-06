import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { theme } from '../styles/theme';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { privacyManager, PrivacySettings } from '../services/privacy/privacyManager';

export const PrivacySettingsScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      let userSettings = await privacyManager.getUserPrivacySettings(user.id);
      
      if (!userSettings) {
        userSettings = await privacyManager.initializeUserPrivacySettings(user.id);
      }
      
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      Alert.alert('Error', 'No se pudieron cargar las configuraciones de privacidad');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: any) => {
    if (!user || !settings) return;

    try {
      setIsSaving(true);
      const updatedSettings = await privacyManager.updatePrivacySettings(user.id, {
        [key]: value
      });
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      Alert.alert('Error', 'No se pudo actualizar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDataRetentionChange = () => {
    if (!settings) return;

    Alert.alert(
      'Período de Retención de Datos',
      'Selecciona por cuánto tiempo quieres que conservemos tus datos:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '6 meses', onPress: () => updateSetting('dataRetentionPeriod', 180) },
        { text: '1 año', onPress: () => updateSetting('dataRetentionPeriod', 365) },
        { text: '2 años', onPress: () => updateSetting('dataRetentionPeriod', 730) },
        { text: '5 años', onPress: () => updateSetting('dataRetentionPeriod', 1825) },
      ]
    );
  };

  const handleInactivityPeriodChange = () => {
    if (!settings) return;

    Alert.alert(
      'Período de Inactividad',
      'Después de cuánto tiempo de inactividad quieres que se eliminen automáticamente tus datos:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '1 año', onPress: () => updateSetting('inactivityPeriod', 365) },
        { text: '2 años', onPress: () => updateSetting('inactivityPeriod', 730) },
        { text: '3 años', onPress: () => updateSetting('inactivityPeriod', 1095) },
        { text: '5 años', onPress: () => updateSetting('inactivityPeriod', 1825) },
      ]
    );
  };

  const getRetentionText = (days: number) => {
    if (days < 365) {
      return `${Math.round(days / 30)} meses`;
    }
    return `${Math.round(days / 365)} años`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando configuraciones...</Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudieron cargar las configuraciones</Text>
        <PremiumButton title="Reintentar" onPress={loadPrivacySettings} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ZyroLogo size="large" />
        <Text style={styles.title}>Configuración de Privacidad</Text>
        <Text style={styles.subtitle}>
          Controla cómo se usan y procesan tus datos
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consentimientos</Text>
        <Text style={styles.sectionDescription}>
          Puedes cambiar estos consentimientos en cualquier momento
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Procesamiento de Datos</Text>
            <Text style={styles.settingDescription}>
              Permitir el procesamiento de tus datos personales para el funcionamiento básico de la app
            </Text>
          </View>
          <Switch
            value={settings.dataProcessingConsent}
            onValueChange={(value) => updateSetting('dataProcessingConsent', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.white}
            disabled={isSaving}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Marketing y Promociones</Text>
            <Text style={styles.settingDescription}>
              Recibir comunicaciones promocionales y ofertas especiales
            </Text>
          </View>
          <Switch
            value={settings.marketingConsent}
            onValueChange={(value) => updateSetting('marketingConsent', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.white}
            disabled={isSaving}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Análisis y Estadísticas</Text>
            <Text style={styles.settingDescription}>
              Permitir el análisis de uso para mejorar la experiencia de la app
            </Text>
          </View>
          <Switch
            value={settings.analyticsConsent}
            onValueChange={(value) => updateSetting('analyticsConsent', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.white}
            disabled={isSaving}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Cookies y Seguimiento</Text>
            <Text style={styles.settingDescription}>
              Permitir cookies para personalización y seguimiento de actividad
            </Text>
          </View>
          <Switch
            value={settings.cookiesConsent}
            onValueChange={(value) => updateSetting('cookiesConsent', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.white}
            disabled={isSaving}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Compartir con Terceros</Text>
            <Text style={styles.settingDescription}>
              Permitir compartir datos con socios comerciales para mejores ofertas
            </Text>
          </View>
          <Switch
            value={settings.thirdPartyConsent}
            onValueChange={(value) => updateSetting('thirdPartyConsent', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.white}
            disabled={isSaving}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Retención de Datos</Text>
        <Text style={styles.sectionDescription}>
          Controla por cuánto tiempo conservamos tus datos
        </Text>

        <TouchableOpacity style={styles.settingButton} onPress={handleDataRetentionChange}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Período de Retención</Text>
            <Text style={styles.settingDescription}>
              Tus datos se conservarán durante: {getRetentionText(settings.dataRetentionPeriod)}
            </Text>
          </View>
          <Text style={styles.settingValue}>Cambiar</Text>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Eliminación Automática</Text>
            <Text style={styles.settingDescription}>
              Eliminar automáticamente datos después de inactividad prolongada
            </Text>
          </View>
          <Switch
            value={settings.autoDeleteAfterInactivity}
            onValueChange={(value) => updateSetting('autoDeleteAfterInactivity', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.white}
            disabled={isSaving}
          />
        </View>

        {settings.autoDeleteAfterInactivity && (
          <TouchableOpacity style={styles.settingButton} onPress={handleInactivityPeriodChange}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Período de Inactividad</Text>
              <Text style={styles.settingDescription}>
                Eliminar después de: {getRetentionText(settings.inactivityPeriod)} sin actividad
              </Text>
            </View>
            <Text style={styles.settingValue}>Cambiar</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Derechos GDPR</Text>
        <Text style={styles.sectionDescription}>
          Ejercita tus derechos bajo el Reglamento General de Protección de Datos
        </Text>

        <TouchableOpacity style={styles.gdprButton}>
          <Text style={styles.gdprButtonText}>📥 Exportar Mis Datos</Text>
          <Text style={styles.gdprButtonDescription}>
            Descargar una copia de todos tus datos personales
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gdprButton, styles.dangerButton]}>
          <Text style={[styles.gdprButtonText, styles.dangerText]}>🗑️ Eliminar Mi Cuenta</Text>
          <Text style={styles.gdprButtonDescription}>
            Eliminar permanentemente tu cuenta y todos los datos
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Información sobre Privacidad</Text>
        <Text style={styles.infoText}>
          • Tus datos se procesan de acuerdo con nuestra Política de Privacidad{'\n'}
          • Puedes cambiar estos consentimientos en cualquier momento{'\n'}
          • Algunos datos son necesarios para el funcionamiento básico de la app{'\n'}
          • El procesamiento se basa en tu consentimiento o interés legítimo{'\n'}
          • Tienes derecho a acceder, rectificar y eliminar tus datos
        </Text>
      </View>

      <View style={styles.lastUpdated}>
        <Text style={styles.lastUpdatedText}>
          Última actualización: {new Date(settings.updatedAt).toLocaleDateString('es-ES')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    fontFamily: theme.fonts.regular,
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    margin: 20,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  settingValue: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.primary,
  },
  gdprButton: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  dangerButton: {
    borderColor: theme.colors.error,
  },
  gdprButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    marginBottom: 4,
  },
  dangerText: {
    color: theme.colors.error,
  },
  gdprButtonDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
  },
  infoSection: {
    margin: 20,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  lastUpdated: {
    margin: 20,
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
  },
});