import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../styles/theme';
import { PremiumButton } from '../components/PremiumButton';
import { useCurrentInfluencer } from '../hooks/useCurrentInfluencer';
import { Influencer } from '../types';

interface PersonalDataForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  instagramUsername: string;
  tiktokUsername: string;
}

export const PersonalDataScreen: React.FC = () => {
  const navigation = useNavigation();
  const influencer = useCurrentInfluencer();
  const [formData, setFormData] = useState<PersonalDataForm>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    instagramUsername: '',
    tiktokUsername: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (influencer) {
      setFormData({
        fullName: influencer.fullName || '',
        phone: influencer.phone || '',
        address: influencer.address || '',
        city: influencer.city || '',
        instagramUsername: influencer.instagramUsername || '',
        tiktokUsername: influencer.tiktokUsername || '',
      });
    }
  }, [influencer]);

  const handleInputChange = (field: keyof PersonalDataForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      Alert.alert('Info', 'No hay cambios para guardar');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to update user data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Éxito',
        'Datos personales actualizados correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              setHasChanges(false);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Descartar cambios',
        '¿Estás seguro de que quieres descartar los cambios?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (!influencer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.goldElegant} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Datos Personales</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <TextInput
              style={styles.textInput}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Ingresa tu nombre completo"
              placeholderTextColor={colors.mediumGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Ingresa tu número de teléfono"
              placeholderTextColor={colors.mediumGray}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dirección</Text>
            <TextInput
              style={styles.textInput}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Ingresa tu dirección"
              placeholderTextColor={colors.mediumGray}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ciudad</Text>
            <TextInput
              style={styles.textInput}
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              placeholder="Ingresa tu ciudad"
              placeholderTextColor={colors.mediumGray}
            />
          </View>
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes Sociales</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Usuario de Instagram</Text>
            <View style={styles.socialInputContainer}>
              <Text style={styles.socialPrefix}>@</Text>
              <TextInput
                style={styles.socialInput}
                value={formData.instagramUsername}
                onChangeText={(value) => handleInputChange('instagramUsername', value)}
                placeholder="usuario_instagram"
                placeholderTextColor={colors.mediumGray}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Usuario de TikTok</Text>
            <View style={styles.socialInputContainer}>
              <Text style={styles.socialPrefix}>@</Text>
              <TextInput
                style={styles.socialInput}
                value={formData.tiktokUsername}
                onChangeText={(value) => handleInputChange('tiktokUsername', value)}
                placeholder="usuario_tiktok"
                placeholderTextColor={colors.mediumGray}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Update History Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Icon name="info" size={20} color={colors.goldElegant} />
            <Text style={styles.infoText}>
              Los cambios se guardan automáticamente y se mantiene un historial de actualizaciones.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <PremiumButton
          title={isLoading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
          onPress={handleSave}
          disabled={!hasChanges || isLoading}
          style={[
            styles.saveButton,
            (!hasChanges || isLoading) && styles.saveButtonDisabled
          ]}
        />
      </View>
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
    width: 32, // Same width as back button for centering
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
  socialInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    ...shadows.small,
  },
  socialPrefix: {
    fontSize: fontSizes.md,
    color: colors.goldElegant,
    fontWeight: fontWeights.medium,
    paddingLeft: spacing.md,
  },
  socialInput: {
    flex: 1,
    padding: spacing.md,
    paddingLeft: spacing.xs,
    fontSize: fontSizes.md,
    color: colors.white,
  },
  infoSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.goldElegant}10`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.goldElegant}30`,
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  saveButton: {
    marginTop: 0,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: fontSizes.lg,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});