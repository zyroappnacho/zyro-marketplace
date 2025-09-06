import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { PremiumButton } from './PremiumButton';
import { collaborationCompletionService } from '../services/collaborationCompletionService';
import { CollaborationStatus } from '../types';

interface CollaborationCompletionButtonProps {
  collaborationRequestId: string;
  currentStatus: CollaborationStatus;
  userRole: 'admin' | 'influencer' | 'company';
  userId: string;
  onStatusUpdate?: () => void;
}

export const CollaborationCompletionButton: React.FC<CollaborationCompletionButtonProps> = ({
  collaborationRequestId,
  currentStatus,
  userRole,
  userId,
  onStatusUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  // Form state for completion
  const [instagramStories, setInstagramStories] = useState('');
  const [tiktokVideos, setTiktokVideos] = useState('');
  
  // Form state for admin confirmation
  const [adminNotes, setAdminNotes] = useState('');

  const canMarkAsCompleted = userRole === 'influencer' && currentStatus === 'approved';
  const canConfirmCompletion = userRole === 'admin' && currentStatus === 'completed';

  const handleMarkAsCompleted = async () => {
    if (!canMarkAsCompleted) return;

    try {
      setLoading(true);
      
      const contentUrls = {
        instagramStories: instagramStories.split('\n').filter(url => url.trim()),
        tiktokVideos: tiktokVideos.split('\n').filter(url => url.trim())
      };

      if (contentUrls.instagramStories.length === 0 && contentUrls.tiktokVideos.length === 0) {
        Alert.alert('Error', 'Debes proporcionar al menos un enlace de contenido');
        return;
      }

      await collaborationCompletionService.markCollaborationAsCompleted(
        collaborationRequestId,
        userId,
        contentUrls
      );

      setShowCompletionModal(false);
      setInstagramStories('');
      setTiktokVideos('');
      
      Alert.alert(
        'Éxito',
        'Has marcado la colaboración como completada. El administrador revisará el contenido.',
        [{ text: 'OK', onPress: onStatusUpdate }]
      );
    } catch (error) {
      console.error('Error marking collaboration as completed:', error);
      Alert.alert('Error', 'No se pudo marcar la colaboración como completada');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCompletion = async () => {
    if (!canConfirmCompletion) return;

    try {
      setLoading(true);
      
      await collaborationCompletionService.confirmCollaborationCompletion(
        collaborationRequestId,
        userId,
        adminNotes.trim() || undefined
      );

      setShowConfirmationModal(false);
      setAdminNotes('');
      
      Alert.alert(
        'Éxito',
        'Has confirmado la finalización de la colaboración.',
        [{ text: 'OK', onPress: onStatusUpdate }]
      );
    } catch (error) {
      console.error('Error confirming collaboration completion:', error);
      Alert.alert('Error', 'No se pudo confirmar la finalización de la colaboración');
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async () => {
    if (userRole !== 'admin') return;

    try {
      setLoading(true);
      await collaborationCompletionService.sendContentDeliveryReminder(
        collaborationRequestId,
        userId
      );
      Alert.alert('Éxito', 'Recordatorio enviado al influencer');
    } catch (error) {
      console.error('Error sending reminder:', error);
      Alert.alert('Error', 'No se pudo enviar el recordatorio');
    } finally {
      setLoading(false);
    }
  };

  if (!canMarkAsCompleted && !canConfirmCompletion && userRole !== 'admin') {
    return null;
  }

  return (
    <View style={styles.container}>
      {canMarkAsCompleted && (
        <PremiumButton
          title="Marcar como Completada"
          onPress={() => setShowCompletionModal(true)}
          disabled={loading}
          style={styles.button}
        />
      )}

      {canConfirmCompletion && (
        <PremiumButton
          title="Confirmar Finalización"
          onPress={() => setShowConfirmationModal(true)}
          disabled={loading}
          style={styles.button}
        />
      )}

      {userRole === 'admin' && currentStatus === 'approved' && (
        <TouchableOpacity
          style={styles.reminderButton}
          onPress={sendReminder}
          disabled={loading}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.reminderButtonText}>Enviar Recordatorio</Text>
        </TouchableOpacity>
      )}

      {/* Completion Modal for Influencers */}
      <Modal
        visible={showCompletionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCompletionModal(false)}>
              <Text style={styles.modalCancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Completar Colaboración</Text>
            <TouchableOpacity onPress={handleMarkAsCompleted} disabled={loading}>
              <Text style={[styles.modalSaveButton, loading && styles.modalButtonDisabled]}>
                Completar
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Proporciona los enlaces del contenido que has publicado para esta colaboración:
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Historias de Instagram</Text>
              <TextInput
                style={styles.formTextArea}
                value={instagramStories}
                onChangeText={setInstagramStories}
                placeholder="Pega aquí los enlaces de tus historias de Instagram (uno por línea)"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.formHelp}>
                Copia y pega los enlaces de las historias que publicaste (uno por línea)
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Videos de TikTok</Text>
              <TextInput
                style={styles.formTextArea}
                value={tiktokVideos}
                onChangeText={setTiktokVideos}
                placeholder="Pega aquí los enlaces de tus videos de TikTok (uno por línea)"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.formHelp}>
                Copia y pega los enlaces de los videos que publicaste (uno por línea)
              </Text>
            </View>

            <View style={styles.requirementBox}>
              <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.requirementText}>
                Recuerda: Debes haber publicado 2 historias de Instagram (una en video) O 1 video de TikTok según lo acordado.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Confirmation Modal for Admin */}
      <Modal
        visible={showConfirmationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowConfirmationModal(false)}>
              <Text style={styles.modalCancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Confirmar Finalización</Text>
            <TouchableOpacity onPress={handleConfirmCompletion} disabled={loading}>
              <Text style={[styles.modalSaveButton, loading && styles.modalButtonDisabled]}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Confirma que la colaboración ha sido completada satisfactoriamente por el influencer.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notas del Administrador (Opcional)</Text>
              <TextInput
                style={styles.formTextArea}
                value={adminNotes}
                onChangeText={setAdminNotes}
                placeholder="Agrega comentarios sobre la colaboración completada..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.formHelp}>
                Estas notas serán visibles para todas las partes involucradas
              </Text>
            </View>

            <View style={styles.confirmationBox}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.confirmationText}>
                Al confirmar, la colaboración se marcará como finalizada exitosamente.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  button: {
    marginVertical: 0,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    backgroundColor: 'transparent',
    gap: 8,
  },
  reminderButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalCancelButton: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  modalSaveButton: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  modalButtonDisabled: {
    color: theme.colors.textSecondary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 24,
    lineHeight: 22,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  formTextArea: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    height: 100,
    textAlignVertical: 'top',
  },
  formHelp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  requirementBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.3)',
    gap: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  confirmationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    gap: 12,
  },
  confirmationText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
});