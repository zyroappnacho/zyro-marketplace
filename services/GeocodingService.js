class GeocodingService {
    // Geocoding service using multiple providers for better accuracy
    
    // Primary geocoding using Nominatim (OpenStreetMap) - Free service
    static async geocodeAddress(address) {
        if (!address || address.trim() === '') {
            throw new Error('Dirección no válida');
        }

        try {
            // Try Nominatim first (free and reliable)
            const nominatimResult = await this.geocodeWithNominatim(address);
            if (nominatimResult) {
                return nominatimResult;
            }

            // Fallback to manual coordinate extraction if available
            const manualResult = this.extractCoordinatesFromText(address);
            if (manualResult) {
                return manualResult;
            }

            // If all fails, return default Madrid coordinates with warning
            console.warn('Geocoding failed, using default coordinates for Madrid');
            return {
                latitude: 40.4168,
                longitude: -3.7038,
                formatted_address: address,
                accuracy: 'default',
                source: 'fallback'
            };

        } catch (error) {
            console.error('Geocoding error:', error);
            throw new Error('No se pudo geocodificar la dirección');
        }
    }

    // Nominatim geocoding (OpenStreetMap)
    static async geocodeWithNominatim(address) {
        try {
            const encodedAddress = encodeURIComponent(address);
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'ZyroMarketplace/1.0'
                }
            });

            if (!response.ok) {
                throw new Error('Nominatim API error');
            }

            const data = await response.json();
            
            if (data && data.length > 0) {
                const result = data[0];
                return {
                    latitude: parseFloat(result.lat),
                    longitude: parseFloat(result.lon),
                    formatted_address: result.display_name,
                    accuracy: 'high',
                    source: 'nominatim',
                    place_id: result.place_id,
                    address_components: result.address
                };
            }

            return null;
        } catch (error) {
            console.error('Nominatim geocoding error:', error);
            return null;
        }
    }

    // Extract coordinates if they're manually provided in the address
    static extractCoordinatesFromText(address) {
        // Look for patterns like "40.4168, -3.7038" or "lat: 40.4168, lng: -3.7038"
        const coordPatterns = [
            /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
            /lat:\s*(-?\d+\.?\d*),?\s*lng?:\s*(-?\d+\.?\d*)/i,
            /latitude:\s*(-?\d+\.?\d*),?\s*longitude:\s*(-?\d+\.?\d*)/i
        ];

        for (const pattern of coordPatterns) {
            const match = address.match(pattern);
            if (match) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                
                // Validate coordinates
                if (this.isValidCoordinate(lat, lng)) {
                    return {
                        latitude: lat,
                        longitude: lng,
                        formatted_address: address,
                        accuracy: 'manual',
                        source: 'manual_coordinates'
                    };
                }
            }
        }

        return null;
    }

    // Validate if coordinates are within reasonable bounds
    static isValidCoordinate(lat, lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

    // Reverse geocoding - get address from coordinates
    static async reverseGeocode(latitude, longitude) {
        try {
            if (!this.isValidCoordinate(latitude, longitude)) {
                throw new Error('Coordenadas no válidas');
            }

            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'ZyroMarketplace/1.0'
                }
            });

            if (!response.ok) {
                throw new Error('Reverse geocoding API error');
            }

            const data = await response.json();
            
            if (data && data.display_name) {
                return {
                    address: data.display_name,
                    components: data.address,
                    accuracy: 'high',
                    source: 'nominatim'
                };
            }

            return null;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
        }
    }

    // Get coordinates for Spanish cities (fallback for common cities)
    static getSpanishCityCoordinates(cityName) {
        const spanishCities = {
            'madrid': { latitude: 40.4168, longitude: -3.7038 },
            'barcelona': { latitude: 41.3851, longitude: 2.1734 },
            'valencia': { latitude: 39.4699, longitude: -0.3763 },
            'sevilla': { latitude: 37.3891, longitude: -5.9845 },
            'bilbao': { latitude: 43.2627, longitude: -2.9253 },
            'málaga': { latitude: 36.7213, longitude: -4.4214 },
            'zaragoza': { latitude: 41.6488, longitude: -0.8891 },
            'murcia': { latitude: 37.9922, longitude: -1.1307 },
            'palma': { latitude: 39.5696, longitude: 2.6502 },
            'las palmas': { latitude: 28.1248, longitude: -15.4300 },
            'córdoba': { latitude: 37.8882, longitude: -4.7794 },
            'valladolid': { latitude: 41.6523, longitude: -4.7245 },
            'vigo': { latitude: 42.2406, longitude: -8.7207 },
            'gijón': { latitude: 43.5322, longitude: -5.6611 },
            'alicante': { latitude: 38.3452, longitude: -0.4810 }
        };

        const normalizedCity = cityName.toLowerCase().trim();
        return spanishCities[normalizedCity] || null;
    }

    // Enhanced geocoding with city fallback
    static async geocodeWithCityFallback(address, city) {
        try {
            // First try to geocode the full address
            const result = await this.geocodeAddress(address);
            
            // If we got default coordinates and we have a city, try city coordinates
            if (result.accuracy === 'default' && city) {
                const cityCoords = this.getSpanishCityCoordinates(city);
                if (cityCoords) {
                    return {
                        ...cityCoords,
                        formatted_address: `${address}, ${city}`,
                        accuracy: 'city',
                        source: 'spanish_cities'
                    };
                }
            }

            return result;
        } catch (error) {
            // If geocoding fails completely, try city coordinates
            if (city) {
                const cityCoords = this.getSpanishCityCoordinates(city);
                if (cityCoords) {
                    return {
                        ...cityCoords,
                        formatted_address: `${address}, ${city}`,
                        accuracy: 'city',
                        source: 'spanish_cities_fallback'
                    };
                }
            }
            
            throw error;
        }
    }

    // Validate and format address for better geocoding
    static formatAddressForGeocoding(address, city, country = 'España') {
        let formattedAddress = address.trim();
        
        // Add city if not already included
        if (city && !formattedAddress.toLowerCase().includes(city.toLowerCase())) {
            formattedAddress += `, ${city}`;
        }
        
        // Add country if not already included
        if (!formattedAddress.toLowerCase().includes('españa') && 
            !formattedAddress.toLowerCase().includes('spain')) {
            formattedAddress += `, ${country}`;
        }
        
        return formattedAddress;
    }

    // Batch geocoding for multiple addresses
    static async geocodeMultipleAddresses(addresses) {
        const results = [];
        
        for (const addressData of addresses) {
            try {
                // Add delay to respect API rate limits
                if (results.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                const result = await this.geocodeWithCityFallback(
                    addressData.address, 
                    addressData.city
                );
                
                results.push({
                    ...addressData,
                    coordinates: result,
                    success: true
                });
            } catch (error) {
                results.push({
                    ...addressData,
                    error: error.message,
                    success: false
                });
            }
        }
        
        return results;
    }

    // Calculate distance between two coordinates (in kilometers)
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}

export default GeocodingService;