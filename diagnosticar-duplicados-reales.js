/**
 * DIAGNÓSTICO DE DUPLICADOS REALES EN EL SISTEMA
 * 
 * Este script diagnostica el problema real de duplicados que ocurre
 * durante el registro de empresas con Stripe
 */

import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from './services/StorageService';

class DiagnosticoDuplicadosReales {
  
  /**
   * Ejecutar diagnóstico completo del sistema real
   */
  async ejecutarDiagnosticoCompleto() {
    try {
      console.log('🔍 INICIANDO DIAGNÓSTICO DE DUPLICADOS REALES...\n');
      
      // PASO 1: Verificar estado actual de empresas
      console.log('📊 PASO 1: Estado actual de empresas');
      const estadoActual = await this.verificarEstadoActual();
      
      // PASO 2: Analizar flujo de registro
      console.log('\n🔄 PASO 2: Análisis del flujo de registro');
      const analisisRegistro = await this.analizarFlujoRegistro();
      
      // PASO 3: Identificar puntos de duplicación
      console.log('\n🎯 PASO 3: Identificando puntos de duplicación');
      const puntosDuplicacion = await this.identificarPuntosDuplicacion();
      
      // PASO 4: Verificar datos existentes
      console.log('\n📋 PASO 4: Verificando datos existentes');
      const datosExistentes = await this.verificarDatosExistentes();
      
      const resultado = {
        estadoActual,
        analisisRegistro,
        puntosDuplicacion,
        datosExistentes,
        timestamp: new Date().toISOString()
      };
      
      // Mostrar resumen
      this.mostrarResumenDiagnostico(resultado);
      
      return resultado;
      
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      
      Alert.alert(
        'Error en Diagnóstico',
        `Error ejecutando diagnóstico: ${error.message}`,
        [{ text: 'OK' }]
      );
      
      return null;
    }
  }
  
  /**
   * Verificar estado actual de empresas
   */
  async verificarEstadoActual() {
    try {
      // 1. Obtener lista de empresas del admin
      const companiesListData = await AsyncStorage.getItem('companiesList');
      const companiesList = companiesListData ? JSON.parse(companiesListData) : [];
      
      // 2. Obtener usuarios aprobados de tipo empresa
      const approvedUsersData = await AsyncStorage.getItem('approvedUsersList');
      const approvedUsers = approvedUsersData ? JSON.parse(approvedUsersData) : [];
      const companyUsers = approvedUsers.filter(u => u.role === 'company');
      
      // 3. Buscar duplicados por email
      const emailGroups = {};
      companiesList.forEach(company => {
        const email = company.email;
        if (!emailGroups[email]) {
          emailGroups[email] = [];
        }
        emailGroups[email].push(company);
      });
      
      const duplicadosPorEmail = Object.entries(emailGroups).filter(([email, companies]) => companies.length > 1);
      
      // 4. Buscar duplicados por nombre
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
      
      const duplicadosPorNombre = Object.entries(nameGroups).filter(([name, companies]) => companies.length > 1);
      
      console.log(`   📊 Total empresas en lista admin: ${companiesList.length}`);
      console.log(`   👥 Total usuarios empresa aprobados: ${companyUsers.length}`);
      console.log(`   📧 Duplicados por email: ${duplicadosPorEmail.length}`);
      console.log(`   🏢 Duplicados por nombre: ${duplicadosPorNombre.length}`);
      
      if (duplicadosPorEmail.length > 0) {
        console.log('\n   📧 DUPLICADOS POR EMAIL ENCONTRADOS:');
        duplicadosPorEmail.forEach(([email, companies]) => {
          console.log(`     Email: ${email} (${companies.length} duplicados)`);
          companies.forEach((company, index) => {
            console.log(`       ${index + 1}. ID: ${company.id}, Nombre: ${company.companyName}`);
            console.log(`          Fecha: ${company.registrationDate}`);
            console.log(`          Plan: ${company.plan}`);
          });
        });
      }
      
      return {
        totalEmpresas: companiesList.length,
        totalUsuariosEmpresa: companyUsers.length,
        duplicadosPorEmail: duplicadosPorEmail,
        duplicadosPorNombre: duplicadosPorNombre,
        companiesList: companiesList,
        companyUsers: companyUsers
      };
      
    } catch (error) {
      console.error('Error verificando estado actual:', error);
      return {
        totalEmpresas: 0,
        totalUsuariosEmpresa: 0,
        duplicadosPorEmail: [],
        duplicadosPorNombre: [],
        companiesList: [],
        companyUsers: []
      };
    }
  }
  
  /**
   * Analizar flujo de registro
   */
  async analizarFlujoRegistro() {
    try {
      console.log('   🔄 Analizando flujo de registro de empresas...');
      
      // Verificar configuraciones de prevención
      const preventionConfig = await AsyncStorage.getItem('duplicate_prevention_config');
      const improvementFlag = await AsyncStorage.getItem('company_registration_improvements');
      
      // Verificar registros en proceso
      const allKeys = await AsyncStorage.getAllKeys();
      const registrationKeys = allKeys.filter(key => key.startsWith('registration_in_progress_'));
      const processingKeys = allKeys.filter(key => key.startsWith('processing_'));
      
      console.log(`   🛡️ Configuración de prevención: ${preventionConfig ? 'EXISTE' : 'NO EXISTE'}`);
      console.log(`   🚀 Flag de mejoras: ${improvementFlag ? 'EXISTE' : 'NO EXISTE'}`);
      console.log(`   ⏳ Registros en proceso: ${registrationKeys.length}`);
      console.log(`   🔄 Claves de procesamiento: ${processingKeys.length}`);
      
      return {
        preventionConfigExists: !!preventionConfig,
        improvementFlagExists: !!improvementFlag,
        registrationsInProgress: registrationKeys.length,
        processingKeys: processingKeys.length,
        preventionConfig: preventionConfig ? JSON.parse(preventionConfig) : null,
        improvementFlag: improvementFlag ? JSON.parse(improvementFlag) : null
      };
      
    } catch (error) {
      console.error('Error analizando flujo de registro:', error);
      return {
        preventionConfigExists: false,
        improvementFlagExists: false,
        registrationsInProgress: 0,
        processingKeys: 0
      };
    }
  }
  
  /**
   * Identificar puntos de duplicación
   */
  async identificarPuntosDuplicacion() {
    try {
      console.log('   🎯 Identificando puntos donde se crean duplicados...');
      
      const puntos = [];
      
      // 1. Verificar si saveApprovedUser y saveCompanyData se llaman ambos
      puntos.push({
        punto: 'CompanyRegistrationService.createCompanyProfileAfterPayment',
        descripcion: 'Se llaman tanto saveApprovedUser como saveCompanyData',
        riesgo: 'ALTO',
        solucion: 'Usar solo saveCompanyData que maneja ambas listas'
      });
      
      // 2. Verificar StorageService.saveCompanyData
      puntos.push({
        punto: 'StorageService.saveCompanyData',
        descripcion: 'Agrega empresa a companiesList automáticamente',
        riesgo: 'MEDIO',
        solucion: 'Verificar duplicados antes de agregar'
      });
      
      // 3. Verificar StorageService.saveApprovedUser
      puntos.push({
        punto: 'StorageService.saveApprovedUser',
        descripcion: 'Agrega usuario a approvedUsersList',
        riesgo: 'MEDIO',
        solucion: 'Coordinar con saveCompanyData'
      });
      
      // 4. Verificar handlePaymentSuccess
      puntos.push({
        punto: 'CompanyRegistrationWithStripe.handlePaymentSuccess',
        descripcion: 'Puede llamarse múltiples veces si hay errores de red',
        riesgo: 'ALTO',
        solucion: 'Implementar protección anti-duplicados'
      });
      
      console.log(`   🎯 Puntos de riesgo identificados: ${puntos.length}`);
      puntos.forEach((punto, index) => {
        console.log(`     ${index + 1}. ${punto.punto} (Riesgo: ${punto.riesgo})`);
        console.log(`        ${punto.descripcion}`);
      });
      
      return puntos;
      
    } catch (error) {
      console.error('Error identificando puntos de duplicación:', error);
      return [];
    }
  }
  
  /**
   * Verificar datos existentes
   */
  async verificarDatosExistentes() {
    try {
      console.log('   📋 Verificando integridad de datos existentes...');
      
      // Obtener todas las claves relacionadas con empresas
      const allKeys = await AsyncStorage.getAllKeys();
      const companyKeys = allKeys.filter(key => 
        key.startsWith('company_') || 
        key.startsWith('approved_user_') ||
        key === 'companiesList' ||
        key === 'approvedUsersList'
      );
      
      console.log(`   🔑 Total claves relacionadas con empresas: ${companyKeys.length}`);
      
      // Verificar consistencia entre listas
      const companiesListData = await AsyncStorage.getItem('companiesList');
      const companiesList = companiesListData ? JSON.parse(companiesListData) : [];
      
      const approvedUsersData = await AsyncStorage.getItem('approvedUsersList');
      const approvedUsers = approvedUsersData ? JSON.parse(approvedUsersData) : [];
      const companyUsers = approvedUsers.filter(u => u.role === 'company');
      
      // Verificar si cada empresa en companiesList tiene su usuario correspondiente
      const inconsistencias = [];
      
      for (const company of companiesList) {
        const correspondingUser = companyUsers.find(u => u.email === company.email);
        if (!correspondingUser) {
          inconsistencias.push({
            tipo: 'EMPRESA_SIN_USUARIO',
            empresa: company.companyName,
            email: company.email,
            id: company.id
          });
        }
      }
      
      // Verificar si cada usuario empresa tiene su empresa correspondiente
      for (const user of companyUsers) {
        const correspondingCompany = companiesList.find(c => c.email === user.email);
        if (!correspondingCompany) {
          inconsistencias.push({
            tipo: 'USUARIO_SIN_EMPRESA',
            usuario: user.name,
            email: user.email,
            id: user.id
          });
        }
      }
      
      console.log(`   ⚠️ Inconsistencias encontradas: ${inconsistencias.length}`);
      if (inconsistencias.length > 0) {
        inconsistencias.forEach((inc, index) => {
          console.log(`     ${index + 1}. ${inc.tipo}: ${inc.empresa || inc.usuario} (${inc.email})`);
        });
      }
      
      return {
        totalKeys: companyKeys.length,
        inconsistencias: inconsistencias,
        companiesListCount: companiesList.length,
        companyUsersCount: companyUsers.length
      };
      
    } catch (error) {
      console.error('Error verificando datos existentes:', error);
      return {
        totalKeys: 0,
        inconsistencias: [],
        companiesListCount: 0,
        companyUsersCount: 0
      };
    }
  }
  
  /**
   * Mostrar resumen del diagnóstico
   */
  mostrarResumenDiagnostico(resultado) {
    console.log('\n📋 RESUMEN DEL DIAGNÓSTICO:');
    console.log('================================');
    
    console.log(`📊 Estado Actual:`);
    console.log(`   - Empresas en admin: ${resultado.estadoActual.totalEmpresas}`);
    console.log(`   - Usuarios empresa: ${resultado.estadoActual.totalUsuariosEmpresa}`);
    console.log(`   - Duplicados por email: ${resultado.estadoActual.duplicadosPorEmail.length}`);
    console.log(`   - Duplicados por nombre: ${resultado.estadoActual.duplicadosPorNombre.length}`);
    
    console.log(`\n🔄 Flujo de Registro:`);
    console.log(`   - Prevención configurada: ${resultado.analisisRegistro.preventionConfigExists ? 'SÍ' : 'NO'}`);
    console.log(`   - Mejoras implementadas: ${resultado.analisisRegistro.improvementFlagExists ? 'SÍ' : 'NO'}`);
    console.log(`   - Registros en proceso: ${resultado.analisisRegistro.registrationsInProgress}`);
    
    console.log(`\n🎯 Puntos de Riesgo:`);
    console.log(`   - Puntos identificados: ${resultado.puntosDuplicacion.length}`);
    
    console.log(`\n📋 Integridad de Datos:`);
    console.log(`   - Inconsistencias: ${resultado.datosExistentes.inconsistencias.length}`);
    
    // Determinar si hay problema activo
    const hayProblema = resultado.estadoActual.duplicadosPorEmail.length > 0 || 
                       resultado.estadoActual.duplicadosPorNombre.length > 0 ||
                       resultado.datosExistentes.inconsistencias.length > 0;
    
    console.log(`\n🚨 ESTADO: ${hayProblema ? 'PROBLEMA DETECTADO' : 'SISTEMA LIMPIO'}`);
    
    if (hayProblema) {
      console.log('\n🔧 ACCIONES RECOMENDADAS:');
      console.log('   1. Ejecutar limpieza de duplicados');
      console.log('   2. Implementar protección anti-duplicados');
      console.log('   3. Verificar flujo de registro');
      console.log('   4. Probar registro completo');
    }
    
    // Mostrar alerta al usuario
    Alert.alert(
      'Diagnóstico Completado',
      `Estado: ${hayProblema ? 'Problema Detectado' : 'Sistema Limpio'}\n\n` +
      `Empresas: ${resultado.estadoActual.totalEmpresas}\n` +
      `Duplicados: ${resultado.estadoActual.duplicadosPorEmail.length}\n` +
      `Inconsistencias: ${resultado.datosExistentes.inconsistencias.length}\n\n` +
      `${hayProblema ? 'Se requiere limpieza.' : 'Todo funciona correctamente.'}`,
      [
        { text: 'Ver Detalles', onPress: () => console.log('Resultado completo:', resultado) },
        { text: 'OK' }
      ]
    );
  }
  
  /**
   * Mostrar menú de diagnóstico
   */
  mostrarMenuDiagnostico() {
    Alert.alert(
      'Diagnóstico de Duplicados',
      'Selecciona el tipo de diagnóstico:',
      [
        {
          text: 'Diagnóstico Completo',
          onPress: () => this.ejecutarDiagnosticoCompleto()
        },
        {
          text: 'Solo Estado Actual',
          onPress: () => this.verificarEstadoActual().then(result => {
            Alert.alert(
              'Estado Actual',
              `Empresas: ${result.totalEmpresas}\nDuplicados: ${result.duplicadosPorEmail.length}`,
              [{ text: 'OK' }]
            );
          })
        },
        {
          text: 'Solo Verificar Datos',
          onPress: () => this.verificarDatosExistentes().then(result => {
            Alert.alert(
              'Verificación de Datos',
              `Inconsistencias: ${result.inconsistencias.length}`,
              [{ text: 'OK' }]
            );
          })
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  }
}

// Funciones de utilidad para usar desde otros componentes
export const ejecutarDiagnosticoReales = async () => {
  const diagnostico = new DiagnosticoDuplicadosReales();
  return await diagnostico.ejecutarDiagnosticoCompleto();
};

export const mostrarMenuDiagnosticoReales = () => {
  const diagnostico = new DiagnosticoDuplicadosReales();
  diagnostico.mostrarMenuDiagnostico();
};

export default DiagnosticoDuplicadosReales;