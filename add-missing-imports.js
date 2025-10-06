#!/usr/bin/env node

/**
 * Script para agregar imports faltantes de MinimalistIcons
 */

const fs = require('fs');
const path = require('path');

function addImportToFile(filePath) {
    const fileName = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip si es el archivo de MinimalistIcons
    if (fileName === 'MinimalistIcons.js') {
        return false;
    }
    
    // Verificar si ya tiene el import
    if (content.includes("import MinimalistIcons from './MinimalistIcons'")) {
        return false;
    }
    
    // Verificar si usa MinimalistIcons
    if (!content.includes('<MinimalistIcons')) {
        return false;
    }
    
    console.log(`📝 Agregando import a: ${fileName}`);
    
    // Buscar donde insertar el import
    const importLine = "import MinimalistIcons from './MinimalistIcons';";
    
    // Buscar la última línea de import de React Native
    const reactNativeImportMatch = content.match(/import.*from 'react-native';/);
    if (reactNativeImportMatch) {
        const insertIndex = content.indexOf(reactNativeImportMatch[0]) + reactNativeImportMatch[0].length;
        content = content.slice(0, insertIndex) + '\n' + importLine + content.slice(insertIndex);
    } else {
        // Si no hay import de React Native, buscar cualquier import
        const anyImportMatch = content.match(/import.*from.*;/);
        if (anyImportMatch) {
            const insertIndex = content.indexOf(anyImportMatch[0]) + anyImportMatch[0].length;
            content = content.slice(0, insertIndex) + '\n' + importLine + content.slice(insertIndex);
        } else {
            // Si no hay imports, agregar al principio
            content = importLine + '\n' + content;
        }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Import agregado correctamente`);
    return true;
}

function main() {
    console.log('📦 ZYRO - Agregando imports faltantes');
    console.log('=' .repeat(50));
    
    const componentsDir = path.join(__dirname, 'components');
    const files = fs.readdirSync(componentsDir).filter(file => file.endsWith('.js'));
    
    let totalImportsAdded = 0;
    
    files.forEach(file => {
        const filePath = path.join(componentsDir, file);
        if (addImportToFile(filePath)) {
            totalImportsAdded++;
        }
    });
    
    console.log('=' .repeat(50));
    console.log(`📊 Imports agregados: ${totalImportsAdded}`);
    
    if (totalImportsAdded > 0) {
        console.log('✅ ¡Todos los imports han sido agregados!');
        console.log('🚀 Ahora puedes ejecutar: npm start');
    } else {
        console.log('⏭️  No se necesitaron imports adicionales');
    }
}

if (require.main === module) {
    main();
}