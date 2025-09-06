#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌐 Iniciando Zyro Marketplace Preview en Chrome...\n');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Instalando dependencias...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencias instaladas correctamente\n');
  } catch (error) {
    console.error('❌ Error instalando dependencias:', error.message);
    process.exit(1);
  }
}

// Display preview information
console.log('🎯 ZYRO MARKETPLACE - PREVIEW WEB');
console.log('═'.repeat(50));
console.log('');
console.log('🌐 INICIANDO EN CHROME...');
console.log('');
console.log('👥 USUARIOS DE PRUEBA:');
console.log('');
console.log('👑 ADMINISTRADOR:');
console.log('   Usuario: admin_zyrovip');
console.log('   Contraseña: xarrec-2paqra-guftoN');
console.log('');
console.log('📱 INFLUENCER:');
console.log('   Usuario: pruebainflu');
console.log('   Contraseña: 12345');
console.log('');
console.log('🏢 EMPRESA:');
console.log('   Hacer clic en "SOY EMPRESA" para auto-crear');
console.log('   Usuario: empresa_auto');
console.log('   Contraseña: empresa123');
console.log('');
console.log('🎨 FUNCIONALIDADES WEB:');
console.log('   ✅ Navegación completa por 4 pestañas');
console.log('   ✅ Estética premium con colores dorados');
console.log('   ✅ Sistema de colaboraciones completo');
console.log('   ✅ Filtros por ciudad y categoría');
console.log('   ✅ Panel de administración');
console.log('   ✅ Gestión de perfil');
console.log('   ✅ 6 campañas de ejemplo');
console.log('');
console.log('🚀 Iniciando servidor web...');
console.log('');

// Function to open Chrome
function openChrome(url) {
  const platform = process.platform;
  let command;

  switch (platform) {
    case 'darwin': // macOS
      command = `open -a "Google Chrome" "${url}"`;
      break;
    case 'win32': // Windows
      command = `start chrome "${url}"`;
      break;
    case 'linux': // Linux
      command = `google-chrome "${url}" || chromium-browser "${url}"`;
      break;
    default:
      console.log(`🌐 Abre manualmente: ${url}`);
      return;
  }

  try {
    execSync(command);
    console.log('✅ Chrome abierto correctamente');
  } catch (error) {
    console.log(`🌐 Abre manualmente en Chrome: ${url}`);
  }
}

// Start Expo web server
try {
  console.log('⏳ Iniciando servidor Expo Web...\n');
  
  // Start expo web in background
  const expoProcess = spawn('npx', ['expo', 'start', '--web'], {
    stdio: 'pipe',
    shell: true
  });

  let serverStarted = false;
  let url = 'http://localhost:19006';

  expoProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);

    // Check if server is ready
    if (output.includes('Web is waiting on') || output.includes('Metro waiting on')) {
      if (!serverStarted) {
        serverStarted = true;
        console.log('\n🎉 ¡Servidor iniciado correctamente!');
        console.log('🌐 Abriendo Chrome...\n');
        
        // Wait a moment for server to be fully ready
        setTimeout(() => {
          openChrome(url);
        }, 2000);
      }
    }

    // Extract URL if different
    const urlMatch = output.match(/http:\/\/localhost:\d+/);
    if (urlMatch && urlMatch[0] !== url) {
      url = urlMatch[0];
    }
  });

  expoProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('Warning') && !error.includes('ExpoWarning')) {
      console.error('Error:', error);
    }
  });

  expoProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`\n❌ Proceso terminado con código ${code}`);
      console.log('\n💡 Intenta ejecutar manualmente:');
      console.log('   cd ZyroMarketplace');
      console.log('   npm install');
      console.log('   npx expo start --web');
    }
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n👋 Cerrando servidor...');
    expoProcess.kill();
    process.exit(0);
  });

  // Show instructions after a delay
  setTimeout(() => {
    console.log('\n📋 INSTRUCCIONES:');
    console.log('   • La app se abrirá automáticamente en Chrome');
    console.log('   • Si no se abre, ve a: ' + url);
    console.log('   • Usa Ctrl+C para cerrar el servidor');
    console.log('   • Refresca la página si hay errores');
    console.log('\n🎯 ¡Disfruta la preview de Zyro Marketplace!');
  }, 3000);

} catch (error) {
  console.error('❌ Error iniciando servidor web:', error.message);
  console.log('\n💡 Intenta ejecutar manualmente:');
  console.log('   cd ZyroMarketplace');
  console.log('   npm install');
  console.log('   npx expo start --web');
  process.exit(1);
}