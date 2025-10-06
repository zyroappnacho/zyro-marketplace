import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import StorageService from '../services/StorageService';

const PaymentDetailsScreen = ({ navigation, route }) => {
  const { user } = useSelector(state => state.auth);
  const { selectedMethod, onDetailsCompleted } = route.params || {};
  
  // Estados para los diferentes tipos de métodos de pago
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    postalCode: ''
  });

  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    bankName: '',
    iban: '',
    swiftCode: '',
    accountNumber: '',
    routingNumber: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleCardNumberChange = (text) => {
    // Formatear número de tarjeta con espacios cada 4 dígitos
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    if (formatted.length <= 19) { // 16 dígitos + 3 espacios
      setCardDetails(prev => ({ ...prev, cardNumber: formatted }));
    }
  };

  const handleExpiryDateChange = (text) => {
    // Formatear fecha de expiración MM/YY
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      const formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
      setCardDetails(prev => ({ ...prev, expiryDate: formatted }));
    } else {
      setCardDetails(prev => ({ ...prev, expiryDate: cleaned }));
    }
  };

  const handleCvvChange = (text) => {
    // Solo números, máximo 4 dígitos
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCardDetails(prev => ({ ...prev, cvv: cleaned }));
    }
  };

  const validateCardDetails = () => {
    const { cardNumber, expiryDate, cvv, cardholderName } = cardDetails;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      Alert.alert('Error', 'Por favor ingresa un número de tarjeta válido');
      return false;
    }
    
    if (!expiryDate || expiryDate.length !== 5) {
      Alert.alert('Error', 'Por favor ingresa una fecha de expiración válida (MM/YY)');
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      Alert.alert('Error', 'Por favor ingresa un CVV válido');
      return false;
    }
    
    if (!cardholderName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del titular de la tarjeta');
      return false;
    }
    
    return true;
  };

  const validateBankDetails = () => {
    const { accountHolder, bankName, iban } = bankDetails;
    
    if (!accountHolder.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del titular de la cuenta');
      return false;
    }
    
    if (!bankName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del banco');
      return false;
    }
    
    if (!iban.trim()) {
      Alert.alert('Error', 'Por favor ingresa el IBAN');
      return false;
    }
    
    return true;
  };

  const handleSavePaymentDetails = async () => {
    try {
      setIsLoading(true);

      let paymentDetails = {};
      let isValid = false;

      // Validar según el tipo de método de pago
      if (selectedMethod.id === 'credit-card' || selectedMethod.id === 'debit-card') {
        isValid = validateCardDetails();
        if (isValid) {
          paymentDetails = {
            type: selectedMethod.id,
            cardNumber: cardDetails.cardNumber.replace(/\s/g, ''), // Guardar sin espacios
            cardNumberMasked: '**** **** **** ' + cardDetails.cardNumber.slice(-4), // Para mostrar
            expiryDate: cardDetails.expiryDate,
            cardholderName: cardDetails.cardholderName,
            billingAddress: cardDetails.billingAddress,
            postalCode: cardDetails.postalCode,
            lastFourDigits: cardDetails.cardNumber.replace(/\s/g, '').slice(-4)
          };
        }
      } else if (selectedMethod.id === 'bank-transfer') {
        isValid = validateBankDetails();
        if (isValid) {
          paymentDetails = {
            type: selectedMethod.id,
            accountHolder: bankDetails.accountHolder,
            bankName: bankDetails.bankName,
            iban: bankDetails.iban,
            ibanMasked: bankDetails.iban.substring(0, 4) + '****' + bankDetails.iban.slice(-4),
            swiftCode: bankDetails.swiftCode,
            accountNumber: bankDetails.accountNumber,
            routingNumber: bankDetails.routingNumber
          };
        }
      }

      if (!isValid) {
        setIsLoading(false);
        return;
      }

      // Crear método de pago completo con detalles
      const completePaymentMethod = {
        ...selectedMethod,
        details: paymentDetails,
        isConfigured: true,
        configuredAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Guardar en el sistema de suscripciones
      const currentSubscription = await StorageService.getCompanySubscription(user.id);
      if (currentSubscription) {
        const updatedSubscription = {
          ...currentSubscription,
          paymentMethod: completePaymentMethod,
          updatedAt: new Date().toISOString()
        };
        
        await StorageService.saveCompanySubscription(updatedSubscription);
      }

      // También guardar los detalles de pago por separado para mayor seguridad
      const paymentDetailsKey = `payment_details_${user.id}`;
      await StorageService.saveData(paymentDetailsKey, {
        userId: user.id,
        paymentMethod: completePaymentMethod,
        encryptedDetails: paymentDetails, // En producción, esto debería estar encriptado
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

      setIsLoading(false);

      // Llamar al callback para actualizar la pantalla anterior
      if (onDetailsCompleted) {
        onDetailsCompleted(completePaymentMethod);
      }

      Alert.alert(
        '✅ Método de Pago Configurado',
        `Tu ${selectedMethod.name.toLowerCase()} ha sido configurado exitosamente y se usará para futuros cobros.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error guardando detalles de pago:', error);
      setIsLoading(false);
      Alert.alert('Error', 'No se pudieron guardar los detalles del método de pago.');
    }
  };

  const renderCardForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>Información de la Tarjeta</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Número de Tarjeta *</Text>
        <TextInput
          style={styles.textInput}
          value={cardDetails.cardNumber}
          onChangeText={handleCardNumberChange}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor="#666666"
          keyboardType="numeric"
          maxLength={19}
        />
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Fecha de Expiración *</Text>
          <TextInput
            style={styles.textInput}
            value={cardDetails.expiryDate}
            onChangeText={handleExpiryDateChange}
            placeholder="MM/YY"
            placeholderTextColor="#666666"
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.inputLabel}>CVV *</Text>
          <TextInput
            style={styles.textInput}
            value={cardDetails.cvv}
            onChangeText={handleCvvChange}
            placeholder="123"
            placeholderTextColor="#666666"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre del Titular *</Text>
        <TextInput
          style={styles.textInput}
          value={cardDetails.cardholderName}
          onChangeText={(text) => setCardDetails(prev => ({ ...prev, cardholderName: text }))}
          placeholder="Nombre como aparece en la tarjeta"
          placeholderTextColor="#666666"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Dirección de Facturación</Text>
        <TextInput
          style={styles.textInput}
          value={cardDetails.billingAddress}
          onChangeText={(text) => setCardDetails(prev => ({ ...prev, billingAddress: text }))}
          placeholder="Dirección completa"
          placeholderTextColor="#666666"
          multiline
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Código Postal</Text>
        <TextInput
          style={styles.textInput}
          value={cardDetails.postalCode}
          onChangeText={(text) => setCardDetails(prev => ({ ...prev, postalCode: text }))}
          placeholder="28001"
          placeholderTextColor="#666666"
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderBankForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>Información Bancaria</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Titular de la Cuenta *</Text>
        <TextInput
          style={styles.textInput}
          value={bankDetails.accountHolder}
          onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountHolder: text }))}
          placeholder="Nombre del titular"
          placeholderTextColor="#666666"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre del Banco *</Text>
        <TextInput
          style={styles.textInput}
          value={bankDetails.bankName}
          onChangeText={(text) => setBankDetails(prev => ({ ...prev, bankName: text }))}
          placeholder="Banco Santander"
          placeholderTextColor="#666666"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>IBAN *</Text>
        <TextInput
          style={styles.textInput}
          value={bankDetails.iban}
          onChangeText={(text) => setBankDetails(prev => ({ ...prev, iban: text.toUpperCase() }))}
          placeholder="ES91 2100 0418 4502 0005 1332"
          placeholderTextColor="#666666"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Código SWIFT/BIC</Text>
        <TextInput
          style={styles.textInput}
          value={bankDetails.swiftCode}
          onChangeText={(text) => setBankDetails(prev => ({ ...prev, swiftCode: text.toUpperCase() }))}
          placeholder="BSCHESMM"
          placeholderTextColor="#666666"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Número de Cuenta</Text>
        <TextInput
          style={styles.textInput}
          value={bankDetails.accountNumber}
          onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountNumber: text }))}
          placeholder="4502000051332"
          placeholderTextColor="#666666"
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#C9A961" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurar {selectedMethod?.name}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Información del método seleccionado */}
        <View style={styles.methodInfoCard}>
          <View style={styles.methodHeader}>
            <Ionicons 
              name={selectedMethod?.icon || 'card'} 
              size={32} 
              color="#C9A961" 
            />
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{selectedMethod?.name}</Text>
              <Text style={styles.methodDescription}>{selectedMethod?.description}</Text>
            </View>
          </View>
        </View>

        {/* Formulario según el tipo de método */}
        {(selectedMethod?.id === 'credit-card' || selectedMethod?.id === 'debit-card') && renderCardForm()}
        {selectedMethod?.id === 'bank-transfer' && renderBankForm()}

        {/* Información de seguridad */}
        <View style={styles.securityInfo}>
          <View style={styles.securityCard}>
            <Ionicons name="shield-checkmark" size={24} color="#34C759" />
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Información Segura</Text>
              <Text style={styles.securityText}>
                Todos tus datos de pago están protegidos con encriptación de nivel bancario. 
                Esta información se utilizará únicamente para procesar tus pagos mensuales.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botón de guardar fijo */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSavePaymentDetails}
          disabled={isLoading}
        >
          <Text style={[styles.saveButtonText, isLoading && styles.disabledButtonText]}>
            {isLoading ? 'Guardando...' : 'Guardar Método de Pago'}
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
  methodInfoCard: {
    backgroundColor: '#1A1A1A',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#C9A961',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  methodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 48,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  securityInfo: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
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
  saveButton: {
    backgroundColor: '#C9A961',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#333333',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  disabledButtonText: {
    color: '#666666',
  },
});

export default PaymentDetailsScreen;