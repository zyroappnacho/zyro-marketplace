import { CampaignCategory } from '../types';

export interface City {
  id: string;
  name: string;
  isEnabled: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryConfig {
  id: CampaignCategory;
  name: string;
  displayName: string;
  isEnabled: boolean;
  icon: string;
  order: number;
}

// Default cities that can be enabled/disabled by admin
const DEFAULT_CITIES: City[] = [
  {
    id: 'madrid',
    name: 'MADRID',
    isEnabled: true,
    coordinates: { lat: 40.4168, lng: -3.7038 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'barcelona',
    name: 'BARCELONA',
    isEnabled: true,
    coordinates: { lat: 41.3851, lng: 2.1734 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'valencia',
    name: 'VALENCIA',
    isEnabled: true,
    coordinates: { lat: 39.4699, lng: -0.3763 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sevilla',
    name: 'SEVILLA',
    isEnabled: true,
    coordinates: { lat: 37.3891, lng: -5.9845 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'bilbao',
    name: 'BILBAO',
    isEnabled: true,
    coordinates: { lat: 43.2627, lng: -2.9253 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'malaga',
    name: 'MÁLAGA',
    isEnabled: true,
    coordinates: { lat: 36.7213, lng: -4.4214 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'zaragoza',
    name: 'ZARAGOZA',
    isEnabled: true,
    coordinates: { lat: 41.6488, lng: -0.8891 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'murcia',
    name: 'MURCIA',
    isEnabled: false,
    coordinates: { lat: 37.9922, lng: -1.1307 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'palma',
    name: 'PALMA',
    isEnabled: false,
    coordinates: { lat: 39.5696, lng: 2.6502 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'las-palmas',
    name: 'LAS PALMAS',
    isEnabled: false,
    coordinates: { lat: 28.1248, lng: -15.4300 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Category configurations
const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: 'restaurantes',
    name: 'restaurantes',
    displayName: 'RESTAURANTES',
    isEnabled: true,
    icon: 'restaurant',
    order: 1,
  },
  {
    id: 'movilidad',
    name: 'movilidad',
    displayName: 'MOVILIDAD',
    isEnabled: true,
    icon: 'directions-car',
    order: 2,
  },
  {
    id: 'ropa',
    name: 'ropa',
    displayName: 'ROPA',
    isEnabled: true,
    icon: 'checkroom',
    order: 3,
  },
  {
    id: 'eventos',
    name: 'eventos',
    displayName: 'EVENTOS',
    isEnabled: true,
    icon: 'event',
    order: 4,
  },
  {
    id: 'delivery',
    name: 'delivery',
    displayName: 'DELIVERY',
    isEnabled: true,
    icon: 'delivery-dining',
    order: 5,
  },
  {
    id: 'salud-belleza',
    name: 'salud-belleza',
    displayName: 'SALUD Y BELLEZA',
    isEnabled: true,
    icon: 'spa',
    order: 6,
  },
  {
    id: 'alojamiento',
    name: 'alojamiento',
    displayName: 'ALOJAMIENTO',
    isEnabled: true,
    icon: 'hotel',
    order: 7,
  },
  {
    id: 'discotecas',
    name: 'discotecas',
    displayName: 'DISCOTECAS',
    isEnabled: true,
    icon: 'nightlife',
    order: 8,
  },
];

export class LocationService {
  private static cities: City[] = [...DEFAULT_CITIES];
  private static categories: CategoryConfig[] = [...CATEGORY_CONFIGS];

  /**
   * Get all enabled cities
   */
  static getEnabledCities(): City[] {
    return this.cities.filter(city => city.isEnabled);
  }

  /**
   * Get all cities (for admin management)
   */
  static getAllCities(): City[] {
    return [...this.cities];
  }

  /**
   * Get all enabled categories
   */
  static getEnabledCategories(): CategoryConfig[] {
    return this.categories
      .filter(category => category.isEnabled)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get all categories (for admin management)
   */
  static getAllCategories(): CategoryConfig[] {
    return [...this.categories].sort((a, b) => a.order - b.order);
  }

  /**
   * Get category display name
   */
  static getCategoryDisplayName(categoryId: CampaignCategory): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.displayName || categoryId.toUpperCase();
  }

  /**
   * Get category icon
   */
  static getCategoryIcon(categoryId: CampaignCategory): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.icon || 'category';
  }

  /**
   * Check if a city is enabled
   */
  static isCityEnabled(cityName: string): boolean {
    const city = this.cities.find(c => c.name === cityName.toUpperCase());
    return city?.isEnabled || false;
  }

  /**
   * Check if a category is enabled
   */
  static isCategoryEnabled(categoryId: CampaignCategory): boolean {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.isEnabled || false;
  }

  /**
   * Get city coordinates
   */
  static getCityCoordinates(cityName: string): { lat: number; lng: number } | null {
    const city = this.cities.find(c => c.name === cityName.toUpperCase());
    return city?.coordinates || null;
  }

  // Admin functions
  /**
   * Enable/disable a city (admin only)
   */
  static toggleCityStatus(cityId: string, isEnabled: boolean): boolean {
    const cityIndex = this.cities.findIndex(city => city.id === cityId);
    if (cityIndex !== -1) {
      this.cities[cityIndex] = {
        ...this.cities[cityIndex],
        isEnabled,
        updatedAt: new Date(),
      };
      return true;
    }
    return false;
  }

  /**
   * Enable/disable a category (admin only)
   */
  static toggleCategoryStatus(categoryId: CampaignCategory, isEnabled: boolean): boolean {
    const categoryIndex = this.categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex !== -1) {
      this.categories[categoryIndex] = {
        ...this.categories[categoryIndex],
        isEnabled,
      };
      return true;
    }
    return false;
  }

  /**
   * Add a new city (admin only)
   */
  static addCity(cityData: Omit<City, 'id' | 'createdAt' | 'updatedAt'>): City {
    const newCity: City = {
      ...cityData,
      id: cityData.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cities.push(newCity);
    return newCity;
  }

  /**
   * Update category order (admin only)
   */
  static updateCategoryOrder(categoryId: CampaignCategory, newOrder: number): boolean {
    const categoryIndex = this.categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex !== -1) {
      this.categories[categoryIndex] = {
        ...this.categories[categoryIndex],
        order: newOrder,
      };
      return true;
    }
    return false;
  }

  /**
   * Get cities with collaboration counts (for admin dashboard)
   */
  static getCitiesWithStats(): Array<City & { collaborationCount: number }> {
    // In a real app, this would query the database for actual counts
    return this.cities.map(city => ({
      ...city,
      collaborationCount: Math.floor(Math.random() * 50), // Mock data
    }));
  }

  /**
   * Get categories with collaboration counts (for admin dashboard)
   */
  static getCategoriesWithStats(): Array<CategoryConfig & { collaborationCount: number }> {
    // In a real app, this would query the database for actual counts
    return this.categories.map(category => ({
      ...category,
      collaborationCount: Math.floor(Math.random() * 30), // Mock data
    }));
  }
}