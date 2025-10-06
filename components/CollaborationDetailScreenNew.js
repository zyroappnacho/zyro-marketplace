import React, { useState } from 'react';
import MinimalistIcons from './MinimalistIcons';
import CollaborationRequestScreen from './CollaborationRequestScreen';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    Alert,
    Dimensions,
    Platform,
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Calendar } from 'react-native-calendars';

const { width, height } = Dimensions.get('window');

const CollaborationDetailScreenNew = ({ collaboration, onBack, onRequest, currentUser }) => {
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showRequestScreen, setShowRequestScreen] = useState(false);
    const [requestForm, setRequestForm] = useState({
        preferredDate: '',
        preferredTime: '',
        companions: 1,
        specialRequests: '',
        contentProposal: '',
        address: '',
        phone: '',
        preferredDeliveryTime: ''
    });
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (!collaboration) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Colaboración no encontrada</Text>
            </View>
        );
    }

    const handleRequest = () => {
        if (!currentUser) {
            Alert.alert('Error', 'Debes iniciar sesión para solicitar colaboraciones');
            return;
        }

        // Validación automática de seguidores
        if (currentUser.instagramFollowers < collaboration.minFollowers) {
            Alert.alert(
                'Requisitos no cumplidos',
                `No cumples los requisitos mínimos de seguidores. Necesitas al menos ${collaboration.minFollowers.toLocaleString()} seguidores para esta colaboración.`
            );
            return;
        }

        setShowRequestScreen(true);
    };

    const handleSubmitRequest = (requestData) => {
        // Aquí se enviaría la solicitud al administrador
        console.log('Solicitud enviada:', requestData);

        // Llamar a la función onRequest si existe
        if (onRequest) {
            onRequest(requestData);
        }

        // Cerrar la pantalla de solicitud
        setShowRequestScreen(false);
    };

    const submitRequest = () => {
        if (!requestForm.contentProposal.trim()) {
            Alert.alert('Error', 'Por favor describe tu propuesta de contenido');
            return;
        }

        if (collaboration.category === 'restaurantes' && !requestForm.preferredDate) {
            Alert.alert('Error', 'Por favor selecciona una fecha preferida');
            return;
        }

        if (collaboration.category !== 'restaurantes' && !requestForm.address.trim()) {
            Alert.alert('Error', 'Por favor proporciona tu dirección de envío');
            return;
        }

        onRequest(collaboration.id, requestForm);
        setShowRequestModal(false);
        setRequestForm({
            preferredDate: '',
            preferredTime: '',
            companions: 1,
            specialRequests: '',
            contentProposal: '',
            address: '',
            phone: '',
            preferredDeliveryTime: ''
        });
    };

    const handleDateSelect = (day) => {
        setRequestForm({ ...requestForm, preferredDate: day.dateString });
        setShowCalendar(false);
    };

    const openMaps = () => {
        const { latitude, longitude } = collaboration.coordinates;
        const url = Platform.select({
            ios: `maps:0,0?q=${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}`
        });

        if (url) {
            Linking.openURL(url).catch(() => {
                Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
            });
        }
    };

    const callBusiness = () => {
        if (collaboration.phone) {
            Linking.openURL(`tel:${collaboration.phone}`);
        }
    };

    const renderImageGallery = () => (
        <View style={styles.imageGallery}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setSelectedImageIndex(index);
                }}
            >
                {collaboration.images.map((image, index) => (
                    <Image
                        key={index}
                        source={{ uri: image }}
                        style={styles.galleryImage}
                        resizeMode="cover"
                    />
                ))}
            </ScrollView>

            {/* Image Indicators */}
            <View style={styles.imageIndicators}>
                {collaboration.images.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            selectedImageIndex === index && styles.activeIndicator
                        ]}
                    />
                ))}
            </View>
        </View>
    );

    const renderMap = () => (
        <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <View style={styles.mapContainer}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={{
                        ...collaboration.coordinates,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    scrollEnabled={true}
                    zoomEnabled={true}
                    pitchEnabled={true}
                    rotateEnabled={true}
                >
                    <Marker coordinate={collaboration.coordinates}>
                        <View style={styles.mapMarker}>
                            <LinearGradient
                                colors={['#C9A961', '#D4AF37']}
                                style={styles.markerGradient}
                            >
                                <MinimalistIcons name="location" size={24} color={'#888888'} isActive={false} />
                            </LinearGradient>
                        </View>
                    </Marker>
                </MapView>

                {/* Map Controls */}
                <View style={styles.mapControls}>
                    <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
                        <View style={styles.mapButtonContent}>
                            <MinimalistIcons name="location" size={16} color="#C9A961" isActive={false} />
                            <Text style={styles.mapButtonText}>Direcciones</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.addressRow}>
                <MinimalistIcons name="location" size={16} color="#888888" isActive={false} />
                <Text style={styles.addressText}>{collaboration.address}</Text>
            </View>
        </View>
    );

    const renderRequestModal = () => (
        <Modal
            visible={showRequestModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowRequestModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Solicitar Colaboración</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowRequestModal(false)}
                        >
                            <MinimalistIcons name="close" size={24} color={'#888888'} isActive={false} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {/* Content Proposal */}
                        <View style={styles.formSection}>
                            <Text style={styles.formLabel}>Propuesta de Contenido *</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Describe qué tipo de contenido planeas crear..."
                                placeholderTextColor="#666"
                                value={requestForm.contentProposal}
                                onChangeText={(text) => setRequestForm({ ...requestForm, contentProposal: text })}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        {/* Restaurant-specific fields */}
                        {collaboration.category === 'restaurantes' && (
                            <>
                                <View style={styles.formSection}>
                                    <Text style={styles.formLabel}>Fecha Preferida *</Text>
                                    <TouchableOpacity
                                        style={styles.dateButton}
                                        onPress={() => setShowCalendar(true)}
                                    >
                                        <Text style={styles.dateButtonText}>
                                            {requestForm.preferredDate || 'Seleccionar fecha'}
                                        </Text>
                                        <MinimalistIcons name="events" size={16} color="#C9A961" isActive={false} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.formSection}>
                                    <Text style={styles.formLabel}>Hora Preferida</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ej: 20:00"
                                        placeholderTextColor="#666"
                                        value={requestForm.preferredTime}
                                        onChangeText={(text) => setRequestForm({ ...requestForm, preferredTime: text })}
                                    />
                                </View>

                                <View style={styles.formSection}>
                                    <Text style={styles.formLabel}>Número de Acompañantes</Text>
                                    <View style={styles.companionsSelector}>
                                        {[0, 1, 2, 3].map((num) => (
                                            <TouchableOpacity
                                                key={num}
                                                style={[
                                                    styles.companionButton,
                                                    requestForm.companions === num && styles.selectedCompanion
                                                ]}
                                                onPress={() => setRequestForm({ ...requestForm, companions: num })}
                                            >
                                                <Text style={[
                                                    styles.companionButtonText,
                                                    requestForm.companions === num && styles.selectedCompanionText
                                                ]}>
                                                    {num}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Product delivery fields */}
                        {collaboration.category !== 'restaurantes' && (
                            <>
                                <View style={styles.formSection}>
                                    <Text style={styles.formLabel}>Dirección de Envío *</Text>
                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="Dirección completa para el envío..."
                                        placeholderTextColor="#666"
                                        value={requestForm.address}
                                        onChangeText={(text) => setRequestForm({ ...requestForm, address: text })}
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>

                                <View style={styles.formSection}>
                                    <Text style={styles.formLabel}>Teléfono de Contacto</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="+34 600 000 000"
                                        placeholderTextColor="#666"
                                        value={requestForm.phone}
                                        onChangeText={(text) => setRequestForm({ ...requestForm, phone: text })}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.formSection}>
                                    <Text style={styles.formLabel}>Horario Preferido de Entrega</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ej: Mañanas de 9:00 a 14:00"
                                        placeholderTextColor="#666"
                                        value={requestForm.preferredDeliveryTime}
                                        onChangeText={(text) => setRequestForm({ ...requestForm, preferredDeliveryTime: text })}
                                    />
                                </View>
                            </>
                        )}

                        {/* Special Requests */}
                        <View style={styles.formSection}>
                            <Text style={styles.formLabel}>Comentarios Especiales</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Cualquier comentario adicional..."
                                placeholderTextColor="#666"
                                value={requestForm.specialRequests}
                                onChangeText={(text) => setRequestForm({ ...requestForm, specialRequests: text })}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Content Commitment */}
                        <View style={styles.commitmentSection}>
                            <Text style={styles.commitmentTitle}>Compromiso de Contenido</Text>
                            <Text style={styles.commitmentText}>
                                Al solicitar esta colaboración, te comprometes a crear:
                            </Text>
                            <Text style={styles.commitmentDetail}>
                                • {collaboration.contentRequired}
                            </Text>
                            <Text style={styles.commitmentDetail}>
                                • Plazo: {collaboration.deadline}
                            </Text>
                            <Text style={styles.commitmentWarning}>
                                El incumplimiento puede resultar en la suspensión de tu cuenta.
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={submitRequest}
                        >
                            <LinearGradient
                                colors={['#C9A961', '#D4AF37']}
                                style={styles.submitGradient}
                            >
                                <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowRequestModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderCalendarModal = () => (
        <Modal
            visible={showCalendar}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCalendar(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.calendarModalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Seleccionar Fecha</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowCalendar(false)}
                        >
                            <MinimalistIcons name="close" size={24} color={'#888888'} isActive={false} />
                        </TouchableOpacity>
                    </View>

                    <Calendar
                        onDayPress={handleDateSelect}
                        markedDates={{
                            [requestForm.preferredDate]: {
                                selected: true,
                                selectedColor: '#C9A961'
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
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {/* Floating Back Button */}
            <TouchableOpacity
                style={styles.floatingBackButton}
                onPress={onBack}
            >
                <View style={styles.backButtonContent}>
                    <MinimalistIcons name="back" size={20} color="#000" isActive={false} />
                    <Text style={styles.floatingBackButtonText}>Volver</Text>
                </View>
            </TouchableOpacity>

            <ScrollView style={styles.content}>
                {/* Image Gallery */}
                {renderImageGallery()}

                {/* Business Info */}
                <View style={styles.businessSection}>
                    <Text style={styles.businessName}>{collaboration.business}</Text>
                    <Text style={styles.collaborationTitle}>{collaboration.title}</Text>
                    <Text style={styles.categoryBadge}>
                        {collaboration.category.toUpperCase()}
                    </Text>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descripción del Negocio</Text>
                    <Text style={styles.descriptionText}>{collaboration.description}</Text>
                </View>

                {/* What's Included */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Qué Incluye</Text>
                    <Text style={styles.includesText}>{collaboration.whatIncludes}</Text>
                </View>

                {/* Content Requirements */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contenido a Publicar</Text>
                    <Text style={styles.contentText}>{collaboration.contentRequired}</Text>
                    <View style={styles.deadlineRow}>
                        <MinimalistIcons name="history" size={16} color="#C9A961" isActive={false} />
                        <Text style={styles.deadlineText}>Plazo para publicar: {collaboration.deadline}</Text>
                    </View>
                    {collaboration.companyInstagram && (
                        <TouchableOpacity 
                            style={styles.instagramRow}
                            onPress={() => {
                                const instagramUrl = collaboration.companyInstagram.startsWith('@') 
                                    ? `https://instagram.com/${collaboration.companyInstagram.substring(1)}`
                                    : `https://instagram.com/${collaboration.companyInstagram}`;
                                Linking.openURL(instagramUrl);
                            }}
                        >
                            <MinimalistIcons name="instagram" size={16} color="#C9A961" isActive={false} />
                            <Text style={styles.instagramText}>
                                Etiqueta a: {collaboration.companyInstagram.startsWith('@') ? collaboration.companyInstagram : `@${collaboration.companyInstagram}`}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Requirements */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Requisitos</Text>
                    <View style={styles.requirementsList}>
                        <View style={styles.requirementRow}>
                            <MinimalistIcons name="users" size={16} color="#888888" isActive={false} />
                            <Text style={styles.requirementItem}>{collaboration.requirements}</Text>
                        </View>
                        <View style={styles.requirementRow}>
                            <MinimalistIcons name="users" size={16} color="#888888" isActive={false} />
                            <Text style={styles.requirementItem}>{collaboration.companions}</Text>
                        </View>
                        <View style={styles.requirementRow}>
                            <MinimalistIcons name="location" size={16} color="#888888" isActive={false} />
                            <Text style={styles.requirementItem}>{collaboration.city}</Text>
                        </View>
                    </View>
                </View>



                {/* Map */}
                {renderMap()}

                {/* Contact Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información de Contacto</Text>
                    <View style={styles.contactRow}>
                        <MinimalistIcons name="location" size={16} color="#888888" isActive={false} />
                        <Text style={styles.contactText}>{collaboration.address}</Text>
                    </View>
                    {collaboration.phone && (
                        <TouchableOpacity style={styles.contactRow} onPress={callBusiness}>
                            <MinimalistIcons name="phone" size={16} color="#C9A961" isActive={false} />
                            <Text style={styles.contactLink}>{collaboration.phone}</Text>
                        </TouchableOpacity>
                    )}
                    {collaboration.email && (
                        <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${collaboration.email}`)}>
                            <MinimalistIcons name="message" size={16} color="#C9A961" isActive={false} />
                            <Text style={styles.contactLink}>{collaboration.email}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Spacer for fixed button */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Fixed Request Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity
                    style={styles.requestButton}
                    onPress={handleRequest}
                >
                    <LinearGradient
                        colors={['#C9A961', '#D4AF37']}
                        style={styles.requestGradient}
                    >
                        <Text style={styles.requestButtonText}>Solicitar Colaboración</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {renderRequestModal()}
            {renderCalendarModal()}

            {/* New Collaboration Request Screen */}
            <CollaborationRequestScreen
                visible={showRequestScreen}
                collaboration={collaboration}
                currentUser={currentUser}
                onClose={() => setShowRequestScreen(false)}
                onSubmitRequest={handleSubmitRequest}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        paddingBottom: 80, // Espacio para la barra de navegación inferior
    },
    floatingBackButton: {
        position: 'absolute',
        top: 60, // Posición más accesible
        left: 20,
        zIndex: 1000,
        backgroundColor: '#C9A961',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    backButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    floatingBackButtonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
        fontFamily: 'Inter',
    },
    content: {
        flex: 1,
    },
    errorText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 50,
        fontFamily: 'Inter',
    },

    // Image Gallery
    imageGallery: {
        height: 250,
        position: 'relative',
    },
    galleryImage: {
        width: width,
        height: 250,
    },
    imageIndicators: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    activeIndicator: {
        backgroundColor: '#C9A961',
    },

    // Business Section
    businessSection: {
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
    instagramRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 4,
    },
    instagramText: {
        fontSize: 14,
        color: '#C9A961',
        marginLeft: 8,
        fontFamily: 'Inter',
        fontWeight: '500',
    },
    collaborationTitle: {
        fontSize: 18,
        color: '#C9A961',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#C9A961',
        color: '#000000',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },

    // Sections
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 12,
        fontFamily: 'Inter',
    },
    descriptionText: {
        fontSize: 14,
        color: '#CCCCCC',
        lineHeight: 20,
        fontFamily: 'Inter',
    },
    includesText: {
        fontSize: 14,
        color: '#CCCCCC',
        lineHeight: 20,
        fontFamily: 'Inter',
    },
    contentText: {
        fontSize: 14,
        color: '#CCCCCC',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    deadlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    deadlineText: {
        fontSize: 12,
        color: '#C9A961',
        fontStyle: 'italic',
        fontFamily: 'Inter',
        marginLeft: 8,
    },
    requirementsList: {
        gap: 8,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    requirementItem: {
        fontSize: 14,
        color: '#CCCCCC',
        fontFamily: 'Inter',
        marginLeft: 8,
        flex: 1,
    },



    // Map Section
    mapSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    mapContainer: {
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    mapMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    markerText: {
        fontSize: 16,
    },
    mapControls: {
        position: 'absolute',
        top: 10,
        right: 10,
        gap: 8,
    },
    mapButton: {
        backgroundColor: 'rgba(17, 17, 17, 0.9)',
        borderWidth: 1,
        borderColor: '#C9A961',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    mapButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapButtonText: {
        color: '#C9A961',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Inter',
        marginLeft: 4,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    addressText: {
        fontSize: 14,
        color: '#CCCCCC',
        fontFamily: 'Inter',
        marginLeft: 8,
        flex: 1,
    },

    // Contact
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    contactText: {
        fontSize: 14,
        color: '#CCCCCC',
        fontFamily: 'Inter',
        marginLeft: 8,
        flex: 1,
    },
    contactLink: {
        fontSize: 14,
        color: '#C9A961',
        textDecorationLine: 'underline',
        fontFamily: 'Inter',
        marginLeft: 8,
        flex: 1,
    },

    // Fixed Button
    bottomSpacer: {
        height: 120, // Espacio para el botón fijo y navegación
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 80, // Posicionado arriba de la barra de navegación
        left: 0,
        right: 0,
        backgroundColor: '#000000',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#333333',
    },
    requestButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },

    requestGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    requestButtonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.9,
    },
    calendarModalContent: {
        backgroundColor: '#111111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.7,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#C9A961',
        flex: 1,
        fontFamily: 'Inter',
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#333333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalBody: {
        flex: 1,
        paddingHorizontal: 20,
    },

    // Form Styles
    formSection: {
        marginVertical: 15,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    input: {
        backgroundColor: '#222222',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter',
    },
    textArea: {
        backgroundColor: '#222222',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        color: '#FFFFFF',
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
        fontFamily: 'Inter',
    },
    dateButton: {
        backgroundColor: '#222222',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter',
    },

    companionsSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    companionButton: {
        backgroundColor: '#222222',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 8,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedCompanion: {
        borderColor: '#C9A961',
        backgroundColor: '#C9A961',
    },
    companionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },
    selectedCompanionText: {
        color: '#000000',
    },

    // Commitment Section
    commitmentSection: {
        backgroundColor: '#222222',
        borderRadius: 12,
        padding: 16,
        marginVertical: 15,
        borderWidth: 1,
        borderColor: '#C9A961',
    },
    commitmentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    commitmentText: {
        fontSize: 14,
        color: '#CCCCCC',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    commitmentDetail: {
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    commitmentWarning: {
        fontSize: 12,
        color: '#FF6B6B',
        marginTop: 8,
        fontStyle: 'italic',
        fontFamily: 'Inter',
    },

    // Modal Actions
    modalActions: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#333333',
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10,
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
    cancelButton: {
        backgroundColor: '#333333',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },
});

export default CollaborationDetailScreenNew;