#!/usr/bin/env node

/**
 * Script para forzar que la aplicación se abra en la pantalla de bienvenida
 * Limpia completamente el estado de usuario y configuraciones
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Forzando pantalla de bienvenida...\n');

// Función para crear un archivo temporal que fuerce la pantalla de bienvenida
const createWelcomeForcer = () => {
    console.log('1️⃣ Creando forzador de pantalla de bienvenida...');
    
    const forcerCode = `
// Temporal forcer para pantalla de bienvenida
export const forceWelcomeScreen = () => {
    // Limpiar AsyncStorage si existe
    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
        console.log('🧹 LocalStorage limpiado');
    }
    
    // Limpiar cualquier estado persistente
    return true;
};

export const clearAllUserData = async () => {
    try {
        // Importar AsyncStorage dinámicamente
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        
        // Limpiar todas las claves relacionadas con usuario
        const keysToRemove = [
            'user',
            'auth',
            'currentUser',
            'company_test_001',
            'empresa@zyro.com',
            'approved_influencers',
            'admin_campaigns',
            'persist:root'
        ];
        
        await AsyncStorage.default.multiRemove(keysToRemove);
        console.log('🧹 AsyncStorage limpiado completamente');
        
        return true;
    } catch (error) {
        console.log('⚠️ No se pudo limpiar AsyncStorage:', error.message);
        return false;
    }
};
`;

    fs.writeFileSync(path.join(__dirname, 'utils', 'welcomeForcer.js'), forcerCode);
    console.log('   ✅ Forzador creado en utils/welcomeForcer.js');
};

// Función para crear un script de inicio que fuerce la pantalla de bienvenida
const createForceWelcomeScript = () => {
    console.log('\n2️⃣ Creando script de inicio con pantalla de bienvenida forzada...');
    
    const script = `#!/bin/bash

echo "🚀 Iniciando ZYRO con pantalla de bienvenida forzada..."

# Limpiar completamente el estado
echo "🧹 Limpiando estado de la aplicación..."

# Limpiar cache de Expo
rm -rf .expo/settings.json 2>/dev/null || true
rm -rf .expo/packager-info.json 2>/dev/null || true

# Limpiar cache de Metro
echo "🧹 Limpiando cache de Metro..."

# Iniciar con cache limpio y reset completo
npx expo start --clear --reset-cache --no-dev --minify

echo "✅ Aplicación iniciada con pantalla de bienvenida forzada"
`;

    fs.writeFileSync(path.join(__dirname, 'start-welcome.sh'), script);
    
    try {
        fs.chmodSync(path.join(__dirname, 'start-welcome.sh'), '755');
        console.log('   ✅ Script start-welcome.sh creado y configurado como ejecutable');
    } catch (error) {
        console.log('   ✅ Script start-welcome.sh creado');
    }
};

// Función para verificar y crear directorio utils si no existe
const ensureUtilsDirectory = () => {
    const utilsDir = path.join(__dirname, 'utils');
    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
        console.log('📁 Directorio utils creado');
    }
};

// Función para crear un componente temporal que fuerce logout
const createLogoutForcer = () => {
    console.log('\n3️⃣ Creando componente de logout forzado...');
    
    const logoutComponent = `import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { setCurrentScreen } from '../store/slices/uiSlice';
import StorageService from '../services/StorageService';

const ForceLogout = ({ children }) => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const forceLogoutAndWelcome = async () => {
            try {
                console.log('🔄 Forzando logout y pantalla de bienvenida...');
                
                // Limpiar Redux
                dispatch(logoutUser());
                dispatch(setCurrentScreen('welcome'));
                
                // Limpiar storage
                await StorageService.clearAll();
                
                console.log('✅ Estado limpiado, mostrando pantalla de bienvenida');
            } catch (error) {
                console.error('❌ Error forzando logout:', error);
                // Aún así ir a welcome
                dispatch(setCurrentScreen('welcome'));
            }
        };
        
        // Ejecutar inmediatamente
        forceLogoutAndWelcome();
    }, [dispatch]);
    
    return children;
};

export default ForceLogout;`;

    fs.writeFileSync(path.join(__dirname, 'components', 'ForceLogout.js'), logoutComponent);
    console.log('   ✅ Componente ForceLogout.js creado');
};

// Función para mostrar instrucciones
const showInstructions = () => {
    console.log('\n📋 INSTRUCCIONES PARA PANTALLA DE BIENVENIDA:');
    console.log('===========================================');
    console.log('');
    console.log('🎯 OPCIÓN 1 - Script automático (RECOMENDADO):');
    console.log('   ./start-welcome.sh');
    console.log('');
    console.log('🎯 OPCIÓN 2 - Manual:');
    console.log('   1. npx expo start --clear --reset-cache');
    console.log('   2. Cuando se abra, presiona "r" para recargar');
    console.log('   3. Si sigue mostrando usuario logueado, presiona "r" varias veces');
    console.log('');
    console.log('🎯 OPCIÓN 3 - Forzar desde el simulador:');
    console.log('   1. Abrir el simulador');
    console.log('   2. Ir a Device > Erase All Content and Settings');
    console.log('   3. Reiniciar la app');
    console.log('');
    console.log('📱 PARA PROBAR LOS NUEVOS BOTONES DE EMPRESA:');
    console.log('   1. Desde la pantalla de bienvenida');
    console.log('   2. Tocar "Iniciar Sesión"');
    console.log('   3. Usar: empresa@zyro.com / empresa123');
    console.log('   4. Ir al dashboard de empresa');
    console.log('   5. Probar los nuevos botones:');
    console.log('      • "Dashboard de Empresa" (icono analytics)');
    console.log('      • "Solicitudes de Influencers" (icono people)');
    console.log('');
    console.log('🔧 COMANDOS ÚTILES:');
    console.log('   • "r" = recargar app');
    console.log('   • "j" = abrir debugger');
    console.log('   • "m" = toggle menu');
    console.log('   • Ctrl+C = salir');
};

// Función principal
const main = () => {
    console.log('🎯 FORZADOR DE PANTALLA DE BIENVENIDA - ZYRO MARKETPLACE');
    console.log('======================================================\n');
    
    ensureUtilsDirectory();
    createWelcomeForcer();
    createForceWelcomeScript();
    createLogoutForcer();
    
    console.log('\n📊 RESUMEN:');
    console.log('===========');
    console.log('✅ Forzador de bienvenida: CREADO');
    console.log('✅ Script de inicio: CREADO');
    console.log('✅ Componente de logout: CREADO');
    console.log('✅ Directorio utils: VERIFICADO');
    
    console.log('\n🎉 ¡LISTO PARA FORZAR PANTALLA DE BIENVENIDA!');
    
    showInstructions();
};

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { main };