
// Temporal forcer para pantalla de bienvenida
export const forceWelcomeScreen = () => {
    // Limpiar AsyncStorage si existe
    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
        console.log('🧹 LocalStorage limpiado');
    }
    
    // Limpiar cualquier estado persistente
    return true;
};

export const clearAllUserData = async () => {
    try {
        // Importar AsyncStorage dinámicamente
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        
        // Limpiar todas las claves relacionadas con usuario
        const keysToRemove = [
            'user',
            'auth',
            'currentUser',
            'company_test_001',
            'empresa@zyro.com',
            'approved_influencers',
            'admin_campaigns',
            'persist:root'
        ];
        
        await AsyncStorage.default.multiRemove(keysToRemove);
        console.log('🧹 AsyncStorage limpiado completamente');
        
        return true;
    } catch (error) {
        console.log('⚠️ No se pudo limpiar AsyncStorage:', error.message);
        return false;
    }
};
