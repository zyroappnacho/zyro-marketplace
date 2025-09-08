import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Linking, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';

const SPAIN_COORDINATES = {
  latitude: 40.4168,
  longitude: -3.7038,
  latitudeDelta: 8.0,
  longitudeDelta: 8.0,
};

const CITY_COORDINATES = {
  Madrid: { latitude: 40.4168, longitude: -3.7038 },
  Barcelona: { latitude: 41.3851, longitude: 2.1734 },
  Valencia: { latitude: 39.4699, longitude: -0.3763 },
  Sevilla: { latitude: 37.3891, longitude: -5.9845 },
  Bilbao: { latitude: 43.2627, longitude: -2.9253 },
  Málaga: { latitude: 36.7213, longitude: -4.4214 },
  Zaragoza: { latitude: 41.6488, longitude: -0.8891 },
  Murcia: { latitude: 37.9922, longitude: -1.1307 },
};

export default function InteractiveMap({ collaborations = [], onMarkerPress }) {
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState(SPAIN_COORDINATES);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de Ubicación',
          'Para mostrarte colaboraciones cercanas, necesitamos acceso a tu ubicación.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Center map on user location if in Spain
      if (isInSpain(location.coords.latitude, location.coords.longitude)) {
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 2.0,
          longitudeDelta: 2.0,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const isInSpain = (lat, lng) => {
    // Rough bounds for Spain
    return lat >= 35.0 && lat <= 44.0 && lng >= -10.0 && lng <= 5.0;
  };

  const getCollaborationsByCity = () => {
    const collaborationsByCity = {};
    
    collaborations.forEach(collaboration => {
      const city = collaboration.city;
      if (!collaborationsByCity[city]) {
        collaborationsByCity[city] = [];
      }
      collaborationsByCity[city].push(collaboration);
    });

    return collaborationsByCity;
  };

  const openDirections = (latitude, longitude, address) => {
    const scheme = Platform.select({
      ios: 'maps://app?saddr=Current+Location&daddr=',
      android: 'geo:0,0?q=',
    });
    
    const url = Platform.select({
      ios: `${scheme}${latitude},${longitude}`,
      android: `${scheme}${latitude},${longitude}(${encodeURIComponent(address)})`,
    });

    Linking.openURL(url).catch(() => {
      // Fallback to Google Maps web
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(googleMapsUrl);
    });
  };

  const collaborationsByCity = getCollaborationsByCity();

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        customMapStyle={mapStyle}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Tu ubicación"
            pinColor="#C9A961"
          />
        )}

        {/* City markers with collaborations */}
        {Object.entries(collaborationsByCity).map(([city, cityCollaborations]) => {
          const cityCoords = CITY_COORDINATES[city];
          if (!cityCoords) return null;

          return (
            <Marker
              key={city}
              coordinate={cityCoords}
              pinColor="#C9A961"
              onPress={() => onMarkerPress && onMarkerPress(city, cityCollaborations)}
            >
              <Callout
                onPress={() => {
                  Alert.alert(
                    `Colaboraciones en ${city}`,
                    `${cityCollaborations.length} colaboraciones disponibles:\n\n${cityCollaborations.map(c => `• ${c.title}`).join('\n')}`,
                    [
                      {
                        text: 'Ver Direcciones',
                        onPress: () => openDirections(cityCoords.latitude, cityCoords.longitude, city)
                      },
                      {
                        text: 'Ver Lista',
                        onPress: () => onMarkerPress && onMarkerPress(city, cityCollaborations)
                      },
                      { text: 'Cerrar', style: 'cancel' }
                    ]
                  );
                }}
              >
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{city}</Text>
                  <Text style={styles.calloutSubtitle}>
                    {cityCollaborations.length} colaboración{cityCollaborations.length !== 1 ? 'es' : ''}
                  </Text>
                  <Text style={styles.calloutAction}>Toca para ver detalles</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Map legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Leyenda</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#C9A961' }]} />
          <Text style={styles.legendText}>Ciudades con colaboraciones</Text>
        </View>
        {userLocation && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Tu ubicación</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#1a1a1a' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#C9A961' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1a1a1a' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#C9A961' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#333333' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f0f0f' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C9A961',
    marginBottom: 4,
  },
  calloutSubtitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  calloutAction: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(17, 17, 17, 0.9)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C9A961',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C9A961',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
});