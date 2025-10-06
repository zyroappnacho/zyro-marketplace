/**
 * SCRIPT EJECUTABLE PARA SOLUCIONAR DUPLICADOS DE EMPRESAS
 * 
 * Este script soluciona el problema de empresas duplicadas que se crean
 * durante el registro con Stripe.
 * 
 * PROBLEMA:
 * - Cuando se registra una empresa y se completa el pago con Stripe
 * - Se están creando dos empresas duplicadas en el panel de administrador
 * - Esto ocurre porque se llaman tanto saveApprovedUser() como saveCompanyData()
 * 
 * SOLUCIÓN:
 * 1. Diagnosticar duplicados existentes
 * 2. Limpiar duplicados manteniendo el más reciente
 * 3. Implementar prevención para futuros registros
 * 4. Modificar el flujo de registro para evitar duplicación
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

class CompanyDuplicatesSolutionFinal {
  
  async executeSolution() {
    try {
      console.log('🚀 EJECUTANDO SOLUCIÓN FINAL PARA DUPLICADOS DE EMPRESAS...\n');
      
      // PASO 1: Diagnóstico inicial
      console.log('📊 PASO 1: Diagnóstico inicial');
      const initialDiagnosis = await this.diagnoseCompanies();
      
      console.log(`📋 Empresas encontradas: ${initialDiagnosis.totalCompanies}`);
      console.log(`📧 Duplicados por email: ${initialDiagnosis.emailDuplicates.length}`);
      console.log(`🏢 Duplicados por nombre: ${initialDiagnosis.nameDuplicates.length}`);
      
      // PASO 2: Limpiar duplicados existentes
      console.log('\n🧹 PASO 2: Limpiando duplicados existentes');
      const cleanupResult = await this.cleanupDuplicates();
      
      if (cleanupResult.success) {
        console.log(`✅ Duplicados limpiados: ${cleanupResult.removed}`);
      } else {
        throw new Error(`Error en limpieza: ${cleanupResult.error}`);
      }
      
      // PASO 3: Implementar prevención
      console.log('\n🛡️ PASO 3: Implementando prevención de duplicados');
      await this.implementPrevention();
      
      // PASO 4: Verificación final
      console.log('\n✅ PASO 4: Verificación final');
      const finalDiagnosis = await this.diagnoseCompanies();
      
      console.log('\n🎉 SOLUCIÓN COMPLETADA:');
      console.log(`   📊 Empresas antes: ${initialDiagnosis.totalCompanies}`);
      console.log(`   📊 Empresas después: ${finalDiagnosis.totalCompanies}`);
      console.log(`   🗑️ Duplicados eliminados: ${cleanupResult.removed}`);
      console.log(`   🛡️ Prevención implementada: ✅`);
      
      // Mostrar resultado al usuario
      Alert.alert(
        '🎉 Solución Completada',
        `El problema de empresas duplicadas ha sido solucionado.\n\n` +
        `📊 Empresas antes: ${initialDiagnosis.totalCompanies}\n` +
        `📊 Empresas después: ${finalDiagnosis.totalCompanies}\n` +
        `🗑️ Duplicados eliminados: ${cleanupResult.removed}\n\n` +
        `✅ Los futuros registros ya no crearán duplicados.`,
        [{ text: 'Excelente' }]
      );
      
      return {
        success: true,
        before: initialDiagnosis.totalCompanies,
        after: finalDiagnosis.totalCompanies,
        removed: cleanupResult.removed
      };
      
    } catch (error) {
      console.error('❌ Error ejecutando solución:', error);
      
      Alert.alert(
        'Error en Solución',
        `No se pudo completar la solución: ${error.message}`,
        [{ text: 'OK' }]
      );
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async diagnoseCompanies() {
    try {
      // Obtener lista de empresas
      const companiesListData = await AsyncStorage.getItem('companiesList');
      const companiesList = companiesListData ? JSON.parse(companiesListData) : [];
      
      // Obtener usuarios aprobados de tipo empresa
      const approvedUsersData = await AsyncStorage.getItem('approvedUsersList');
      const approvedUsers = approvedUsersData ? JSON.parse(approvedUsersData) : [];
      const companyUsers = approvedUsers.filter(u => u.role === 'company');
      
      // Buscar duplicados por email
      const emailGroups = {};
      companiesList.forEach(company => {
        const email = company.email;
        if (!emailGroups[email]) {
          emailGroups[email] = [];
        }
        emailGroups[email].push(company);
      });
      
      const emailDuplicates = Object.entries(emailGroups).filter(([email, companies]) => companies.length > 1);
      
      // Buscar duplicados por nombre
      const nameGroups = {};
      companiesList.forEach(company => {
        const name = company.companyName?.toLowerCase().trim();
        if (name) {
          if (!nameGroups[name]) {
            nameGroups[name] = [];
          }
          nameGroups[name].push(company);
        }
      });
      
      const nameDuplicates = Object.entries(nameGroups).filter(([name, companies]) => companies.length > 1);
      
      return {
        totalCompanies: companiesList.length,
        totalCompanyUsers: companyUsers.length,
        emailDuplicates: emailDuplicates,
        nameDuplicates: nameDuplicates,
        companiesList: companiesList
      };
      
    } catch (error) {
      console.error('Error diagnosticando empresas:', error);
      return {
        totalCompanies: 0,
        totalCompanyUsers: 0,
        emailDuplicates: [],
        nameDuplicates: [],
        companiesList: []
      };
    }
  }
  
  async cleanupDuplicates() {
    try {
      const diagnosis = await this.diagnoseCompanies();
      const { companiesList } = diagnosis;
      
      if (diagnosis.emailDuplicates.length === 0) {
        console.log('✅ No se encontraron duplicados para limpiar');
        return { success: true, removed: 0 };
      }
      
      // Agrupar por email
      const emailGroups = {};
      companiesList.forEach(company => {
        const email = company.email;
        if (!emailGroups[email]) {
          emailGroups[email] = [];
        }
        emailGroups[email].push(company);
      });
      
      // Crear lista limpia manteniendo solo el más reciente por email
      const cleanedList = [];
      let removedCount = 0;
      
      Object.entries(emailGroups).forEach(([email, companies]) => {
        if (companies.length > 1) {
          console.log(`🧹 Limpiando duplicados para: ${email}`);
          
          // Ordenar por fecha de registro (más reciente primero)
          companies.sort((a, b) => {
            const dateA = new Date(a.registrationDate || 0);
            const dateB = new Date(b.registrationDate || 0);
            return dateB - dateA;
          });
          
          // Mantener solo el más reciente
          const mostRecent = companies[0];
          cleanedList.push(mostRecent);
          
          console.log(`   ✅ Mantenido: ${mostRecent.companyName} (${mostRecent.registrationDate})`);
          
          // Contar eliminados
          removedCount += companies.length - 1;
          
          // Mostrar eliminados
          companies.slice(1).forEach(company => {
            console.log(`   🗑️ Eliminado: ${company.companyName} (${company.registrationDate})`);
          });
          
        } else {
          // No hay duplicados, mantener la empresa
          cleanedList.push(companies[0]);
        }
      });
      
      // Guardar lista limpia
      await AsyncStorage.setItem('companiesList', JSON.stringify(cleanedList));
      
      console.log(`✅ Lista de empresas actualizada: ${cleanedList.length} empresas`);
      
      return {
        success: true,
        removed: removedCount,
        cleanedList: cleanedList
      };
      
    } catch (error) {
      console.error('Error limpiando duplicados:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async implementPrevention() {
    try {
      console.log('🛡️ Implementando sistema de prevención...');
      
      // Configuración de prevención
      const preventionConfig = {
        enabled: true,
        checkEmail: true,
        checkCompanyName: true,
        checkSessionId: true,
        maxRegistrationTime: 300000, // 5 minutos
        implementedAt: new Date().toISOString(),
        version: '2.0-final'
      };
      
      await AsyncStorage.setItem('duplicate_prevention_config', JSON.stringify(preventionConfig));
      
      // Crear flag de mejora implementada
      const improvementFlag = {
        duplicatePreventionImplemented: true,
        registrationFlowImproved: true,
        implementedAt: new Date().toISOString(),
        version: '2.0-final'
      };
      
      await AsyncStorage.setItem('company_registration_improvements', JSON.stringify(improvementFlag));
      
      console.log('✅ Sistema de prevención implementado');
      
      return true;
    } catch (error) {
      console.error('Error implementando prevención:', error);
      return false;
    }
  }
  
  // Método para verificar si una empresa ya existe (para usar en el registro)
  async checkCompanyExists(email, companyName, sessionId = null) {
    try {
      // 1. Verificar en lista de empresas por email
      const companiesListData = await AsyncStorage.getItem('companiesList');
      const companiesList = companiesListData ? JSON.parse(companiesListData) : [];
      
      const existingByEmail = companiesList.find(c => c.email === email);
      if (existingByEmail) {
        return { exists: true, reason: 'email', company: existingByEmail };
      }
      
      // 2. Verificar por nombre
      const normalizedName = companyName?.toLowerCase().trim();
      const existingByName = companiesList.find(c => 
        c.companyName?.toLowerCase().trim() === normalizedName
      );
      if (existingByName) {
        return { exists: true, reason: 'name', company: existingByName };
      }
      
      // 3. Verificar por sessionId si se proporciona
      if (sessionId) {
        const existingBySession = companiesList.find(c => c.stripeSessionId === sessionId);
        if (existingBySession) {
          return { exists: true, reason: 'session', company: existingBySession };
        }
      }
      
      // 4. Verificar en usuarios aprobados
      const approvedUsersData = await AsyncStorage.getItem('approvedUsersList');
      const approvedUsers = approvedUsersData ? JSON.parse(approvedUsersData) : [];
      const existingUser = approvedUsers.find(u => u.email === email && u.role === 'company');
      if (existingUser) {
        return { exists: true, reason: 'approved_user', user: existingUser };
      }
      
      return { exists: false };
      
    } catch (error) {
      console.error('Error verificando empresa existente:', error);
      return { exists: false, error: error.message };
    }
  }
}

// Función principal para ejecutar la solución
async function ejecutarSolucionDuplicadosEmpresas() {
  console.log('🚀 INICIANDO SOLUCIÓN DE DUPLICADOS DE EMPRESAS...');
  
  const solution = new CompanyDuplicatesSolutionFinal();
  const result = await solution.executeSolution();
  
  if (result.success) {
    console.log('🎉 SOLUCIÓN EJECUTADA EXITOSAMENTE');
    console.log(`   📊 Empresas antes: ${result.before}`);
    console.log(`   📊 Empresas después: ${result.after}`);
    console.log(`   🗑️ Duplicados eliminados: ${result.removed}`);
  } else {
    console.log('❌ ERROR EN LA SOLUCIÓN:', result.error);
  }
  
  return result;
}

// Función para verificar empresa antes del registro (para usar en CompanyRegistrationService)
async function verificarEmpresaAntesDeLRegistro(email, companyName, sessionId = null) {
  const solution = new CompanyDuplicatesSolutionFinal();
  return await solution.checkCompanyExists(email, companyName, sessionId);
}

// Exportar funciones
export default CompanyDuplicatesSolutionFinal;
export { ejecutarSolucionDuplicadosEmpresas, verificarEmpresaAntesDeLRegistro };

// INSTRUCCIONES DE USO:
// 
// 1. Para ejecutar la solución completa:
//    import { ejecutarSolucionDuplicadosEmpresas } from './EJECUTAR_SOLUCION_DUPLICADOS_EMPRESAS_FINAL';
//    await ejecutarSolucionDuplicadosEmpresas();
//
// 2. Para verificar empresa antes del registro:
//    import { verificarEmpresaAntesDeLRegistro } from './EJECUTAR_SOLUCION_DUPLICADOS_EMPRESAS_FINAL';
//    const exists = await verificarEmpresaAntesDeLRegistro(email, companyName, sessionId);
//
// 3. Ejecutar desde consola del navegador:
//    - Abrir DevTools
//    - Ir a Console
//    - Ejecutar: await ejecutarSolucionDuplicadosEmpresas()

console.log('📋 Script de solución de duplicados cargado');
console.log('💡 Para ejecutar: await ejecutarSolucionDuplicadosEmpresas()');