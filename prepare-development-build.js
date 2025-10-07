#!/usr/bin/env node

/**
 * 🚀 PREPARACIÓN PARA BUILD DE DESARROLLO
 * 
 * Este script prepara todo lo necesario para crear el build de desarrollo
 * una vez que Apple verifique tu cuenta de desarrollador.
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Preparando build de desarrollo...\n');

// Verificar estado actual
function checkCurrentStatus() {
  console.log('📋 VERIFICANDO ESTADO ACTUAL:');
  console.log('=====================================');
  
  // 1. Verificar expo-dev-client
  try {
    const devClientCheck = execSync('npm list expo-dev-client', { encoding: 'utf8' });
    if (devClientCheck.includes('expo-dev-client@')) {
      console.log('✅ expo-dev-client instalado correctamente');
    }
  } catch (error) {
    console.log('❌ expo-dev-client NO instalado');
    return false;
  }
  
  // 2. Verificar EAS CLI
  try {
    const easCheck = execSync('npx eas-cli whoami', { encoding: 'utf8' });
    if (easCheck.includes('nachodeborbon')) {
      console.log('✅ EAS CLI configurado y logueado');
    }
  } catch (error) {
    console.log('❌ EAS CLI no configurado');
    return false;
  }
  
  // 3. Verificar credenciales demo
  if (fs.existsSync('./demo-credentials.json')) {
    console.log('✅ Credenciales demo configuradas');
  } else {
    console.log('❌ Credenciales demo no encontradas');
    return false;
  }
  
  // 4. Verificar configuración EAS
  if (fs.existsSync('./eas.json')) {
    console.log('✅ Configuración EAS lista');
  } else {
    console.log('❌ Configuración EAS no encontrada');
    return false;
  }
  
  console.log('');
  return true;
}

// Mostrar comandos para cuando Apple verifique
function showNextSteps() {
  console.log('🎯 PRÓXIMOS PASOS (Cuando Apple verifique tu cuenta):');
  console.log('=====================================================');
  console.log('');
  console.log('1️⃣ VERIFICAR CUENTA APPLE:');
  console.log('   • Ve a https://developer.apple.com/account');
  console.log('   • Verifica que tu cuenta esté activa');
  console.log('   • Anota tu Team ID');
  console.log('');
  console.log('2️⃣ CREAR BUILD DE DESARROLLO:');
  console.log('   npx eas-cli build --platform ios --profile development');
  console.log('');
  console.log('3️⃣ INSTALAR EN DISPOSITIVO:');
  console.log('   • Descarga el .ipa desde Expo.dev');
  console.log('   • Instala en tu iPhone 16 Plus');
  console.log('   • Prueba todas las credenciales');
  console.log('');
  console.log('📱 CREDENCIALES PRECONFIGURADAS:');
  console.log('   👤 Influencer: colabos.nachodeborbon@gmail.com / Nacho12345');
  console.log('   🏢 Empresa: empresa@zyro.com / Empresa1234');
  console.log('   ⚙️ Admin: admin_zyrovip / xarrec-2paqra-guftoN5');
  console.log('');
}

// Crear script de build automático
function createBuildScript() {
  const buildScript = `#!/bin/bash

# 🚀 BUILD DE DESARROLLO AUTOMÁTICO
# Ejecutar cuando Apple verifique la cuenta

echo "🚀 Iniciando build de desarrollo..."

# Verificar login EAS
echo "📋 Verificando login EAS..."
npx eas-cli whoami

# Crear build de desarrollo
echo "🔨 Creando build de desarrollo..."
npx eas-cli build --platform ios --profile development

echo "✅ Build completado!"
echo "📱 Descarga el .ipa desde https://expo.dev/accounts/nachodeborbon/projects/zyromarketplace/builds"
echo "🔐 Credenciales incluidas en el build:"
echo "   👤 Influencer: colabos.nachodeborbon@gmail.com / Nacho12345"
echo "   🏢 Empresa: empresa@zyro.com / Empresa1234"
echo "   ⚙️ Admin: admin_zyrovip / xarrec-2paqra-guftoN5"
`;

  fs.writeFileSync('./create-development-build.sh', buildScript);
  execSync('chmod +x ./create-development-build.sh');
  console.log('✅ Script de build automático creado: create-development-build.sh');
}

// Crear guía de instalación
function createInstallationGuide() {
  const guide = `# 📱 GUÍA DE INSTALACIÓN - BUILD DE DESARROLLO

## 🎯 OBJETIVO
Instalar el build de desarrollo en tu iPhone 16 Plus para probar la app con credenciales reales mientras Apple revisa la app de producción.

## 📋 REQUISITOS
- ✅ iPhone 16 Plus
- ✅ Cuenta Apple Developer verificada
- ✅ Build de desarrollo creado con EAS

## 🚀 PASOS DE INSTALACIÓN

### 1️⃣ CREAR BUILD DE DESARROLLO
\`\`\`bash
# Ejecutar cuando Apple verifique tu cuenta
./create-development-build.sh
\`\`\`

### 2️⃣ DESCARGAR E INSTALAR
1. Ve a https://expo.dev/accounts/nachodeborbon/projects/zyromarketplace/builds
2. Encuentra tu build de desarrollo más reciente
3. Descarga el archivo .ipa
4. Instala en tu iPhone usando:
   - **Opción A:** AltStore / Sideloadly
   - **Opción B:** Xcode (si tienes Mac)
   - **Opción C:** TestFlight (si configuras distribución interna)

### 3️⃣ PROBAR CREDENCIALES
Una vez instalada, prueba estos logins:

#### 👤 PERFIL INFLUENCER
- **Email:** colabos.nachodeborbon@gmail.com
- **Contraseña:** Nacho12345
- **Funciones:** Perfil completo, colaboraciones, métricas EMV

#### 🏢 PERFIL EMPRESA
- **Email:** empresa@zyro.com
- **Contraseña:** Empresa1234
- **Funciones:** Dashboard empresarial, campañas, suscripciones

#### ⚙️ PERFIL ADMINISTRADOR
- **Email:** admin_zyrovip
- **Contraseña:** xarrec-2paqra-guftoN5
- **Funciones:** Panel completo de administración

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "No se puede instalar"
- Verifica que el dispositivo esté registrado en tu cuenta de desarrollador
- Asegúrate de que el certificado de desarrollo sea válido

### Error: "App no se abre"
- Confía en el certificado de desarrollador en Configuración > General > Gestión de dispositivos

### Credenciales no funcionan
- Las credenciales están preconfiguradas en el build
- Si no funcionan, verifica que el build incluya el StorageService actualizado

## 📞 SOPORTE
Si tienes problemas, verifica:
1. Que tu cuenta Apple Developer esté activa
2. Que el build se haya creado correctamente
3. Que el dispositivo esté registrado

---
*Generado automáticamente para el proceso de desarrollo*
`;

  fs.writeFileSync('./DEVELOPMENT_BUILD_GUIDE.md', guide);
  console.log('✅ Guía de instalación creada: DEVELOPMENT_BUILD_GUIDE.md');
}

// Ejecutar verificaciones
async function main() {
  console.log('🔐 ZYRO MARKETPLACE - PREPARACIÓN BUILD DESARROLLO');
  console.log('==================================================\n');
  
  const isReady = checkCurrentStatus();
  
  if (isReady) {
    console.log('🎉 TODO LISTO PARA BUILD DE DESARROLLO!');
    console.log('');
    
    createBuildScript();
    createInstallationGuide();
    
    console.log('');
    showNextSteps();
    
    console.log('📁 ARCHIVOS CREADOS:');
    console.log('   🔨 create-development-build.sh - Script automático de build');
    console.log('   📖 DEVELOPMENT_BUILD_GUIDE.md - Guía completa de instalación');
    console.log('   🔐 demo-credentials.json - Credenciales preconfiguradas');
    console.log('   📄 APPLE_REVIEW_CREDENTIALS.md - Documentación para Apple');
    
  } else {
    console.log('❌ Faltan configuraciones. Ejecuta primero:');
    console.log('   node setup-demo-credentials.js');
  }
}

// Ejecutar
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkCurrentStatus, showNextSteps };