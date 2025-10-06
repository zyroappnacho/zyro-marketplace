import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaymentMethodsScreen = ({ navigation, route }) => {
  const { currentMethod, onMethodSelected } = route.params || {};
  const [selectedMethod, setSelectedMethod] = useState(currentMethod);

  // Métodos de pago disponibles según los requirements
  const paymentMethods = [
    {
      id: 'debit-card',
      name: 'Tarjeta de Débito',
      icon: 'card',
      description: 'Pago directo desde tu cuenta bancaria',
      details: 'Visa, Mastercard, Maestro',
      popular: false
    },
    {
      id: 'credit-card',
      name: 'Tarjeta de Crédito',
      icon: 'card',
      description: 'Visa, Mastercard, American Express',
      details: 'Pago con línea de crédito',
      popular: true
    },
    {
      id: 'bank-transfer',
      name: 'Transferencia Bancaria',
      icon: 'business',
      description: 'Transferencia directa a nuestra cuenta',
      details: 'Procesamiento en 1-2 días hábiles',
      popular: false
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleConfirmSelection = () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Por favor selecciona un método de pago.');
      return;
    }

    // Navegar a la pantalla de detalles de pago
    navigation.navigate('PaymentDetailsScreen', {
      selectedMethod: selectedMethod,
      onDetailsCompleted: (completePaymentMethod) => {
        // Llamar al callback para actualizar el método con los detalles
        if (onMethodSelected) {
          onMethodSelected(completePaymentMethod);
        }
      }
    });
  };

  const renderPaymentMethod = (method) => {
    const isSelected = selectedMethod?.id === method.id;
    const isCurrent = currentMethod?.id === method.id;
    
    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.methodCard,
          isSelected && styles.selectedMethodCard
        ]}
        onPress={() => handleMethodSelect(method)}
        activeOpacity={0.7}
      >
        {method.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MÁS USADO</Text>
          </View>
        )}
        
        <View style={styles.methodHeader}>
          <View style={styles.methodIconContainer}>
            <Ionicons 
              name={method.icon} 
              size={28} 
              color={isSelected ? '#000000' : '#C9A961'} 
            />
          </View>
          
          <View style={styles.methodInfo}>
            <View style={styles.methodTitleRow}>
              <Text style={[
                styles.methodName,
                isSelected && styles.selectedMethodName
              ]}>
                {method.name}
              </Text>
              {isCurrent && (
                <View style={styles.currentMethodBadge}>
                  <Text style={styles.currentMethodText}>ACTUAL</Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.methodDescription,
              isSelected && styles.selectedMethodDescription
            ]}>
              {method.description}
            </Text>
            <Text style={[
              styles.methodDetails,
              isSelected && styles.selectedMethodDetails
            ]}>
              {method.details}
            </Text>
          </View>
          
          <View style={styles.radioContainer}>
            <View style={[
              styles.radioButton,
              isSelected && styles.selectedRadioButton
            ]}>
              {isSelected && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </View>
        </View>
        
        {/* Información adicional para cada método */}
        {method.id === 'debit-card' && (
          <View style={styles.additionalInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.infoText}>Pago inmediato</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={16} color="#34C759" />
              <Text style={styles.infoText}>Máxima seguridad</Text>
            </View>
          </View>
        )}
        
        {method.id === 'credit-card' && (
          <View style={styles.additionalInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.infoText}>Pago inmediato</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={16} color="#C9A961" />
              <Text style={styles.infoText}>Flexibilidad de pago</Text>
            </View>
          </View>
        )}
        
        {method.id === 'bank-transfer' && (
          <View style={styles.additionalInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="business" size={16} color="#C9A961" />
              <Text style={styles.infoText}>Sin comisiones adicionales</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={16} color="#FF9500" />
              <Text style={styles.infoText}>Procesamiento 1-2 días</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#C9A961" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Métodos de Pago</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona tu Método de Pago</Text>
          <Text style={styles.sectionSubtitle}>
            Elige cómo prefieres realizar tus pagos mensuales
          </Text>
          
          {paymentMethods.map(method => renderPaymentMethod(method))}
        </View>

        {/* Información de seguridad */}
        <View style={styles.securitySection}>
          <View style={styles.securityCard}>
            <Ionicons name="shield-checkmark" size={32} color="#34C759" />
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Pagos 100% Seguros</Text>
              <Text style={styles.securityText}>
                Todos los pagos están protegidos con encriptación SSL de nivel bancario. 
                Tu información financiera nunca se almacena en nuestros servidores.
              </Text>
            </View>
          </View>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="lock-closed" size={20} color="#C9A961" />
              <Text style={styles.featureText}>Encriptación SSL</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="card" size={20} color="#C9A961" />
              <Text style={styles.featureText}>PCI Compliant</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#C9A961" />
              <Text style={styles.featureText}>Verificación 3D</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="receipt" size={20} color="#C9A961" />
              <Text style={styles.featureText}>Facturación Automática</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botón de confirmación fijo */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.confirmButton,
            !selectedMethod && styles.disabledButton
          ]}
          onPress={handleConfirmSelection}
          disabled={!selectedMethod}
        >
          <Text style={[
            styles.confirmButtonText,
            !selectedMethod && styles.disabledButtonText
          ]}>
            Confirmar Método de Pago
          </Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 25,
  },
  methodCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#333333',
    position: 'relative',
  },
  selectedMethodCard: {
    borderColor: '#C9A961',
    backgroundColor: '#C9A961',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  selectedMethodName: {
    color: '#000000',
  },
  currentMethodBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 10,
  },
  currentMethodText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  methodDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  selectedMethodDescription: {
    color: '#000000',
  },
  methodDetails: {
    fontSize: 12,
    color: '#999999',
  },
  selectedMethodDetails: {
    color: '#333333',
  },
  radioContainer: {
    marginLeft: 15,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C9A961',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButton: {
    borderColor: '#000000',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
  },
  additionalInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
  },
  securitySection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  securityContent: {
    flex: 1,
    marginLeft: 15,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  featureText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  confirmButton: {
    backgroundColor: '#C9A961',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#333333',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  disabledButtonText: {
    color: '#666666',
  },
});

export default PaymentMethodsScreen;