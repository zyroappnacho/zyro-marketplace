import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewClustering from 'react-native-map-clustering';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, fontSizes, fontWeights } from '../styles/theme';
import { Campaign } from '../types';
import { CampaignRepository } from '../database/repositories/CampaignRepository';
import { ZyroLogo } from '../components/ZyroLogo';

const { width, height } = Dimensions.get('window');

// Spain coordinates and bounds
const SPAIN_REGION: Region = {
  latitude: 40.4637, // Center of Spain
  longitude: -3.7492,
  latitudeDelta: 8.0, // Covers most of Spain
  longitudeDelta: 8.0,
};

const SPAIN_BOUNDS = {
  northEast: { lat: 43.7, lng: 4.3 },
  southWest: { lat: 36.0, lng: -9.3 },
};

interface MarkerData extends Campaign {
  key: string;
}

interface MapScreenProps {
  navigation?: any; // Will be properly typed when navigation is set up
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const [campaigns, setCampaigns] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [region, setRegion] = useState<Region>(SPAIN_REGION);
  const [visibleCampaigns, setVisibleCampaigns] = useState<number>(0);
  const mapRef = useRef<MapView>(null);
  const campaignRepository = new CampaignRepository();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const campaignData = await campaignRepository.getCampaignsByLocation(
        SPAIN_BOUNDS,
        'active'
      );
      
      const markersData: MarkerData[] = campaignData
        .filter(campaign => campaign.coordinates.lat && campaign.coordinates.lng)
        .map(campaign => ({
          ...campaign,
          key: `marker-${campaign.id}`,
        }));

      setCampaigns(markersData);
      setVisibleCampaigns(markersData.length);
    } catch (error) {
      console.error('Error loading campaigns for map:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las ubicaciones de colaboraciones'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    
    // Calculate visible campaigns based on region bounds
    const visibleCount = campaigns.filter(campaign => {
      const { lat, lng } = campaign.coordinates;
      const latDelta = newRegion.latitudeDelta / 2;
      const lngDelta = newRegion.longitudeDelta / 2;
      
      return (
        lat >= newRegion.latitude - latDelta &&
        lat <= newRegion.latitude + latDelta &&
        lng >= newRegion.longitude - lngDelta &&
        lng <= newRegion.longitude + lngDelta
      );
    }).length;
    
    setVisibleCampaigns(visibleCount);
  };

  const handleMarkerPress = (marker: MarkerData) => {
    setSelectedMarker(marker);
    
    // Animate to marker location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: marker.coordinates.lat,
        longitude: marker.coordinates.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };

  const handleMapPress = () => {
    setSelectedMarker(null);
  };

  const resetToSpain = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(SPAIN_REGION, 1000);
    }
    setSelectedMarker(null);
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'restaurantes':
        return 'restaurant';
      case 'movilidad':
        return 'directions-car';
      case 'ropa':
        return 'shopping-bag';
      case 'eventos':
        return 'event';
      case 'delivery':
        return 'delivery-dining';
      case 'salud-belleza':
        return 'spa';
      case 'alojamiento':
        return 'hotel';
      case 'discotecas':
        return 'nightlife';
      default:
        return 'place';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'restaurantes':
        return '#FF6B6B';
      case 'movilidad':
        return '#4ECDC4';
      case 'ropa':
        return '#45B7D1';
      case 'eventos':
        return '#96CEB4';
      case 'delivery':
        return '#FFEAA7';
      case 'salud-belleza':
        return '#DDA0DD';
      case 'alojamiento':
        return '#98D8C8';
      case 'discotecas':
        return '#F7DC6F';
      default:
        return colors.goldElegant;
    }
  };

  const renderMarker = (marker: MarkerData) => (
    <Marker
      key={marker.key}
      coordinate={{
        latitude: marker.coordinates.lat,
        longitude: marker.coordinates.lng,
      }}
      onPress={() => handleMarkerPress(marker)}
      title={marker.businessName}
      description={marker.title}
    >
      <View style={[
        styles.customMarker,
        { backgroundColor: getCategoryColor(marker.category) }
      ]}>
        <Icon
          name={getCategoryIcon(marker.category)}
          size={20}
          color={colors.white}
        />
      </View>
    </Marker>
  );

  const handleClusterPress = (cluster: any) => {
    const { coordinate, pointCount } = cluster;
    
    // Calculate zoom level based on cluster size
    const zoomLevel = Math.min(0.02, 0.1 / Math.sqrt(pointCount));
    
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: zoomLevel,
        longitudeDelta: zoomLevel,
      }, 500);
    }
  };

  const renderCluster = (cluster: any) => {
    const { pointCount, coordinate } = cluster;
    
    return (
      <Marker 
        coordinate={coordinate} 
        onPress={() => handleClusterPress(cluster)}
      >
        <View style={[
          styles.clusterMarker,
          pointCount > 10 && styles.clusterMarkerLarge,
          pointCount > 50 && styles.clusterMarkerXLarge,
        ]}>
          <Text style={[
            styles.clusterText,
            pointCount > 10 && styles.clusterTextLarge,
          ]}>
            {pointCount > 99 ? '99+' : pointCount}
          </Text>
        </View>
      </Marker>
    );
  };

  const renderSelectedMarkerInfo = () => {
    if (!selectedMarker) return null;

    return (
      <View style={styles.markerInfoContainer}>
        <View style={styles.markerInfo}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedMarker(null)}
          >
            <Icon name="close" size={20} color={colors.goldElegant} />
          </TouchableOpacity>
          
          <Text style={styles.markerTitle}>{selectedMarker.businessName}</Text>
          <Text style={styles.markerSubtitle}>{selectedMarker.title}</Text>
          
          <View style={styles.markerDetails}>
            <View style={styles.markerDetailRow}>
              <Icon name="location-on" size={16} color={colors.goldElegant} />
              <Text style={styles.markerDetailText}>{selectedMarker.city}</Text>
            </View>
            
            <View style={styles.markerDetailRow}>
              <Icon name="category" size={16} color={colors.goldElegant} />
              <Text style={styles.markerDetailText}>
                {selectedMarker.category.charAt(0).toUpperCase() + selectedMarker.category.slice(1)}
              </Text>
            </View>
            
            {selectedMarker.requirements.minInstagramFollowers && (
              <View style={styles.markerDetailRow}>
                <Icon name="people" size={16} color={colors.goldElegant} />
                <Text style={styles.markerDetailText}>
                  Min. {selectedMarker.requirements.minInstagramFollowers.toLocaleString()} seguidores
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => {
              if (navigation) {
                navigation.navigate('CollaborationDetail', {
                  campaignId: selectedMarker.id
                });
              } else {
                Alert.alert('Próximamente', 'Navegación a detalles de colaboración');
              }
            }}
          >
            <Text style={styles.viewDetailsButtonText}>Ver Detalles</Text>
            <Icon name="arrow-forward" size={16} color={colors.black} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ZyroLogo />
        <ActivityIndicator 
          size="large" 
          color={colors.goldElegant} 
          style={styles.loadingIndicator}
        />
        <Text style={styles.loadingText}>Cargando mapa de colaboraciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapViewClustering
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={SPAIN_REGION}
        onRegionChangeComplete={handleRegionChange}
        onPress={handleMapPress}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
        customMapStyle={mapStyle}
        clusterColor={colors.goldElegant}
        clusterTextColor={colors.black}
        clusterFontFamily="Inter-SemiBold"
        radius={50}
        maxZoom={20}
        minZoom={5}
        extent={512}
        nodeSize={64}
        renderCluster={renderCluster}
        animationEnabled={true}
      >
        {campaigns.map(renderMarker)}
      </MapViewClustering>

      {/* Header with logo and controls */}
      <View style={styles.header}>
        <ZyroLogo size="small" />
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={resetToSpain}
          >
            <Icon name="my-location" size={20} color={colors.goldElegant} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={loadCampaigns}
          >
            <Icon name="refresh" size={20} color={colors.goldElegant} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Campaign counter */}
      <View style={styles.campaignCounter}>
        <Icon name="place" size={16} color={colors.goldElegant} />
        <Text style={styles.campaignCounterText}>
          {visibleCampaigns} de {campaigns.length} colaboraciones visibles
        </Text>
      </View>

      {/* Selected marker info */}
      {renderSelectedMarkerInfo()}
    </View>
  );
};

// Custom map style for premium dark theme
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
        "color": "#4b6878"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#64779f"
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
        "color": "#6f9ba4"
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
    backgroundColor: colors.black,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
    paddingHorizontal: spacing.lg,
  },
  loadingIndicator: {
    marginVertical: spacing.lg,
  },
  loadingText: {
    color: colors.goldElegant,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.black}95`,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerControls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  controlButton: {
    backgroundColor: `${colors.darkGray}90`,
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.goldElegant,
  },
  campaignCounter: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: `${colors.darkGray}95`,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.goldElegant,
  },
  campaignCounterText: {
    color: colors.goldElegant,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerInfoContainer: {
    position: 'absolute',
    bottom: 150,
    left: spacing.md,
    right: spacing.md,
  },
  markerInfo: {
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.goldElegant,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
  },
  markerTitle: {
    color: colors.goldElegant,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
    paddingRight: spacing.xl,
  },
  markerSubtitle: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.sm,
  },
  markerDetails: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  markerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  markerDetailText: {
    color: colors.lightGray,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
  },
  viewDetailsButton: {
    backgroundColor: colors.goldElegant,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  viewDetailsButtonText: {
    color: colors.black,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  clusterMarker: {
    backgroundColor: colors.goldElegant,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  clusterText: {
    color: colors.black,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  clusterMarkerLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  clusterMarkerXLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  clusterTextLarge: {
    fontSize: fontSizes.lg,
  },
});