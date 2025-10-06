const fs = require('fs');
const path = require('path');

console.log('🎨 Generando assets para iOS con logozyrotransparente.png...');

// Verificar que el logo existe
const logoPath = path.join(__dirname, 'assets', 'logozyrotransparente.png');
if (!fs.existsSync(logoPath)) {
    console.error('❌ No se encontró logozyrotransparente.png en assets/');
    process.exit(1);
}

// Crear directorio de assets si no existe
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Verificar que el logo está en la ubicación correcta
console.log('✅ Logo encontrado en:', logoPath);

// Actualizar app.json para asegurar que usa el logo correcto
const appJsonPath = path.join(__dirname, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Actualizar configuración del logo
appJson.expo.icon = './assets/logozyrotransparente.png';
appJson.expo.splash.image = './assets/logozyrotransparente.png';
appJson.expo.web.favicon = './assets/logozyrotransparente.png';
appJson.expo.notification.icon = './assets/logozyrotransparente.png';

if (appJson.expo.android && appJson.expo.android.adaptiveIcon) {
    appJson.expo.android.adaptiveIcon.foregroundImage = './assets/logozyrotransparente.png';
}

// Guardar app.json actualizado
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log('✅ app.json actualizado con logozyrotransparente.png');
console.log('🎯 Assets configurados correctamente para iOS');
console.log('📱 El logo se usará en:');
console.log('   - Icono de la app');
console.log('   - Splash screen');
console.log('   - Notificaciones');
console.log('   - Favicon web');
console.log('   - Icono adaptativo Android');

console.log('\n🚀 Listo para generar el simulador de iOS!');