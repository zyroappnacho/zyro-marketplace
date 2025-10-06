import React, { useState, useEffect } from 'react';
import MinimalistIcons from './MinimalistIcons';
import CollaborationRequestService from '../services/CollaborationRequestService';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
    Modal,
    Switch,
    SafeAreaView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';

const { width, height } = Dimensions.get('window');

const CollaborationRequestScreen = ({
    visible,
    collaboration,
    currentUser,
    onClose,
    onSubmitRequest
}) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [availableSlots, setAvailableSlots] = useState({ dates: {}, times: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cargar fechas y horarios disponibles
    useEffect(() => {
        const loadAvailableSlots = async () => {
            if (collaboration?.id) {
                try {
                    console.log(`🔄 Cargando fechas disponibles para colaboración ${collaboration.id}`);
                    const slots = await CollaborationRequestService.getAvailableSlots(collaboration.id);
                    setAvailableSlots(slots);
                    console.log('✅ Fechas y horarios cargados:', slots);
                } catch (error) {
                    console.error('❌ Error cargando fechas disponibles:', error);
                    // Usar configuración por defecto en caso de error
                    setAvailableSlots({ dates: {}, times: [] });
                }
            }
        };

        loadAvailableSlots();
    }, [collaboration?.id]);

    const resetForm = () => {
        setSelectedDate('');
        setSelectedTime('');
        setAcceptedTerms(false);
    };

    const handleDateSelect = (day) => {
        if (availableSlots.dates[day.dateString]) {
            setSelectedDate(day.dateString);
            setSelectedTime(''); // Reset time selection when date changes
        } else {
            Alert.alert(
                'Fecha no disponible',
                'Esta fecha no está disponible para colaboraciones. Por favor selecciona una fecha marcada.'
            );
        }
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
    };

    const handleSubmit = async () => {
        if (!selectedDate) {
            Alert.alert('Error', 'Por favor selecciona una fecha');
            return;
        }

        if (!selectedTime) {
            Alert.alert('Error', 'Por favor selecciona una hora');
            return;
        }

        if (!acceptedTerms) {
            Alert.alert('Error', 'Debes aceptar los términos y condiciones');
            return;
        }

        setIsSubmitting(true);

        try {
            const requestData = {
                collaborationId: collaboration.id,
                userId: currentUser.id,
                userName: currentUser.name || currentUser.username,
                userEmail: currentUser.email,
                userInstagram: currentUser.instagramHandle,
                userFollowers: currentUser.instagramFollowers,
                selectedDate,
                selectedTime,
                acceptedTerms,
                collaborationTitle: collaboration.title,
                businessName: collaboration.business,
                timestamp: new Date().toISOString()
            };

            const result = await CollaborationRequestService.submitRequest(requestData);

            if (result.success) {
                onSubmitRequest(requestData);
                resetForm();
                onClose();

                Alert.alert(
                    'Solicitud Enviada',
                    `Tu solicitud ha sido enviada al administrador con el ID: ${result.requestId}. Te notificaremos cuando sea revisada.`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Error',
                    result.error || 'No se pudo enviar la solicitud. Inténtalo de nuevo.'
                );
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Ocurrió un error inesperado. Por favor inténtalo de nuevo.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTermsModal = () => (
        <Modal
            visible={showTermsModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTermsModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.termsModalContent}>
                    <View style={styles.termsHeader}>
                        <Text style={styles.termsTitle}>Términos y Condiciones</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowTermsModal(false)}
                        >
                            <MinimalistIcons name="close" size={24} color="#888888" isActive={false} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.termsContent}>
                        <Text style={styles.termsText}>
                            <Text style={styles.termsBold}>1. COMPROMISO DE CONTENIDO</Text>
                            {'\n\n'}
                            Al aceptar esta colaboración, te comprometes a crear y publicar el contenido acordado en las fechas establecidas.
                            {'\n\n'}
                            <Text style={styles.termsBold}>2. CALIDAD DEL CONTENIDO</Text>
                            {'\n\n'}
                            El contenido debe ser de alta calidad, original y alineado con los valores de la marca.
                            {'\n\n'}
                            <Text style={styles.termsBold}>3. PUNTUALIDAD</Text>
                            {'\n\n'}
                            Debes llegar puntualmente a la cita programada. En caso de retraso, notifica inmediatamente.
                            {'\n\n'}
                            <Text style={styles.termsBold}>4. CANCELACIONES</Text>
                            {'\n\n'}
                            Las cancelaciones deben realizarse con al menos 24 horas de anticipación.
                            {'\n\n'}
                            <Text style={styles.termsBold}>5. DERECHOS DE IMAGEN</Text>
                            {'\n\n'}
                            Autorizas el uso de tu imagen en materiales promocionales del establecimiento.
                            {'\n\n'}
                            <Text style={styles.termsBold}>6. INCUMPLIMIENTO</Text>
                            {'\n\n'}
                            El incumplimiento de estos términos puede resultar en la suspensión de tu cuenta.
                        </Text>
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.acceptTermsButton}
                        onPress={() => {
                            setAcceptedTerms(true);
                            setShowTermsModal(false);
                        }}
                    >
                        <LinearGradient
                            colors={['#C9A961', '#D4AF37']}
                            style={styles.acceptTermsGradient}
                        >
                            <Text style={styles.acceptTermsButtonText}>Aceptar Términos</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={onClose}>
                            <MinimalistIcons name="back" size={24} color="#C9A961" isActive={false} />
                            <Text style={styles.backButtonText}>Volver</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Solicitar Colaboración</Text>
                    </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Collaboration Info */}
                    <View style={styles.collaborationInfo}>
                        <Text style={styles.businessName}>{collaboration?.business}</Text>
                        <Text style={styles.collaborationTitle}>{collaboration?.title}</Text>
                    </View>

                    {/* Calendar Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Selecciona una Fecha</Text>
                        <Text style={styles.sectionSubtitle}>
                            Las fechas marcadas están disponibles para colaboraciones
                        </Text>

                        <View style={styles.calendarContainer}>
                            <Calendar
                                onDayPress={handleDateSelect}
                                firstDay={1} // Lunes como primer día de la semana
                                markedDates={{
                                    ...availableSlots.dates,
                                    [selectedDate]: {
                                        selected: true,
                                        selectedColor: '#C9A961',
                                        marked: availableSlots.dates[selectedDate]?.marked || false,
                                        dotColor: '#000'
                                    }
                                }}
                                theme={{
                                    backgroundColor: '#111111',
                                    calendarBackground: '#111111',
                                    textSectionTitleColor: '#C9A961',
                                    selectedDayBackgroundColor: '#C9A961',
                                    selectedDayTextColor: '#000000',
                                    todayTextColor: '#C9A961',
                                    dayTextColor: '#FFFFFF',
                                    textDisabledColor: '#666666',
                                    dotColor: '#C9A961',
                                    selectedDotColor: '#000000',
                                    arrowColor: '#C9A961',
                                    monthTextColor: '#C9A961',
                                    indicatorColor: '#C9A961',
                                    textDayFontFamily: 'Inter',
                                    textMonthFontFamily: 'Inter',
                                    textDayHeaderFontFamily: 'Inter',
                                }}
                                minDate={new Date().toISOString().split('T')[0]}
                                maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                            />
                        </View>

                        {selectedDate && (
                            <View style={styles.selectedDateInfo}>
                                <MinimalistIcons name="events" size={16} color="#C9A961" isActive={false} />
                                <Text style={styles.selectedDateText}>
                                    Fecha seleccionada: {new Date(selectedDate).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Time Selection */}
                    {selectedDate && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Selecciona una Hora</Text>
                            <Text style={styles.sectionSubtitle}>
                                Horarios disponibles configurados por el administrador
                            </Text>

                            <View style={styles.timeGrid}>
                                {availableSlots.times.map((time) => (
                                    <TouchableOpacity
                                        key={time}
                                        style={[
                                            styles.timeSlot,
                                            selectedTime === time && styles.selectedTimeSlot
                                        ]}
                                        onPress={() => handleTimeSelect(time)}
                                    >
                                        <Text style={[
                                            styles.timeSlotText,
                                            selectedTime === time && styles.selectedTimeSlotText
                                        ]}>
                                            {time}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {selectedTime && (
                                <View style={styles.selectedTimeInfo}>
                                    <MinimalistIcons name="history" size={16} color="#C9A961" isActive={false} />
                                    <Text style={styles.selectedTimeText}>
                                        Hora seleccionada: {selectedTime}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Terms and Conditions */}
                    {selectedDate && selectedTime && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Términos y Condiciones</Text>

                            <View style={styles.termsContainer}>
                                <View style={styles.termsRow}>
                                    <Switch
                                        value={acceptedTerms}
                                        onValueChange={setAcceptedTerms}
                                        trackColor={{ false: '#666666', true: '#C9A961' }}
                                        thumbColor={acceptedTerms ? '#D4AF37' : '#CCCCCC'}
                                    />
                                    <Text style={styles.termsLabel}>
                                        Acepto los términos y condiciones de la colaboración
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.viewTermsButton}
                                    onPress={() => setShowTermsModal(true)}
                                >
                                    <Text style={styles.viewTermsButtonText}>Ver términos completos</Text>
                                    <MinimalistIcons name="arrow" size={16} color="#C9A961" isActive={false} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Spacer */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {/* Submit Button */}
                {selectedDate && selectedTime && (
                    <View style={styles.submitContainer}>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!acceptedTerms || isSubmitting) && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={!acceptedTerms || isSubmitting}
                        >
                            <LinearGradient
                                colors={(acceptedTerms && !isSubmitting) ? ['#C9A961', '#D4AF37'] : ['#666666', '#555555']}
                                style={styles.submitGradient}
                            >
                                <Text style={styles.submitButtonText}>
                                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {renderTermsModal()}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000000',
    },
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 20, // Menos padding en iOS con SafeAreaView
        paddingBottom: 15,
        backgroundColor: '#111111',
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    backButtonText: {
        color: '#C9A961',
        fontSize: 16,
        marginLeft: 8,
        fontFamily: 'Inter',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
        fontFamily: 'Inter',
    },
    content: {
        flex: 1,
    },
    collaborationInfo: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    businessName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    collaborationTitle: {
        fontSize: 16,
        color: '#C9A961',
        fontFamily: 'Inter',
    },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#CCCCCC',
        marginBottom: 16,
        fontFamily: 'Inter',
    },
    calendarContainer: {
        backgroundColor: '#111111',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#333333',
    },
    selectedDateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(201, 169, 97, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C9A961',
    },
    selectedDateText: {
        color: '#C9A961',
        fontSize: 14,
        marginLeft: 8,
        fontFamily: 'Inter',
        textTransform: 'capitalize',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    timeSlot: {
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: 70,
        alignItems: 'center',
    },
    selectedTimeSlot: {
        backgroundColor: '#C9A961',
        borderColor: '#D4AF37',
    },
    timeSlotText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    selectedTimeSlotText: {
        color: '#000000',
    },
    selectedTimeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(201, 169, 97, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C9A961',
    },
    selectedTimeText: {
        color: '#C9A961',
        fontSize: 14,
        marginLeft: 8,
        fontFamily: 'Inter',
    },
    termsContainer: {
        backgroundColor: '#111111',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333333',
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    termsLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        marginLeft: 12,
        flex: 1,
        fontFamily: 'Inter',
    },
    viewTermsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    viewTermsButtonText: {
        color: '#C9A961',
        fontSize: 14,
        textDecorationLine: 'underline',
        marginRight: 8,
        fontFamily: 'Inter',
    },
    bottomSpacer: {
        height: 120,
    },
    submitContainer: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#111111',
        borderTopWidth: 1,
        borderTopColor: '#333333',
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },

    // Terms Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    termsModalContent: {
        backgroundColor: '#111111',
        borderRadius: 16,
        width: width * 0.9,
        maxHeight: height * 0.8,
        borderWidth: 1,
        borderColor: '#333333',
    },
    termsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    termsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        fontFamily: 'Inter',
    },
    closeButton: {
        padding: 4,
    },
    termsContent: {
        padding: 20,
        maxHeight: height * 0.5,
    },
    termsText: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Inter',
    },
    termsBold: {
        fontWeight: 'bold',
        color: '#C9A961',
    },
    acceptTermsButton: {
        margin: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    acceptTermsGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    acceptTermsButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },
});

export default CollaborationRequestScreen;