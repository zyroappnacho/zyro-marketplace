/**
 * Gestor de Suscripciones para Empresas
 * Permite ver, modificar y cancelar suscripciones de Stripe
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StripeService from '../services/StripeService';
import { useSelector } from 'react-redux';

const CompanySubscriptionManager = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const company = useSelector(state => state.auth.company);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      if (company?.stripeCustomerId) {
        const subscriptionData = await StripeService.getSubscriptionInfo(company.stripeCustomerId);
        setSubscription(subscriptionData.subscription);
      }
    } catch (error) {
      console.error('Error cargando datos de suscripción:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptionData();
    setRefreshing(false);
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancelar Suscripción',
      '¿Estás seguro de que quieres cancelar tu suscripción? Se cancelará al final del período actual.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí, Cancelar', 
          style: 'destructive',
          onPress: confirmCancelSubscription 
        }
      ]
    );
  };

  const confirmCancelSubscription = async () => {
    try {
      setLoading(true);
      await StripeService.cancelSubscription(subscription.id);
      
      Alert.alert(
        'Suscripción Cancelada',
        'Tu suscripción se cancelará al final del período actual. Seguirás teniendo acceso hasta entonces.',
        [{ text: 'OK', onPress: loadSubscriptionData }]
      );
    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      Alert.alert('Error', 'No se pudo cancelar la suscripción. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleManagePaymentMethods = async () => {
    try {
      setLoading(true);
      await StripeService.createCustomerPortal(company.stripeCustomerId);
    } catch (error) {
      console.error('Error abriendo portal del cliente:', error);
      Alert.alert('Error', 'No se pudo abrir el portal de gestión');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'canceled': return '#ef4444';
      case 'past_due': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'canceled': return 'Cancelada';
      case 'past_due': return 'Pago Pendiente';
      default: return 'Desconocido';
    }
  };

  const renderSubscriptionCard = () => {
    if (!subscription) {
      return (
        <View style={styles.noSubscriptionCard}>
          <Text style={styles.noSubscriptionTitle}>Sin Suscripción Activa</Text>
          <Text style={styles.noSubscriptionText}>
            No tienes una suscripción activa. Contacta con soporte si crees que esto es un error.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <Text style={styles.subscriptionTitle}>Suscripción Actual</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) }]}>
            <Text style={styles.statusText}>{getStatusText(subscription.status)}</Text>
          </View>
        </View>

        <View style={styles.subscriptionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plan:</Text>
            <Text style={styles.detailValue}>
              {StripeService.formatPrice(subscription.plan.amount)} / {subscription.plan.interval}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Próximo pago:</Text>
            <Text style={styles.detailValue}>
              {formatDate(subscription.current_period_end)}
            </Text>
          </View>

          {subscription.cancel_at_period_end && (
            <View style={styles.cancelNotice}>
              <Text style={styles.cancelNoticeText}>
                ⚠️ Esta suscripción se cancelará el {formatDate(subscription.current_period_end)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderActionButtons = () => {
    if (!subscription) return null;

    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleManagePaymentMethods}
        >
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonText}>Gestionar Métodos de Pago</Text>
          </LinearGradient>
        </TouchableOpacity>

        {subscription.status === 'active' && !subscription.cancel_at_period_end && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelSubscription}
          >
            <Text style={styles.cancelButtonText}>Cancelar Suscripción</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderBillingInfo = () => {
    return (
      <View style={styles.billingCard}>
        <Text style={styles.billingTitle}>Información de Facturación</Text>
        
        <View style={styles.billingDetails}>
          <Text style={styles.billingText}>
            • Los pagos se procesan automáticamente cada mes
          </Text>
          <Text style={styles.billingText}>
            • Recibirás un recibo por email después de cada pago
          </Text>
          <Text style={styles.billingText}>
            • Puedes actualizar tus métodos de pago en cualquier momento
          </Text>
          <Text style={styles.billingText}>
            • Las cancelaciones son efectivas al final del período actual
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.portalButton}
          onPress={handleManagePaymentMethods}
        >
          <Text style={styles.portalButtonText}>
            Abrir Portal de Facturación →
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Cargando información de suscripción...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Suscripción</Text>
        <Text style={styles.subtitle}>
          Administra tu plan y métodos de pago
        </Text>
      </View>

      {renderSubscriptionCard()}
      {renderActionButtons()}
      {renderBillingInfo()}

      <View style={styles.supportSection}>
        <Text style={styles.supportTitle}>¿Necesitas Ayuda?</Text>
        <Text style={styles.supportText}>
          Si tienes problemas con tu suscripción o facturación, contacta con nuestro equipo de soporte.
        </Text>
        <TouchableOpacity style={styles.supportButton}>
          <Text style={styles.supportButtonText}>Contactar Soporte</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  subscriptionCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subscriptionDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  cancelNotice: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  cancelNoticeText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '500',
  },
  noSubscriptionCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  noSubscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  noSubscriptionText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
  },
  billingCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  billingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  billingDetails: {
    gap: 8,
    marginBottom: 16,
  },
  billingText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  portalButton: {
    alignItems: 'center',
    padding: 12,
  },
  portalButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  supportSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  supportButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CompanySubscriptionManager;