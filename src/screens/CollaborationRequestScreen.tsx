import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { HomeStackParamList, Campaign } from '../types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../styles/theme';
import { PremiumButton } from '../components/PremiumButton';
import { useAppDispatch, useAppSelector } from '../store';
import { createCollaborationRequest, selectSubmittingRequest } from '../store/slices/collaborationSlice';

type CollaborationRequestScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'CollaborationRequest'
>;

type CollaborationRequestScreenRouteProp = RouteProp<
  HomeStackParamList,
  'CollaborationRequest'
>;

interface Props {
  navigation: CollaborationRequestScreenNavigationProp;
  route: CollaborationRequestScreenRouteProp;
}

// Mock campaign data - in real app this would come from the store/API
const MOCK_CAMPAIGN: Campaign = {
  id: '1',
  title: 'Cena Premium en La Terraza',
  description: 'Disfruta de una experiencia gastronómica única en nuestra terraza con vistas panorámicas de la ciudad.',
  businessName: 'Restaurante La Terraza Premium',
  category: 'restaurantes',
  city: 'Madrid',
  address: 'Calle Gran Vía 28, 28013 Madrid',
  coordinates: { lat: 40.4168, lng: -3.7038 },
  images: [],
  requirements: {
    minInstagramFollowers: 5000,
    maxCompanions: 2,
  },
  whatIncludes: [
    'Cena completa para 2 personas',
    'Bebidas incluidas (vino de la casa)',
    'Postre especial de la casa',
  ],
  contentRequirements: {
    instagramStories: 2,
    tiktokVideos: 0,
    deadline: 72,
  },
  companyId: 'company-1',
  status: 'active',
  createdBy: 'admin-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

export const CollaborationRequestScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectSubmittingRequest);
  const { user } = useAppSelector(state => state.auth);
  
  const [proposedContent, setProposedContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('20:00');
  const [companions, setCompanions] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // For delivery/product collaborations
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState('');
  
  // In real app, fetch campaign data using route.params.campaignId
  const campaign = MOCK_CAMPAIGN;
  const isRestaurant = campaign.category === 'restaurantes' || campaign.category === 'discotecas';
  const isDelivery = campaign.category === 'delivery' || campaign.category === 'ropa';

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
    }
  };

  const validateForm = (): boolean => {
    if (!proposedContent.trim()) {
      Alert.alert('Error', 'Por favor, describe tu propuesta de contenido.');
      return false;
    }

    if (isRestaurant) {
      if (companions < 1 || companions > campaign.requirements.maxCompanions) {
        Alert.alert('Error', `El número de acompañantes debe estar entre 1 y ${campaign.requirements.maxCompanions}.`);
        return false;
      }
    }

    if (isDelivery) {
      if (!deliveryAddress.trim()) {
        Alert.alert('Error', 'Por favor, proporciona una dirección de entrega.');
        return false;
      }
      if (!deliveryPhone.trim()) {
        Alert.alert('Error', 'Por favor, proporciona un teléfono de contacto.');
        return false;
      }
    }

    return true;
  };

  const handleSubmitRequest = async () => {
    if (!validateForm() || !user) return;
    
    try {
      const requestData = {
        campaignId: campaign.id,
        influencerId: user.id,
        proposedContent,
        ...(isRestaurant && {
          reservationDetails: {
            date: selectedDate,
            time: selectedTime,
            companions,
            specialRequests: specialRequests.trim() || undefined,
          }
        }),
        ...(isDelivery && {
          deliveryDetails: {
            address: deliveryAddress.trim(),
            phone: deliveryPhone.trim(),
            preferredTime: preferredDeliveryTime.trim() || undefined,
          }
        }),
      };

      const result = await dispatch(createCollaborationRequest(requestData));
      
      if (createCollaborationRequest.fulfilled.match(result)) {
        Alert.alert(
          'Solicitud Enviada',
          'Tu solicitud de colaboración ha sido enviada correctamente. Recibirás una notificación cuando sea revisada por el administrador.',
          [
            {
              text: 'Entendido',
              onPress: () => navigation.navigate('HomeMain'),
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Ha ocurrido un error al enviar tu solicitud. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ha ocurrido un error al enviar tu solicitud. Por favor, inténtalo de nuevo.');
    }
  };

  const renderContentCommitment = () => (
    <View style={styles.commitmentSection}>
      <Text style={styles.sectionTitle}>COMPROMISO DE CONTENIDO OBLIGATORIO</Text>
      <View style={styles.commitmentContainer}>
        <Icon name="warning" size={24} color={colors.goldElegant} />
        <View style={styles.commitmentTextContainer}>
          <Text style={styles.commitmentText}>
            Al solicitar esta colaboración, te comprometes a crear:
          </Text>
          {campaign.contentRequirements.instagramStories > 0 && (
            <Text style={styles.commitmentDetail}>
              • {campaign.contentRequirements.instagramStories} historias de Instagram
              {campaign.contentRequirements.instagramStories > 1 ? ' (1 en video)' : ''}
            </Text>
          )}
          {campaign.contentRequirements.tiktokVideos > 0 && (
            <Text style={styles.commitmentDetail}>
              • {campaign.contentRequirements.tiktokVideos} video de TikTok
            </Text>
          )}
          <Text style={styles.commitmentDeadline}>
            Plazo: {campaign.contentRequirements.deadline} horas después de la experiencia
          </Text>
        </View>
      </View>
    </View>
  );

  const renderProposalSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>PROPUESTA DE CONTENIDO</Text>
      <Text style={styles.sectionDescription}>
        Describe cómo planeas promocionar esta colaboración en tus redes sociales
      </Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={6}
        placeholder="Ej: Crearé 2 historias mostrando la experiencia gastronómica, destacando la vista panorámica y los platos especiales. Una historia será en video mostrando el ambiente del restaurante..."
        placeholderTextColor={colors.mediumGray}
        value={proposedContent}
        onChangeText={setProposedContent}
        textAlignVertical="top"
      />
    </View>
  );

  const renderRestaurantDetails = () => {
    if (!isRestaurant) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DETALLES DE LA RESERVA</Text>
        
        {/* Date Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fecha preferida</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-today" size={20} color={colors.goldElegant} />
            <Text style={styles.dateTimeText}>
              {selectedDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Time Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Hora preferida</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Icon name="access-time" size={20} color={colors.goldElegant} />
            <Text style={styles.dateTimeText}>{selectedTime}</Text>
          </TouchableOpacity>
        </View>

        {/* Companions */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Número de acompañantes (máx. {campaign.requirements.maxCompanions})
          </Text>
          <View style={styles.companionSelector}>
            <TouchableOpacity
              style={[styles.companionButton, companions <= 1 && styles.companionButtonDisabled]}
              onPress={() => companions > 1 && setCompanions(companions - 1)}
              disabled={companions <= 1}
            >
              <Icon name="remove" size={20} color={companions <= 1 ? colors.mediumGray : colors.goldElegant} />
            </TouchableOpacity>
            <Text style={styles.companionCount}>{companions}</Text>
            <TouchableOpacity
              style={[styles.companionButton, companions >= campaign.requirements.maxCompanions && styles.companionButtonDisabled]}
              onPress={() => companions < campaign.requirements.maxCompanions && setCompanions(companions + 1)}
              disabled={companions >= campaign.requirements.maxCompanions}
            >
              <Icon name="add" size={20} color={companions >= campaign.requirements.maxCompanions ? colors.mediumGray : colors.goldElegant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Special Requests */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Solicitudes especiales (opcional)</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={3}
            placeholder="Ej: Mesa en terraza, celebración de cumpleaños, alergias alimentarias..."
            placeholderTextColor={colors.mediumGray}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            textAlignVertical="top"
          />
        </View>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={new Date(`2000-01-01T${selectedTime}:00`)}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>
    );
  };

  const renderDeliveryDetails = () => {
    if (!isDelivery) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DETALLES DE ENTREGA</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Dirección completa *</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={3}
            placeholder="Calle, número, piso, código postal, ciudad..."
            placeholderTextColor={colors.mediumGray}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Teléfono de contacto *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="+34 600 000 000"
            placeholderTextColor={colors.mediumGray}
            value={deliveryPhone}
            onChangeText={setDeliveryPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Horario preferido (opcional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Mañanas de 10:00 a 14:00, tardes después de las 18:00..."
            placeholderTextColor={colors.mediumGray}
            value={preferredDeliveryTime}
            onChangeText={setPreferredDeliveryTime}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.goldElegant} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitar Colaboración</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Campaign Info */}
        <View style={styles.campaignInfo}>
          <Text style={styles.campaignTitle}>{campaign.title}</Text>
          <Text style={styles.campaignBusiness}>{campaign.businessName}</Text>
        </View>

        {renderContentCommitment()}
        {renderProposalSection()}
        {renderRestaurantDetails()}
        {renderDeliveryDetails()}
        
        {/* Bottom spacing for fixed button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed bottom button */}
      <View style={styles.fixedBottomContainer}>
        <PremiumButton
          title={isSubmitting ? "ENVIANDO..." : "ENVIAR SOLICITUD"}
          onPress={handleSubmitRequest}
          disabled={isSubmitting}
          style={styles.submitButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.goldElegant,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
  },
  headerSpacer: {
    width: 40, // Same width as back button for centering
  },
  
  // Content Styles
  content: {
    flex: 1,
  },
  
  // Campaign Info Styles
  campaignInfo: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    backgroundColor: colors.darkGray,
  },
  campaignTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
    marginBottom: spacing.xs,
  },
  campaignBusiness: {
    fontSize: fontSizes.md,
    color: colors.lightGray,
    fontWeight: fontWeights.medium,
  },
  
  // Section Styles
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.goldElegant,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  sectionDescription: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  
  // Commitment Section Styles
  commitmentSection: {
    padding: spacing.md,
    backgroundColor: colors.darkGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.goldElegant,
  },
  commitmentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commitmentTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  commitmentText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.xs,
  },
  commitmentDetail: {
    fontSize: fontSizes.sm,
    color: colors.goldElegant,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.xs,
  },
  commitmentDeadline: {
    fontSize: fontSizes.sm,
    color: colors.goldDark,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  
  // Input Styles
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.darkGray,
    borderWidth: 1,
    borderColor: colors.goldElegant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.white,
    minHeight: 50,
  },
  textArea: {
    backgroundColor: colors.darkGray,
    borderWidth: 1,
    borderColor: colors.goldElegant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.white,
    minHeight: 120,
  },
  
  // Date/Time Picker Styles
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
    borderWidth: 1,
    borderColor: colors.goldElegant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  dateTimeText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    marginLeft: spacing.sm,
    fontWeight: fontWeights.medium,
    textTransform: 'capitalize',
  },
  
  // Companion Selector Styles
  companionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.darkGray,
    borderWidth: 1,
    borderColor: colors.goldElegant,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  companionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.goldElegant,
  },
  companionButtonDisabled: {
    borderColor: colors.mediumGray,
    backgroundColor: colors.mediumGray,
  },
  companionCount: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.goldElegant,
    marginHorizontal: spacing.lg,
    minWidth: 30,
    textAlign: 'center',
  },
  
  // Fixed Bottom Button Styles
  fixedBottomContainer: {
    backgroundColor: colors.black,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.goldElegant,
  },
  submitButton: {
    width: '100%',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});