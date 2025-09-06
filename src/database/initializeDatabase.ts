import { Platform } from 'react-native';

/**
 * Initialize database based on platform
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Use web database
      const { initializeDatabase: initWebDB } = require('./database.web');
      await initWebDB();
    } else {
      // Try to use native database
      try {
        const { databaseManager } = require('./database');
        await databaseManager.initialize();
      } catch (error) {
        console.warn('Native database failed, falling back to web database');
        const { initializeDatabase: initWebDB } = require('./database.web');
        await initWebDB();
      }
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Don't throw to prevent app crash
  }
};