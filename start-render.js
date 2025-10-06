#!/usr/bin/env node

/**
 * Script de inicio optimizado para Render.com
 * Maneja la configuración específica para el entorno de producción
 */

const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando Zyro Marketplace Backend en Render...');
console.log('📁 Directorio actual:', process.cwd());
console.log('📁 __dirname:', __dirname);

// Listar archivos en el directorio actual para debug
try {
  const files = fs.readdirSync(process.cwd());
  console.log('📂 Archivos en directorio actual:', files.slice(0, 10));
} catch (err) {
  console.log('❌ Error listando archivos:', err.message);
}

// Configurar puerto
const PORT = process.env.PORT || 3000;
process.env.PORT = PORT;

console.log(`✅ Puerto configurado: ${PORT}`);
console.log(`✅ Entorno: ${process.env.NODE_ENV || 'development'}`);

// Buscar el archivo del servidor en diferentes ubicaciones
const possiblePaths = [
  './backend/stripe-server-optimized.js',
  path.join(__dirname, 'backend/stripe-server-optimized.js'),
  path.join(process.cwd(), 'backend/stripe-server-optimized.js')
];

let serverPath = null;
for (const testPath of possiblePaths) {
  if (fs.existsSync(testPath)) {
    serverPath = testPath;
    console.log(`✅ Servidor encontrado en: ${serverPath}`);
    break;
  }
}

if (!serverPath) {
  console.error('❌ No se pudo encontrar el archivo del servidor');
  console.error('Rutas probadas:', possiblePaths);
  process.exit(1);
}

console.log('✅ Iniciando servidor...');

// Iniciar el servidor principal
require(serverPath);