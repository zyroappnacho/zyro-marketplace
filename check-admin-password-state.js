#!/usr/bin/env node

/**
 * 🔍 Verificar el estado actual del sistema de contraseñas de administrador
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO ESTADO ACTUAL DEL SISTEMA');
console.log('=' .repeat(50));

// 1. Verificar que la función saveAdminPassword crea el flag
console.log('\n1️⃣ Verificando función saveAdminPassword...');

const storageServicePath = path.join(__dirname, 'services', 'StorageService.js');
const storageContent = fs.readFileSync(storageServicePath, 'utf8');

const hasFlagCreation = storageContent.includes('password_changed_admin_001');
const hasAsyncStorageSetItem = storageContent.includes("AsyncStorage.setItem('password_changed_admin_001'");

console.log('✅ Flag de contraseña presente:', hasFlagCreation ? 'SÍ' : 'NO');
console.log('✅ Creación de flag presente:', hasAsyncStorageSetItem ? 'SÍ' : 'NO');

if (!hasFlagCreation || !hasAsyncStorageSetItem) {
    console.log('❌ ERROR: La función saveAdminPassword no está creando el flag correctamente');
    process.exit(1);
}

// 2. Verificar que AdminPanel llama a saveAdminPassword
console.log('\n2️⃣ Verificando AdminPanel...');

const adminPanelPath = path.join(__dirname, 'components', 'AdminPanel.js');
const adminPanelContent = fs.readFileSync(adminPanelPath, 'utf8');

const callsSaveAdminPassword = adminPanelContent.includes('StorageService.saveAdminPassword');
const hasChangePasswordFunction = adminPanelContent.includes('handleAdminChangePassword');

console.log('✅ Función de cambio presente:', hasChangePasswordFunction ? 'SÍ' : 'NO');
console.log('✅ Llama a saveAdminPassword:', callsSaveAdminPassword ? 'SÍ' : 'NO');

if (!callsSaveAdminPassword) {
    console.log('❌ ERROR: AdminPanel no está llamando a StorageService.saveAdminPassword');
    process.exit(1);
}

// 3. Verificar que ZyroAppNew no tiene validación hardcodeada
console.log('\n3️⃣ Verificando ZyroAppNew...');

const zyroAppPath = path.join(__dirname, 'components', 'ZyroAppNew.js');
const zyroAppContent = fs.readFileSync(zyroAppPath, 'utf8');

const hasHardcodedValidation = zyroAppContent.includes("loginForm.password === 'xarrec-2paqra-guftoN'");

console.log('✅ Sin validación hardcodeada:', !hasHardcodedValidation ? 'SÍ' : 'NO');

if (hasHardcodedValidation) {
    console.log('❌ ERROR: Aún hay validación hardcodeada en ZyroAppNew.js');
    process.exit(1);
}

// 4. Verificar la lógica de creación de usuario administrador
console.log('\n4️⃣ Verificando lógica de usuario administrador...');

const hasAdminUserCreation = storageContent.includes('admin_zyrovip');
const hasAdminPasswordLogic = storageContent.includes('passwordChangeFlag') && storageContent.includes('admin_001');

console.log('✅ Creación de usuario admin:', hasAdminUserCreation ? 'SÍ' : 'NO');
console.log('✅ Lógica de contraseña admin:', hasAdminPasswordLogic ? 'SÍ' : 'NO');

console.log('\n🎯 DIAGNÓSTICO FINAL');
console.log('=' .repeat(50));

if (hasFlagCreation && hasAsyncStorageSetItem && callsSaveAdminPassword && !hasHardcodedValidation && hasAdminUserCreation) {
    console.log('✅ SISTEMA CONFIGURADO CORRECTAMENTE');
    console.log('\n🔧 POSIBLES CAUSAS DEL PROBLEMA:');
    console.log('1. El flag no se está creando porque hay un error en saveAdminPassword');
    console.log('2. La app no está usando la versión actualizada del código');
    console.log('3. Hay cache de AsyncStorage que no se está limpiando');
    console.log('\n💡 SOLUCIONES RECOMENDADAS:');
    console.log('1. Reiniciar completamente la app');
    console.log('2. Limpiar cache de AsyncStorage');
    console.log('3. Verificar que se está llamando a saveAdminPassword correctamente');
} else {
    console.log('❌ SISTEMA NO CONFIGURADO CORRECTAMENTE');
    console.log('Revisa los errores anteriores');
}

console.log('\n📱 PASOS PARA PROBAR:');
console.log('1. Reinicia la app completamente');
console.log('2. Login con admin_zyrovip / xarrec-2paqra-guftoN');
console.log('3. Ve al perfil → Contraseña y Seguridad');
console.log('4. Cambia la contraseña (debería crear el flag)');
console.log('5. Logout');
console.log('6. Intenta login con la contraseña anterior (debería fallar)');
console.log('7. Login con la nueva contraseña (debería funcionar)');