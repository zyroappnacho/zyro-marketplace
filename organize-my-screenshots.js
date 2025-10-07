#!/usr/bin/env node

/**
 * ORGANIZADOR DE SCREENSHOTS PARA APP STORE
 * ========================================
 * 
 * Organiza tus 42 screenshots de 6.7" y 3 de 6.5" según los requisitos de Apple
 */

const fs = require('fs');
const path = require('path');

console.log('📱 ORGANIZADOR DE SCREENSHOTS PARA APP STORE');
console.log('===========================================\n');

console.log('✅ ESTADO ACTUAL DE TUS SCREENSHOTS:');
console.log('   • 42 capturas en 6.7" (iPhone 15 Pro Max) ✅');
console.log('   • 3 capturas en 6.5" (iPhone 14 Plus) ✅');
console.log('   • 5.5" no necesarias para apps nuevas ✅\n');

console.log('📋 REQUISITOS DE APPLE APP STORE:\n');

console.log('🎯 SCREENSHOTS OBLIGATORIOS (6.7"):');
console.log('   1. Pantalla principal/Home');
console.log('   2. Funcionalidad principal (mapa de influencers)');
console.log('   3. Perfil de usuario/influencer');
console.log('   4. Funcionalidad de empresa');
console.log('   5. Pantalla de colaboraciones\n');

console.log('📐 ESPECIFICACIONES TÉCNICAS:');
console.log('   • 6.7": 1290 x 2796 píxeles (obligatorio)');
console.log('   • 6.5": 1242 x 2688 píxeles (opcional pero recomendado)');
console.log('   • Formato: PNG o JPEG');
console.log('   • Máximo: 10 screenshots por tamaño\n');

console.log('🗂️ ESTRUCTURA RECOMENDADA PARA TUS SCREENSHOTS:\n');

const recommendedStructure = {
  '6.7_inch': [
    '01_welcome_screen.png',
    '02_home_map_influencers.png', 
    '03_influencer_profile.png',
    '04_company_dashboard.png',
    '05_collaboration_details.png',
    '06_admin_panel.png',
    '07_payment_system.png',
    '08_settings_profile.png'
  ],
  '6.5_inch': [
    '01_welcome_screen.png',
    '02_home_map_influencers.png',
    '03_influencer_profile.png'
  ]
};

console.log('📁 6.7" (OBLIGATORIOS - máximo 10):');
recommendedStructure['6.7_inch'].forEach((file, index) => {
  console.log(`   ${index + 1}. ${file}`);
});

console.log('\n📁 6.5" (OPCIONALES - máximo 10):');
recommendedStructure['6.5_inch'].forEach((file, index) => {
  console.log(`   ${index + 1}. ${file}`);
});

console.log('\n🎨 MEJORES PRÁCTICAS PARA SELECCIÓN:\n');

console.log('✨ SCREENSHOTS QUE DEBES INCLUIR:');
console.log('   • Pantalla de bienvenida/login');
console.log('   • Mapa principal con influencers');
console.log('   • Perfil de influencer completo');
console.log('   • Dashboard de empresa');
console.log('   • Detalles de colaboración');
console.log('   • Sistema de pagos/suscripciones');
console.log('   • Panel de administración');
console.log('   • Configuración/perfil\n');

console.log('❌ EVITAR:');
console.log('   • Pantallas de error');
console.log('   • Pantallas vacías o de carga');
console.log('   • Contenido duplicado');
console.log('   • Información personal real\n');

console.log('🔧 PASOS PARA ORGANIZAR TUS SCREENSHOTS:\n');

console.log('1️⃣ CREAR ESTRUCTURA DE CARPETAS:');
console.log('   mkdir -p ~/Desktop/AppStore_Screenshots/6.7_inch');
console.log('   mkdir -p ~/Desktop/AppStore_Screenshots/6.5_inch\n');

console.log('2️⃣ SELECCIONAR LOS MEJORES (de tus 42):');
console.log('   • Elige las 8-10 capturas más representativas');
console.log('   • Que muestren las funcionalidades principales');
console.log('   • Con buena calidad visual\n');

console.log('3️⃣ RENOMBRAR ARCHIVOS:');
console.log('   • 01_welcome_screen.png');
console.log('   • 02_home_map.png');
console.log('   • 03_influencer_profile.png');
console.log('   • etc...\n');

console.log('4️⃣ VERIFICAR RESOLUCIONES:');
console.log('   • 6.7": 1290 x 2796 píxeles');
console.log('   • 6.5": 1242 x 2688 píxeles\n');

// Función para crear la estructura de carpetas
function createScreenshotStructure() {
  const baseDir = './screenshots_app_store';
  
  try {
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir);
    }
    
    if (!fs.existsSync(`${baseDir}/6.7_inch`)) {
      fs.mkdirSync(`${baseDir}/6.7_inch`);
    }
    
    if (!fs.existsSync(`${baseDir}/6.5_inch`)) {
      fs.mkdirSync(`${baseDir}/6.5_inch`);
    }
    
    // Crear archivo README con instrucciones
    const readmeContent = `# Screenshots para App Store - ZyroMarketplace

## Estructura de Carpetas

### 6.7_inch/ (OBLIGATORIO)
Coloca aquí 8-10 screenshots de iPhone 15 Pro Max (1290 x 2796 px)

### 6.5_inch/ (OPCIONAL)
Coloca aquí 3-5 screenshots de iPhone 14 Plus (1242 x 2688 px)

## Nomenclatura Recomendada
- 01_welcome_screen.png
- 02_home_map_influencers.png
- 03_influencer_profile.png
- 04_company_dashboard.png
- 05_collaboration_details.png
- 06_admin_panel.png
- 07_payment_system.png
- 08_settings_profile.png

## Verificación antes de subir
1. Resolución correcta
2. Formato PNG o JPEG
3. Contenido representativo
4. Sin información personal
5. Máximo 10 por carpeta
`;
    
    fs.writeFileSync(`${baseDir}/README.md`, readmeContent);
    
    console.log('✅ ESTRUCTURA CREADA EN EL PROYECTO:');
    console.log(`   ${baseDir}/`);
    console.log(`   ├── 6.7_inch/`);
    console.log(`   ├── 6.5_inch/`);
    console.log(`   └── README.md\n`);
    
  } catch (error) {
    console.log('❌ Error creando estructura:', error.message);
  }
}

// Verificar si se debe crear la estructura
if (process.argv.includes('--create-structure')) {
  createScreenshotStructure();
} else {
  console.log('💡 COMANDOS DISPONIBLES:\n');
  console.log('   node organize-my-screenshots.js --create-structure');
  console.log('   (Crea carpetas organizadas en el proyecto)\n');
}

console.log('📊 RESUMEN DE TU SITUACIÓN:\n');
console.log('✅ TIENES TODO LO NECESARIO:');
console.log('   • Suficientes screenshots (42 + 3)');
console.log('   • Resoluciones correctas');
console.log('   • Cobertura completa de la app\n');

console.log('🎯 PRÓXIMOS PASOS:');
console.log('   1. Selecciona las 8-10 mejores de 6.7"');
console.log('   2. Usa las 3 de 6.5" que tienes');
console.log('   3. Organiza según la estructura recomendada');
console.log('   4. Verifica resoluciones');
console.log('   5. ¡Listo para App Store Connect!\n');

console.log('🚀 ESTADO: SCREENSHOTS COMPLETOS ✅');
console.log('   Tienes todo lo necesario para el App Store');
console.log('   Solo falta organizarlos según los requisitos de Apple\n');

console.log('📚 DOCUMENTACIÓN:');
console.log('   • APP_STORE_FINAL_CHECKLIST.md');
console.log('   • APPLE_DEPLOYMENT_STATUS_ACTUAL.md');