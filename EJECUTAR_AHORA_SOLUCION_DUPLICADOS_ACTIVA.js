/**
 * ⚡ EJECUTAR AHORA - SOLUCIÓN DUPLICADOS "ACTIVA"
 * 
 * Script de ejecución inmediata para la app React Native
 * 
 * INSTRUCCIONES DE USO:
 * 1. Importa este archivo en tu componente principal
 * 2. Llama a la función ejecutarAhoraSolucionDuplicados()
 * 3. La solución se aplicará automáticamente
 */

import { ejecutarSolucionDuplicadosActiva } from './EJECUTAR_SOLUCION_DUPLICADOS_ACTIVA_REAL';
import { Alert } from 'react-native';

/**
 * ⚡ EJECUTAR SOLUCIÓN INMEDIATAMENTE
 */
export const ejecutarAhoraSolucionDuplicados = async () => {
  try {
    console.log('⚡ EJECUTANDO SOLUCIÓN DE DUPLICADOS "ACTIVA" AHORA...');
    
    // Mostrar confirmación al usuario
    return new Promise((resolve) => {
      Alert.alert(
        '🛠️ Solución de Duplicados',
        '¿Quieres ejecutar la solución para eliminar empresas duplicadas con estado "Activa"?\n\n' +
        '✅ Eliminará duplicados automáticamente\n' +
        '✅ Mantendrá las versiones más completas\n' +
        '✅ Limpiará datos relacionados\n\n' +
        '⚠️ Esta acción no se puede deshacer.',
        [
          {
            text: '❌ Cancelar',
            style: 'cancel',
            onPress: () => {
              console.log('❌ Solución cancelada por el usuario');
              resolve({ success: false, cancelled: true });
            }
          },
          {
            text: '✅ Ejecutar',
            onPress: async () => {
              try {
                console.log('✅ Usuario confirmó ejecución');
                
                // Ejecutar la solución
                const resultado = await ejecutarSolucionDuplicadosActiva();
                
                console.log('📊 Resultado de ejecución inmediata:', resultado);
                
                resolve(resultado);
                
              } catch (error) {
                console.error('❌ Error en ejecución inmediata:', error);
                
                Alert.alert(
                  '❌ Error',
                  `Error ejecutando la solución:\n\n${error.message}`,
                  [{ text: 'OK' }]
                );
                
                resolve({ success: false, error: error.message });
              }
            }
          }
        ]
      );
    });
    
  } catch (error) {
    console.error('❌ Error en ejecutarAhoraSolucionDuplicados:', error);
    
    Alert.alert(
      '❌ Error Crítico',
      `Error iniciando la solución:\n\n${error.message}`,
      [{ text: 'OK' }]
    );
    
    return { success: false, error: error.message };
  }
};

/**
 * 🔥 EJECUTAR SOLUCIÓN SIN CONFIRMACIÓN (PARA DESARROLLO)
 */
export const ejecutarSolucionSinConfirmacion = async () => {
  try {
    console.log('🔥 EJECUTANDO SOLUCIÓN SIN CONFIRMACIÓN...');
    console.log('⚠️ MODO DESARROLLO - SIN ALERTAS DE CONFIRMACIÓN');
    
    const resultado = await ejecutarSolucionDuplicadosActiva();
    
    console.log('📊 Resultado sin confirmación:', resultado);
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error en ejecución sin confirmación:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 🎯 EJECUTAR CON CALLBACK PERSONALIZADO
 */
export const ejecutarSolucionConCallback = async (onSuccess, onError) => {
  try {
    console.log('🎯 Ejecutando solución con callback personalizado...');
    
    const resultado = await ejecutarSolucionDuplicadosActiva();
    
    if (resultado.success) {
      console.log('✅ Solución exitosa, ejecutando callback de éxito');
      if (onSuccess) onSuccess(resultado);
    } else {
      console.log('❌ Solución falló, ejecutando callback de error');
      if (onError) onError(resultado);
    }
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error en ejecución con callback:', error);
    if (onError) onError({ success: false, error: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * 📱 INTEGRACIÓN FÁCIL PARA COMPONENTES
 */
export const integrarSolucionEnComponente = (Component) => {
  return class ComponenteConSolucion extends Component {
    
    /**
     * Método para ejecutar la solución desde cualquier componente
     */
    ejecutarSolucionDuplicados = async () => {
      try {
        console.log('📱 Ejecutando solución desde componente integrado...');
        
        const resultado = await ejecutarAhoraSolucionDuplicados();
        
        // Si el componente tiene un método para manejar el resultado
        if (this.onSolucionCompletada) {
          this.onSolucionCompletada(resultado);
        }
        
        return resultado;
        
      } catch (error) {
        console.error('❌ Error en integración de componente:', error);
        
        // Si el componente tiene un método para manejar errores
        if (this.onSolucionError) {
          this.onSolucionError(error);
        }
        
        return { success: false, error: error.message };
      }
    };
    
    /**
     * Método para verificar si hay duplicados sin ejecutar la solución
     */
    verificarDuplicados = async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        
        const companiesData = await AsyncStorage.getItem('companiesList');
        const companies = companiesData ? JSON.parse(companiesData) : [];
        
        if (companies.length === 0) {
          return { hayDuplicados: false, totalEmpresas: 0 };
        }
        
        // Detectar duplicados rápido
        const emails = companies.map(c => c.email?.toLowerCase().trim()).filter(Boolean);
        const names = companies.map(c => (c.companyName || c.name || '').toLowerCase().trim()).filter(Boolean);
        
        const uniqueEmails = [...new Set(emails)];
        const uniqueNames = [...new Set(names)];
        
        const duplicateEmails = emails.length - uniqueEmails.length;
        const duplicateNames = names.length - uniqueNames.length;
        const hayDuplicados = duplicateEmails > 0 || duplicateNames > 0;
        
        return {
          hayDuplicados,
          totalEmpresas: companies.length,
          duplicadosEmail: duplicateEmails,
          duplicadosNombre: duplicateNames
        };
        
      } catch (error) {
        console.error('❌ Error verificando duplicados:', error);
        return { hayDuplicados: false, error: error.message };
      }
    };
  };
};

// Exportar función principal por defecto
export default ejecutarAhoraSolucionDuplicados;