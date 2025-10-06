const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando diagnóstico...');

const adminPanelPath = path.join(__dirname, 'components/AdminPanel.js');
let content = fs.readFileSync(adminPanelPath, 'utf8');

const start = content.indexOf('// 🔍 DIAGNÓSTICO: Mostrar contraseña actual real');
const end = content.indexOf('// 🔍 FIN DIAGNÓSTICO') + '// 🔍 FIN DIAGNÓSTICO'.length;

if (start !== -1 && end !== -1) {
  const newContent = content.slice(0, start) + content.slice(end);
  fs.writeFileSync(adminPanelPath, newContent, 'utf8');
  console.log('✅ Diagnóstico removido');
} else {
  console.log('⚠️ No se encontró diagnóstico para remover');
}