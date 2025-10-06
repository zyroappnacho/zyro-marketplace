/**
 * Script para desplegar el backend de Stripe en modo producción
 * Simula un entorno de producción local para testing
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 DESPLEGANDO BACKEND DE STRIPE PARA PRODUCCIÓN');
console.log('=' .repeat(60));

async function verifyConfiguration() {
  console.log('\n🔍 PASO 1: Verificando configuración...');
  
  // Verificar archivos necesarios
  const requiredFiles = [
    'backend/stripe-server-optimized.js',
    'backend/.env',
    'stripe-price-ids.json'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ Archivo faltante: ${file}`);
      return false;
    }
    console.log(`✅ ${file}: Encontrado`);
  }

  // Verificar variables de entorno
  const envContent = fs.readFileSync('backend/.env', 'utf8');
  const checks = [
    { pattern: 'sk_live_', name: 'Clave secreta de producción' },
    { pattern: 'whsec_', name: 'Webhook secret' },
    { pattern: 'NODE_ENV=production', name: 'Entorno de producción' }
  ];

  for (const check of checks) {
    if (envContent.includes(check.pattern)) {
      console.log(`✅ ${check.name}: Configurado`);
    } else {
      console.error(`❌ ${check.name}: Faltante`);
      return false;
    }
  }

  return true;
}

async function installDependencies() {
  console.log('\n📦 PASO 2: Verificando dependencias...');
  
  return new Promise((resolve) => {
    const npm = spawn('npm', ['install'], {
      cwd: 'backend',
      stdio: 'inherit'
    });

    npm.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Dependencias instaladas correctamente');
        resolve(true);
      } else {
        console.error('❌ Error instalando dependencias');
        resolve(false);
      }
    });
  });
}

async function startProductionServer() {
  console.log('\n🖥️  PASO 3: Iniciando servidor de producción...');
  console.log('📍 Puerto: 3001');
  console.log('🌐 Entorno: Producción');
  console.log('🔗 Webhook: https://zyromarketplace.com/api/stripe/webhook');
  console.log('💳 Stripe: Modo LIVE (claves reales)');
  
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   • Este servidor usa claves REALES de Stripe');
  console.log('   • NO uses tarjetas de prueba (serán rechazadas)');
  console.log('   • Para testing, usa tarjetas reales con cantidades pequeñas');
  console.log('   • Puedes cancelar/reembolsar inmediatamente después del test');
  
  console.log('\n🧪 PARA TESTING SEGURO:');
  console.log('   1. Usa tu propia tarjeta con 1€');
  console.log('   2. Verifica que el pago se procesa');
  console.log('   3. Verifica que se crea la cuenta de empresa');
  console.log('   4. Cancela la suscripción inmediatamente en Stripe Dashboard');
  
  console.log('\n🔄 Iniciando servidor...');
  console.log('   Para detener: Ctrl+C');
  console.log('   Health check: http://localhost:3001/health');
  console.log('=' .repeat(60));

  // Cambiar al directorio backend
  process.chdir('backend');

  // Iniciar servidor
  const server = spawn('node', ['stripe-server-optimized.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  // Manejar cierre del servidor
  server.on('error', (error) => {
    console.error('\n❌ Error iniciando servidor:', error.message);
    process.exit(1);
  });

  server.on('close', (code) => {
    console.log(`\n👋 Servidor cerrado con código: ${code}`);
    process.exit(code);
  });

  // Manejar señales de terminación
  process.on('SIGINT', () => {
    console.log('\n\n👋 Cerrando servidor de producción...');
    server.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n\n👋 Cerrando servidor de producción...');
    server.kill('SIGTERM');
  });
}

async function main() {
  try {
    // Verificar configuración
    const configOk = await verifyConfiguration();
    if (!configOk) {
      console.error('\n❌ Configuración incompleta. Corrige los errores antes de continuar.');
      process.exit(1);
    }

    // Instalar dependencias
    const depsOk = await installDependencies();
    if (!depsOk) {
      console.error('\n❌ Error con las dependencias. Revisa la instalación.');
      process.exit(1);
    }

    // Iniciar servidor
    await startProductionServer();

  } catch (error) {
    console.error('\n💥 ERROR CRÍTICO:', error.message);
    process.exit(1);
  }
}

// Ejecutar despliegue
main();