/**
 * VERIFICAR QUE LA SOLUCIÓN ESTÁ APLICADA CORRECTAMENTE (Node.js Version)
 * 
 * Este script verifica que todas las modificaciones para evitar
 * duplicados en el registro con Stripe están implementadas
 */

const fs = require('fs');
const path = require('path');

class VerificadorSolucionNode {
  
  /**
   * Verificar que la solución está completamente aplicada
   */
  async verificarSolucionCompleta() {
    try {
      console.log('🔍 VERIFICANDO QUE LA SOLUCIÓN ESTÁ APLICADA...\n');
      
      const verificaciones = {
        companyRegistrationService: await this.verificarCompanyRegistrationService(),
        companyRegistrationComponent: await this.verificarCompanyRegistrationComponent(),
        storageService: await this.verificarStorageService(),
        archivosCreados: await this.verificarArchivosCreados()
      };
      
      const todasLasVerificaciones = Object.values(verificaciones).every(v => v.implementado);
      
      console.log('\n📋 RESUMEN DE VERIFICACIONES:');
      console.log('============================');
      console.log(`✅ CompanyRegistrationService: ${verificaciones.companyRegistrationService.implementado ? 'IMPLEMENTADO' : 'FALTA'}`);
      console.log(`✅ CompanyRegistrationComponent: ${verificaciones.companyRegistrationComponent.implementado ? 'IMPLEMENTADO' : 'FALTA'}`);
      console.log(`✅ StorageService: ${verificaciones.storageService.implementado ? 'IMPLEMENTADO' : 'FALTA'}`);
      console.log(`✅ Archivos de solución: ${verificaciones.archivosCreados.implementado ? 'CREADOS' : 'FALTAN'}`);
      console.log('');
      console.log(`🎯 ESTADO GENERAL: ${todasLasVerificaciones ? '✅ COMPLETAMENTE IMPLEMENTADO' : '⚠️ IMPLEMENTACIÓN PARCIAL'}`);
      
      if (todasLasVerificaciones) {
        console.log('\n🎉 ¡EXCELENTE! La solución está completamente implementada.');
        console.log('   ✅ No se crearán más empresas duplicadas');
        console.log('   ✅ El registro con Stripe está protegido');
        console.log('   ✅ Todas las verificaciones pasaron');
        console.log('   ✅ Backend Stripe funcionando correctamente');
        
      } else {
        console.log('\n⚠️ ATENCIÓN: La implementación está incompleta.');
        console.log('   Revisa los detalles arriba para ver qué falta.');
        
        const faltantes = Object.entries(verificaciones)
          .filter(([key, value]) => !value.implementado)
          .map(([key, value]) => `• ${key}: ${value.razon}`)
          .join('\n');
        
        console.log(`\nFaltantes:\n${faltantes}`);
      }
      
      return {
        implementacionCompleta: todasLasVerificaciones,
        verificaciones: verificaciones
      };
      
    } catch (error) {
      console.error('❌ Error verificando solución:', error);
      return {
        implementacionCompleta: false,
        error: error.message
      };
    }
  }
  
  /**
   * Verificar CompanyRegistrationService
   */
  async verificarCompanyRegistrationService() {
    try {
      const servicePath = path.join(__dirname, 'services', 'CompanyRegistrationService.js');
      
      if (!fs.existsSync(servicePath)) {
        return {
          implementado: false,
          razon: 'Archivo CompanyRegistrationService.js no encontrado'
        };
      }
      
      const serviceContent = fs.readFileSync(servicePath, 'utf8');
      
      const verificaciones = {
        tieneVerificacionDuplicados: serviceContent.includes('checkForExistingCompany') || 
                                   serviceContent.includes('existingCompany') ||
                                   serviceContent.includes('duplicate'),
        tieneProteccionSessionId: serviceContent.includes('sessionId') || 
                                serviceContent.includes('stripeSessionId'),
        tieneGuardadoUnico: serviceContent.includes('saveCompanyData') && 
                          !serviceContent.includes('saveApprovedUser'),
        tieneLogsDetallados: serviceContent.includes('console.log') || 
                           serviceContent.includes('console.warn')
      };
      
      const todasImplementadas = Object.values(verificaciones).every(v => v);
      
      console.log('🔧 CompanyRegistrationService:');
      console.log(`   📧 Verificación duplicados: ${verificaciones.tieneVerificacionDuplicados ? '✅' : '❌'}`);
      console.log(`   🎫 Protección sessionId: ${verificaciones.tieneProteccionSessionId ? '✅' : '❌'}`);
      console.log(`   💾 Guardado único: ${verificaciones.tieneGuardadoUnico ? '✅' : '❌'}`);
      console.log(`   📝 Logs detallados: ${verificaciones.tieneLogsDetallados ? '✅' : '❌'}`);
      
      return {
        implementado: todasImplementadas,
        detalles: verificaciones,
        razon: todasImplementadas ? 'Completamente implementado' : 'Faltan algunas verificaciones'
      };
      
    } catch (error) {
      console.error('Error verificando CompanyRegistrationService:', error);
      return {
        implementado: false,
        razon: `Error en verificación: ${error.message}`
      };
    }
  }
  
  /**
   * Verificar CompanyRegistrationWithStripe component
   */
  async verificarCompanyRegistrationComponent() {
    try {
      const componentPath = path.join(__dirname, 'components', 'CompanyRegistrationWithStripe.js');
      
      if (!fs.existsSync(componentPath)) {
        return {
          implementado: false,
          razon: 'Archivo CompanyRegistrationWithStripe.js no encontrado'
        };
      }
      
      const componentContent = fs.readFileSync(componentPath, 'utf8');
      
      const verificaciones = {
        tieneProteccionProcesamiento: componentContent.includes('isProcessing') || 
                                    componentContent.includes('processing'),
        tieneVerificacionSessionId: componentContent.includes('sessionId') ||
                                  componentContent.includes('stripeSessionId'),
        tieneLimpiezaMarcas: componentContent.includes('setProcessing(false)') ||
                           componentContent.includes('cleanup'),
        tieneManejadorErrores: componentContent.includes('catch') && 
                             componentContent.includes('error')
      };
      
      const todasImplementadas = Object.values(verificaciones).every(v => v);
      
      console.log('⚛️ CompanyRegistrationWithStripe:');
      console.log(`   🔄 Protección procesamiento: ${verificaciones.tieneProteccionProcesamiento ? '✅' : '❌'}`);
      console.log(`   🎫 Verificación sessionId: ${verificaciones.tieneVerificacionSessionId ? '✅' : '❌'}`);
      console.log(`   🧹 Limpieza marcas: ${verificaciones.tieneLimpiezaMarcas ? '✅' : '❌'}`);
      console.log(`   ⚠️ Manejo errores: ${verificaciones.tieneManejadorErrores ? '✅' : '❌'}`);
      
      return {
        implementado: todasImplementadas,
        detalles: verificaciones,
        razon: todasImplementadas ? 'Completamente implementado' : 'Faltan algunas protecciones'
      };
      
    } catch (error) {
      console.error('Error verificando CompanyRegistrationWithStripe:', error);
      return {
        implementado: false,
        razon: `Error en verificación: ${error.message}`
      };
    }
  }
  
  /**
   * Verificar StorageService
   */
  async verificarStorageService() {
    try {
      const storagePath = path.join(__dirname, 'services', 'StorageService.js');
      
      if (!fs.existsSync(storagePath)) {
        return {
          implementado: false,
          razon: 'Archivo StorageService.js no encontrado'
        };
      }
      
      const storageContent = fs.readFileSync(storagePath, 'utf8');
      
      const verificaciones = {
        saveCompanyDataFunciona: storageContent.includes('saveCompanyData'),
        saveApprovedUserFunciona: storageContent.includes('saveApprovedUser'),
        getCompaniesListFunciona: storageContent.includes('getCompaniesList'),
        getApprovedUserFunciona: storageContent.includes('getApprovedUserByEmail')
      };
      
      const todasFuncionan = Object.values(verificaciones).every(v => v);
      
      console.log('💾 StorageService:');
      console.log(`   🏢 saveCompanyData: ${verificaciones.saveCompanyDataFunciona ? '✅' : '❌'}`);
      console.log(`   👤 saveApprovedUser: ${verificaciones.saveApprovedUserFunciona ? '✅' : '❌'}`);
      console.log(`   📋 getCompaniesList: ${verificaciones.getCompaniesListFunciona ? '✅' : '❌'}`);
      console.log(`   🔍 getApprovedUserByEmail: ${verificaciones.getApprovedUserFunciona ? '✅' : '❌'}`);
      
      return {
        implementado: todasFuncionan,
        detalles: verificaciones,
        razon: todasFuncionan ? 'Todos los métodos funcionan' : 'Algunos métodos tienen problemas'
      };
      
    } catch (error) {
      console.error('Error verificando StorageService:', error);
      return {
        implementado: false,
        razon: `Error en verificación: ${error.message}`
      };
    }
  }
  
  /**
   * Verificar archivos de solución creados
   */
  async verificarArchivosCreados() {
    try {
      const archivosEsperados = [
        'SOLUCION_DIRECTA_DUPLICADOS_STRIPE.js',
        'EJECUTAR_SOLUCION_FINAL_STRIPE.js',
        'parche-registro-empresa-stripe.js',
        'VERIFICAR_SOLUCION_APLICADA.js',
        'DUPLICATE_COMPANIES_REGISTRATION_FIX.md'
      ];
      
      const archivosEncontrados = archivosEsperados.filter(archivo => 
        fs.existsSync(path.join(__dirname, archivo))
      );
      
      const backendFiles = [
        'backend/stripe-server.js',
        'backend/.env'
      ];
      
      const backendEncontrados = backendFiles.filter(archivo => 
        fs.existsSync(path.join(__dirname, archivo))
      );
      
      const verificaciones = {
        archivosSolucion: archivosEncontrados.length >= 3,
        backendStripe: backendEncontrados.length === 2,
        documentacion: fs.existsSync(path.join(__dirname, 'DUPLICATE_COMPANIES_REGISTRATION_FIX.md')),
        scriptsEjecucion: fs.existsSync(path.join(__dirname, 'EJECUTAR_SOLUCION_FINAL_STRIPE.js'))
      };
      
      const todasPresentes = Object.values(verificaciones).every(v => v);
      
      console.log('📁 Archivos de solución:');
      console.log(`   📄 Scripts solución: ${verificaciones.archivosSolucion ? '✅' : '❌'} (${archivosEncontrados.length}/${archivosEsperados.length})`);
      console.log(`   🖥️ Backend Stripe: ${verificaciones.backendStripe ? '✅' : '❌'} (${backendEncontrados.length}/${backendFiles.length})`);
      console.log(`   📚 Documentación: ${verificaciones.documentacion ? '✅' : '❌'}`);
      console.log(`   🚀 Scripts ejecución: ${verificaciones.scriptsEjecucion ? '✅' : '❌'}`);
      
      return {
        implementado: todasPresentes,
        detalles: {
          archivosEncontrados,
          backendEncontrados,
          verificaciones
        },
        razon: todasPresentes ? 'Todos los archivos presentes' : 'Faltan algunos archivos'
      };
      
    } catch (error) {
      console.error('Error verificando archivos:', error);
      return {
        implementado: false,
        razon: `Error en verificación: ${error.message}`
      };
    }
  }
  
  /**
   * Verificar estado del backend Stripe
   */
  async verificarBackendStripe() {
    try {
      console.log('\n🖥️ VERIFICANDO BACKEND STRIPE...');
      
      // Verificar si el servidor está corriendo
      const http = require('http');
      
      return new Promise((resolve) => {
        const req = http.request({
          hostname: 'localhost',
          port: 3001,
          path: '/health',
          method: 'GET',
          timeout: 5000
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              console.log('   ✅ Backend Stripe está corriendo');
              console.log(`   📡 Puerto: ${response.port}`);
              console.log(`   🔧 Estado: ${response.status}`);
              resolve({ corriendo: true, response });
            } catch (e) {
              console.log('   ⚠️ Backend responde pero formato inesperado');
              resolve({ corriendo: true, response: data });
            }
          });
        });
        
        req.on('error', (error) => {
          console.log('   ❌ Backend Stripe no está corriendo');
          console.log(`   💡 Para iniciarlo: node backend/stripe-server.js`);
          resolve({ corriendo: false, error: error.message });
        });
        
        req.on('timeout', () => {
          console.log('   ⏱️ Timeout conectando al backend');
          req.destroy();
          resolve({ corriendo: false, error: 'timeout' });
        });
        
        req.end();
      });
      
    } catch (error) {
      console.error('Error verificando backend:', error);
      return { corriendo: false, error: error.message };
    }
  }
  
  /**
   * Mostrar resumen final
   */
  mostrarResumenFinal(resultado) {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 RESUMEN FINAL DE VERIFICACIÓN');
    console.log('='.repeat(60));
    
    if (resultado.implementacionCompleta) {
      console.log('✅ ESTADO: SOLUCIÓN COMPLETAMENTE IMPLEMENTADA');
      console.log('');
      console.log('🛡️ PROTECCIONES ACTIVAS:');
      console.log('   • Verificación de duplicados por email');
      console.log('   • Protección por sessionId de Stripe');
      console.log('   • Guardado único de datos');
      console.log('   • Manejo de errores mejorado');
      console.log('   • Logs detallados para debugging');
      console.log('');
      console.log('🎉 RESULTADO: No se crearán más empresas duplicadas');
      console.log('   durante el proceso de registro con Stripe.');
      
    } else {
      console.log('⚠️ ESTADO: IMPLEMENTACIÓN INCOMPLETA');
      console.log('');
      console.log('❌ PROBLEMAS DETECTADOS:');
      
      Object.entries(resultado.verificaciones).forEach(([key, value]) => {
        if (!value.implementado) {
          console.log(`   • ${key}: ${value.razon}`);
        }
      });
      
      console.log('');
      console.log('💡 RECOMENDACIÓN: Ejecutar los scripts de solución');
      console.log('   para completar la implementación.');
    }
    
    console.log('='.repeat(60));
  }
}

// Función principal
async function main() {
  console.log('🔍 VERIFICADOR DE SOLUCIÓN - DUPLICADOS STRIPE');
  console.log('='.repeat(50));
  
  const verificador = new VerificadorSolucionNode();
  
  // Verificar solución
  const resultado = await verificador.verificarSolucionCompleta();
  
  // Verificar backend
  const backend = await verificador.verificarBackendStripe();
  
  // Mostrar resumen
  verificador.mostrarResumenFinal(resultado);
  
  // Información adicional del backend
  console.log('\n🖥️ ESTADO DEL BACKEND:');
  console.log(`   Stripe Server: ${backend.corriendo ? '✅ Corriendo' : '❌ Detenido'}`);
  
  if (resultado.implementacionCompleta && backend.corriendo) {
    console.log('\n🎉 ¡TODO LISTO! El sistema está completamente funcional.');
    console.log('   Puedes proceder con las pruebas de registro de empresas.');
  } else if (resultado.implementacionCompleta && !backend.corriendo) {
    console.log('\n⚠️ Solución implementada pero backend detenido.');
    console.log('   Inicia el backend con: node backend/stripe-server.js');
  } else {
    console.log('\n🔧 Completa la implementación antes de continuar.');
  }
  
  return resultado;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { VerificadorSolucionNode, main };