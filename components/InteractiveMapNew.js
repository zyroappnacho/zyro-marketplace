import React, { useState, useEffect } from 'react';
import MinimalistIcons from './MinimalistIcons';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Alert,
    Platform,
    Linking
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
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
    const [mapRegion, setMapRegion] = useState(SPAIN_REGION);

    // Add coordinates to collaborations if they don't have them
    const collaborationsWithCoords = collaborations.map(collab => ({
        ...collab,
        coordinates: collab.coordinates || {
            latitude: MADRID_COORDINATES.latitude + (Math.random() - 0.5) * 0.1,
            longitude: MADRID_COORDINATES.longitude + (Math.random() - 0.5) * 0.1,
        }
    }));



    const openAppleMaps = async (collaboration) => {
        console.log('🗺️ Abriendo Apple Maps para:', collaboration.business);

        const { latitude, longitude } = collaboration.coordinates;
        const businessName = collaboration.business || 'Colaboración';

        console.log('📍 Coordenadas:', latitude, longitude);

        // URL simple y directa para Apple Maps
        const appleMapUrl = `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;

        console.log('🔗 URL generada:', appleMapUrl);

        try {
            console.log('🚀 Intentando abrir Apple Maps...');
            await Linking.openURL(appleMapUrl);
            console.log('✅ Apple Maps abierto exitosamente');
        } catch (error) {
            console.error('❌ Error abriendo Apple Maps:', error);
            Alert.alert(
                'Error',
                'No se pudo abrir Apple Maps. Verifica tu conexión a internet.',
                [{ text: 'OK' }]
            );
        }
    };

    const formatFollowers = (followers) => {
        if (followers >= 1000000) {
            return `${(followers / 1000000).toFixed(1)}M`;
        } else if (followers >= 1000) {
            return `${(followers / 1000).toFixed(1)}K`;
        }
        return followers.toString();
    };

    const renderMarker = (collaboration) => (
        <Marker
            key={collaboration.id}
            coordinate={collaboration.coordinates}
        >
            <View style={styles.markerContainer}>
                <LinearGradient
                    colors={['#C9A961', '#D4AF37']}
                    style={styles.marker}
                >
                    <MinimalistIcons 
                        name="location" 
                        size={20} 
                        color="#444444" 
                        strokeWidth={2.5}
                    />
                </LinearGradient>
            </View>

            <Callout
                tooltip={true}
                onPress={() => {
                    console.log('📍 Abriendo dirección para:', collaboration.business);
                    openAppleMaps(collaboration);
                }}
            >
                <View style={styles.callout}>
                    {/* Header */}
                    <View style={styles.calloutHeader}>
                        <Text style={styles.calloutTitle} numberOfLines={1}>
                            {collaboration.title}
                        </Text>
                        <Text style={styles.calloutBusiness} numberOfLines={1}>
                            {collaboration.business}
                        </Text>
                    </View>

                    {/* Quick Info */}
                    <View style={styles.calloutInfo}>
                        <View style={styles.calloutInfoItem}>
                            <Text style={styles.calloutInfoLabel}>Seguidores mín:</Text>
                            <Text style={styles.calloutInfoValue}>
                                {formatFollowers(collaboration.minFollowers)}
                            </Text>
                        </View>

                        <View style={styles.calloutInfoItem}>
                            <Text style={styles.calloutInfoLabel}>Acompañantes:</Text>
                            <Text style={styles.calloutInfoValue}>
                                {collaboration.companions}
                            </Text>
                        </View>

                        <View style={styles.calloutInfoItem}>
                            <Text style={styles.calloutInfoLabel}>Categoría:</Text>
                            <Text style={styles.calloutInfoValue}>
                                {collaboration.category}
                            </Text>
                        </View>
                    </View>

                    {/* New Address Button */}
                    <View style={styles.addressButton}>
                        <LinearGradient
                            colors={['#C9A961', '#D4AF37']}
                            style={styles.addressButtonGradient}
                        >
                            <Text style={styles.addressButtonText}>
                                📍 Dirección
                            </Text>
                        </LinearGradient>
                    </View>
                </View>
            </Callout>
        </Marker>
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
                    <MinimalistIcons name="location" size={24} color={'#888888'} isActive={false} />
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
                            <MinimalistIcons 
                                name="location" 
                                size={12} 
                                color="#444444" 
                                strokeWidth={2}
                            />
                        </LinearGradient>
                    </View>
                    <Text style={styles.legendText}>Colaboración disponible</Text>
                </View>
            </View>


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

    legendText: {
        color: '#CCCCCC',
        fontSize: 12,
        fontFamily: 'Inter',
    },

    // Callout Styles
    callout: {
        backgroundColor: 'rgba(17, 17, 17, 0.95)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: '#C9A961',
        shadowColor: '#C9A961',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
        width: 260,
        minHeight: 140,
    },
    calloutHeader: {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201, 169, 97, 0.3)',
        paddingBottom: 8,
    },
    calloutTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 4,
        fontFamily: 'Inter',
        textAlign: 'center',
    },
    calloutBusiness: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Inter',
        textAlign: 'center',
        opacity: 0.9,
    },
    calloutInfo: {
        marginBottom: 12,
    },
    calloutInfoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        paddingHorizontal: 4,
    },
    calloutInfoLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        fontFamily: 'Inter',
    },
    calloutInfoValue: {
        fontSize: 12,
        color: '#C9A961',
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    addressButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 4,
    },
    addressButtonGradient: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressButtonText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Inter',
    },
});

export default InteractiveMapNew;