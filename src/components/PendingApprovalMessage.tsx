import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ZyroLogo } from './ZyroLogo';
import { theme } from '../styles/theme';

interface PendingApprovalMessageProps {
  userRole: 'influencer' | 'company';
  registrationDate?: Date;
}

export const PendingApprovalMessage: React.FC<PendingApprovalMessageProps> = ({
  userRole,
  registrationDate
}) => {
  const getTimeElapsed = (): string => {
    if (!registrationDate) return '';
    
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'hace menos de una hora';
    } else if (diffInHours < 24) {
      return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  const getMessageForRole = () => {
    if (userRole === 'influencer') {
      return {
        title: 'Solicitud en Revisión',
        message: 'Tu solicitud está siendo revisada por nuestro equipo. Este proceso puede tomar entre 24-48 horas. Te notificaremos por email una vez que tu cuenta sea aprobada.',
        subtitle: 'Gracias por elegir Zyro'
      };
    } else {
      return {
        title: 'Cuenta en Validación',
        message: 'Estamos validando la información de tu empresa. Este proceso puede tomar hasta 48 horas. Te contactaremos por email para continuar con el proceso de activación.',
        subtitle: 'Pronto podrás acceder a colaboraciones premium'
      };
    }
  };

  const messageContent = getMessageForRole();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <ZyroLogo size="large" />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{messageContent.title}</Text>
        
        <View style={styles.messageContainer}>
          <Text style={styles.message}>{messageContent.message}</Text>
        </View>
        
        {registrationDate && (
          <Text style={styles.timeElapsed}>
            Solicitud enviada {getTimeElapsed()}
          </Text>
        )}
        
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>En revisión</Text>
        </View>
        
        <Text style={styles.subtitle}>{messageContent.subtitle}</Text>
      </View>
      
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          Si tienes alguna pregunta, puedes contactarnos en
        </Text>
        <Text style={styles.contactEmail}>soporte@zyro.com</Text>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    maxWidth: width - 48,
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Cinzel',
  },
  messageContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  timeElapsed: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  footerContainer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    width: '100%',
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  contactEmail: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});

export default PendingApprovalMessage;