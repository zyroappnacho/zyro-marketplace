const { spawn } = require('child_process');

console.log('🚀 Iniciando Zyro Marketplace en el navegador...');

// Iniciar el servidor Expo
const expo = spawn('npx', ['expo', 'start', '--web'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Manejar la salida del proceso
expo.on('close', (code) => {
  console.log(`Servidor cerrado con código ${code}`);
});

// Manejar errores
expo.on('error', (err) => {
  console.error('Error al iniciar el servidor:', err);
});

console.log('📱 Zyro Marketplace iniciándose...');
console.log('🌐 La aplicación se abrirá automáticamente en tu navegador');
console.log('');
console.log('👑 CREDENCIALES DE ADMINISTRADOR:');
console.log('   Usuario: admin_zyrovip');
console.log('   Contraseña: xarrec-2paqra-guftoN');
console.log('');
console.log('📱 CREDENCIALES DE INFLUENCER DE PRUEBA:');
console.log('   Usuario: pruebainflu');
console.log('   Contraseña: 12345');
console.log('');
console.log('🏢 PARA EMPRESAS:');
console.log('   Hacer clic en "SOY EMPRESA" y registrarse');
console.log('');
console.log('Presiona Ctrl+C para detener el servidor');