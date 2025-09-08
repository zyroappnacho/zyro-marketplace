import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Share,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentScreen } from '../store/slices/uiSlice';
import { requestCollaboration } from '../store/slices/collaborationsSlice';
import { addNotification } from '../store/slices/notificationsSlice';

const { width } = Dimensions.get('window');

export default function CollaborationDetailScreen() {
  const dispatch = useDispatch();
  const { selectedCollaboration } = useSelector(state => state.collaborations);
  const { user } = useSelector(state => state.auth);
  const [requestSent, setRequestSent] = useState(false);

  if (!selectedCollaboration) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Colaboración no encontrada</Text>
      </View>
    );
  }

  const handleRequestCollaboration = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para solicitar colaboraciones');
      return;
    }

    if (user.followers < selectedCollaboration.minFollowers) {
      Alert.alert(
        'Requisitos no cumplidos',
        `Necesitas al menos ${selectedCollaboration.minFollowers.toLocaleString()} seguidores para esta colaboración.`
      );
      return;
    }

    Alert.alert(
      'Confirmar Solicitud',
      '¿Estás seguro de que quieres solicitar esta colaboración?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: async () => {
            try {
              await dispatch(requestCollaboration({
                collaborationId: selectedCollaboration.id,
                userId: user.id,
                message: 'Solicitud de colaboración enviada'
              })).unwrap();

              dispatch(addNotification({
                id: Date.now(),
                type: 'collaboration_request',
                title: 'Solicitud Enviada',
                message: `Tu solicitud para "${selectedCollaboration.title}" ha sido enviada al administrador.`,
                timestamp: new Date(),
                read: false,
                icon: '📤'
              }));

              setRequestSent(true);
              Alert.alert(
                'Solicitud Enviada',
                'Tu solicitud ha sido enviada al administrador. Te notificaremos cuando sea revisada.'
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo enviar la solicitud. Inténtalo de nuevo.');
            }
          }
        }
      ]
    );
  };

  const handleCall = () => {
    Linking.openURL(`tel:${selectedCollaboration.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${selectedCollaboration.email}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Mira esta colaboración en ZYRO! ${selectedCollaboration.title} - ${selectedCollaboration.business}`,
        title: selectedCollaboration.title,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => dispatch(setCurrentScreen('home'))}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={['#C9A961', '#D4AF37', '#B8860B']}
            style={styles.heroImage}
          >
            <Text style={styles.heroPlaceholder}>📸</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroOverlay}
          >
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {selectedCollaboration.category.toUpperCase()}
              </Text>
            </View>
            
            <Text style={styles.heroTitle}>{selectedCollaboration.title}</Text>
            <Text style={styles.heroBusiness}>{selectedCollaboration.business}</Text>
            
            <View style={styles.heroMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{selectedCollaboration.estimatedReach}</Text>
                <Text style={styles.metricLabel}>Alcance Estimado</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{selectedCollaboration.engagement}</Text>
                <Text style={styles.metricLabel}>Engagement</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{selectedCollaboration.description}</Text>
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requisitos</Text>
            <View style={styles.requirementItem}>
              <Text style={styles.requirementIcon}>👥</Text>
              <Text style={styles.requirementText}>{selectedCollaboration.requirements}</Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={styles.requirementIcon}>📍</Text>
              <Text style={styles.requirementText}>{selectedCollaboration.city}</Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={styles.requirementIcon}>👫</Text>
              <Text style={styles.requirementText}>{selectedCollaboration.companions}</Text>
            </View>
          </View>

          {/* What's Included */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Qué Incluye</Text>
            <Text style={styles.includesText}>{selectedCollaboration.whatIncludes}</Text>
          </View>

          {/* Content Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contenido Requerido</Text>
            <Text style={styles.contentRequired}>{selectedCollaboration.contentRequired}</Text>
            <Text style={styles.deadline}>
              📅 Plazo: {selectedCollaboration.deadline}
            </Text>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactItem}>📍 {selectedCollaboration.address}</Text>
              
              <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                <Text style={styles.contactButtonText}>📞 {selectedCollaboration.phone}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                <Text style={styles.contactButtonText}>✉️ {selectedCollaboration.email}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Expiration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Adicional</Text>
            <Text style={styles.expirationText}>
              ⏰ Válido hasta: {formatDate(selectedCollaboration.expiresAt)}
            </Text>
            <Text style={styles.createdText}>
              📅 Publicado: {formatDate(selectedCollaboration.createdAt)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {requestSent ? (
          <View style={styles.requestSentContainer}>
            <Text style={styles.requestSentText}>✅ Solicitud Enviada</Text>
            <Text style={styles.requestSentSubtext}>
              Te notificaremos cuando sea revisada
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.requestButton,
              user && user.followers < selectedCollaboration.minFollowers && styles.requestButtonDisabled
            ]}
            onPress={handleRequestCollaboration}
            disabled={user && user.followers < selectedCollaboration.minFollowers}
          >
            <LinearGradient
              colors={
                user && user.followers < selectedCollaboration.minFollowers
                  ? ['#666', '#555']
                  : ['#C9A961', '#D4AF37']
              }
              style={styles.requestButtonGradient}
            >
              <Text style={styles.requestButtonText}>
                {user && user.followers < selectedCollaboration.minFollowers
                  ? 'No Cumples Requisitos'
                  : 'SOLICITAR COLABORACIÓN'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#C9A961',
    fontSize: 16,
    fontWeight: '500',
  },
  shareButton: {
    padding: 8,
  },
  shareButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholder: {
    fontSize: 64,
    opacity: 0.3,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201, 169, 97, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroBusiness: {
    color: '#CCCCCC',
    fontSize: 18,
    marginBottom: 16,
  },
  heroMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    color: '#C9A961',
    fontSize: 18,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 4,
  },
  mainContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#C9A961',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  requirementText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  includesText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  contentRequired: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  deadline: {
    color: '#C9A961',
    fontSize: 14,
    fontWeight: '600',
  },
  contactInfo: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  contactItem: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  contactButton: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  contactButtonText: {
    color: '#C9A961',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  expirationText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  createdText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  requestButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  requestButtonDisabled: {
    opacity: 0.6,
  },
  requestButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  requestSentContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  requestSentText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  requestSentSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});