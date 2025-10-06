/**
 * SOLUCIÓN DEFINITIVA PARA DUPLICADOS DE EMPRESAS
 * 
 * Este script elimina duplicados existentes y aplica una protección robusta
 * para evitar que se vuelvan a crear duplicados en el futuro.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class DuplicateCompanyFixer {
  
  /**
   * Ejecutar solución completa
   */
  async executeFix() {
    try {
      console.log('🚀 INICIANDO SOLUCIÓN DEFINITIVA PARA DUPLICADOS DE EMPRESAS');
      console.log('='.repeat(60));
      
      // 1. Limpiar duplicados existentes
      await this.removeDuplicateCompanies();
      
      // 2. Verificar y mostrar estado final
      await this.verifyFinalState();
      
      // 3. Aplicar protección anti-duplicados mejorada
      await this.applyAntiDuplicateProtection();
      
      console.log('='.repeat(60));
      console.log('✅ SOLUCIÓN COMPLETADA EXITOSAMENTE');
      
      return {
        success: true,
        message: 'Duplicados eliminados y protección aplicada'
      };
      
    } catch (error) {
      console.error('❌ Error en solución de duplicados:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Eliminar empresas duplicadas
   */
  async removeDuplicateCompanies() {
    console.log('🔍 PASO 1: Eliminando duplicados existentes...');
    
    try {
      // Obtener todas las empresas
      const companiesData = await AsyncStorage.getItem('companiesList');
      const companies = companiesData ? JSON.parse(companiesData) : [];
      
      console.log(`📊 Total de empresas encontradas: ${companies.length}`);
      
      if (companies.length === 0) {
        console.log('ℹ️ No hay empresas para procesar');
        return;
      }
      
      // Mostrar empresas actuales
      console.log('\n📋 EMPRESAS ACTUALES:');
      companies.forEach((company, index) => {
        console.log(`${index + 1}. ${company.companyName || company.name} (${company.email}) - Plan: ${company.plan || 'N/A'}`);
      });
      
      // Identificar duplicados por email
      const emailGroups = {};
      companies.forEach((company, index) => {
        const email = company.email?.toLowerCase();
        if (email) {
          if (!emailGroups[email]) {
            emailGroups[email] = [];
          }
          emailGroups[email].push({ ...company, originalIndex: index });
        }
      });
      
      // Encontrar duplicados
      const duplicateEmails = Object.keys(emailGroups).filter(email => emailGroups[email].length > 1);
      
      if (duplicateEmails.length === 0) {
        console.log('✅ No se encontraron duplicados por email');
      } else {
        console.log(`\n⚠️ DUPLICADOS ENCONTRADOS: ${duplicateEmails.length} emails con duplicados`);
        
        duplicateEmails.forEach(email => {
          const duplicates = emailGroups[email];
          console.log(`\n📧 Email: ${email}`);
          duplicates.forEach((dup, index) => {
            console.log(`   ${index + 1}. ${dup.companyName || dup.name} - Registrado: ${dup.registrationDate || 'N/A'}`);
          });
        });
      }
      
      // Identificar duplicados por nombre
      const nameGroups = {};
      companies.forEach((company, index) => {
        const name = (company.companyName || company.name || '').toLowerCase().trim();
        if (name) {
          if (!nameGroups[name]) {
            nameGroups[name] = [];
          }
          nameGroups[name].push({ ...company, originalIndex: index });
        }
      });
      
      const duplicateNames = Object.keys(nameGroups).filter(name => nameGroups[name].length > 1);
      
      if (duplicateNames.length > 0) {
        console.log(`\n⚠️ DUPLICADOS POR NOMBRE: ${duplicateNames.length} nombres con duplicados`);
        
        duplicateNames.forEach(name => {
          const duplicates = nameGroups[name];
          console.log(`\n🏢 Nombre: ${name}`);
          duplicates.forEach((dup, index) => {
            console.log(`   ${index + 1}. ${dup.email} - Registrado: ${dup.registrationDate || 'N/A'}`);
          });
        });
      }
      
      // Crear lista limpia sin duplicados
      const cleanCompanies = [];
      const processedEmails = new Set();
      const processedNames = new Set();
      
      companies.forEach(company => {
        const email = company.email?.toLowerCase();
        const name = (company.companyName || company.name || '').toLowerCase().trim();
        
        // Verificar si ya procesamos este email o nombre
        const emailDuplicate = email && processedEmails.has(email);
        const nameDuplicate = name && processedNames.has(name);
        
        if (!emailDuplicate && !nameDuplicate) {
          // Primera ocurrencia, mantener
          cleanCompanies.push(company);
          if (email) processedEmails.add(email);
          if (name) processedNames.add(name);
          
          console.log(`✅ Manteniendo: ${company.companyName || company.name} (${company.email})`);
        } else {
          console.log(`❌ Eliminando duplicado: ${company.companyName || company.name} (${company.email})`);
        }
      });
      
      // Guardar lista limpia
      await AsyncStorage.setItem('companiesList', JSON.stringify(cleanCompanies));
      
      const removedCount = companies.length - cleanCompanies.length;
      console.log(`\n📊 RESUMEN DE LIMPIEZA:`);
      console.log(`   • Empresas originales: ${companies.length}`);
      console.log(`   • Empresas después de limpieza: ${cleanCompanies.length}`);
      console.log(`   • Duplicados eliminados: ${removedCount}`);
      
      // También limpiar usuarios aprobados duplicados
      await this.cleanDuplicateApprovedUsers();
      
    } catch (error) {
      console.error('❌ Error eliminando duplicados:', error);
      throw error;
    }
  }

  /**
   * Limpiar usuarios aprobados duplicados
   */
  async cleanDuplicateApprovedUsers() {
    console.log('\n🔍 Limpiando usuarios aprobados duplicados...');
    
    try {
      const approvedUsersData = await AsyncStorage.getItem('approvedUsers');
      const approvedUsers = approvedUsersData ? JSON.parse(approvedUsersData) : [];
      
      console.log(`📊 Total de usuarios aprobados: ${approvedUsers.length}`);
      
      // Filtrar solo empresas
      const companyUsers = approvedUsers.filter(user => user.role === 'company');
      const otherUsers = approvedUsers.filter(user => user.role !== 'company');
      
      console.log(`📊 Usuarios empresa: ${companyUsers.length}, Otros usuarios: ${otherUsers.length}`);
      
      if (companyUsers.length === 0) {
        console.log('ℹ️ No hay usuarios empresa para limpiar');
        return;
      }
      
      // Eliminar duplicados de empresas
      const cleanCompanyUsers = [];
      const processedEmails = new Set();
      
      companyUsers.forEach(user => {
        const email = user.email?.toLowerCase();
        
        if (email && !processedEmails.has(email)) {
          cleanCompanyUsers.push(user);
          processedEmails.add(email);
          console.log(`✅ Usuario empresa mantenido: ${user.companyName || user.name} (${user.email})`);
        } else {
          console.log(`❌ Usuario empresa duplicado eliminado: ${user.companyName || user.name} (${user.email})`);
        }
      });
      
      // Combinar usuarios limpios
      const allCleanUsers = [...otherUsers, ...cleanCompanyUsers];
      
      // Guardar lista limpia
      await AsyncStorage.setItem('approvedUsers', JSON.stringify(allCleanUsers));
      
      const removedUserCount = companyUsers.length - cleanCompanyUsers.length;
      console.log(`📊 Usuarios empresa duplicados eliminados: ${removedUserCount}`);
      
    } catch (error) {
      console.error('❌ Error limpiando usuarios aprobados:', error);
      throw error;
    }
  }

  /**
   * Verificar estado final
   */
  async verifyFinalState() {
    console.log('\n🔍 PASO 2: Verificando estado final...');
    
    try {
      // Verificar empresas
      const companiesData = await AsyncStorage.getItem('companiesList');
      const companies = companiesData ? JSON.parse(companiesData) : [];
      
      console.log(`\n📊 ESTADO FINAL - EMPRESAS:`);
      console.log(`   Total de empresas: ${companies.length}`);
      
      if (companies.length > 0) {
        console.log('\n📋 LISTA FINAL DE EMPRESAS:');
        companies.forEach((company, index) => {
          console.log(`${index + 1}. ${company.companyName || company.name}`);
          console.log(`   📧 Email: ${company.email}`);
          console.log(`   📅 Plan: ${company.plan || 'N/A'}`);
          console.log(`   📅 Registrado: ${company.registrationDate || 'N/A'}`);
          console.log('');
        });
      }
      
      // Verificar usuarios aprobados
      const approvedUsersData = await AsyncStorage.getItem('approvedUsers');
      const approvedUsers = approvedUsersData ? JSON.parse(approvedUsersData) : [];
      const companyUsers = approvedUsers.filter(user => user.role === 'company');
      
      console.log(`📊 ESTADO FINAL - USUARIOS EMPRESA APROBADOS:`);
      console.log(`   Total de usuarios empresa: ${companyUsers.length}`);
      
      // Verificar consistencia
      const companyEmails = new Set(companies.map(c => c.email?.toLowerCase()).filter(Boolean));
      const userEmails = new Set(companyUsers.map(u => u.email?.toLowerCase()).filter(Boolean));
      
      console.log(`\n🔍 VERIFICACIÓN DE CONSISTENCIA:`);
      console.log(`   Emails únicos en empresas: ${companyEmails.size}`);
      console.log(`   Emails únicos en usuarios: ${userEmails.size}`);
      
      // Buscar inconsistencias
      const onlyInCompanies = [...companyEmails].filter(email => !userEmails.has(email));
      const onlyInUsers = [...userEmails].filter(email => !companyEmails.has(email));
      
      if (onlyInCompanies.length > 0) {
        console.log(`⚠️ Empresas sin usuario aprobado: ${onlyInCompanies.length}`);
        onlyInCompanies.forEach(email => console.log(`   - ${email}`));
      }
      
      if (onlyInUsers.length > 0) {
        console.log(`⚠️ Usuarios sin empresa: ${onlyInUsers.length}`);
        onlyInUsers.forEach(email => console.log(`   - ${email}`));
      }
      
      if (onlyInCompanies.length === 0 && onlyInUsers.length === 0) {
        console.log('✅ Consistencia perfecta entre empresas y usuarios');
      }
      
    } catch (error) {
      console.error('❌ Error verificando estado final:', error);
      throw error;
    }
  }

  /**
   * Aplicar protección anti-duplicados mejorada
   */
  async applyAntiDuplicateProtection() {
    console.log('\n🛡️ PASO 3: Aplicando protección anti-duplicados...');
    
    try {
      // Crear índice de empresas existentes para búsqueda rápida
      const companiesData = await AsyncStorage.getItem('companiesList');
      const companies = companiesData ? JSON.parse(companiesData) : [];
      
      const companyIndex = {
        byEmail: {},
        byName: {},
        byId: {},
        lastUpdated: new Date().toISOString()
      };
      
      companies.forEach(company => {
        const email = company.email?.toLowerCase();
        const name = (company.companyName || company.name || '').toLowerCase().trim();
        const id = company.id;
        
        if (email) {
          companyIndex.byEmail[email] = {
            id: company.id,
            name: company.companyName || company.name,
            registrationDate: company.registrationDate
          };
        }
        
        if (name) {
          companyIndex.byName[name] = {
            id: company.id,
            email: company.email,
            registrationDate: company.registrationDate
          };
        }
        
        if (id) {
          companyIndex.byId[id] = {
            email: company.email,
            name: company.companyName || company.name
          };
        }
      });
      
      // Guardar índice para búsquedas rápidas
      await AsyncStorage.setItem('companyIndex', JSON.stringify(companyIndex));
      
      console.log('✅ Índice de empresas creado');
      console.log(`   • Emails indexados: ${Object.keys(companyIndex.byEmail).length}`);
      console.log(`   • Nombres indexados: ${Object.keys(companyIndex.byName).length}`);
      console.log(`   • IDs indexados: ${Object.keys(companyIndex.byId).length}`);
      
      // Crear configuración de protección
      const protectionConfig = {
        enabled: true,
        strictEmailValidation: true,
        strictNameValidation: true,
        preventConcurrentRegistrations: true,
        sessionIdTracking: true,
        maxRegistrationAttempts: 3,
        registrationCooldown: 300000, // 5 minutos
        lastUpdated: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('duplicateProtectionConfig', JSON.stringify(protectionConfig));
      
      console.log('✅ Configuración de protección aplicada');
      
    } catch (error) {
      console.error('❌ Error aplicando protección:', error);
      throw error;
    }
  }

  /**
   * Verificar si una empresa ya existe (método mejorado)
   */
  async companyExists(email, name = null) {
    try {
      const indexData = await AsyncStorage.getItem('companyIndex');
      if (!indexData) {
        // Fallback a búsqueda tradicional
        return await this.companyExistsFallback(email, name);
      }
      
      const index = JSON.parse(indexData);
      const emailKey = email?.toLowerCase();
      const nameKey = name?.toLowerCase().trim();
      
      // Verificar por email
      if (emailKey && index.byEmail[emailKey]) {
        return {
          exists: true,
          type: 'email',
          existing: index.byEmail[emailKey]
        };
      }
      
      // Verificar por nombre si se proporciona
      if (nameKey && index.byName[nameKey]) {
        return {
          exists: true,
          type: 'name',
          existing: index.byName[nameKey]
        };
      }
      
      return { exists: false };
      
    } catch (error) {
      console.error('Error verificando existencia de empresa:', error);
      return await this.companyExistsFallback(email, name);
    }
  }

  /**
   * Método fallback para verificar existencia
   */
  async companyExistsFallback(email, name) {
    try {
      const companiesData = await AsyncStorage.getItem('companiesList');
      const companies = companiesData ? JSON.parse(companiesData) : [];
      
      const emailKey = email?.toLowerCase();
      const nameKey = name?.toLowerCase().trim();
      
      for (const company of companies) {
        const companyEmail = company.email?.toLowerCase();
        const companyName = (company.companyName || company.name || '').toLowerCase().trim();
        
        if (emailKey && companyEmail === emailKey) {
          return {
            exists: true,
            type: 'email',
            existing: company
          };
        }
        
        if (nameKey && companyName === nameKey) {
          return {
            exists: true,
            type: 'name',
            existing: company
          };
        }
      }
      
      return { exists: false };
      
    } catch (error) {
      console.error('Error en verificación fallback:', error);
      return { exists: false };
    }
  }
}

// Función para ejecutar la solución
export const executeDuplicatesFix = async () => {
  const fixer = new DuplicateCompanyFixer();
  return await fixer.executeFix();
};

// Función para verificar si una empresa existe
export const checkCompanyExists = async (email, name = null) => {
  const fixer = new DuplicateCompanyFixer();
  return await fixer.companyExists(email, name);
};

export default DuplicateCompanyFixer;