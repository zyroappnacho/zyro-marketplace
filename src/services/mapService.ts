import Supercluster from 'supercluster';
import { Campaign } from '../types';

export interface MapPoint {
    type: 'Feature';
    properties: {
        cluster: boolean;
        campaignId?: string;
        campaign?: Campaign;
        point_count?: number;
        point_count_abbreviated?: string;
    };
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
    };
}

export interface MapBounds {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
}

export class MapService {
    private supercluster: Supercluster;

    constructor() {
        this.supercluster = new Supercluster({
            radius: 60,
            maxZoom: 16,
            minZoom: 5,
            minPoints: 2,
        });
    }

    // Coordenadas de las principales ciudades españolas
    static getCityCoordinates(city: string): { lat: number; lng: number } {
        const cityCoords: { [key: string]: { lat: number; lng: number } } = {
            'MADRID': { lat: 40.4168, lng: -3.7038 },
            'BARCELONA': { lat: 41.3851, lng: 2.1734 },
            'VALENCIA': { lat: 39.4699, lng: -0.3763 },
            'SEVILLA': { lat: 37.3891, lng: -5.9845 },
            'ZARAGOZA': { lat: 41.6488, lng: -0.8891 },
            'MÁLAGA': { lat: 36.7213, lng: -4.4214 },
            'MURCIA': { lat: 37.9922, lng: -1.1307 },
            'PALMA': { lat: 39.5696, lng: 2.6502 },
            'LAS PALMAS': { lat: 28.1248, lng: -15.4300 },
            'BILBAO': { lat: 43.2627, lng: -2.9253 },
            'ALICANTE': { lat: 38.3452, lng: -0.4810 },
            'CÓRDOBA': { lat: 37.8882, lng: -4.7794 },
            'VALLADOLID': { lat: 41.6523, lng: -4.7245 },
            'VIGO': { lat: 42.2406, lng: -8.7207 },
            'GIJÓN': { lat: 43.5322, lng: -5.6611 },
            'HOSPITALET': { lat: 41.3598, lng: 2.1074 },
            'VITORIA': { lat: 42.8467, lng: -2.6716 },
            'A CORUÑA': { lat: 43.3623, lng: -8.4115 },
            'GRANADA': { lat: 37.1773, lng: -3.5986 },
            'ELCHE': { lat: 38.2622, lng: -0.7011 },
            'OVIEDO': { lat: 43.3614, lng: -5.8593 },
            'SANTA CRUZ': { lat: 28.4636, lng: -16.2518 },
            'BADALONA': { lat: 41.4502, lng: 2.2445 },
            'CARTAGENA': { lat: 37.6063, lng: -0.9864 },
            'TERRASSA': { lat: 41.5647, lng: 2.0084 },
            'JEREZ': { lat: 36.6866, lng: -6.1364 },
            'SABADELL': { lat: 41.5431, lng: 2.1089 },
            'MÓSTOLES': { lat: 40.3230, lng: -3.8644 },
            'ALCALÁ DE HENARES': { lat: 40.4817, lng: -3.3616 },
            'PAMPLONA': { lat: 42.8125, lng: -1.6458 },
        };

        return cityCoords[city.toUpperCase()] || cityCoords['MADRID'];
    }

    // Convertir campañas a puntos de mapa
    campaignsToMapPoints(campaigns: Campaign[]): MapPoint[] {
        return campaigns.map(campaign => {
            const coords = campaign.coordinates || MapService.getCityCoordinates(campaign.city);
            
            return {
                type: 'Feature',
                properties: {
                    cluster: false,
                    campaignId: campaign.id,
                    campaign: campaign,
                },
                geometry: {
                    type: 'Point',
                    coordinates: [coords.lng, coords.lat],
                },
            };
        });
    }

    // Obtener clusters para un nivel de zoom y bounds específicos
    getClusters(campaigns: Campaign[], zoom: number, bounds: MapBounds): MapPoint[] {
        const points = this.campaignsToMapPoints(campaigns);
        this.supercluster.load(points);

        const bbox: [number, number, number, number] = [
            bounds.southWest.lng,
            bounds.southWest.lat,
            bounds.northEast.lng,
            bounds.northEast.lat,
        ];

        return this.supercluster.getClusters(bbox, Math.floor(zoom));
    }

    // Expandir un cluster para obtener sus puntos individuales
    getClusterExpansionZoom(clusterId: number): number {
        return this.supercluster.getClusterExpansionZoom(clusterId);
    }

    // Obtener las campañas de un cluster
    getClusterLeaves(clusterId: number, limit: number = 10, offset: number = 0): MapPoint[] {
        return this.supercluster.getLeaves(clusterId, limit, offset);
    }

    // Bounds por defecto para España
    static getSpainBounds(): MapBounds {
        return {
            northEast: { lat: 43.7, lng: 4.3 },
            southWest: { lat: 36.0, lng: -9.3 },
        };
    }

    // Obtener bounds para una ciudad específica
    static getCityBounds(city: string): MapBounds {
        const center = MapService.getCityCoordinates(city);
        const offset = 0.1; // Aproximadamente 11km

        return {
            northEast: { lat: center.lat + offset, lng: center.lng + offset },
            southWest: { lat: center.lat - offset, lng: center.lng - offset },
        };
    }

    // Calcular el centro de un conjunto de campañas
    static calculateCenter(campaigns: Campaign[]): { lat: number; lng: number } {
        if (campaigns.length === 0) {
            return MapService.getCityCoordinates('MADRID');
        }

        const sum = campaigns.reduce(
            (acc, campaign) => {
                const coords = campaign.coordinates || MapService.getCityCoordinates(campaign.city);
                return {
                    lat: acc.lat + coords.lat,
                    lng: acc.lng + coords.lng,
                };
            },
            { lat: 0, lng: 0 }
        );

        return {
            lat: sum.lat / campaigns.length,
            lng: sum.lng / campaigns.length,
        };
    }

    // Obtener el color del marcador según la categoría
    static getCategoryMarkerColor(category: string): string {
        const colorMap: { [key: string]: string } = {
            'restaurantes': '#FF6B6B',
            'movilidad': '#4ECDC4',
            'ropa': '#45B7D1',
            'eventos': '#96CEB4',
            'delivery': '#FFEAA7',
            'salud-belleza': '#DDA0DD',
            'alojamiento': '#98D8C8',
            'discotecas': '#F7DC6F',
        };
        return colorMap[category] || '#C9A961';
    }

    // Crear icono SVG para marcadores
    static createMarkerIcon(category: string, isSelected: boolean = false): string {
        const color = MapService.getCategoryMarkerColor(category);
        const strokeColor = isSelected ? '#C9A961' : '#FFFFFF';
        const strokeWidth = isSelected ? 3 : 2;

        return `
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
                <circle cx="16" cy="16" r="6" fill="#FFFFFF" opacity="0.8"/>
            </svg>
        `;
    }

    // Crear icono SVG para clusters
    static createClusterIcon(count: number, isSelected: boolean = false): string {
        const strokeColor = isSelected ? '#C9A961' : '#FFFFFF';
        const strokeWidth = isSelected ? 3 : 2;
        const size = Math.min(40 + Math.log(count) * 5, 60);

        return `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
                <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#C9A961" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
                <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="#000000" font-family="Inter" font-weight="600" font-size="12">${count}</text>
            </svg>
        `;
    }
}