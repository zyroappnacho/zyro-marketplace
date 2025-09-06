import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Campaign } from '../types';
import { MapService, MapPoint, MapBounds } from '../services/mapService';
import { colors, spacing, fontSizes, fontWeights } from '../styles/theme';
import { WebIcon } from './WebIcon';

// Fix para los iconos por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
    campaigns: Campaign[];
    selectedCampaign: Campaign | null;
    onCampaignSelect: (campaign: Campaign | null) => void;
    selectedCity: string;
    selectedCategory: string;
    style?: any;
}

interface MapEventsHandlerProps {
    onBoundsChange: (bounds: MapBounds, zoom: number) => void;
}

// Componente para manejar eventos del mapa
function MapEventsHandler({ onBoundsChange }: MapEventsHandlerProps) {
    const map = useMap();

    useMapEvents({
        moveend: () => {
            const bounds = map.getBounds();
            const zoom = map.getZoom();
            onBoundsChange(
                {
                    northEast: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng },
                    southWest: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng },
                },
                zoom
            );
        },
        zoomend: () => {
            const bounds = map.getBounds();
            const zoom = map.getZoom();
            onBoundsChange(
                {
                    northEast: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng },
                    southWest: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng },
                },
                zoom
            );
        },
    });

    return null;
}

// Componente para centrar el mapa en una ciudad
function MapCenterController({ city, campaigns }: { city: string; campaigns: Campaign[] }) {
    const map = useMap();

    useEffect(() => {
        if (city === 'TODAS LAS CIUDADES') {
            // Mostrar toda España
            const spainBounds = MapService.getSpainBounds();
            map.fitBounds([
                [spainBounds.southWest.lat, spainBounds.southWest.lng],
                [spainBounds.northEast.lat, spainBounds.northEast.lng],
            ]);
        } else {
            // Centrar en la ciudad seleccionada
            const cityCoords = MapService.getCityCoordinates(city);
            map.setView([cityCoords.lat, cityCoords.lng], 12);
        }
    }, [city, map]);

    return null;
}

export function InteractiveMap({
    campaigns,
    selectedCampaign,
    onCampaignSelect,
    selectedCity,
    selectedCategory,
    style,
}: InteractiveMapProps) {
    const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
    const [currentBounds, setCurrentBounds] = useState<MapBounds>(MapService.getSpainBounds());
    const [currentZoom, setCurrentZoom] = useState(6);
    const mapService = useRef(new MapService());

    // Actualizar puntos del mapa cuando cambian las campañas o el zoom
    const updateMapPoints = useCallback(() => {
        const clusters = mapService.current.getClusters(campaigns, currentZoom, currentBounds);
        setMapPoints(clusters);
    }, [campaigns, currentZoom, currentBounds]);

    useEffect(() => {
        updateMapPoints();
    }, [updateMapPoints]);

    // Manejar cambios en los bounds del mapa
    const handleBoundsChange = useCallback((bounds: MapBounds, zoom: number) => {
        setCurrentBounds(bounds);
        setCurrentZoom(zoom);
    }, []);

    // Manejar click en marcador
    const handleMarkerClick = useCallback((point: MapPoint) => {
        if (point.properties.cluster) {
            // Es un cluster, expandir
            const clusterId = point.properties.point_count || 0;
            const expansionZoom = mapService.current.getClusterExpansionZoom(clusterId);
            // Aquí podrías implementar la lógica para hacer zoom al cluster
            Alert.alert(
                'Cluster',
                `Este cluster contiene ${point.properties.point_count} colaboraciones. Haz zoom para ver más detalles.`
            );
        } else if (point.properties.campaign) {
            // Es una campaña individual
            onCampaignSelect(point.properties.campaign);
        }
    }, [onCampaignSelect]);

    // Crear icono personalizado para marcadores
    const createCustomIcon = useCallback((point: MapPoint) => {
        let iconHtml: string;
        
        if (point.properties.cluster) {
            iconHtml = MapService.createClusterIcon(
                point.properties.point_count || 0,
                false
            );
        } else {
            const campaign = point.properties.campaign;
            const isSelected = selectedCampaign?.id === campaign?.id;
            iconHtml = MapService.createMarkerIcon(
                campaign?.category || 'restaurantes',
                isSelected
            );
        }

        return L.divIcon({
            html: iconHtml,
            className: 'custom-marker',
            iconSize: point.properties.cluster ? [50, 50] : [32, 32],
            iconAnchor: point.properties.cluster ? [25, 25] : [16, 16],
        });
    }, [selectedCampaign]);

    // Coordenadas iniciales (centro de España)
    const initialCenter: [number, number] = [40.4168, -3.7038];
    const initialZoom = selectedCity === 'TODAS LAS CIUDADES' ? 6 : 12;

    return (
        <View style={[styles.container, style]}>
            <MapContainer
                center={initialCenter}
                zoom={initialZoom}
                style={styles.map}
                zoomControl={true}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                dragging={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapEventsHandler onBoundsChange={handleBoundsChange} />
                <MapCenterController city={selectedCity} campaigns={campaigns} />

                {mapPoints.map((point, index) => (
                    <Marker
                        key={`${point.properties.campaignId || 'cluster'}-${index}`}
                        position={[
                            point.geometry.coordinates[1],
                            point.geometry.coordinates[0],
                        ]}
                        icon={createCustomIcon(point)}
                        eventHandlers={{
                            click: () => handleMarkerClick(point),
                        }}
                    >
                        <Popup>
                            <View style={styles.popup}>
                                {point.properties.cluster ? (
                                    <View style={styles.clusterPopup}>
                                        <Text style={styles.popupTitle}>
                                            {point.properties.point_count} Colaboraciones
                                        </Text>
                                        <Text style={styles.popupText}>
                                            Haz zoom para ver más detalles
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.campaignPopup}>
                                        <Text style={styles.popupTitle}>
                                            {point.properties.campaign?.businessName}
                                        </Text>
                                        <Text style={styles.popupSubtitle}>
                                            {point.properties.campaign?.title}
                                        </Text>
                                        <View style={styles.popupDetails}>
                                            <View style={styles.popupDetailRow}>
                                                <WebIcon name="location-on" size={12} color={colors.goldElegant} />
                                                <Text style={styles.popupDetailText}>
                                                    {point.properties.campaign?.city}
                                                </Text>
                                            </View>
                                            {point.properties.campaign?.requirements.minInstagramFollowers && (
                                                <View style={styles.popupDetailRow}>
                                                    <WebIcon name="people" size={12} color={colors.goldElegant} />
                                                    <Text style={styles.popupDetailText}>
                                                        Min. {point.properties.campaign.requirements.minInstagramFollowers.toLocaleString()} seguidores
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <TouchableOpacity
                                            style={styles.popupButton}
                                            onPress={() => point.properties.campaign && onCampaignSelect(point.properties.campaign)}
                                        >
                                            <Text style={styles.popupButtonText}>Ver Detalles</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Controles del mapa */}
            <View style={styles.mapControls}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                        // Reset a vista de España
                        setCurrentZoom(6);
                        onCampaignSelect(null);
                    }}
                >
                    <WebIcon name="home" size={20} color={colors.goldElegant} />
                </TouchableOpacity>
            </View>

            {/* Información de resultados */}
            <View style={styles.mapInfo}>
                <Text style={styles.mapInfoText}>
                    {campaigns.length} colaboraciones en {selectedCity}
                </Text>
                {selectedCategory !== 'TODAS LAS CATEGORÍAS' && (
                    <Text style={styles.mapInfoSubtext}>
                        Categoría: {selectedCategory}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    mapControls: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        zIndex: 1000,
    },
    controlButton: {
        backgroundColor: colors.black,
        borderRadius: 8,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.goldElegant,
        marginBottom: spacing.xs,
    },
    mapInfo: {
        position: 'absolute',
        bottom: spacing.md,
        left: spacing.md,
        backgroundColor: colors.black,
        borderRadius: 8,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.goldElegant,
        zIndex: 1000,
    },
    mapInfoText: {
        color: colors.goldElegant,
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.medium,
    },
    mapInfoSubtext: {
        color: colors.lightGray,
        fontSize: fontSizes.xs,
        marginTop: spacing.xs,
    },
    popup: {
        minWidth: 200,
    },
    clusterPopup: {
        alignItems: 'center',
        padding: spacing.sm,
    },
    campaignPopup: {
        padding: spacing.sm,
    },
    popupTitle: {
        fontSize: fontSizes.md,
        fontWeight: fontWeights.bold,
        color: colors.black,
        marginBottom: spacing.xs,
    },
    popupSubtitle: {
        fontSize: fontSizes.sm,
        color: colors.darkGray,
        marginBottom: spacing.sm,
    },
    popupText: {
        fontSize: fontSizes.sm,
        color: colors.darkGray,
        textAlign: 'center',
    },
    popupDetails: {
        marginBottom: spacing.sm,
    },
    popupDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    popupDetailText: {
        fontSize: fontSizes.xs,
        color: colors.darkGray,
        marginLeft: spacing.xs,
    },
    popupButton: {
        backgroundColor: colors.goldElegant,
        borderRadius: 6,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        alignItems: 'center',
    },
    popupButtonText: {
        color: colors.black,
        fontSize: fontSizes.xs,
        fontWeight: fontWeights.semibold,
    },
});