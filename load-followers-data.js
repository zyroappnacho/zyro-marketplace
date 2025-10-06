/**
 * Script de carga de datos de seguidores corregidos
 * Generado automáticamente el 2025-09-26T12:34:59.769Z
 * 
 * INSTRUCCIONES:
 * 1. Importa este archivo en tu aplicación React Native
 * 2. Ejecuta loadCorrectedFollowersData() una sola vez
 * 3. Reinicia la aplicación
 * 4. Los seguidores aparecerán correctamente en todos los perfiles
 */

import StorageService from './services/StorageService';

export const loadCorrectedFollowersData = async () => {
  try {
    console.log('🔄 Cargando datos de seguidores corregidos...');

    // Influencers aprobados con seguidores corregidos
    const approvedInfluencers = [
  {
    "id": "nayades_001",
    "email": "nayades@gmail.com",
    "fullName": "Nayades Influencer",
    "instagramUsername": "@nayades",
    "instagramFollowers": 1300000,
    "tiktokUsername": "@nayades",
    "tiktokFollowers": 800000,
    "phone": "+34 600 000 001",
    "city": "Madrid",
    "role": "influencer",
    "status": "approved",
    "password": "nayades123",
    "lastUpdated": "2025-09-26T12:32:03.261Z"
  },
  {
    "id": "test_002",
    "email": "test@influencer.com",
    "fullName": "Test Influencer",
    "instagramUsername": "@testinfluencer",
    "instagramFollowers": 25000,
    "tiktokUsername": "@testinfluencer",
    "tiktokFollowers": 15000,
    "phone": "+34 600 000 002",
    "city": "Barcelona",
    "role": "influencer",
    "status": "approved",
    "password": "test123",
    "lastUpdated": "2025-09-26T12:32:03.272Z"
  },
  {
    "id": "demo_003",
    "email": "demo@influencer.com",
    "fullName": "Demo Influencer",
    "instagramUsername": "@demoinfluencer",
    "instagramFollowers": 50000,
    "tiktokUsername": "@demoinfluencer",
    "tiktokFollowers": 30000,
    "phone": "+34 600 000 003",
    "city": "Valencia",
    "role": "influencer",
    "status": "approved",
    "password": "demo123",
    "lastUpdated": "2025-09-26T12:32:03.272Z"
  }
];

    // Credenciales de login
    const loginCredentials = {
  "nayades@gmail.com": {
    "email": "nayades@gmail.com",
    "password": "nayades123",
    "userId": "nayades_001",
    "role": "influencer",
    "lastUpdated": "2025-09-26T12:32:03.274Z"
  },
  "test@influencer.com": {
    "email": "test@influencer.com",
    "password": "test123",
    "userId": "test_002",
    "role": "influencer",
    "lastUpdated": "2025-09-26T12:32:03.275Z"
  },
  "demo@influencer.com": {
    "email": "demo@influencer.com",
    "password": "demo123",
    "userId": "demo_003",
    "role": "influencer",
    "lastUpdated": "2025-09-26T12:32:03.276Z"
  }
};

    // Guardar en AsyncStorage
    await StorageService.saveData('approved_influencers', approvedInfluencers);
    await StorageService.saveData('login_credentials', loginCredentials);

    // Guardar datos individuales de cada influencer
    for (const influencer of approvedInfluencers) {
      await StorageService.saveInfluencerData(influencer);
      console.log(`✅ Datos guardados para: ${influencer.fullName} (${influencer.instagramFollowers} seguidores)`);
    }

    // Crear backup
    const backupData = {
      approvedInfluencers,
      loginCredentials,
      timestamp: new Date().toISOString(),
      source: 'followers_correction_script'
    };
    await StorageService.saveData('followers_correction_backup', backupData);

    console.log('✅ Datos de seguidores cargados correctamente');
    console.log(`📊 ${approvedInfluencers.length} influencers con seguidores corregidos`);
    
    return {
      success: true,
      influencersLoaded: approvedInfluencers.length,
      credentialsCreated: Object.keys(loginCredentials).length
    };

  } catch (error) {
    console.error('❌ Error cargando datos de seguidores:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Credenciales para pruebas
export const testCredentials = [
  {
    email: 'nayades@gmail.com',
    password: 'nayades123',
    name: 'Nayades Influencer',
    followers: 1300000
  },
  {
    email: 'test@influencer.com',
    password: 'test123',
    name: 'Test Influencer',
    followers: 25000
  },
  {
    email: 'demo@influencer.com',
    password: 'demo123',
    name: 'Demo Influencer',
    followers: 50000
  }
];

export default {
  loadCorrectedFollowersData,
  testCredentials
};