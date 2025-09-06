import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../styles/theme';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { useCurrentInfluencer } from '../hooks/useCurrentInfluencer';
import { logout } from '../store/slices/authSlice';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const influencer = useCurrentInfluencer();
  const [isUpdatingFollowers, setIsUpdatingFollowers] = useState(false);

  if (!influencer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
      </View>
    );
  }

  const handleUpdateFollowers = () => {
    Alert.alert(
      'Actualizar Seguidores',
      'Ingresa tu número actual de seguidores',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Actualizar',
          onPress: () => {
            setIsUpdatingFollowers(true);
            // TODO: Implement follower update logic
            setTimeout(() => {
              setIsUpdatingFollowers(false);
              Alert.alert('Éxito', 'Seguidores actualizados correctamente');
            }, 1000);
          },
        },
      ]
    );
  };

  const handleUpdateProfileImage = () => {
    Alert.alert(
      'Actualizar Foto de Perfil',
      'Selecciona una nueva foto de perfil',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Galería',
          onPress: () => {
            // TODO: Implement image picker
            Alert.alert('Info', 'Funcionalidad de galería próximamente');
          },
        },
        {
          text: 'Cámara',
          onPress: () => {
            // TODO: Implement camera
            Alert.alert('Info', 'Funcionalidad de cámara próximamente');
          },
        },
      ]
    );
  };

  const handlePersonalData = () => {
    navigation.navigate('PersonalData' as never);
  };

  const handleTermsOfService = () => {
    navigation.navigate('TermsOfService' as never);
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy' as never);
  };

  const handleSecuritySettings = () => {
    navigation.navigate('SecuritySettings' as never);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            // Navigation will be handled automatically by the auth state change
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      'Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmación Final',
              '¿Estás completamente seguro? Se eliminará toda tu información y no podrás recuperarla.',
              [
                {
                  text: 'Cancelar',
                  style: 'cancel',
                },
                {
                  text: 'Sí, eliminar mi cuenta',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // TODO: Implement account deletion API call
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      
                      Alert.alert(
                        'Cuenta Eliminada',
                        'Tu cuenta ha sido eliminada exitosamente. Se ha enviado una confirmación a tu email.',
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              dispatch(logout());
                            },
                          },
                        ]
                      );
                    } catch (error) {
                      Alert.alert('Error', 'No se pudo eliminar la cuenta. Inténtalo de nuevo.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Zyro Logo */}
      <View style={styles.header}>
        <ZyroLogo size="large" />
      </View>

      {/* Profile Image Section */}
      <View style={styles.profileImageSection}>
        <TouchableOpacity 
          style={styles.profileImageContainer}
          onPress={handleUpdateProfileImage}
          activeOpacity={0.8}
        >
          <Image 
            source={{ uri: influencer.profileImage || 'https://via.placeholder.com/120' }}
            style={styles.profileImage}
          />
          <View style={styles.profileImageOverlay}>
            <Icon name="camera-alt" size={24} color={colors.white} />
          </View>
        </TouchableOpacity>
      </View>

      {/* User Info Section */}
      <View style={styles.userInfoSection}>
        <Text style={styles.fullName}>{influencer.fullName}</Text>
        <Text style={styles.email}>{influencer.email}</Text>
      </View>

      {/* Social Media Section */}
      <View style={styles.socialMediaSection}>
        <Text style={styles.sectionTitle}>Redes Sociales</Text>
        
        {/* Instagram */}
        {influencer.instagramUsername && (
          <View style={styles.socialMediaItem}>
            <View style={styles.socialMediaInfo}>
              <Icon name="camera-alt" size={24} color={colors.goldElegant} />
              <View style={styles.socialMediaText}>
                <Text style={styles.socialMediaPlatform}>Instagram</Text>
                <Text style={styles.socialMediaUsername}>@{influencer.instagramUsername}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.followersButton}
              onPress={handleUpdateFollowers}
              disabled={isUpdatingFollowers}
            >
              <Text style={styles.followersText}>
                {influencer.instagramFollowers.toLocaleString()} seguidores
              </Text>
              <Icon name="edit" size={16} color={colors.goldElegant} />
            </TouchableOpacity>
          </View>
        )}

        {/* TikTok */}
        {influencer.tiktokUsername && (
          <View style={styles.socialMediaItem}>
            <View style={styles.socialMediaInfo}>
              <Icon name="video-library" size={24} color={colors.goldElegant} />
              <View style={styles.socialMediaText}>
                <Text style={styles.socialMediaPlatform}>TikTok</Text>
                <Text style={styles.socialMediaUsername}>@{influencer.tiktokUsername}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.followersButton}
              onPress={handleUpdateFollowers}
              disabled={isUpdatingFollowers}
            >
              <Text style={styles.followersText}>
                {influencer.tiktokFollowers.toLocaleString()} seguidores
              </Text>
              <Icon name="edit" size={16} color={colors.goldElegant} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Personal Data Button */}
      <View style={styles.actionSection}>
        <PremiumButton
          title="DATOS PERSONALES"
          onPress={handlePersonalData}
          style={styles.personalDataButton}
        />
      </View>

      {/* Configuration Options */}
      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        <TouchableOpacity style={styles.configItem} onPress={handleTermsOfService}>
          <View style={styles.configItemLeft}>
            <Icon name="description" size={24} color={colors.goldElegant} />
            <Text style={styles.configItemText}>Normas de uso</Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.mediumGray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.configItem} onPress={handlePrivacyPolicy}>
          <View style={styles.configItemLeft}>
            <Icon name="privacy-tip" size={24} color={colors.goldElegant} />
            <Text style={styles.configItemText}>Política de privacidad</Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.mediumGray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.configItem} onPress={handleSecuritySettings}>
          <View style={styles.configItemLeft}>
            <Icon name="security" size={24} color={colors.goldElegant} />
            <Text style={styles.configItemText}>Contraseña y seguridad</Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.mediumGray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.configItem} onPress={handleLogout}>
          <View style={styles.configItemLeft}>
            <Icon name="logout" size={24} color={colors.error} />
            <Text style={[styles.configItemText, { color: colors.error }]}>Cerrar sesión</Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.mediumGray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.configItem} onPress={handleDeleteAccount}>
          <View style={styles.configItemLeft}>
            <Icon name="delete-forever" size={24} color={colors.error} />
            <Text style={[styles.configItemText, { color: colors.error }]}>Borrar cuenta</Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.mediumGray} />
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'flex-start',
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.goldElegant,
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.goldElegant,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.black,
  },
  userInfoSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  fullName: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSizes.md,
    color: colors.lightGray,
  },
  socialMediaSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
    marginBottom: spacing.md,
  },
  socialMediaItem: {
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.goldElegant,
    ...shadows.small,
  },
  socialMediaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  socialMediaText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  socialMediaPlatform: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.white,
  },
  socialMediaUsername: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
  },
  followersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.goldElegant}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.goldElegant,
  },
  followersText: {
    fontSize: fontSizes.sm,
    color: colors.goldElegant,
    fontWeight: fontWeights.medium,
    marginRight: spacing.xs,
  },
  actionSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  personalDataButton: {
    marginTop: 0,
  },
  configSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  configItem: {
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  configItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  configItemText: {
    fontSize: fontSizes.md,
    color: colors.white,
    marginLeft: spacing.md,
    fontWeight: fontWeights.medium,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  errorText: {
    fontSize: fontSizes.lg,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});