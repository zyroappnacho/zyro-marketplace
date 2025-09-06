#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando Zyro Marketplace Preview...\n');

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
console.log('🎯 USUARIOS DE PRUEBA CONFIGURADOS:');
console.log('');
console.log('👑 ADMINISTRADOR:');
console.log('   Usuario: admin_zyrovip');
console.log('   Contraseña: xarrec-2paqra-guftoN');
console.log('   Acceso: Panel completo de administración');
console.log('');
console.log('📱 INFLUENCER:');
console.log('   Usuario: pruebainflu');
console.log('   Contraseña: 12345');
console.log('   Acceso: App completa con 4 pestañas');
console.log('');
console.log('🏢 EMPRESA:');
console.log('   Al hacer clic en "SOY EMPRESA" se crea automáticamente');
console.log('   Usuario: empresa_auto');
console.log('   Contraseña: empresa123');
console.log('   Acceso: Dashboard limitado para empresas');
console.log('');
console.log('📊 DATOS DE PRUEBA INCLUIDOS:');
console.log('   • 6 campañas de ejemplo');
console.log('   • 8 ciudades habilitadas');
console.log('   • 8 categorías de negocios');
console.log('   • Estética premium completa');
console.log('   • Navegación por 4 pestañas');
console.log('');
console.log('🎨 FUNCIONALIDADES IMPLEMENTADAS:');
console.log('   ✅ Sistema de autenticación completo');
console.log('   ✅ Panel de administración');
console.log('   ✅ App móvil con 4 pestañas');
console.log('   ✅ Sistema de colaboraciones');
console.log('   ✅ Filtros por ciudad y categoría');
console.log('   ✅ Mapa interactivo');
console.log('   ✅ Historial de colaboraciones');
console.log('   ✅ Gestión de perfil');
console.log('   ✅ Estética premium con colores dorados');
console.log('');

// Start Expo
console.log('🚀 Iniciando servidor de desarrollo...\n');
try {
  execSync('npx expo start', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error iniciando Expo:', error.message);
  console.log('\n💡 Intenta ejecutar manualmente:');
  console.log('   cd ZyroMarketplace');
  console.log('   npm install');
  console.log('   npx expo start');
  process.exit(1);
}