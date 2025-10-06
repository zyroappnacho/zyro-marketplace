
import { initializeDemoData } from './utils/demoConfig';

// Ejecutar al iniciar la aplicación para asegurar datos de demo
export const setupDemoData = async () => {
  try {
    console.log('🚀 Configurando datos de demostración...');
    const result = await initializeDemoData();
    
    if (result) {
      console.log('✅ Datos de demostración configurados correctamente');
    } else {
      console.log('❌ Error configurando datos de demostración');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error en setupDemoData:', error);
    return false;
  }
};
