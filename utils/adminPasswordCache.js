
// 🧹 Script de limpieza de cache para administrador
import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAdminPasswordCache = async () => {
  try {
    console.log('🧹 Limpiando cache de contraseña de administrador...');
    
    // Limpiar todas las claves relacionadas con administrador
    const keysToRemove = [
      'admin_credentials',
      'admin_credentials_backup', 
      'admin_password_current',
      'admin_last_update',
      'password_changed_admin_001',
      'approved_user_admin_001',
      'approvedUsersList'
    ];
    
    await AsyncStorage.multiRemove(keysToRemove);
    console.log('✅ Cache limpiado exitosamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error limpiando cache:', error);
    return false;
  }
};

export const forceAdminPasswordReset = async () => {
  try {
    console.log('🔄 Forzando reset del sistema de contraseñas...');
    
    // Limpiar cache primero
    await clearAdminPasswordCache();
    
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Sistema reseteado. Reinicia la app para aplicar cambios.');
    return true;
  } catch (error) {
    console.error('❌ Error en reset:', error);
    return false;
  }
};
