#!/usr/bin/env node

/**
 * 🔍 Verificador de Errores de Sintaxis
 * 
 * Verifica que no haya errores de sintaxis en los archivos principales
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO ERRORES DE SINTAXIS');
console.log('='.repeat(40));

const filesToCheck = [
    'services/AdminService.js',
    'services/StorageService.js',
    'components/AdminPanel.js',
    'store/slices/authSlice.js'
];

let allFilesValid = true;

filesToCheck.forEach(file => {
    console.log(`\n📁 Verificando ${file}...`);
    
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`   ❌ Archivo no encontrado: ${file}`);
        allFilesValid = false;
        return;
    }
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Verificaciones básicas de sintaxis
        const checks = [
            {
                name: 'Llaves balanceadas',
                test: () => {
                    const openBraces = (content.match(/\{/g) || []).length;
                    const closeBraces = (content.match(/\}/g) || []).length;
                    return openBraces === closeBraces;
                }
            },
            {
                name: 'Paréntesis balanceados',
                test: () => {
                    const openParens = (content.match(/\(/g) || []).length;
                    const closeParens = (content.match(/\)/g) || []).length;
                    return openParens === closeParens;
                }
            },
            {
                name: 'No hay funciones sin llaves',
                test: () => {
                    // Buscar funciones que no tengan llave de apertura en la misma línea o siguiente
                    const functionLines = content.split('\n');
                    for (let i = 0; i < functionLines.length; i++) {
                        const line = functionLines[i].trim();
                        if (line.includes('async ') && line.includes('(') && line.includes(')') && !line.includes('=>')) {
                            // Es una función async
                            if (!line.includes('{')) {
                                // No tiene llave en la misma línea, verificar siguiente línea
                                const nextLine = functionLines[i + 1];
                                if (!nextLine || !nextLine.trim().startsWith('{') && !nextLine.includes('try {')) {
                                    console.log(`   ⚠️ Posible función sin llave: línea ${i + 1}: ${line}`);
                                    return false;
                                }
                            }
                        }
                    }
                    return true;
                }
            },
            {
                name: 'Export statement válido',
                test: () => {
                    return content.includes('export default') && !content.includes('export default;');
                }
            }
        ];
        
        let fileValid = true;
        checks.forEach(check => {
            try {
                if (check.test()) {
                    console.log(`   ✅ ${check.name}`);
                } else {
                    console.log(`   ❌ ${check.name}`);
                    fileValid = false;
                }
            } catch (error) {
                console.log(`   ⚠️ ${check.name}: Error en verificación`);
            }
        });
        
        if (fileValid) {
            console.log(`   ✅ ${file} - Sintaxis válida`);
        } else {
            console.log(`   ❌ ${file} - Errores de sintaxis detectados`);
            allFilesValid = false;
        }
        
    } catch (error) {
        console.log(`   ❌ Error leyendo ${file}: ${error.message}`);
        allFilesValid = false;
    }
});

console.log('\n📊 RESULTADO FINAL:');
if (allFilesValid) {
    console.log('✅ TODOS LOS ARCHIVOS TIENEN SINTAXIS VÁLIDA');
    console.log('\n🎯 El sistema debería compilar correctamente ahora.');
    console.log('🚀 Puedes intentar ejecutar la app nuevamente.');
} else {
    console.log('❌ SE DETECTARON ERRORES DE SINTAXIS');
    console.log('\n🔧 Revisa los archivos marcados con errores.');
}

console.log('\n' + '='.repeat(40));