const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo errores de sintaxis en ZyroAppNew.js...');

const filePath = path.join(__dirname, 'components', 'ZyroAppNew.js');
let content = fs.readFileSync(filePath, 'utf8');

// Corregir comentarios mal formateados
const fixes = [
    // Patrón: ); seguido de comentario mal formateado
    { pattern: /\);\s*\/\/\s*\n\s*([A-Z])/g, replacement: ');\n\n    // $1' },
    { pattern: /\);\s*\/\/\s*\n([A-Z])/g, replacement: ');\n\n    // $1' },
    { pattern: /\);\s*\/\/\s*\n\s*\/\s*([A-Z])/g, replacement: ');\n\n    // $1' },
    { pattern: /\};\s*\/\/\s*\n\s*([A-Z])/g, replacement: '};\n\n    // $1' },
    { pattern: /\};\s*\/\/\s*\n([A-Z])/g, replacement: '};\n\n    // $1' },
    
    // Corregir comentarios específicos encontrados
    { pattern: /\);\s+\/\/\s*\n\s*([A-Za-z])/g, replacement: ');\n\n    // $1' },
    { pattern: /\};\s+\/\/\s*\n\s*([A-Za-z])/g, replacement: '};\n\n    // $1' },
];

let fixedCount = 0;
fixes.forEach((fix, index) => {
    const matches = content.match(fix.pattern);
    if (matches) {
        console.log(`Aplicando corrección ${index + 1}: ${matches.length} coincidencias`);
        content = content.replace(fix.pattern, fix.replacement);
        fixedCount += matches.length;
    }
});

// Corregir líneas específicas problemáticas
const specificFixes = [
    // Comentarios que empiezan sin //
    { pattern: /\);\s*\/\s*\n\s*([A-Z][a-z]+)/g, replacement: ');\n\n    // $1' },
    { pattern: /\};\s*\/\s*\n\s*([A-Z][a-z]+)/g, replacement: '};\n\n    // $1' },
];

specificFixes.forEach((fix, index) => {
    const matches = content.match(fix.pattern);
    if (matches) {
        console.log(`Aplicando corrección específica ${index + 1}: ${matches.length} coincidencias`);
        content = content.replace(fix.pattern, fix.replacement);
        fixedCount += matches.length;
    }
});

// Escribir el archivo corregido
fs.writeFileSync(filePath, content);

console.log(`✅ Correcciones aplicadas: ${fixedCount}`);
console.log('🎯 Archivo ZyroAppNew.js corregido');

// Verificar que no hay errores de sintaxis básicos
const basicErrors = [
    /\);\s*\/[^\/]/g,  // ); seguido de / pero no //
    /\};\s*\/[^\/]/g,  // }; seguido de / pero no //
];

let hasErrors = false;
basicErrors.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
        console.log(`⚠️  Posibles errores restantes (patrón ${index + 1}): ${matches.length}`);
        hasErrors = true;
    }
});

if (!hasErrors) {
    console.log('✅ No se detectaron errores de sintaxis básicos');
} else {
    console.log('⚠️  Pueden quedar algunos errores por corregir manualmente');
}

console.log('🚀 Listo para probar el simulador!');