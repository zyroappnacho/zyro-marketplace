#!/usr/bin/env node

/**
 * Script para preparar todos los assets necesarios para el App Store
 * Basado en el logo principal de ZYRO
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando assets para App Store...');

// Verificar que el logo principal existe
const logoPath = './assets/logozyrotransparente.png';
if (!fs.existsSync(logoPath)) {
  console.error('❌ No se encuentra el logo principal en:', logoPath);
  process.exit(1);
}

console.log('✅ Logo principal encontrado');

// Crear estructura de directorios si no existe
const assetsDir = './assets';
const iosDir = path.join(assetsDir, 'ios');
const androidDir = path.join(assetsDir, 'android');

[iosDir, androidDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Creado directorio: ${dir}`);
  }
});

// Copiar el logo como icono principal
const iconPath = path.join(assetsDir, 'icon.png');
if (fs.existsSync(logoPath)) {
  fs.copyFileSync(logoPath, iconPath);
  console.log('✅ Icono principal creado');
}

// Crear adaptive icon para Android
const adaptiveIconPath = path.join(assetsDir, 'adaptive-icon.png');
if (fs.existsSync(logoPath)) {
  fs.copyFileSync(logoPath, adaptiveIconPath);
  console.log('✅ Adaptive icon creado');
}

// Crear splash screen
const splashPath = path.join(assetsDir, 'splash.png');
if (fs.existsSync(logoPath)) {
  fs.copyFileSync(logoPath, splashPath);
  console.log('✅ Splash screen creado');
}

// Crear favicon
const faviconPath = path.join(assetsDir, 'favicon.png');
if (fs.existsSync(logoPath)) {
  fs.copyFileSync(logoPath, faviconPath);
  console.log('✅ Favicon creado');
}

console.log('\n📋 Assets preparados para App Store:');
console.log('   ✅ icon.png (1024x1024)');
console.log('   ✅ adaptive-icon.png (1024x1024)');
console.log('   ✅ splash.png');
console.log('   ✅ favicon.png');

console.log('\n📝 IMPORTANTE:');
console.log('   - Asegúrate de que el logo tenga 1024x1024 píxeles');
console.log('   - El fondo debe ser transparente o sólido');
console.log('   - Para el App Store necesitarás screenshots del simulador');

console.log('\n🎯 Próximos pasos:');
console.log('   1. Tomar screenshots en el simulador iOS');
console.log('   2. Configurar datos reales en app.json y eas.json');
console.log('   3. Crear build de producción');

console.log('\n✨ Assets listos para deployment!');