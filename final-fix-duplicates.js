#!/usr/bin/env node

/**
 * Script final para eliminar completamente las funciones duplicadas
 */

const fs = require('fs');
const path = require('path');

function finalFixDuplicates() {
    const filePath = path.join(__dirname, 'components', 'ZyroAppNew.js');
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log('🔧 Corrección final de duplicados...');
    
    // Contar todas las ocurrencias de navigateToScreen
    const navigateMatches = content.match(/const navigateToScreen/g);
    if (navigateMatches) {
        console.log(`  📊 Encontradas ${navigateMatches.length} declaraciones de navigateToScreen`);
    }
    
    // Buscar y eliminar TODAS las declaraciones de navigateToScreen
    // Luego agregar solo una al final de las funciones de utilidad
    content = content.replace(/\/\/ Screen navigation.*?\n.*?const navigateToScreen.*?\n.*?dispatch\(setCurrentScreen\(screen\)\);\n.*?\};/g, '');
    content = content.replace(/const navigateToScreen.*?\n.*?dispatch\(setCurrentScreen\(screen\)\);\n.*?\};/g, '');
    
    // Buscar donde insertar la función única (después de handleTabPress)
    const insertPoint = content.indexOf('const handleTabPress');
    if (insertPoint !== -1) {
        const endOfHandleTabPress = content.indexOf('};', insertPoint) + 2;
        
        const navigateFunction = `

    // Screen navigation helper
    const navigateToScreen = (screen) => {
        dispatch(setCurrentScreen(screen));
    };`;
        
        content = content.slice(0, endOfHandleTabPress) + navigateFunction + content.slice(endOfHandleTabPress);
        console.log('  ✅ Función navigateToScreen única agregada');
    }
    
    // Limpiar líneas vacías múltiples
    content = content.replace(/\n\s*\n\s*\n\s*\n/g, '\n\n');
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  ✅ Archivo corregido y guardado');
    
    // Verificar que ahora solo hay una declaración
    const finalContent = fs.readFileSync(filePath, 'utf8');
    const finalMatches = finalContent.match(/const navigateToScreen/g);
    console.log(`  📊 Después de la corrección: ${finalMatches ? finalMatches.length : 0} declaraciones`);
    
    return finalMatches && finalMatches.length === 1;
}

function main() {
    console.log('🔧 ZYRO - Corrección Final de Duplicados');
    console.log('=' .repeat(45));
    
    const success = finalFixDuplicates();
    
    console.log('=' .repeat(45));
    
    if (success) {
        console.log('✅ ¡Corrección completada exitosamente!');
        console.log('🚀 El archivo ahora debería compilar sin errores');
        console.log('📱 Navegación optimizada lista para usar');
    } else {
        console.log('⚠️  Puede que aún haya problemas');
        console.log('🔧 Revisa manualmente el archivo si es necesario');
    }
}

if (require.main === module) {
    main();
}