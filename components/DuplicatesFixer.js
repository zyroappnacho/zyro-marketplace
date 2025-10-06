/**
 * Componente temporal para corregir duplicados desde la aplicación
 * Agrégalo temporalmente a tu app para ejecutar la corrección
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DuplicatesFixer = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [log, setLog] = useState([]);

  const addLog = (message) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const fixDuplicates = async () => {
    setIsFixing(true);
    setLog([]);
    
    try {
      addLog('🔍 Iniciando corrección de duplicados...');
      
      // 1. Obtener lista de empresas
      const companiesListStr = await AsyncStorage.getItem('companiesList');
      const companies = companiesListStr ? JSON.parse(companiesListStr) : [];
      
      addLog(`📊 Empresas encontradas: ${companies.length}`);
      
      // 2. Buscar duplicados por nombre
      const duplicates = {};
      companies.forEach(company => {
        const name = (company.companyName || company.name || '').toLowerCase().trim();
        if (!duplicates[name]) {
          duplicates[name] = [];
        }
        duplicates[name].push(company);
      });
      
      // 3. Identificar grupos con duplicados
      const duplicateGroups = Object.entries(duplicates).filter(([name, comps]) => comps.length > 1);
      
      if (duplicateGroups.length === 0) {
        addLog('✅ No se encontraron duplicados');
        Alert.alert('Éxito', 'No se encontraron empresas duplicadas');
        return;
      }
      
      addLog(`⚠️ Encontrados ${duplicateGroups.length} grupos de duplicados:`);
      
      // Mostrar duplicados encontrados
      duplicateGroups.forEach(([name, comps]) => {
        addLog(`📋 "${name}": ${comps.length} duplicados`);
        comps.forEach((comp, i) => {
          addLog(`   ${i + 1}. ID: ${comp.id} | Plan: ${comp.plan}`);
        });
      });
      
      // 4. Corregir duplicados
      addLog('🔧 Eliminando duplicados...');
      
      let eliminados = 0;
      const empresasLimpias = [];
      
      for (const [name, comps] of duplicateGroups) {
        // Ordenar por fecha de registro (más reciente primero)
        comps.sort((a, b) => {
          const fechaA = new Date(a.registrationDate || 0);
          const fechaB = new Date(b.registrationDate || 0);
          return fechaB - fechaA;
        });
        
        // Mantener la más reciente
        const empresaAMantener = comps[0];
        const empresasAEliminar = comps.slice(1);
        
        addLog(`✅ Manteniendo: ${empresaAMantener.companyName} (${empresaAMantener.plan})`);
        empresasLimpias.push(empresaAMantener);
        
        // Eliminar duplicados
        for (const empresa of empresasAEliminar) {
          addLog(`🗑️ Eliminando: ${empresa.companyName} (${empresa.plan})`);
          
          // Eliminar datos individuales
          await AsyncStorage.removeItem(`company_${empresa.id}`);
          await AsyncStorage.removeItem(`approved_user_${empresa.id}`);
          await AsyncStorage.removeItem(`company_subscription_${empresa.id}`);
          await AsyncStorage.removeItem(`company_locations_${empresa.id}`);
          await AsyncStorage.removeItem(`company_profile_image_${empresa.id}`);
          
          eliminados++;
        }
      }
      
      // 5. Agregar empresas sin duplicados
      const empresasSinDuplicados = companies.filter(company => {
        const name = (company.companyName || company.name || '').toLowerCase().trim();
        return !duplicates[name] || duplicates[name].length === 1;
      });
      
      const listaFinal = [...empresasSinDuplicados, ...empresasLimpias];
      
      // 6. Guardar lista limpia
      addLog('💾 Guardando lista corregida...');
      await AsyncStorage.setItem('companiesList', JSON.stringify(listaFinal));
      
      // 7. Limpiar usuarios aprobados duplicados
      addLog('🧹 Limpiando usuarios aprobados...');
      const approvedUsersStr = await AsyncStorage.getItem('approvedUsersList');
      const approvedUsers = approvedUsersStr ? JSON.parse(approvedUsersStr) : [];
      
      const usuariosUnicos = [];
      const emailsVistos = new Set();
      
      for (const user of approvedUsers) {
        if (!emailsVistos.has(user.email)) {
          emailsVistos.add(user.email);
          usuariosUnicos.push(user);
        }
      }
      
      await AsyncStorage.setItem('approvedUsersList', JSON.stringify(usuariosUnicos));
      
      // 8. Instalar protección
      addLog('🛡️ Instalando protección anti-duplicados...');
      const proteccion = {
        enabled: true,
        installedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      await AsyncStorage.setItem('duplicate_protection', JSON.stringify(proteccion));
      
      // Resultado final
      addLog('✅ CORRECCIÓN COMPLETADA');
      addLog(`📊 Duplicados eliminados: ${eliminados}`);
      addLog(`📊 Empresas finales: ${listaFinal.length}`);
      addLog(`📊 Usuarios únicos: ${usuariosUnicos.length}`);
      addLog('🛡️ Protección instalada');
      
      Alert.alert(
        'Corrección Completada',
        `✅ ${eliminados} duplicados eliminados\n📊 ${listaFinal.length} empresas restantes\n\n🔄 Reinicia la aplicación para ver los cambios`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
      Alert.alert('Error', `Error corrigiendo duplicados: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  const clearLog = () => {
    setLog([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Corrector de Duplicados</Text>
      
      <TouchableOpacity
        style={[styles.button, isFixing && styles.buttonDisabled]}
        onPress={fixDuplicates}
        disabled={isFixing}
      >
        <Text style={styles.buttonText}>
          {isFixing ? 'Corrigiendo...' : 'Corregir Duplicados'}
        </Text>
      </TouchableOpacity>
      
      {log.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearLog}>
          <Text style={styles.clearButtonText}>Limpiar Log</Text>
        </TouchableOpacity>
      )}
      
      <ScrollView style={styles.logContainer}>
        {log.map((entry, index) => (
          <Text key={index} style={styles.logEntry}>
            {entry}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  clearButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 10,
  },
  logEntry: {
    color: '#00FF00',
    fontSize: 12,
    fontFamily: 'Courier',
    marginBottom: 2,
  },
});

export default DuplicatesFixer;