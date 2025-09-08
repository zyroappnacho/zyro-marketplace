import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // User data management
  async saveUser(user) {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  }

  async getUser() {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async removeUser() {
    try {
      await AsyncStorage.removeItem('currentUser');
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      return false;
    }
  }

  // Settings management
  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  async getSettings() {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      return settings ? JSON.parse(settings) : {
        notifications: true,
        emailNotifications: true,
        pushNotifications: true,
        city: 'Madrid',
        language: 'es'
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }

  // Collaboration history
  async saveCollaborationHistory(history) {
    try {
      await AsyncStorage.setItem('collaborationHistory', JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Error saving collaboration history:', error);
      return false;
    }
  }

  async getCollaborationHistory() {
    try {
      const history = await AsyncStorage.getItem('collaborationHistory');
      return history ? JSON.parse(history) : {
        proximos: [],
        pasados: [],
        cancelados: []
      };
    } catch (error) {
      console.error('Error getting collaboration history:', error);
      return { proximos: [], pasados: [], cancelados: [] };
    }
  }

  // Favorites
  async saveFavorites(favorites) {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Error saving favorites:', error);
      return false;
    }
  }

  async getFavorites() {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  // Search history
  async saveSearchHistory(searches) {
    try {
      await AsyncStorage.setItem('searchHistory', JSON.stringify(searches));
      return true;
    } catch (error) {
      console.error('Error saving search history:', error);
      return false;
    }
  }

  async getSearchHistory() {
    try {
      const searches = await AsyncStorage.getItem('searchHistory');
      return searches ? JSON.parse(searches) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  // Cache management
  async saveCache(key, data, expirationMinutes = 60) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        expiration: Date.now() + (expirationMinutes * 60 * 1000)
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Error saving cache:', error);
      return false;
    }
  }

  async getCache(key) {
    try {
      const cacheData = await AsyncStorage.getItem(`cache_${key}`);
      if (!cacheData) return null;

      const parsed = JSON.parse(cacheData);
      if (Date.now() > parsed.expiration) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  // Clear all data
  async clearAll() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Get storage info
  async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const values = await AsyncStorage.multiGet(keys);
      
      let totalSize = 0;
      const items = values.map(([key, value]) => {
        const size = new Blob([value]).size;
        totalSize += size;
        return { key, size };
      });

      return {
        totalItems: keys.length,
        totalSize,
        items: items.sort((a, b) => b.size - a.size)
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }
}

export default new StorageService();