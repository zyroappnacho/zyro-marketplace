import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import StorageService from '../services/StorageService';

const SubscriptionManagementScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Planes disponibles según requirements.md
  const availablePlans = [
    {
      id: '3-months',
      name: 'Plan 3 Meses',
      price: 499,
      duration: 3,
      totalPrice: 1497,
      description: 'Perfecto para campañas cortas',
      recommended: false
    },
    {
      id: '6-months',
      name: 'Plan 6 Meses',
      price: 399,
      duration: 6,
      totalPrice: 2394,
      description: 'Ideal para estrategias a medio plazo',
      recommended: true
    },
    {
      id: '12-months',
      name: 'Plan 12 Meses',
      price: 299,
      duration: 12,
      totalPrice: 3588,
      description: 'Máximo ahorro para estrategias anuales',
      recommended: false
    }
  ];

  // Métodos de pago disponibles
  const paymentMethods = [
    {
      id: 'debit-card',
      name: 'Tarjeta de Débito',
      icon: 'card',
      description: 'Pago directo desde tu cuenta bancaria'
    },
    {
      id: 'credit-card',
      name: 'Tarjeta de Crédito',
      icon: 'card',
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'bank-transfer',
      name: 'Transferencia Bancaria',
      icon: 'business',
      description: 'Transferencia directa a nuestra cuenta'
    }
  ];

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar datos de suscripción actual
      const subscriptionData = await StorageService.getCompanySubscription(user.id);
      if (subscriptionData) {
        setCurrentPlan(subscriptionData.plan);
        setCurrentPaymentMethod(subscriptionData.paymentMethod);
      } else {
        // Plan por defecto si no hay datos
        setCurrentPlan(availablePlans[2]); // Plan 12 meses por defecto
        setCurrentPaymentMethod(paymentMethods[0]); // Tarjeta de débito por defecto
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error cargando datos de suscripción:', error);
      setIsLoading(false);
    }
  };

  const handlePlanChange = async (newPlan) => {
    Alert.alert(
      'Cambiar Plan de Suscripción',
      `¿Estás seguro de que quieres cambiar al ${newPlan.name}?\n\nNuevo precio: ${newPlan.price}€/mes\nTotal: ${newPlan.totalPrice}€ por ${newPlan.duration} meses`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar Cambio',
          onPress: async () => {
            try {
              // Actualizar plan actual
              setCurrentPlan(newPlan);

              // Guardar en storage
              const subscriptionData = {
                userId: user.id,
                plan: newPlan,
                paymentMethod: currentPaymentMethod,
                updatedAt: new Date().toISOString(),
                nextBillingDate: calculateNextBillingDate(newPlan.duration)
              };

              await StorageService.saveCompanySubscription(subscriptionData);

              Alert.alert(
                '✅ Plan Actualizado',
                `Tu plan ha sido cambiado exitosamente al ${newPlan.name}.\n\nEl nuevo precio de ${newPlan.price}€/mes se aplicará en tu próxima facturación.`,
                [{ text: 'OK' }]
              );

            } catch (error) {
              console.error('Error actualizando plan:', error);
              Alert.alert('Error', 'No se pudo actualizar el plan. Inténtalo de nuevo.');
            }
          },
        },
      ]
    );
  };

  const calculateNextBillingDate = (durationMonths) => {
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate.toISOString();
  };

  const handlePaymentMethodChange = () => {
    navigation.navigate('PaymentMethodsScreen', {
      currentMethod: currentPaymentMethod,
      onMethodSelected: (newMethod) => {
        setCurrentPaymentMethod(newMethod);
        savePaymentMethod(newMethod);
      }
    });
  };

  const savePaymentMethod = async (newMethod) => {
    try {
      const subscriptionData = {
        userId: user.id,
        plan: currentPlan,
        paymentMethod: newMethod,
        updatedAt: new Date().toISOString(),
        nextBillingDate: calculateNextBillingDate(currentPlan?.duration || 12)
      };

      await StorageService.saveCompanySubscription(subscriptionData);

      Alert.alert(
        '✅ Método de Pago Actualizado',
        `Tu método de pago ha sido actualizado a ${newMethod.name}.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error guardando método de pago:', error);
      Alert.alert('Error', 'No se pudo actualizar el método de pago.');
    }
  };

  const renderPlanCard = (plan) => {
    const isCurrentPlan = currentPlan?.id === plan.id;
    
    return (
      <View key={plan.id} style={[
        styles.planCard,
        isCurrentPlan && styles.currentPlanCard,
        plan.recommended && styles.recommendedPlan
      ]}>
        {plan.recommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>RECOMENDADO</Text>
          </View>
        )}
        
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          {isCurrentPlan && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>ACTUAL</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.planPrice}>{plan.price}€<Text style={styles.priceUnit}>/mes</Text></Text>
        <Text style={styles.planTotal}>Total: {plan.totalPrice}€ por {plan.duration} meses</Text>
        <Text style={styles.planDescription}>{plan.description}</Text>
        
        {!isCurrentPlan && (
          <TouchableOpacity 
            style={styles.changePlanButton}
            onPress={() => handlePlanChange(plan)}
          >
            <Text style={styles.changePlanButtonText}>Cambiar a este Plan</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#C9A961" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestionar Suscripción</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Sección de Planes Disponibles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planes Disponibles</Text>
          <Text style={styles.sectionSubtitle}>
            Selecciona el plan que mejor se adapte a tus necesidades
          </Text>
          
          {availablePlans.map(plan => renderPlanCard(plan))}
        </View>

        {/* Sección de Gestión de Métodos de Pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestión de Métodos de Pago</Text>
          <Text style={styles.sectionSubtitle}>
            Administra tu método de pago actual
          </Text>
          
          <View style={styles.paymentMethodCard}>
            <View style={styles.paymentMethodHeader}>
              <Ionicons 
                name={currentPaymentMethod?.icon || 'card'} 
                size={24} 
                color="#C9A961" 
              />
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>
                  {currentPaymentMethod?.name || 'Método no seleccionado'}
                </Text>
                <Text style={styles.paymentMethodDescription}>
                  {currentPaymentMethod?.description || 'Selecciona un método de pago'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.changePaymentButton}
              onPress={handlePaymentMethodChange}
            >
              <Text style={styles.changePaymentButtonText}>Cambiar Método</Text>
              <Ionicons name="chevron-forward" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#C9A961" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Información Importante</Text>
              <Text style={styles.infoText}>
                • Los cambios de plan se aplicarán en tu próximo ciclo de facturación{'\n'}
                • Puedes cambiar tu método de pago en cualquier momento{'\n'}
                • Todos los pagos se procesan de forma segura{'\n'}
                • Recibirás una factura por cada pago realizado
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C9A961',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
    position: 'relative',
  },
  currentPlanCard: {
    borderColor: '#C9A961',
    borderWidth: 2,
  },
  recommendedPlan: {
    borderColor: '#34C759',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentBadge: {
    backgroundColor: '#C9A961',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 5,
  },
  priceUnit: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  planTotal: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  changePlanButton: {
    backgroundColor: '#C9A961',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  changePlanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  paymentMethodCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  changePaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#C9A961',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  changePaymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
});

export default SubscriptionManagementScreen;