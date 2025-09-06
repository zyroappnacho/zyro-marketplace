#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDANDO ASSETS PARA STORES...');
console.log('==================================');

const requiredAssets = {
  ios: [
    'app-icon-1024x1024.png',
    'screenshot-6.7-1.png',
    'screenshot-6.7-2.png',
    'screenshot-6.7-3.png'
  ],
  android: [
    'app-icon-512x512.png',
    'feature-graphic-1024x500.png',
    'screenshot-phone-1.png',
    'screenshot-phone-2.png',
    'screenshot-phone-3.png'
  ]
};

let allValid = true;

Object.entries(requiredAssets).forEach(([platform, assets]) => {
  console.log(`\n📱 Validando ${platform.toUpperCase()}:`);
  
  assets.forEach(asset => {
    const assetPath = path.join(__dirname, platform, asset);
    const exists = fs.existsSync(assetPath);
    
    console.log(`  ${exists ? '✅' : '❌'} ${asset}`);
    
    if (!exists) {
      allValid = false;
    }
  });
});

console.log(`\n${allValid ? '🎉' : '⚠️'} ${allValid ? 'Todos los assets están listos!' : 'Faltan algunos assets requeridos'}`);

if (allValid) {
  console.log('\n🚀 ¡Listo para hacer build de producción!');
} else {
  console.log('\n📋 Revisa las instrucciones en INSTRUCCIONES.md');
}
