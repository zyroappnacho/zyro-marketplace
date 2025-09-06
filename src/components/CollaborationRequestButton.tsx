import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../styles/theme';
import { Campaign } from '../types';
import { useCurrentInfluencer } from '../hooks/useCurrentInfluencer';
import { FollowerValidationService } from '../services/followerValidationService';
import { FollowerValidationBanner } from './FollowerValidationBanner';

interface Props {
  campaign: Campaign;
  onPress: () => void;
  style?: any;
  showValidationBanner?: boolean;
}

export const CollaborationRequestButton: React.FC<Props> = ({ 
  campaign, 
  onPress, 
  style,
  showValidationBanner = true 
}) => {
  const currentInfluencer = useCurrentInfluencer();

  // If no current influencer, show login prompt
  if (!currentInfluencer) {
    return (
      <View style={[styles.container, style]}>
        {showValidationBanner && (
          <View style={styles.warningBanner}>
            <Icon name="info" size={20} color={colors.warning} />
            <Text style={styles.warningText}>
              Debes iniciar sesión como influencer para solicitar colaboraciones
            </Text>
          </View>
        )}
        <TouchableOpacity style={[styles.button, styles.disabledButton]} disabled>
          <Text style={styles.disabledButtonText}>Iniciar Sesión Requerido</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If influencer is not approved, show pending message
  if (currentInfluencer.status !== 'approved') {
    return (
      <View style={[styles.container, style]}>
        {showValidationBanner && (
          <View style={styles.warningBanner}>
            <Icon name="hourglass-empty" size={20} color={colors.warning} />
            <Text style={styles.warningText}>
              Tu cuenta está pendiente de aprobación. Espera 24-48 horas.
            </Text>
          </View>
        )}
        <TouchableOpacity style={[styles.button, styles.disabledButton]} disabled>
          <Text style={styles.disabledButtonText}>Cuenta Pendiente de Aprobación</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Validate follower requirements
  const validationResult = FollowerValidationService.validateFollowerRequirements(
    campaign,
    currentInfluencer
  );

  return (
    <View style={[styles.container, style]}>
      {showValidationBanner && (
        <FollowerValidationBanner validationResult={validationResult} />
      )}
      
      <TouchableOpacity 
        style={[
          styles.button, 
          validationResult.isEligible ? styles.enabledButton : styles.disabledButton
        ]}
        onPress={validationResult.isEligible ? onPress : undefined}
        disabled={!validationResult.isEligible}
      >
        <View style={styles.buttonContent}>
          <Icon 
            name={validationResult.isEligible ? "send" : "block"} 
            size={20} 
            color={validationResult.isEligible ? colors.black : colors.mediumGray} 
          />
          <Text style={[
            styles.buttonText,
            validationResult.isEligible ? styles.enabledButtonText : styles.disabledButtonText
          ]}>
            {validationResult.isEligible ? 'Solicitar Colaboración' : 'No Cumples Requisitos'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}15`,
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.warning,
    fontWeight: fontWeights.medium,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  button: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  enabledButton: {
    backgroundColor: colors.goldElegant,
    borderWidth: 1,
    borderColor: colors.goldBright,
    shadowColor: colors.goldElegant,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: colors.mediumGray,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    marginLeft: spacing.sm,
  },
  enabledButtonText: {
    color: colors.black,
  },
  disabledButtonText: {
    color: colors.lightGray,
  },
});