/**
 * CitiesService - Servicio para gestionar las ciudades disponibles en la plataforma
 * Permite al administrador añadir, editar y eliminar ciudades que aparecen en el selector de influencers
 */

import StorageService from './StorageService';
import EventBusService, { CITIES_EVENTS } from './EventBusService';

class CitiesService {
    constructor() {
        this.STORAGE_KEY = 'zyro_cities_list';
        this.DEFAULT_CITIES = [
            { id: 1, name: 'Madrid', isActive: true, createdAt: new Date().toISOString() },
            { id: 2, name: 'Barcelona', isActive: true, createdAt: new Date().toISOString() },
            { id: 3, name: 'Valencia', isActive: true, createdAt: new Date().toISOString() },
            { id: 4, name: 'Sevilla', isActive: true, createdAt: new Date().toISOString() },
            { id: 5, name: 'Bilbao', isActive: true, createdAt: new Date().toISOString() },
            { id: 6, name: 'Málaga', isActive: true, createdAt: new Date().toISOString() },
            { id: 7, name: 'Zaragoza', isActive: true, createdAt: new Date().toISOString() },
            { id: 8, name: 'Murcia', isActive: true, createdAt: new Date().toISOString() },
            { id: 9, name: 'Palma', isActive: true, createdAt: new Date().toISOString() },
            { id: 10, name: 'Las Palmas', isActive: true, createdAt: new Date().toISOString() }
        ];
    }

    /**
     * Obtiene todas las ciudades (activas e inactivas)
     * @returns {Promise<Array>} Lista de todas las ciudades
     */
    async getAllCities() {
        try {
            console.log('🏙️ [CitiesService] Obteniendo todas las ciudades...');
            
            let cities = await StorageService.getData(this.STORAGE_KEY);
            
            if (!cities || cities.length === 0) {
                console.log('🏙️ [CitiesService] No hay ciudades guardadas, usando ciudades por defecto');
                cities = this.DEFAULT_CITIES;
                await this.saveCities(cities);
            }
            
            console.log('🏙️ [CitiesService] Ciudades obtenidas:', cities.length);
            return cities;
        } catch (error) {
            console.error('❌ [CitiesService] Error obteniendo ciudades:', error);
            return this.DEFAULT_CITIES;
        }
    }

    /**
     * Obtiene solo las ciudades activas (para el selector de influencers)
     * @returns {Promise<Array>} Lista de ciudades activas
     */
    async getActiveCities() {
        try {
            console.log('🏙️ [CitiesService] Obteniendo ciudades activas...');
            
            const allCities = await this.getAllCities();
            const activeCities = allCities.filter(city => city.isActive);
            
            console.log('🏙️ [CitiesService] Ciudades activas:', activeCities.length);
            return activeCities;
        } catch (error) {
            console.error('❌ [CitiesService] Error obteniendo ciudades activas:', error);
            return this.DEFAULT_CITIES.filter(city => city.isActive);
        }
    }

    /**
     * Obtiene los nombres de las ciudades activas (para compatibilidad con el selector existente)
     * @returns {Promise<Array>} Array de nombres de ciudades activas
     */
    async getActiveCityNames() {
        try {
            const activeCities = await this.getActiveCities();
            const cityNames = activeCities.map(city => city.name);
            
            console.log('🏙️ [CitiesService] Nombres de ciudades activas:', cityNames);
            return cityNames;
        } catch (error) {
            console.error('❌ [CitiesService] Error obteniendo nombres de ciudades:', error);
            return this.DEFAULT_CITIES.filter(city => city.isActive).map(city => city.name);
        }
    }

    /**
     * Guarda la lista completa de ciudades
     * @param {Array} cities - Lista de ciudades a guardar
     * @returns {Promise<boolean>} True si se guardó correctamente
     */
    async saveCities(cities) {
        try {
            console.log('🏙️ [CitiesService] Guardando ciudades:', cities.length);
            
            const result = await StorageService.saveData(this.STORAGE_KEY, cities);
            
            if (result) {
                // Verificar que los datos se guardaron correctamente
                const verification = await StorageService.getData(this.STORAGE_KEY);
                if (verification && verification.length === cities.length) {
                    console.log('✅ [CitiesService] Ciudades guardadas y verificadas correctamente');
                    return true;
                } else {
                    console.error('❌ [CitiesService] Error en verificación de guardado');
                    return false;
                }
            } else {
                console.error('❌ [CitiesService] Error guardando ciudades');
                return false;
            }
        } catch (error) {
            console.error('❌ [CitiesService] Error guardando ciudades:', error);
            return false;
        }
    }

    /**
     * Añade una nueva ciudad
     * @param {string} cityName - Nombre de la ciudad a añadir
     * @returns {Promise<Object>} Resultado de la operación
     */
    async addCity(cityName) {
        try {
            console.log('🏙️ [CitiesService] Añadiendo nueva ciudad:', cityName);
            
            if (!cityName || cityName.trim() === '') {
                return { success: false, message: 'El nombre de la ciudad es requerido' };
            }

            const cities = await this.getAllCities();
            
            // Verificar si la ciudad ya existe
            const existingCity = cities.find(city => 
                city.name.toLowerCase() === cityName.trim().toLowerCase()
            );
            
            if (existingCity) {
                return { success: false, message: 'Esta ciudad ya existe' };
            }

            // Crear nueva ciudad
            const newCity = {
                id: Date.now(),
                name: cityName.trim(),
                isActive: true,
                createdAt: new Date().toISOString()
            };

            cities.push(newCity);
            
            const saved = await this.saveCities(cities);
            
            if (saved) {
                console.log('✅ [CitiesService] Ciudad añadida correctamente:', newCity.name);
                
                // Emitir evento de ciudad añadida
                EventBusService.emit(CITIES_EVENTS.CITY_ADDED, {
                    city: newCity,
                    allCities: cities
                });
                
                // Emitir evento general de ciudades actualizadas
                EventBusService.emit(CITIES_EVENTS.CITIES_UPDATED, {
                    cities: cities,
                    activeCities: cities.filter(c => c.isActive)
                });
                
                return { success: true, city: newCity, message: 'Ciudad añadida correctamente' };
            } else {
                return { success: false, message: 'Error guardando la ciudad' };
            }
        } catch (error) {
            console.error('❌ [CitiesService] Error añadiendo ciudad:', error);
            return { success: false, message: 'Error interno añadiendo ciudad' };
        }
    }

    /**
     * Actualiza una ciudad existente
     * @param {number} cityId - ID de la ciudad a actualizar
     * @param {Object} updates - Datos a actualizar
     * @returns {Promise<Object>} Resultado de la operación
     */
    async updateCity(cityId, updates) {
        try {
            console.log('🏙️ [CitiesService] Actualizando ciudad:', cityId, updates);
            
            const cities = await this.getAllCities();
            const cityIndex = cities.findIndex(city => city.id === cityId);
            
            if (cityIndex === -1) {
                return { success: false, message: 'Ciudad no encontrada' };
            }

            // Actualizar ciudad
            cities[cityIndex] = {
                ...cities[cityIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            const saved = await this.saveCities(cities);
            
            if (saved) {
                console.log('✅ [CitiesService] Ciudad actualizada correctamente');
                
                // Emitir evento general de ciudades actualizadas
                EventBusService.emit(CITIES_EVENTS.CITIES_UPDATED, {
                    cities: cities,
                    activeCities: cities.filter(c => c.isActive)
                });
                
                return { success: true, city: cities[cityIndex], message: 'Ciudad actualizada correctamente' };
            } else {
                return { success: false, message: 'Error guardando los cambios' };
            }
        } catch (error) {
            console.error('❌ [CitiesService] Error actualizando ciudad:', error);
            return { success: false, message: 'Error interno actualizando ciudad' };
        }
    }

    /**
     * Elimina una ciudad
     * @param {number} cityId - ID de la ciudad a eliminar
     * @returns {Promise<Object>} Resultado de la operación
     */
    async deleteCity(cityId) {
        try {
            console.log('🏙️ [CitiesService] Eliminando ciudad:', cityId);
            
            const cities = await this.getAllCities();
            const cityIndex = cities.findIndex(city => city.id === cityId);
            
            if (cityIndex === -1) {
                return { success: false, message: 'Ciudad no encontrada' };
            }

            const cityName = cities[cityIndex].name;
            cities.splice(cityIndex, 1);

            const saved = await this.saveCities(cities);
            
            if (saved) {
                console.log('✅ [CitiesService] Ciudad eliminada correctamente:', cityName);
                
                // Emitir evento de ciudad eliminada
                EventBusService.emit(CITIES_EVENTS.CITY_DELETED, {
                    cityId: cityId,
                    cityName: cityName,
                    allCities: cities
                });
                
                // Emitir evento general de ciudades actualizadas
                EventBusService.emit(CITIES_EVENTS.CITIES_UPDATED, {
                    cities: cities,
                    activeCities: cities.filter(c => c.isActive)
                });
                
                return { success: true, message: `Ciudad "${cityName}" eliminada correctamente` };
            } else {
                return { success: false, message: 'Error guardando los cambios' };
            }
        } catch (error) {
            console.error('❌ [CitiesService] Error eliminando ciudad:', error);
            return { success: false, message: 'Error interno eliminando ciudad' };
        }
    }

    /**
     * Activa o desactiva una ciudad
     * @param {number} cityId - ID de la ciudad
     * @param {boolean} isActive - Estado activo/inactivo
     * @returns {Promise<Object>} Resultado de la operación
     */
    async toggleCityStatus(cityId, isActive) {
        try {
            console.log('🏙️ [CitiesService] Cambiando estado de ciudad:', cityId, isActive);
            
            const result = await this.updateCity(cityId, { isActive });
            
            if (result.success) {
                // Emitir evento específico de cambio de estado
                EventBusService.emit(CITIES_EVENTS.CITY_STATUS_CHANGED, {
                    cityId: cityId,
                    isActive: isActive,
                    city: result.city
                });
            }
            
            return result;
        } catch (error) {
            console.error('❌ [CitiesService] Error cambiando estado de ciudad:', error);
            return { success: false, message: 'Error cambiando estado de ciudad' };
        }
    }

    /**
     * Resetea las ciudades a los valores por defecto
     * @returns {Promise<Object>} Resultado de la operación
     */
    async resetToDefault() {
        try {
            console.log('🏙️ [CitiesService] Reseteando ciudades a valores por defecto...');
            
            const saved = await this.saveCities(this.DEFAULT_CITIES);
            
            if (saved) {
                console.log('✅ [CitiesService] Ciudades reseteadas correctamente');
                
                // Emitir evento de reset de ciudades
                EventBusService.emit(CITIES_EVENTS.CITIES_RESET, {
                    cities: this.DEFAULT_CITIES,
                    activeCities: this.DEFAULT_CITIES.filter(c => c.isActive)
                });
                
                // Emitir evento general de ciudades actualizadas
                EventBusService.emit(CITIES_EVENTS.CITIES_UPDATED, {
                    cities: this.DEFAULT_CITIES,
                    activeCities: this.DEFAULT_CITIES.filter(c => c.isActive)
                });
                
                return { success: true, message: 'Ciudades reseteadas a valores por defecto' };
            } else {
                return { success: false, message: 'Error reseteando ciudades' };
            }
        } catch (error) {
            console.error('❌ [CitiesService] Error reseteando ciudades:', error);
            return { success: false, message: 'Error interno reseteando ciudades' };
        }
    }

    /**
     * Obtiene estadísticas de las ciudades
     * @returns {Promise<Object>} Estadísticas de ciudades
     */
    async getCitiesStats() {
        try {
            const cities = await this.getAllCities();
            const activeCities = cities.filter(city => city.isActive);
            const inactiveCities = cities.filter(city => !city.isActive);
            
            return {
                total: cities.length,
                active: activeCities.length,
                inactive: inactiveCities.length,
                cities: cities
            };
        } catch (error) {
            console.error('❌ [CitiesService] Error obteniendo estadísticas:', error);
            return {
                total: 0,
                active: 0,
                inactive: 0,
                cities: []
            };
        }
    }
}

export default new CitiesService();