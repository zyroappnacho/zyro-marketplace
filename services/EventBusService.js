/**
 * EventBusService - Sistema de eventos para sincronización en tiempo real
 * Permite comunicación entre componentes para actualizaciones inmediatas
 */

class EventBusService {
    constructor() {
        this.listeners = {};
        console.log('🔄 [EventBusService] Inicializado');
    }

    /**
     * Suscribirse a un evento
     * @param {string} eventName - Nombre del evento
     * @param {function} callback - Función a ejecutar cuando ocurra el evento
     * @returns {function} Función para desuscribirse
     */
    subscribe(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        
        this.listeners[eventName].push(callback);
        console.log(`📡 [EventBusService] Suscrito a evento: ${eventName}`);
        
        // Retornar función de desuscripción
        return () => {
            this.unsubscribe(eventName, callback);
        };
    }

    /**
     * Desuscribirse de un evento
     * @param {string} eventName - Nombre del evento
     * @param {function} callback - Función a remover
     */
    unsubscribe(eventName, callback) {
        if (this.listeners[eventName]) {
            this.listeners[eventName] = this.listeners[eventName].filter(
                listener => listener !== callback
            );
            console.log(`📡 [EventBusService] Desuscrito de evento: ${eventName}`);
        }
    }

    /**
     * Emitir un evento
     * @param {string} eventName - Nombre del evento
     * @param {*} data - Datos a enviar con el evento
     */
    emit(eventName, data) {
        console.log(`🚀 [EventBusService] Emitiendo evento: ${eventName}`, data);
        
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ [EventBusService] Error en callback para evento ${eventName}:`, error);
                }
            });
        }
    }

    /**
     * Obtener número de listeners para un evento
     * @param {string} eventName - Nombre del evento
     * @returns {number} Número de listeners
     */
    getListenerCount(eventName) {
        return this.listeners[eventName] ? this.listeners[eventName].length : 0;
    }

    /**
     * Limpiar todos los listeners
     */
    clear() {
        this.listeners = {};
        console.log('🧹 [EventBusService] Todos los listeners limpiados');
    }

    /**
     * Obtener todos los eventos registrados
     * @returns {Array} Lista de nombres de eventos
     */
    getRegisteredEvents() {
        return Object.keys(this.listeners);
    }
}

// Crear instancia singleton
const eventBus = new EventBusService();

// Eventos predefinidos para el sistema de ciudades
export const CITIES_EVENTS = {
    CITIES_UPDATED: 'cities_updated',
    CITY_ADDED: 'city_added',
    CITY_DELETED: 'city_deleted',
    CITY_STATUS_CHANGED: 'city_status_changed',
    CITIES_RESET: 'cities_reset'
};

export default eventBus;