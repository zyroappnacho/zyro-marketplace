#!/usr/bin/env node

/**
 * Script para resetear la aplicación a la pantalla de bienvenida
 * Limpia el estado de usuario y configuraciones previas
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Reseteando aplicación a pantalla de bienvenida...\n');

// Función para limpiar archivos de cache y estado
const clearAppState = () => {
    console.log('1️⃣ Limpiando estado de la aplicación...');
    
    // Archivos y directorios a limpiar
    const filesToClear = [
        '.expo/settings.json',
        'node_modules/.cache',
        '.expo/web-cache',
        '.expo/packager-info.json'
    ];
    
    filesToClear.forEach(file => {
        const fullPath = path.join(__dirname, file);
        try {
            if (fs.existsSync(fullPath)) {
                if (fs.lstatSync(fullPath).isDirectory()) {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                    console.log(`   ✅ Directorio eliminado: ${file}`);
                } else {
                    fs.unlinkSync(fullPath);
                    console.log(`   ✅ Archivo eliminado: ${file}`);
                }
            } else {
                console.log(`   ℹ️ No existe: ${file}`);
            }
        } catch (error) {
            console.log(`   ⚠️ No se pudo eliminar ${file}: ${error.message}`);
        }
    });
};

// Función para crear un script de inicio limpio
const createCleanStartScript = () => {
    console.log('\n2️⃣ Creando script de inicio limpio...');
    
    const startScript = `#!/bin/bash

# Script de inicio limpio para ZYRO Marketplace
echo "🚀 Iniciando ZYRO Marketplace con estado limpio..."

# Limpiar cache de Metro
echo "🧹 Limpiando cache de Metro..."
npx expo start --clear --reset-cache

echo "✅ Aplicación iniciada en modo limpio"
`;

    fs.writeFileSync(path.join(__dirname, 'start-clean.sh'), startScript);
    
    // Hacer el script ejecutable
    try {
        fs.chmodSync(path.join(__dirname, 'start-clean.sh'), '755');
        console.log('   ✅ Script start-clean.sh creado y configurado como ejecutable');
    } catch (error) {
        console.log('   ✅ Script start-clean.sh creado');
    }
};

// Función para verificar que los archivos principales existen
const verifyMainFiles = () => {
    console.log('\n3️⃣ Verificando archivos principales...');
    
    const mainFiles = [
        'App.js',
        'package.json',
        'components/ZyroAppNew.js',
        'components/CompanyDashboard.js',
        'components/CompanyDashboardMain.js',
        'components/CompanyRequests.js'
    ];
    
    let allFilesExist = true;
    
    mainFiles.forEach(file => {
        const fullPath = path.join(__dirname, file);
        if (fs.existsSync(fullPath)) {
            console.log(`   ✅ ${file}: EXISTE`);
        } else {
            console.log(`   ❌ ${file}: FALTA`);
            allFilesExist = false;
        }
    });
    
    return allFilesExist;
};

// Función para mostrar instrucciones
const showInstructions = () => {
    console.log('\n📋 INSTRUCCIONES PARA ABRIR EN PANTALLA DE BIENVENIDA:');
    console.log('=====================================================');
    console.log('');
    console.log('1️⃣ Ejecutar el script de inicio limpio:');
    console.log('   ./start-clean.sh');
    console.log('   o');
    console.log('   npx expo start --clear --reset-cache');
    console.log('');
    console.log('2️⃣ Cuando se abra el simulador:');
    console.log('   • La app debería mostrar la pantalla de bienvenida');
    console.log('   • Si no, presiona "r" en la terminal para recargar');
    console.log('');
    console.log('3️⃣ Para probar los nuevos botones de empresa:');
    console.log('   • Ir a "Iniciar Sesión"');
    console.log('   • Usar: empresa@zyro.com / empresa123');
    console.log('   • Navegar al dashboard de empresa');
    console.log('   • Probar los nuevos botones:');
    console.log('     - "Dashboard de Empresa"');
    console.log('     - "Solicitudes de Influencers"');
    console.log('');
    console.log('4️⃣ Comandos útiles durante desarrollo:');
    console.log('   • Presiona "r" para recargar la app');
    console.log('   • Presiona "j" para abrir el debugger');
    console.log('   • Presiona "m" para toggle del menu');
    console.log('   • Presiona Ctrl+C para salir');
};

// Ejecutar todas las funciones
const main = () => {
    console.log('🎯 RESET A PANTALLA DE BIENVENIDA - ZYRO MARKETPLACE');
    console.log('===================================================\n');
    
    clearAppState();
    createCleanStartScript();
    const filesOk = verifyMainFiles();
    
    console.log('\n📊 RESUMEN:');
    console.log('===========');
    console.log(`✅ Estado limpiado: SÍ`);
    console.log(`✅ Script creado: SÍ`);
    console.log(`✅ Archivos principales: ${filesOk ? 'TODOS PRESENTES' : 'ALGUNOS FALTAN'}`);
    
    if (filesOk) {
        console.log('\n🎉 ¡TODO LISTO!');
        console.log('La aplicación está preparada para iniciarse en la pantalla de bienvenida.');
    } else {
        console.log('\n⚠️ ADVERTENCIA');
        console.log('Algunos archivos principales faltan. Revisa los errores arriba.');
    }
    
    showInstructions();
};

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = {
    clearAppState,
    createCleanStartScript,
    verifyMainFiles,
    main
};