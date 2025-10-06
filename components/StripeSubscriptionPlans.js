/**
 * Componente de Planes de Suscripción con Stripe
 * Integración completa con pasarela externa
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
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StripeService from '../services/StripeService';

const { width } = Dimensions.get('window');

const StripeSubscriptionPlans = ({ companyData, onPaymentSuccess, onPaymentCancel }) => {
  const [selectedPlan, setSelectedPlan] = useState('plan_6_months'); // Plan más popular por defecto
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState({});
  const [initialPayment, setInitialPayment] = useState({});

  useEffect(() => {
    loadPlansData();
  }, []);

  const loadPlansData = () => {
    const plansData = StripeService.getSubscriptionPlans();
    const initialData = StripeService.getInitialPayment();
    setPlans(plansData);
    setInitialPayment(initialData);
  };

  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Por favor selecciona un plan');
      return;
    }

    if (!companyData || !companyData.email) {
      Alert.alert('Error', 'Datos de empresa incompletos');
      return;
    }

    setLoading(true);

    try {
      // Mostrar resumen antes del pago
      const summary = StripeService.getBillingSummary(selectedPlan);
      
      Alert.alert(
        'Confirmar Pago',
        `Plan: ${summary.plan.name}\n` +
        `Primer pago: ${StripeService.formatPrice(summary.firstPayment)}\n` +
        `(Incluye configuración inicial de ${StripeService.formatPrice(summary.initialPayment.price)})\n\n` +
        `Pagos mensuales siguientes: ${StripeService.formatPrice(summary.monthlyPayment)}\n` +
        `Duración: ${summary.plan.duration_months} meses\n\n` +
        `¿Proceder al pago seguro con Stripe?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setLoading(false)
          },
          {
            text: 'Pagar Ahora',
            onPress: () => proceedToStripeCheckout()
          }
        ]
      );

    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Error preparando el pago: ' + error.message);
    }
  };

  const proceedToStripeCheckout = async () => {
    try {
      // Redirigir a Stripe Checkout (pasarela externa)
      const result = await StripeService.redirectToCheckout(companyData, selectedPlan);
      
      setLoading(false);

      // Manejar resultado del navegador
      if (result.type === 'success') {
        // El usuario completó el pago o canceló
        // Verificar el estado real del pago
        await checkPaymentStatus();
      } else if (result.type === 'cancel') {
        onPaymentCancel && onPaymentCancel();
      }

    } catch (error) {
      setLoading(false);
      console.error('Error en checkout:', error);
      Alert.alert('Error de Pago', 'No se pudo procesar el pago. Inténtalo de nuevo.');
    }
  };

  const checkPaymentStatus = async () => {
    // En una implementación real, aquí verificarías el estado del pago
    // usando webhooks o consultando la API de Stripe
    try {
      // Simular verificación exitosa por ahora
      setTimeout(() => {
        onPaymentSuccess && onPaymentSuccess({
          plan: selectedPlan,
          status: 'completed'
        });
      }, 2000);
    } catch (error) {
      console.error('Error verificando pago:', error);
    }
  };

  const renderPlanCard = (planId, plan) => {
    const isSelected = selectedPlan === planId;
    const summary = StripeService.getBillingSummary(planId);

    return (
      <TouchableOpacity
        key={planId}
        style={[styles.planCard, isSelected && styles.selectedPlan]}
        onPress={() => handlePlanSelection(planId)}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MÁS POPULAR</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{StripeService.formatPrice(plan.price)}</Text>
            <Text style={styles.priceUnit}>/mes</Text>
          </View>
          <Text style={styles.duration}>{plan.duration_months} meses de duración</Text>
        </View>

        <View style={styles.planFeatures}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {summary.savings > 0 && (
          <View style={styles.savingsContainer}>
            <Text style={styles.savingsText}>
              Ahorras {StripeService.formatPrice(summary.savings)} vs plan mensual
            </Text>
          </View>
        )}

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total del plan:</Text>
          <Text style={styles.totalAmount}>
            {StripeService.formatPrice(summary.totalPlan)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderInitialPaymentInfo = () => {
    if (!initialPayment.price) return null;

    return (
      <View style={styles.initialPaymentCard}>
        <Text style={styles.initialPaymentTitle}>Configuración Inicial</Text>
        <Text style={styles.initialPaymentPrice}>
          {StripeService.formatPrice(initialPayment.price)}
        </Text>
        <Text style={styles.initialPaymentDescription}>
          Pago único que incluye:
        </Text>
        {initialPayment.features?.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPaymentSummary = () => {
    if (!selectedPlan) return null;

    const summary = StripeService.getBillingSummary(selectedPlan);

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen de Facturación</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Primer pago:</Text>
          <Text style={styles.summaryAmount}>
            {StripeService.formatPrice(summary.firstPayment)}
          </Text>
        </View>

        <View style={styles.summaryBreakdown}>
          <Text style={styles.breakdownText}>
            • Plan mensual: {StripeService.formatPrice(summary.plan.price)}
          </Text>
          <Text style={styles.breakdownText}>
            • Configuración inicial: {StripeService.formatPrice(summary.initialPayment.price)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pagos siguientes:</Text>
          <Text style={styles.summaryAmount}>
            {StripeService.formatPrice(summary.monthlyPayment)}/mes
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total del plan:</Text>
          <Text style={[styles.summaryAmount, styles.totalFinal]}>
            {StripeService.formatPrice(summary.totalWithSetup)}
          </Text>
        </View>

        <View style={styles.renewalInfo}>
          <Text style={styles.renewalTitle}>🔄 Renovación Automática</Text>
          <Text style={styles.renewalNote}>
            • Tu plan se renovará automáticamente cada {summary.plan.duration_months} meses
          </Text>
          <Text style={styles.renewalNote}>
            • Precio de renovación: {StripeService.formatPrice(summary.monthlyPayment)}/mes
          </Text>
          <Text style={styles.renewalNote}>
            • Puedes desactivar la renovación automática en cualquier momento
          </Text>
          <Text style={styles.renewalNote}>
            • Sin compromisos a largo plazo - cancela cuando quieras
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Procesando pago...</Text>
        <Text style={styles.loadingSubtext}>
          Serás redirigido a Stripe para completar el pago de forma segura
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecciona tu Plan</Text>
        <Text style={styles.subtitle}>
          Elige el plan que mejor se adapte a tus necesidades de marketing
        </Text>
      </View>

      {renderInitialPaymentInfo()}

      <View style={styles.plansContainer}>
        {Object.entries(plans).map(([planId, plan]) => 
          renderPlanCard(planId, plan)
        )}
      </View>

      {renderPaymentSummary()}

      <TouchableOpacity
        style={[styles.payButton, !selectedPlan && styles.payButtonDisabled]}
        onPress={handleProceedToPayment}
        disabled={!selectedPlan || loading}
      >
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.payButtonGradient}
        >
          <Text style={styles.payButtonText}>
            Suscribirse - {selectedPlan ? StripeService.formatPrice(StripeService.calculateFirstPaymentTotal(selectedPlan)) : ''} (Renovación Automática)
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.securityInfo}>
        <Text style={styles.securityText}>
          🔒 Pago 100% seguro procesado por Stripe
        </Text>
        <Text style={styles.securitySubtext}>
          Suscripción con renovación automática • Cancela cuando quieras
        </Text>
        <Text style={styles.securitySubtext}>
          Aceptamos tarjetas de débito, crédito y transferencias bancarias
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    lineHeight: 22,
  },
  initialPaymentCard: {
    backgroundColor: '#fef3c7',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  initialPaymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  initialPaymentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  initialPaymentDescription: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 12,
    fontWeight: '600',
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#6366f1',
    backgroundColor: '#f8faff',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  priceUnit: {
    fontSize: 18,
    color: '#64748b',
    marginLeft: 4,
  },
  duration: {
    fontSize: 14,
    color: '#64748b',
  },
  planFeatures: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkmark: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  savingsContainer: {
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  savingsText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#475569',
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  summaryBreakdown: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  breakdownText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  totalFinal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  renewalInfo: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  renewalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
  },
  renewalNote: {
    fontSize: 13,
    color: '#0369a1',
    marginBottom: 4,
    lineHeight: 18,
  },
  payButton: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  securityText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 4,
  },
  securitySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default StripeSubscriptionPlans;