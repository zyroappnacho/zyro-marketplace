/**
 * CategoriesService - Servicio para gestión de categorías
 * Permite a los administradores gestionar las categorías del selector deslizable
 * con sincronización en tiempo real y persistencia permanente
 */

import StorageService from './StorageService';
import EventBusService from './EventBusService';

// Eventos para sincronización en tiempo real
export const CATEGORIES_EVENTS = {
    CATEGORIES_UPDATED: 'categories_updated',
    CATEGORY_ADDED: 'category_added',
    CATEGORY_DELETED: 'category_deleted',
    CATEGORY_UPDATED: 'category_updated'
};

class CategoriesService {
    constructor() {
        this.storageKey = 'zyro_categories';
        this.defaultCategories = [
            { id: 1, name: 'restaurantes', isActive: true, createdAt: new Date().toISOString() },
            { id: 2, name: 'movilidad', isActive: true, createdAt: new Date().toISOString() },
            { id: 3, name: 'ropa', isActive: true, createdAt: new Date().toISOString() },
            { id: 4, name: 'eventos', isActive: true, createdAt: new Date().toISOString() },
            { id: 5, name: 'delivery', isActive: true, createdAt: new Date().toISOString() },
            { id: 6, name: 'salud-belleza', isActive: true, createdAt: new Date().toISOString() },
            { id: 7, name: 'alojamiento', isActive: true, createdAt: new Date().toISOString() },
            { id: 8, name: 'discotecas', isActive: true, createdAt: new Date().toISOString() }
        ];
    }

    /**
     * Inicializar categorías por defecto si no existen
     */
    async initializeCategories() {
        try {
            console.log('🏷️ [CategoriesService] Inicializando categorías...');
            
            const existingCategories = await StorageService.getData(this.storageKey);
            
            if (!existingCategories || existingCategories.length === 0) {
                console.log('🏷️ [CategoriesService] No hay categorías, creando por defecto...');
                await StorageService.saveData(this.storageKey, this.defaultCategories);
                console.log('✅ [CategoriesService] Categorías por defecto creadas');
                return this.defaultCategories;
            }
            
            console.log('✅ [CategoriesService] Categorías existentes cargadas:', existingCategories.length);
            return existingCategories;
        } catch (error) {
            console.error('❌ [CategoriesService] Error inicializando categorías:', error);
            return this.defaultCategories;
        }
    }

    /**
     * Obtener todas las categorías
     */
    async getAllCategories() {
        try {
            console.log('🏷️ [CategoriesService] Obteniendo todas las categorías...');
            
            const categories = await StorageService.getData(this.storageKey);
            
            if (!categories || categories.length === 0) {
                console.log('🏷️ [CategoriesService] No hay categorías, inicializando...');
                return await this.initializeCategories();
            }
            
            // Ordenar por nombre
            const sortedCategories = categories.sort((a, b) => a.name.localeCompare(b.name));
            
            console.log('✅ [CategoriesService] Categorías obtenidas:', sortedCategories.length);
            return sortedCategories;
        } catch (error) {
            console.error('❌ [CategoriesService] Error obteniendo categorías:', error);
            return this.defaultCategories;
        }
    }

    /**
     * Obtener solo categorías activas (para el selector de influencers)
     */
    async getActiveCategories() {
        try {
            const allCategories = await this.getAllCategories();
            const activeCategories = allCategories.filter(category => category.isActive);
            
            console.log('✅ [CategoriesService] Categorías activas:', activeCategories.length);
            return activeCategories;
        } catch (error) {
            console.error('❌ [CategoriesService] Error obteniendo categorías activas:', error);
            return this.defaultCategories.filter(cat => cat.isActive);
        }
    }

    /**
     * Obtener categorías como array de strings (compatibilidad con código existente)
     */
    async getCategoriesAsStringArray() {
        try {
            const activeCategories = await this.getActiveCategories();
            return activeCategories.map(category => category.name);
        } catch (error) {
            console.error('❌ [CategoriesService] Error obteniendo categorías como array:', error);
            return this.defaultCategories.map(cat => cat.name);
        }
    }

    /**
     * Añadir nueva categoría
     */
    async addCategory(categoryName) {
        try {
            console.log('🏷️ [CategoriesService] Añadiendo categoría:', categoryName);
            
            if (!categoryName || !categoryName.trim()) {
                return { success: false, message: 'El nombre de la categoría es requerido' };
            }

            const trimmedName = categoryName.trim().toLowerCase();
            const categories = await this.getAllCategories();
            
            // Verificar si ya existe
            const existingCategory = categories.find(cat => 
                cat.name.toLowerCase() === trimmedName
            );
            
            if (existingCategory) {
                return { success: false, message: 'Esta categoría ya existe' };
            }

            // Crear nueva categoría
            const newCategory = {
                id: Date.now(),
                name: trimmedName,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const updatedCategories = [...categories, newCategory];
            await StorageService.saveData(this.storageKey, updatedCategories);

            console.log('✅ [CategoriesService] Categoría añadida exitosamente');

            // Emitir eventos para sincronización en tiempo real
            EventBusService.emit(CATEGORIES_EVENTS.CATEGORY_ADDED, newCategory);
            EventBusService.emit(CATEGORIES_EVENTS.CATEGORIES_UPDATED, updatedCategories);

            return { 
                success: true, 
                message: 'Categoría añadida exitosamente',
                category: newCategory
            };
        } catch (error) {
            console.error('❌ [CategoriesService] Error añadiendo categoría:', error);
            return { success: false, message: 'Error al añadir la categoría' };
        }
    }

    /**
     * Actualizar categoría existente
     */
    async updateCategory(categoryId, updates) {
        try {
            console.log('🏷️ [CategoriesService] Actualizando categoría:', categoryId);
            
            const categories = await this.getAllCategories();
            const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
            
            if (categoryIndex === -1) {
                return { success: false, message: 'Categoría no encontrada' };
            }

            // Verificar nombre duplicado si se está cambiando el nombre
            if (updates.name) {
                const trimmedName = updates.name.trim().toLowerCase();
                const existingCategory = categories.find(cat => 
                    cat.name.toLowerCase() === trimmedName && cat.id !== categoryId
                );
                
                if (existingCategory) {
                    return { success: false, message: 'Ya existe una categoría con ese nombre' };
                }
            }

            // Actualizar categoría
            const updatedCategory = {
                ...categories[categoryIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            categories[categoryIndex] = updatedCategory;
            await StorageService.saveData(this.storageKey, categories);

            console.log('✅ [CategoriesService] Categoría actualizada exitosamente');

            // Emitir eventos para sincronización en tiempo real
            EventBusService.emit(CATEGORIES_EVENTS.CATEGORY_UPDATED, updatedCategory);
            EventBusService.emit(CATEGORIES_EVENTS.CATEGORIES_UPDATED, categories);

            return { 
                success: true, 
                message: 'Categoría actualizada exitosamente',
                category: updatedCategory
            };
        } catch (error) {
            console.error('❌ [CategoriesService] Error actualizando categoría:', error);
            return { success: false, message: 'Error al actualizar la categoría' };
        }
    }

    /**
     * Eliminar categoría
     */
    async deleteCategory(categoryId) {
        try {
            console.log('🏷️ [CategoriesService] Eliminando categoría:', categoryId);
            
            const categories = await this.getAllCategories();
            const categoryToDelete = categories.find(cat => cat.id === categoryId);
            
            if (!categoryToDelete) {
                return { success: false, message: 'Categoría no encontrada' };
            }

            // Filtrar la categoría a eliminar
            const updatedCategories = categories.filter(cat => cat.id !== categoryId);
            await StorageService.saveData(this.storageKey, updatedCategories);

            console.log('✅ [CategoriesService] Categoría eliminada exitosamente');

            // Emitir eventos para sincronización en tiempo real
            EventBusService.emit(CATEGORIES_EVENTS.CATEGORY_DELETED, categoryToDelete);
            EventBusService.emit(CATEGORIES_EVENTS.CATEGORIES_UPDATED, updatedCategories);

            return { 
                success: true, 
                message: 'Categoría eliminada exitosamente',
                deletedCategory: categoryToDelete
            };
        } catch (error) {
            console.error('❌ [CategoriesService] Error eliminando categoría:', error);
            return { success: false, message: 'Error al eliminar la categoría' };
        }
    }

    /**
     * Cambiar estado activo/inactivo de una categoría
     */
    async toggleCategoryStatus(categoryId, isActive) {
        try {
            console.log('🏷️ [CategoriesService] Cambiando estado de categoría:', categoryId, 'a', isActive);
            
            return await this.updateCategory(categoryId, { isActive });
        } catch (error) {
            console.error('❌ [CategoriesService] Error cambiando estado de categoría:', error);
            return { success: false, message: 'Error al cambiar el estado de la categoría' };
        }
    }

    /**
     * Obtener estadísticas de categorías
     */
    async getCategoriesStats() {
        try {
            const categories = await this.getAllCategories();
            
            return {
                total: categories.length,
                active: categories.filter(cat => cat.isActive).length,
                inactive: categories.filter(cat => !cat.isActive).length
            };
        } catch (error) {
            console.error('❌ [CategoriesService] Error obteniendo estadísticas:', error);
            return { total: 0, active: 0, inactive: 0 };
        }
    }

    /**
     * Resetear a categorías por defecto
     */
    async resetToDefaultCategories() {
        try {
            console.log('🏷️ [CategoriesService] Reseteando a categorías por defecto...');
            
            await StorageService.saveData(this.storageKey, this.defaultCategories);
            
            console.log('✅ [CategoriesService] Categorías reseteadas exitosamente');

            // Emitir evento de actualización
            EventBusService.emit(CATEGORIES_EVENTS.CATEGORIES_UPDATED, this.defaultCategories);

            return { 
                success: true, 
                message: 'Categorías reseteadas a valores por defecto',
                categories: this.defaultCategories
            };
        } catch (error) {
            console.error('❌ [CategoriesService] Error reseteando categorías:', error);
            return { success: false, message: 'Error al resetear las categorías' };
        }
    }
}

export default new CategoriesService();