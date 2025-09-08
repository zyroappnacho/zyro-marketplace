import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Modal,
    ScrollView,
    Image,
    Alert,
    Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Spain coordinates for initial region
const SPAIN_REGION = {
    latitude: 40.4637,
    longitude: -3.7492,
    latitudeDelta: 8.0,
    longitudeDelta: 8.0,
};

// Madrid coordinates for example
const MADRID_COORDINATES = {
    latitude: 40.4168,
    longitude: -3.7038,
};

const InteractiveMapNew = ({ collaborations = [], onMarkerPress, currentUser }) => {
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [mapRegion, setMapRegion] = useState(SPAIN_REGION);

    // Add coordinates to collaborations if they don't have them
    const collaborationsWithCoords = collaborations.map(collab => ({
        ...collab,
        coordinates: collab.coordinates || {
            latitude: MADRID_COORDINATES.latitude + (Math.random() - 0.5) * 0.1,
            longitude: MADRID_COORDINATES.longitude + (Math.random() - 0.5) * 0.1,
        }
    }));

    const handleMarkerPress = (collaboration) => {
        setSelectedMarker(collaboration);
        setShowDetails(true);
    };

    const handleViewDetails = () => {
        setShowDetails(false);
        if (onMarkerPress && selectedMarker) {
            onMarkerPress(selectedMarker);
        }
    };

    const renderMarker = (collaboration) => (
        <Marker
            key={collaboration.id}
            coordinate={collaboration.coordinates}
            onPress={() => handleMarkerPress(collaboration)}
        >
            <View style={styles.markerContainer}>
                <LinearGradient
                    colors={['#C9A961', '#D4AF37']}
                    style={styles.marker}
                >
                    <Text style={styles.markerText}>🏪</Text>
                </LinearGradient>
            </View>
        </Marker>
    );

    const renderDetailsModal = () => (
        <Modal
            visible={showDetails}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDetails(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {selectedMarker && (
                        <>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{selectedMarker.title}</Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowDetails(false)}
                                >
                                    <Text style={styles.closeButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                {/* Business Image */}
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: selectedMarker.images[0] }}
                                        style={styles.businessImage}
                                        resizeMode="cover"
                                    />
                                </View>

                                {/* Business Info */}
                                <View style={styles.businessInfo}>
                                    <Text style={styles.businessName}>
                                        {selectedMarker.business}
                                    </Text>
                                    <Text style={styles.businessCategory}>
                                        {selectedMarker.category.toUpperCase()}
                                    </Text>
                                    <Text style={styles.businessCity}>
                                        📍 {selectedMarker.city}
                                    </Text>
                                </View>

                                {/* Description */}
                                <View style={styles.descriptionSection}>
                                    <Text style={styles.sectionTitle}>Descripción</Text>
                                    <Text style={styles.descriptionText}>
                                        {selectedMarker.description}
                                    </Text>
                                </View>

                                {/* Requirements */}
                                <View style={styles.requirementsSection}>
                                    <Text style={styles.sectionTitle}>Requisitos</Text>
                                    <View style={styles.requirementItem}>
                                        <Text style={styles.requirementText}>
                                            👥 {selectedMarker.requirements}
                                        </Text>
                                    </View>
                                    <View style={styles.requirementItem}>
                                        <Text style={styles.requirementText}>
                                            👫 {selectedMarker.companions}
                                        </Text>
                                    </View>
                                </View>

                                {/* What's Included */}
                                <View style={styles.includesSection}>
                                    <Text style={styles.sectionTitle}>Qué Incluye</Text>
                                    <Text style={styles.includesText}>
                                        {selectedMarker.whatIncludes}
                                    </Text>
                                </View>

                                {/* Content Required */}
                                <View style={styles.contentSection}>
                                    <Text style={styles.sectionTitle}>Contenido Requerido</Text>
                                    <Text style={styles.contentText}>
                                        {selectedMarker.contentRequired}
                                    </Text>
                                    <Text style={styles.deadlineText}>
                                        ⏰ Plazo: {selectedMarker.deadline}
                                    </Text>
                                </View>

                                {/* Location Info */}
                                <View style={styles.locationSection}>
                                    <Text style={styles.sectionTitle}>Ubicación</Text>
                                    <Text style={styles.addressText}>
                                        📍 {selectedMarker.address}
                                    </Text>
                                    {selectedMarker.phone && (
                                        <TouchableOpacity style={styles.contactButton}>
                                            <Text style={styles.contactButtonText}>
                                                📞 {selectedMarker.phone}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Eligibility Check */}
                                {currentUser && (
                                    <View style={styles.eligibilitySection}>
                                        {currentUser.instagramFollowers >= selectedMarker.minFollowers ? (
                                            <View style={styles.eligibleBadge}>
                                                <Text style={styles.eligibleText}>
                                                    ✅ Cumples los requisitos
                                                </Text>
                                            </View>
                                        ) : (
                                            <View style={styles.ineligibleBadge}>
                                                <Text style={styles.ineligibleText}>
                                                    ❌ Necesitas {selectedMarker.minFollowers} seguidores mínimo
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </ScrollView>

                            {/* Action Buttons */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.detailsButton}
                                    onPress={handleViewDetails}
                                >
                                    <LinearGradient
                                        colors={['#C9A961', '#D4AF37']}
                                        style={styles.buttonGradient}
                                    >
                                        <Text style={styles.detailsButtonText}>
                                            Ver Detalles Completos
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.directionsButton}
                                    onPress={() => {
                                        const { latitude, longitude } = selectedMarker.coordinates;
                                        const url = Platform.select({
                                            ios: `maps:0,0?q=${latitude},${longitude}`,
                                            android: `geo:0,0?q=${latitude},${longitude}`
                                        });
                                        
                                        if (url) {
                                            Linking.openURL(url).catch(() => {
                                                Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
                                            });
                                        }
                                    }}
                                >
                                    <Text style={styles.directionsButtonText}>
                                        🧭 Obtener Direcciones
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {/* Map Header */}
            <View style={styles.mapHeader}>
                <Text style={styles.mapTitle}>Mapa de Colaboraciones</Text>
                <Text style={styles.mapSubtitle}>
                    {collaborationsWithCoords.length} colaboraciones disponibles
                </Text>
            </View>

            {/* Map */}
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={SPAIN_REGION}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
                mapType="standard"
                customMapStyle={mapStyle}
            >
                {collaborationsWithCoords.map(renderMarker)}
            </MapView>

            {/* Map Controls */}
            <View style={styles.mapControls}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => setMapRegion(SPAIN_REGION)}
                >
                    <Text style={styles.controlButtonText}>🇪🇸</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => setMapRegion({
                        ...MADRID_COORDINATES,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                    })}
                >
                    <Text style={styles.controlButtonText}>📍</Text>
                </TouchableOpacity>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={styles.legendMarker}>
                        <LinearGradient
                            colors={['#C9A961', '#D4AF37']}
                            style={styles.legendMarkerIcon}
                        >
                            <Text style={styles.legendMarkerText}>🏪</Text>
                        </LinearGradient>
                    </View>
                    <Text style={styles.legendText}>Colaboración disponible</Text>
                </View>
            </View>

            {renderDetailsModal()}
        </View>
    );
};

// Custom map style for premium look
const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#1d2c4d"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8ec3b9"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1a3646"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#C9A961"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#64779e"
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#4b6878"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#334e87"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#023e58"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#283d6a"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#6f9ba5"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1d2c4d"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#023e58"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#3C7680"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#304a7d"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#98a5be"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1d2c4d"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2c6675"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#255763"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#b0d5ce"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#023e58"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#98a5be"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1d2c4d"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#283d6a"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#3a4762"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#0e1626"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#4e6d70"
            }
        ]
    }
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    mapHeader: {
        backgroundColor: '#111111',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    mapTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    mapSubtitle: {
        fontSize: 14,
        color: '#CCCCCC',
        fontFamily: 'Inter',
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    marker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    markerText: {
        fontSize: 16,
    },
    mapControls: {
        position: 'absolute',
        top: 80,
        right: 20,
        flexDirection: 'column',
    },
    controlButton: {
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#C9A961',
        borderRadius: 25,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    controlButtonText: {
        fontSize: 20,
    },
    legend: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'rgba(17, 17, 17, 0.9)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#333333',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendMarker: {
        marginRight: 8,
    },
    legendMarkerIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    legendMarkerText: {
        fontSize: 12,
    },
    legendText: {
        color: '#CCCCCC',
        fontSize: 12,
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
        maxHeight: height * 0.8,
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
    imageContainer: {
        marginVertical: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    businessImage: {
        width: '100%',
        height: 200,
    },
    businessInfo: {
        marginBottom: 20,
    },
    businessName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    businessCategory: {
        fontSize: 14,
        color: '#C9A961',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    businessCity: {
        fontSize: 14,
        color: '#CCCCCC',
        fontFamily: 'Inter',
    },
    descriptionSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    descriptionText: {
        fontSize: 14,
        color: '#CCCCCC',
        lineHeight: 20,
        fontFamily: 'Inter',
    },
    requirementsSection: {
        marginBottom: 20,
    },
    requirementItem: {
        marginBottom: 4,
    },
    requirementText: {
        fontSize: 14,
        color: '#CCCCCC',
        fontFamily: 'Inter',
    },
    includesSection: {
        marginBottom: 20,
    },
    includesText: {
        fontSize: 14,
        color: '#CCCCCC',
        lineHeight: 20,
        fontFamily: 'Inter',
    },
    contentSection: {
        marginBottom: 20,
    },
    contentText: {
        fontSize: 14,
        color: '#CCCCCC',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    deadlineText: {
        fontSize: 12,
        color: '#C9A961',
        fontStyle: 'italic',
        fontFamily: 'Inter',
    },
    locationSection: {
        marginBottom: 20,
    },
    addressText: {
        fontSize: 14,
        color: '#CCCCCC',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    contactButton: {
        backgroundColor: '#333333',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
    },
    contactButtonText: {
        color: '#C9A961',
        fontSize: 14,
        fontFamily: 'Inter',
    },
    eligibilitySection: {
        marginBottom: 20,
    },
    eligibleBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderWidth: 1,
        borderColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    eligibleText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Inter',
    },
    ineligibleBadge: {
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        borderWidth: 1,
        borderColor: '#F44336',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    ineligibleText: {
        color: '#F44336',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Inter',
    },
    modalActions: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#333333',
    },
    detailsButton: {
        marginBottom: 10,
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    detailsButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },
    directionsButton: {
        backgroundColor: '#333333',
        borderWidth: 1,
        borderColor: '#C9A961',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    directionsButtonText: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },
});

export default InteractiveMapNew;