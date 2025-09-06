import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../styles/theme';
import { FollowerValidationResult } from '../services/followerValidationService';

interface Props {
  validationResult: FollowerValidationResult;
  showDetails?: boolean;
}

export const FollowerValidationBanner: React.FC<Props> = ({ 
  validationResult, 
  showDetails = true 
}) => {
  const { isEligible, message } = validationResult;

  return (
    <View style={[
      styles.container,
      isEligible ? styles.eligibleContainer : styles.ineligibleContainer
    ]}>
      <View style={styles.iconContainer}>
        <Icon 
          name={isEligible ? "check-circle" : "error"} 
          size={20} 
          color={isEligible ? colors.success : colors.error} 
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[
          styles.message,
          isEligible ? styles.eligibleText : styles.ineligibleText
        ]}>
          {message}
        </Text>
        {!isEligible && showDetails && (
          <Text style={styles.helpText}>
            Actualiza tu número de seguidores en tu perfil si has crecido recientemente.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginVertical: spacing.sm,
  },
  eligibleContainer: {
    backgroundColor: `${colors.success}15`,
    borderColor: colors.success,
  },
  ineligibleContainer: {
    backgroundColor: `${colors.error}15`,
    borderColor: colors.error,
  },
  iconContainer: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: 20,
  },
  eligibleText: {
    color: colors.success,
  },
  ineligibleText: {
    color: colors.error,
  },
  helpText: {
    fontSize: fontSizes.xs,
    color: colors.mediumGray,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
});