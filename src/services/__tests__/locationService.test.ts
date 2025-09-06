import { LocationService } from '../locationService';
import { CampaignCategory } from '../../types';

describe('LocationService', () => {
  beforeEach(() => {
    // Reset the service to default state before each test
    // Since LocationService uses static properties, we need to be careful about state
    jest.clearAllMocks();
  });

  describe('City Management', () => {
    describe('getEnabledCities', () => {
      it('should return only enabled cities', () => {
        const enabledCities = LocationService.getEnabledCities();
        
        expect(enabledCities.length).toBeGreaterThan(0);
        enabledCities.forEach(city => {
          expect(city.isEnabled).toBe(true);
        });
      });

      it('should include default enabled cities', () => {
        const enabledCities = LocationService.getEnabledCities();
        const cityNames = enabledCities.map(city => city.name);
        
        expect(cityNames).toContain('MADRID');
        expect(cityNames).toContain('BARCELONA');
        expect(cityNames).toContain('VALENCIA');
      });
    });

    describe('getAllCities', () => {
      it('should return all cities including disabled ones', () => {
        const allCities = LocationService.getAllCities();
        const enabledCities = LocationService.getEnabledCities();
        
        expect(allCities.length).toBeGreaterThanOrEqual(enabledCities.length);
      });

      it('should include both enabled and disabled cities', () => {
        const allCities = LocationService.getAllCities();
        const hasEnabled = allCities.some(city => city.isEnabled);
        const hasDisabled = allCities.some(city => !city.isEnabled);
        
        expect(hasEnabled).toBe(true);
        expect(hasDisabled).toBe(true);
      });
    });

    describe('isCityEnabled', () => {
      it('should return true for enabled cities', () => {
        expect(LocationService.isCityEnabled('MADRID')).toBe(true);
        expect(LocationService.isCityEnabled('madrid')).toBe(true); // case insensitive
      });

      it('should return false for disabled cities', () => {
        expect(LocationService.isCityEnabled('MURCIA')).toBe(false);
        expect(LocationService.isCityEnabled('murcia')).toBe(false);
      });

      it('should return false for non-existent cities', () => {
        expect(LocationService.isCityEnabled('NON_EXISTENT')).toBe(false);
      });
    });

    describe('getCityCoordinates', () => {
      it('should return coordinates for existing cities', () => {
        const coordinates = LocationService.getCityCoordinates('MADRID');
        
        expect(coordinates).toBeDefined();
        expect(coordinates?.lat).toBe(40.4168);
        expect(coordinates?.lng).toBe(-3.7038);
      });

      it('should be case insensitive', () => {
        const coordinates = LocationService.getCityCoordinates('madrid');
        
        expect(coordinates).toBeDefined();
        expect(coordinates?.lat).toBe(40.4168);
      });

      it('should return null for non-existent cities', () => {
        const coordinates = LocationService.getCityCoordinates('NON_EXISTENT');
        
        expect(coordinates).toBeNull();
      });
    });

    describe('toggleCityStatus', () => {
      it('should enable a disabled city', () => {
        const result = LocationService.toggleCityStatus('murcia', true);
        
        expect(result).toBe(true);
        expect(LocationService.isCityEnabled('MURCIA')).toBe(true);
      });

      it('should disable an enabled city', () => {
        const result = LocationService.toggleCityStatus('madrid', false);
        
        expect(result).toBe(true);
        expect(LocationService.isCityEnabled('MADRID')).toBe(false);
        
        // Re-enable for other tests
        LocationService.toggleCityStatus('madrid', true);
      });

      it('should return false for non-existent city', () => {
        const result = LocationService.toggleCityStatus('non_existent', true);
        
        expect(result).toBe(false);
      });
    });

    describe('addCity', () => {
      it('should add a new city', () => {
        const newCityData = {
          name: 'TOLEDO',
          isEnabled: true,
          coordinates: { lat: 39.8628, lng: -4.0273 },
        };

        const newCity = LocationService.addCity(newCityData);
        
        expect(newCity.id).toBe('toledo');
        expect(newCity.name).toBe('TOLEDO');
        expect(newCity.isEnabled).toBe(true);
        expect(newCity.createdAt).toBeInstanceOf(Date);
        expect(newCity.updatedAt).toBeInstanceOf(Date);
        
        // Verify it's in the list
        const allCities = LocationService.getAllCities();
        const addedCity = allCities.find(city => city.id === 'toledo');
        expect(addedCity).toBeDefined();
      });

      it('should generate correct ID from name', () => {
        const newCityData = {
          name: 'SAN SEBASTIAN',
          isEnabled: true,
          coordinates: { lat: 43.3183, lng: -1.9812 },
        };

        const newCity = LocationService.addCity(newCityData);
        
        expect(newCity.id).toBe('san-sebastian');
      });
    });
  });

  describe('Category Management', () => {
    describe('getEnabledCategories', () => {
      it('should return only enabled categories', () => {
        const enabledCategories = LocationService.getEnabledCategories();
        
        expect(enabledCategories.length).toBeGreaterThan(0);
        enabledCategories.forEach(category => {
          expect(category.isEnabled).toBe(true);
        });
      });

      it('should return categories in order', () => {
        const enabledCategories = LocationService.getEnabledCategories();
        
        for (let i = 1; i < enabledCategories.length; i++) {
          expect(enabledCategories[i].order).toBeGreaterThanOrEqual(enabledCategories[i - 1].order);
        }
      });

      it('should include default categories', () => {
        const enabledCategories = LocationService.getEnabledCategories();
        const categoryIds = enabledCategories.map(cat => cat.id);
        
        expect(categoryIds).toContain('restaurantes');
        expect(categoryIds).toContain('movilidad');
        expect(categoryIds).toContain('ropa');
      });
    });

    describe('getAllCategories', () => {
      it('should return all categories in order', () => {
        const allCategories = LocationService.getAllCategories();
        
        for (let i = 1; i < allCategories.length; i++) {
          expect(allCategories[i].order).toBeGreaterThanOrEqual(allCategories[i - 1].order);
        }
      });
    });

    describe('getCategoryDisplayName', () => {
      it('should return correct display names', () => {
        expect(LocationService.getCategoryDisplayName('restaurantes')).toBe('RESTAURANTES');
        expect(LocationService.getCategoryDisplayName('salud-belleza')).toBe('SALUD Y BELLEZA');
        expect(LocationService.getCategoryDisplayName('discotecas')).toBe('DISCOTECAS');
      });

      it('should return uppercase category ID for unknown categories', () => {
        const unknownCategory = 'unknown' as CampaignCategory;
        expect(LocationService.getCategoryDisplayName(unknownCategory)).toBe('UNKNOWN');
      });
    });

    describe('getCategoryIcon', () => {
      it('should return correct icons', () => {
        expect(LocationService.getCategoryIcon('restaurantes')).toBe('restaurant');
        expect(LocationService.getCategoryIcon('movilidad')).toBe('directions-car');
        expect(LocationService.getCategoryIcon('salud-belleza')).toBe('spa');
      });

      it('should return default icon for unknown categories', () => {
        const unknownCategory = 'unknown' as CampaignCategory;
        expect(LocationService.getCategoryIcon(unknownCategory)).toBe('category');
      });
    });

    describe('isCategoryEnabled', () => {
      it('should return true for enabled categories', () => {
        expect(LocationService.isCategoryEnabled('restaurantes')).toBe(true);
        expect(LocationService.isCategoryEnabled('movilidad')).toBe(true);
      });

      it('should return false for unknown categories', () => {
        const unknownCategory = 'unknown' as CampaignCategory;
        expect(LocationService.isCategoryEnabled(unknownCategory)).toBe(false);
      });
    });

    describe('toggleCategoryStatus', () => {
      it('should disable an enabled category', () => {
        const result = LocationService.toggleCategoryStatus('restaurantes', false);
        
        expect(result).toBe(true);
        expect(LocationService.isCategoryEnabled('restaurantes')).toBe(false);
        
        // Re-enable for other tests
        LocationService.toggleCategoryStatus('restaurantes', true);
      });

      it('should enable a disabled category', () => {
        // First disable it
        LocationService.toggleCategoryStatus('ropa', false);
        
        const result = LocationService.toggleCategoryStatus('ropa', true);
        
        expect(result).toBe(true);
        expect(LocationService.isCategoryEnabled('ropa')).toBe(true);
      });

      it('should return false for unknown category', () => {
        const unknownCategory = 'unknown' as CampaignCategory;
        const result = LocationService.toggleCategoryStatus(unknownCategory, true);
        
        expect(result).toBe(false);
      });
    });

    describe('updateCategoryOrder', () => {
      it('should update category order', () => {
        const result = LocationService.updateCategoryOrder('restaurantes', 10);
        
        expect(result).toBe(true);
        
        const allCategories = LocationService.getAllCategories();
        const restaurantesCategory = allCategories.find(cat => cat.id === 'restaurantes');
        expect(restaurantesCategory?.order).toBe(10);
        
        // Reset order
        LocationService.updateCategoryOrder('restaurantes', 1);
      });

      it('should return false for unknown category', () => {
        const unknownCategory = 'unknown' as CampaignCategory;
        const result = LocationService.updateCategoryOrder(unknownCategory, 5);
        
        expect(result).toBe(false);
      });
    });
  });

  describe('Statistics Methods', () => {
    describe('getCitiesWithStats', () => {
      it('should return cities with collaboration counts', () => {
        const citiesWithStats = LocationService.getCitiesWithStats();
        
        expect(citiesWithStats.length).toBeGreaterThan(0);
        citiesWithStats.forEach(city => {
          expect(city.collaborationCount).toBeGreaterThanOrEqual(0);
          expect(typeof city.collaborationCount).toBe('number');
          expect(city.id).toBeDefined();
          expect(city.name).toBeDefined();
        });
      });
    });

    describe('getCategoriesWithStats', () => {
      it('should return categories with collaboration counts', () => {
        const categoriesWithStats = LocationService.getCategoriesWithStats();
        
        expect(categoriesWithStats.length).toBeGreaterThan(0);
        categoriesWithStats.forEach(category => {
          expect(category.collaborationCount).toBeGreaterThanOrEqual(0);
          expect(typeof category.collaborationCount).toBe('number');
          expect(category.id).toBeDefined();
          expect(category.name).toBeDefined();
        });
      });
    });
  });

  describe('Data Integrity', () => {
    it('should have consistent city data structure', () => {
      const allCities = LocationService.getAllCities();
      
      allCities.forEach(city => {
        expect(city.id).toBeDefined();
        expect(city.name).toBeDefined();
        expect(typeof city.isEnabled).toBe('boolean');
        expect(city.coordinates).toBeDefined();
        expect(typeof city.coordinates.lat).toBe('number');
        expect(typeof city.coordinates.lng).toBe('number');
        expect(city.createdAt).toBeInstanceOf(Date);
        expect(city.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should have consistent category data structure', () => {
      const allCategories = LocationService.getAllCategories();
      
      allCategories.forEach(category => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.displayName).toBeDefined();
        expect(typeof category.isEnabled).toBe('boolean');
        expect(category.icon).toBeDefined();
        expect(typeof category.order).toBe('number');
      });
    });

    it('should have valid coordinates for all cities', () => {
      const allCities = LocationService.getAllCities();
      
      allCities.forEach(city => {
        expect(city.coordinates.lat).toBeGreaterThanOrEqual(-90);
        expect(city.coordinates.lat).toBeLessThanOrEqual(90);
        expect(city.coordinates.lng).toBeGreaterThanOrEqual(-180);
        expect(city.coordinates.lng).toBeLessThanOrEqual(180);
      });
    });

    it('should have unique category orders', () => {
      const allCategories = LocationService.getAllCategories();
      const orders = allCategories.map(cat => cat.order);
      const uniqueOrders = [...new Set(orders)];
      
      expect(orders.length).toBe(uniqueOrders.length);
    });
  });
});