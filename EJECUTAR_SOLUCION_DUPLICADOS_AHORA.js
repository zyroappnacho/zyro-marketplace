/**
 * EJECUTAR SOLUCIÓN DE DUPLICADOS INMEDIATAMENTE
 * 
 * Este script ejecuta la solución definitiva para eliminar duplicados
 * de empresas y aplicar protección anti-duplicados.
 */

import React from 'react';
import { Alert } from 'react-native';
import { executeDuplicatesFix } from './SOLUCION_DUPLICADOS_EMPRESAS_DEFINITIVA';

/**
 * Ejecutar solución de duplicados
 */
export const executeFixNow = async () => {
  try {
    console.log('🚀 EJECUTANDO SOLUCIÓN DE DUPLICADOS...');
    console.log('='.repeat(50));
    
    // Mostrar alerta de inicio
    Alert.alert(
      '🔧 Solucionando Duplicados',
      'Iniciando proceso para eliminar empresas duplicadas...',
      [{ text: 'OK' }]
    );
    
    // Ejecutar la solución
    const result = await executeDuplicatesFix();
    
    if (result.success) {
      console.log('✅ SOLUCIÓN COMPLETADA EXITOSAMENTE');
      
      Alert.alert(
        '✅ ¡Duplicados Eliminados!',
        'Los duplicados de empresas han sido eliminados exitosamente.\n\n' +
        '• Se han eliminado las empresas duplicadas\n' +
        '• Se ha aplicado protección anti-duplicados\n' +
        '• El sistema ahora evitará crear duplicados\n\n' +
        'El registro de empresas funcionará correctamente.',
        [
          {
            text: 'Perfecto',
            style: 'default'
          }
        ]
      );
      
      return result;
    } else {
      console.error('❌ Error en la solución:', result.error);
      
      Alert.alert(
        '❌ Error',
        `Hubo un problema ejecutando la solución:\n\n${result.error}`,
        [{ text: 'OK' }]
      );
      
      return result;
    }
    
  } catch (error) {
    console.error('❌ Error ejecutando solución:', error);
    
    Alert.alert(
      '❌ Error Crítico',
      `Error ejecutando la solución de duplicados:\n\n${error.message}`,
      [{ text: 'OK' }]
    );
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verificar estado actual de empresas
 */
export const checkCurrentState = async () => {
  try {
    console.log('🔍 VERIFICANDO ESTADO ACTUAL...');
    
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    // Obtener empresas
    const companiesData = await AsyncStorage.getItem('companiesList');
    const companies = companiesData ? JSON.parse(companiesData) : [];
    
    console.log(`📊 Total de empresas: ${companies.length}`);
    
    if (companies.length > 0) {
      console.log('\n📋 EMPRESAS ACTUALES:');
      companies.forEach((company, index) => {
        console.log(`${index + 1}. ${company.companyName || company.name}`);
        console.log(`   📧 ${company.email}`);
        console.log(`   📅 Plan: ${company.plan || 'N/A'}`);
        console.log('');
      });
      
      // Detectar duplicados
      const emailCounts = {};
      const nameCounts = {};
      
      companies.forEach(company => {
        const email = company.email?.toLowerCase();
        const name = (company.companyName || company.name || '').toLowerCase();
        
        if (email) {
          emailCounts[email] = (emailCounts[email] || 0) + 1;
        }
        
        if (name) {
          nameCounts[name] = (nameCounts[name] || 0) + 1;
        }
      });
      
      const duplicateEmails = Object.keys(emailCounts).filter(email => emailCounts[email] > 1);
      const duplicateNames = Object.keys(nameCounts).filter(name => nameCounts[name] > 1);
      
      if (duplicateEmails.length > 0 || duplicateNames.length > 0) {
        console.log('\n⚠️ DUPLICADOS DETECTADOS:');
        
        if (duplicateEmails.length > 0) {
          console.log(`📧 Emails duplicados: ${duplicateEmails.length}`);
          duplicateEmails.forEach(email => {
            console.log(`   - ${email} (${emailCounts[email]} veces)`);
          });
        }
        
        if (duplicateNames.length > 0) {
          console.log(`🏢 Nombres duplicados: ${duplicateNames.length}`);
          duplicateNames.forEach(name => {
            console.log(`   - ${name} (${nameCounts[name]} veces)`);
          });
        }
        
        Alert.alert(
          '⚠️ Duplicados Detectados',
          `Se encontraron duplicados:\n\n` +
          `• ${duplicateEmails.length} emails duplicados\n` +
          `• ${duplicateNames.length} nombres duplicados\n\n` +
          `¿Deseas ejecutar la solución para eliminarlos?`,
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Sí, Eliminar',
              onPress: executeFixNow
            }
          ]
        );
        
        return {
          hasDuplicates: true,
          duplicateEmails: duplicateEmails.length,
          duplicateNames: duplicateNames.length,
          totalCompanies: companies.length
        };
      } else {
        console.log('✅ No se detectaron duplicados');
        
        Alert.alert(
          '✅ Sin Duplicados',
          `Estado actual:\n\n` +
          `• Total de empresas: ${companies.length}\n` +
          `• No se detectaron duplicados\n` +
          `• El sistema está funcionando correctamente`,
          [{ text: 'Perfecto' }]
        );
        
        return {
          hasDuplicates: false,
          totalCompanies: companies.length
        };
      }
    } else {
      console.log('ℹ️ No hay empresas registradas');
      
      Alert.alert(
        'ℹ️ Sin Empresas',
        'No hay empresas registradas en el sistema.',
        [{ text: 'OK' }]
      );
      
      return {
        hasDuplicates: false,
        totalCompanies: 0
      };
    }
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
    
    Alert.alert(
      '❌ Error',
      `Error verificando el estado actual:\n\n${error.message}`,
      [{ text: 'OK' }]
    );
    
    return {
      error: error.message
    };
  }
};

// Función principal para usar desde la consola o componentes
export const solutionDuplicates = {
  execute: executeFixNow,
  check: checkCurrentState
};

export default solutionDuplicates;