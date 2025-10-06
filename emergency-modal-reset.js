// Script de emergencia para resetear modales bloqueados
import AsyncStorage from '@react-native-async-storage/async-storage';

const resetModalState = async () => {
    try {
        console.log('🚨 EMERGENCY: Resetting modal state...');
        
        // Limpiar estado de Redux persistido
        await AsyncStorage.removeItem('persist:ui');
        await AsyncStorage.removeItem('persist:root');
        
        // Limpiar cualquier estado de modal
        const keys = await AsyncStorage.getAllKeys();
        const modalKeys = keys.filter(key => key.includes('modal') || key.includes('Modal'));
        
        if (modalKeys.length > 0) {
            await AsyncStorage.multiRemove(modalKeys);
            console.log('✅ Modal keys cleared:', modalKeys);
        }
        
        console.log('✅ Modal state reset complete');
        console.log('💡 Please reload the app (Cmd+R)');
        
        return true;
    } catch (error) {
        console.error('❌ Error resetting modal state:', error);
        return false;
    }
};

// Función para usar en el simulador
global.resetModals = resetModalState;

export default resetModalState;