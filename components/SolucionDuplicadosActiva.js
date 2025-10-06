/**
 * 🛠️ COMPONENTE SOLUCIÓN DUPLICADOS "ACTIVA"
 * 
 * Componente React Native para aplicar la solución de duplicados
 * directamente desde la interfaz de la app
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import {
  ejecutarSolucionDuplicadosActiva,
  verificarSolucionAplicada,
  mostrarResumenEmpresas
} from '../EJECUTAR_SOLUCION_DUPLICADOS_ACTIVA_REAL';

const SolucionDuplicadosActiva = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  /**
   * Ejecutar solución principal
   */
  const handleEjecutarSolucion = async () => {
    try {
      setLoading(true);
      setResultado(null);
      
      console.log('🚀 Iniciando solución desde componente...');
      
      const result = await ejecutarSolucionDuplicadosActiva();
      
      setResultado(result);
      
      if (result.success) {
        console.log('✅ Solución ejecutada exitosamente desde componente');
      } else {
        console.error('❌ Error en solución desde componente:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Error ejecutando solución:', error);
      Alert.alert('❌ Error', `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verificar estado después de la solución
   */
  const handleVerificarSolucion = async () => {
    try {
      setLoading(true);
      
      const result = await verificarSolucionAplicada();
      
      console.log('🔍 Verificación completada:', result);
      
    } catch (error) {
      console.error('❌ Error verificando:', error);
      Alert.alert('❌ Error', `Error verificando: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mostrar resumen de empresas
   */
  const handleMostrarResumen = async () => {
    try {
      setLoading(true);
      
      const companies = await mostrarResumenEmpresas();
      
      Alert.alert(
        '📋 Resumen de Empresas',
        `Total de empresas: ${companies.length}\n\n` +
        `Revisa la consola para ver el detalle completo.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('❌ Error mostrando resumen:', error);
      Alert.alert('❌ Error', `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🛠️ Solución Duplicados "Activa"</Text>
          <Text style={styles.subtitle}>
            Herramienta para eliminar empresas duplicadas causadas por el estado "Activa"
          </Text>
        </View>

        {/* Información */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📋 ¿Qué hace esta solución?</Text>
          <Text style={styles.infoText}>
            • Detecta empresas duplicadas por email y nombre{'\n'}
            • Prioriza empresas con email válido{'\n'}
            • Mantiene versiones con más datos completos{'\n'}
            • Elimina duplicados manteniendo las más recientes{'\n'}
            • Limpia datos relacionados automáticamente
          </Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.buttonsContainer}>
          
          {/* Botón principal */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleEjecutarSolucion}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.buttonIcon}>🚀</Text>
                <Text style={styles.buttonText}>Ejecutar Solución</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botón verificar */}
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleVerificarSolucion}
            disabled={loading}
          >
            <Text style={styles.buttonIcon}>🔍</Text>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Verificar Estado
            </Text>
          </TouchableOpacity>

          {/* Botón resumen */}
          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={handleMostrarResumen}
            disabled={loading}
          >
            <Text style={styles.buttonIcon}>📋</Text>
            <Text style={[styles.buttonText, styles.tertiaryButtonText]}>
              Ver Resumen
            </Text>
          </TouchableOpacity>

        </View>

        {/* Resultado */}
        {resultado && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>
              {resultado.success ? '✅ Resultado Exitoso' : '❌ Error'}
            </Text>
            
            {resultado.success ? (
              <View style={styles.successResult}>
                <Text style={styles.resultText}>
                  📊 Empresas antes: {resultado.empresasAntes}
                </Text>
                <Text style={styles.resultText}>
                  📊 Empresas después: {resultado.empresasDespues}
                </Text>
                <Text style={styles.resultText}>
                  🗑️ Duplicados eliminados: {resultado.duplicadosEliminados}
                </Text>
                <Text style={styles.successText}>
                  🎉 ¡Problema solucionado exitosamente!
                </Text>
              </View>
            ) : (
              <View style={styles.errorResult}>
                <Text style={styles.errorText}>
                  Error: {resultado.error}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Instrucciones */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📝 Instrucciones:</Text>
          <Text style={styles.instructionsText}>
            1. Presiona "Ejecutar Solución" para aplicar la corrección{'\n'}
            2. Espera a que termine el proceso{'\n'}
            3. Usa "Verificar Estado" para confirmar que funcionó{'\n'}
            4. Revisa "Ver Resumen" para ver las empresas finales{'\n'}
            5. Cierra esta ventana cuando termines
          </Text>
        </View>

        {/* Botón cerrar */}
        <TouchableOpacity
          style={[styles.button, styles.closeButton]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>❌ Cerrar</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  tertiaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#2196F3',
  },
  tertiaryButtonText: {
    color: '#FF9800',
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  successResult: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 4,
  },
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
    textAlign: 'center',
  },
  errorResult: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#F44336',
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default SolucionDuplicadosActiva;