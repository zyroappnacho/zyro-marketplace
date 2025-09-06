import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { theme } from '../styles/theme';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { privacyManager } from '../services/privacy/privacyManager';
import { gdprService, DataExportRequest } from '../services/privacy/gdprService';

export const DataExportScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingExport, setIsRequestingExport] = useState(false);

  useEffect(() => {
    loadExportRequests();
  }, []);

  const loadExportRequests = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const requests = await gdprService.getUserDataExportRequests(user.id);
      setExportRequests(requests);
    } catch (error) {
      console.error('Error loading export requests:', error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes de exportación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestExport = async () => {
    if (!user) return;

    Alert.alert(
      'Solicitar Exportación de Datos',
      'Se creará un archivo con todos tus datos personales. Este proceso puede tardar hasta 24 horas. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: async () => {
            try {
              setIsRequestingExport(true);
              await privacyManager.requestDataExport(user.id);
              Alert.alert(
                'Solicitud Enviada',
                'Tu solicitud de exportación ha sido enviada. Recibirás una notificación cuando esté lista.'
              );
              await loadExportRequests();
            } catch (error) {
              console.error('Error requesting export:', error);
              Alert.alert('Error', 'No se pudo procesar la solicitud de exportación');
            } finally {
              setIsRequestingExport(false);
            }
          }
        }
      ]
    );
  };

  const handleDownloadExport = async (request: DataExportRequest) => {
    if (!request.downloadUrl || request.status !== 'completed') {
      Alert.alert('Error', 'La exportación no está disponible');
      return;
    }

    try {
      const exportData = await gdprService.downloadExportedData(request.id);
      
      // In a real app, this would save the file or open a share dialog
      // For now, we'll show the data structure
      Alert.alert(
        'Datos Exportados',
        'Los datos han sido preparados. En una aplicación real, se descargaría un archivo JSON.',
        [
          {
            text: 'Compartir',
            onPress: () => {
              Share.share({
                message: `Exportación de datos de Zyro - ${new Date().toLocaleDateString()}`,
                title: 'Mis datos de Zyro'
              });
            }
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error downloading export:', error);
      Alert.alert('Error', 'No se pudo descargar la exportación');
    }
  };

  const getStatusText = (status: DataExportRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'completed':
        return 'Completado';
      case 'failed':
        return 'Error';
      default:
        return status;
    }
  };

  const getStatusColor = (status: DataExportRequest['status']) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'processing':
        return theme.colors.primary;
      case 'completed':
        return theme.colors.success;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

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
        <Text style={styles.title}>Exportación de Datos</Text>
        <Text style={styles.subtitle}>
          Descarga una copia de todos tus datos personales
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>¿Qué incluye la exportación?</Text>
        <Text style={styles.infoText}>
          • Información personal y de perfil{'\n'}
          • Historial de colaboraciones{'\n'}
          • Mensajes y conversaciones{'\n'}
          • Configuraciones de cuenta{'\n'}
          • Datos de actividad y uso{'\n'}
          • Registros de consentimiento
        </Text>
      </View>

      <View style={styles.section}>
        <PremiumButton
          title={isRequestingExport ? "Procesando..." : "Solicitar Nueva Exportación"}
          onPress={handleRequestExport}
          disabled={isRequestingExport}
          style={styles.requestButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Solicitudes</Text>
        
        {exportRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No tienes solicitudes de exportación
            </Text>
          </View>
        ) : (
          exportRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestDate}>
                  {new Date(request.requestDate).toLocaleDateString('es-ES')}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusText(request.status)}
                  </Text>
                </View>
              </View>
              
              {request.status === 'completed' && (
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownloadExport(request)}
                  >
                    <Text style={styles.downloadButtonText}>Descargar</Text>
                  </TouchableOpacity>
                  
                  {request.expiresAt && (
                    <Text style={styles.expiryText}>
                      Expira: {new Date(request.expiresAt).toLocaleDateString('es-ES')}
                    </Text>
                  )}
                </View>
              )}
              
              {request.status === 'failed' && (
                <Text style={styles.errorText}>
                  Error al procesar la solicitud. Intenta nuevamente.
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      <View style={styles.legalSection}>
        <Text style={styles.legalTitle}>Información Legal</Text>
        <Text style={styles.legalText}>
          Este servicio cumple con el Artículo 20 del RGPD (Derecho a la portabilidad de datos). 
          Los datos se proporcionan en formato JSON estructurado. Las exportaciones expiran 
          después de 7 días por motivos de seguridad.
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
  infoSection: {
    margin: 20,
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.primary,
    marginBottom: 12,
  },
  infoText: {
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
  requestButton: {
    marginBottom: 0,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    fontSize: 16,
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
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.white,
  },
  expiryText: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.error,
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