const fs = require('fs');
const path = require('path');

console.log('🔄 Convirtiendo logozyrotransparente.png a base64...');

// Ruta al logo original
const logoPath = path.join(__dirname, '..', 'logozyrotransparente.png');
const outputPath = path.join(__dirname, 'assets', 'logoBase64.js');

try {
    // Leer el archivo PNG
    const logoBuffer = fs.readFileSync(logoPath);

    // Convertir a base64
    const base64String = logoBuffer.toString('base64');

    // Crear el archivo JavaScript con la imagen base64
    const jsContent = `// Logo ZYRO en base64
export const logoZyroBase64 = 'data:image/png;base64,${base64String}';
`;

    // Escribir el archivo
    fs.writeFileSync(outputPath, jsContent);

    console.log('✅ Logo convertido exitosamente a base64');
    console.log(`📁 Archivo creado: ${outputPath}`);
    console.log(`📏 Tamaño original: ${logoBuffer.length} bytes`);
    console.log(`📏 Tamaño base64: ${base64String.length} caracteres`);

} catch (error) {
    console.error('❌ Error al convertir el logo:', error.message);
    process.exit(1);
}

console.log('🚀 Listo para usar en la app!');