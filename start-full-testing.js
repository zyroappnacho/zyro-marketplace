const { spawn, exec } = require('child_process');
const open = require('open');

console.log('🚀 Iniciando Zyro Marketplace - Testing Completo');
console.log('===============================================');

// Función para abrir web después de un delay
const openWeb = () => {
  setTimeout(() => {
    console.log('🌐 Abriendo aplicación web...');
    open('http://localhost:8081');
  }, 3000);
};

// Función para abrir iOS simulator después de un delay
const openIOS = () => {
  setTimeout(() => {
    console.log('📱 Abriendo simulador de iOS...');
    exec('npx expo start --ios', (error, stdout, stderr) => {
      if (error) {
        console.error('Error abriendo iOS:', error);
      } else {
        console.log('iOS simulator iniciado');
      }
    });
  }, 5000);
};

// Iniciar servidor Expo
console.log('⚡ Iniciando servidor Expo...');
const expo = spawn('npx', ['expo', 'start'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Abrir web y iOS automáticamente
openWeb();
openIOS();

console.log('');
console.log('📋 CREDENCIALES DE PRUEBA:');
console.log('');
console.log('👑 ADMINISTRADOR:');
console.log('   Usuario: admin_zyrovip');
console.log('   Contraseña: xarrec-2paqra-guftoN');
console.log('');
console.log('📱 INFLUENCER DE PRUEBA:');
console.log('   Usuario: pruebainflu');
console.log('   Contraseña: 12345');
console.log('');
console.log('🏢 EMPRESA:');
console.log('   Hacer clic en "SOY EMPRESA" y registrarse');
console.log('');
console.log('🌐 WEB: http://localhost:8081');
console.log('📱 iOS: Se abrirá automáticamente en el simulador');
console.log('');
console.log('Presiona Ctrl+C para detener todos los servicios');

// Manejar cierre
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servicios...');
  expo.kill();
  process.exit(0);
});

expo.on('close', (code) => {
  console.log(`Servidor cerrado con código ${code}`);
  process.exit(code);
});