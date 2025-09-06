import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { theme } from '../styles/theme';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { privacyManager } from '../services/privacy/privacyManager';
import { gdprService, DataDeletionRequest } from '../services/privacy/gdprService';

export const AccountDeletionScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [confirmationText, setConfirmationText] = useState('');

  useEffect(() => {
    loadDeletionRequests();
  }, []);

  const loadDeletionRequests = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const requests = await gdprService.getUserDeletionRequests(user.id);
      setDeletionRequests(requests);
    } catch (error) {
      console.error('Error loading deletion requests:', error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes de eliminación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!user) return;

    if (confirmationText !== 'ELIMINAR MI CUENTA') {
      Alert.alert('Error', 'Debes escribir "ELIMINAR MI CUENTA" para confirmar');
      return;
    }

    Alert.alert(
      'Confirmar Eliminación de Cuenta',
      '⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER\n\n' +
      'Se eliminarán permanentemente:\n' +
      '• Todos tus datos personales\n' +
      '• Historial de colaboraciones\n' +
      '• Mensajes y conversaciones\n' +
      '• Configuraciones de cuenta\n\n' +
      'Tienes 30 días para cancelar esta solicitud.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Cuenta',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsRequestingDeletion(true);
              await privacyManager.requestAccountDeletion(user.id, deletionReason);
              
              Alert.alert(
                'Solicitud de Eliminación Enviada',
                'Tu cuenta será eliminada en 30 días. Puedes cancelar esta solicitud antes de esa fecha.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Log out the user
                      dispatch(logout());
                    }
                  }
                ]
              );
              
              await loadDeletionRequests();
            } catch (error) {
              console.error('Error requesting deletion:', error);
              Alert.alert('Error', 'No se pudo procesar la solicitud de eliminación');
            } finally {
              setIsRequestingDeletion(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelDeletion = async (request: DataDeletionRequest) => {
    Alert.alert(
      'Cancelar Eliminación',
      '¿Estás seguro de que quieres cancelar la eliminación de tu cuenta?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          onPress: async () => {
            try {
              const success = await privacyManager.cancelAccountDeletion(request.id, user!.id);
              
              if (success) {
                Alert.alert('Eliminación Cancelada', 'La eliminación de tu cuenta ha sido cancelada.');
                await loadDeletionRequests();
              } else {
                Alert.alert('Error', 'No se pudo cancelar la eliminación');
              }
            } catch (error) {
              console.error('Error cancelling deletion:', error);
              Alert.alert('Error', 'No se pudo cancelar la eliminación');
            }
          }
        }
      ]
    );
  };

  const getStatusText = (status: DataDeletionRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'scheduled':
        return 'Programada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: DataDeletionRequest['status']) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'scheduled':
        return theme.colors.error;
      case 'completed':
        return theme.colors.textSecondary;
      case 'cancelled':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getDaysRemaining = (scheduledDate: Date) => {
    const now = new Date();
    const scheduled = new Date(scheduledDate);
    const diffTime = scheduled.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Check if user has a pending deletion request
  const hasPendingDeletion = deletionRequests.some(
    req => req.status === 'scheduled' || req.status === 'pending'
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando solicitudes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ZyroLogo size="large" />
        <Text style={styles.title}>Eliminación de Cuenta</Text>
        <Text style={styles.subtitle}>
          Elimina permanentemente tu cuenta y todos tus datos
        </Text>
      </View>

      <View style={styles.warningSection}>
        <Text style={styles.warningTitle}>⚠️ Advertencia Importante</Text>
        <Text style={styles.warningText}>
          La eliminación de tu cuenta es permanente e irreversible. Se eliminarán todos tus datos, 
          incluyendo colaboraciones, mensajes y configuraciones. Esta acción cumple con el 
          Artículo 17 del RGPD (Derecho al olvido).
        </Text>
      </View>

      {!hasPendingDeletion ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solicitar Eliminación</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Motivo (opcional)</Text>
            <TextInput
              style={styles.textInput}
              value={deletionReason}
              onChangeText={setDeletionReason}
              placeholder="¿Por qué quieres eliminar tu cuenta?"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Escribe "ELIMINAR MI CUENTA" para confirmar
            </Text>
            <TextInput
              style={styles.textInput}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder="ELIMINAR MI CUENTA"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="characters"
            />
          </View>

          <PremiumButton
            title={isRequestingDeletion ? "Procesando..." : "Eliminar Mi Cuenta"}
            onPress={handleRequestDeletion}
            disabled={isRequestingDeletion || confirmationText !== 'ELIMINAR MI CUENTA'}
            style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solicitudes de Eliminación</Text>
          
          {deletionRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestDate}>
                  Solicitada: {new Date(request.requestDate).toLocaleDateString('es-ES')}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusText(request.status)}
                  </Text>
                </View>
              </View>
              
              {request.status === 'scheduled' && (
                <View style={styles.scheduledInfo}>
                  <Text style={styles.scheduledText}>
                    Eliminación programada: {new Date(request.scheduledDeletionDate).toLocaleDateString('es-ES')}
                  </Text>
                  <Text style={styles.daysRemaining}>
                    Días restantes: {getDaysRemaining(request.scheduledDeletionDate)}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelDeletion(request)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar Eliminación</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {request.reason && (
                <View style={styles.reasonSection}>
                  <Text style={styles.reasonLabel}>Motivo:</Text>
                  <Text style={styles.reasonText}>{request.reason}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.alternativesSection}>
        <Text style={styles.alternativesTitle}>¿Buscas otras opciones?</Text>
        <Text style={styles.alternativesText}>
          • Puedes desactivar temporalmente tu cuenta{'\n'}
          • Exportar tus datos antes de eliminar{'\n'}
          • Cambiar configuraciones de privacidad{'\n'}
          • Contactar con soporte para resolver problemas
        </Text>
      </View>

      <View style={styles.legalSection}>
        <Text style={styles.legalTitle}>Información Legal</Text>
        <Text style={styles.legalText}>
          Este proceso cumple con el Artículo 17 del RGPD (Derecho al olvido). 
          Algunos datos pueden conservarse por obligaciones legales o para 
          fines estadísticos anónimos. El período de gracia de 30 días permite 
          cancelar la solicitud antes de la eliminación definitiva.
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
  warningSection: {
    margin: 20,
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  warningTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    color: theme.colors.error,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    lineHeight: 20,
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    textAlignVertical: 'top',
  },
  deleteButton: {
    marginTop: 20,
  },
  requestCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestDate: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.white,
  },
  scheduledInfo: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  scheduledText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    marginBottom: 4,
  },
  daysRemaining: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    color: theme.colors.error,
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.white,
  },
  reasonSection: {
    marginTop: 8,
  },
  reasonLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  alternativesSection: {
    margin: 20,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  alternativesTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  alternativesText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  legalSection: {
    margin: 20,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  legalTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  legalText: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
});