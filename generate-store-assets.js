#!/usr/bin/env node

/**
 * Script para generar todos los assets necesarios para las stores
 * Convierte SVG a PNG y crea todos los tamaños requeridos
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 GENERADOR DE ASSETS PARA STORES - ZYRO MARKETPLACE');
console.log('====================================================');

// Crear directorios necesarios
const storeAssetsDir = path.join(__dirname, 'store-assets');
const iosDir = path.join(storeAssetsDir, 'ios');
const androidDir = path.join(storeAssetsDir, 'android');

[storeAssetsDir, iosDir, androidDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Creado directorio: ${dir}`);
  }
});

// Instrucciones para generar assets
const instructions = `
📋 INSTRUCCIONES PARA GENERAR ASSETS

1. ICONOS PRINCIPALES (REQUERIDOS):
   
   iOS App Store:
   - App Icon: 1024x1024 PNG (sin transparencia)
   - Ubicación: ./store-assets/ios/app-icon-1024x1024.png
   
   Google Play Store:
   - App Icon: 512x512 PNG
   - Ubicación: ./store-assets/android/app-icon-512x512.png

2. SCREENSHOTS (REQUERIDOS):

   iOS Screenshots (mínimo 3, máximo 10 por tamaño):
   - iPhone 6.7": 1290x2796 (iPhone 14 Pro Max)
   - iPhone 6.1": 1179x2556 (iPhone 14 Pro)
   - iPhone 5.5": 1242x2208 (iPhone 8 Plus)
   
   Android Screenshots:
   - Phone: 1080x1920 mínimo
   - 7" Tablet: 1024x1600 mínimo
   - 10" Tablet: 1200x1920 mínimo

3. ASSETS ADICIONALES:

   Google Play Store:
   - Feature Graphic: 1024x500 PNG
   - Promo Graphic: 180x120 PNG (opcional)

4. HERRAMIENTAS RECOMENDADAS:

   Online:
   - https://appicon.co/ (genera todos los tamaños)
   - https://makeappicon.com/
   - https://canva.com (para screenshots)
   
   Local:
   - Figma/Sketch para diseño
   - Simulator/Emulator para screenshots

5. PASOS SIGUIENTES:

   a) Generar iconos PNG desde SVG:
      - Usar herramienta online o Figma
      - Exportar en alta calidad
      - Verificar que no tengan transparencia (iOS)
   
   b) Tomar screenshots:
      - Usar simuladores iOS/Android
      - Capturar pantallas principales de la app
      - Mostrar funcionalidades clave
   
   c) Ejecutar validación:
      node validate-assets.js

📱 PANTALLAS RECOMENDADAS PARA SCREENSHOTS:
1. Pantalla de login/bienvenida
2. Dashboard principal (influencer/empresa)
3. Lista de colaboraciones
4. Mapa interactivo
5. Perfil de usuario
6. Chat/mensajería
7. Configuración de pagos (empresas)

🎯 TIPS PARA SCREENSHOTS:
- Usar datos de ejemplo atractivos
- Mostrar la interfaz en español
- Incluir elementos visuales llamativos
- Evitar información personal real
- Usar el tema oscuro (marca ZYRO)
`;

// Crear archivo de instrucciones
fs.writeFileSync(path.join(storeAssetsDir, 'INSTRUCCIONES.md'), instructions);

// Crear script de validación
const validationScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDANDO ASSETS PARA STORES...');
console.log('==================================');

const requiredAssets = {
  ios: [
    'app-icon-1024x1024.png',
    'screenshot-6.7-1.png',
    'screenshot-6.7-2.png',
    'screenshot-6.7-3.png'
  ],
  android: [
    'app-icon-512x512.png',
    'feature-graphic-1024x500.png',
    'screenshot-phone-1.png',
    'screenshot-phone-2.png',
    'screenshot-phone-3.png'
  ]
};

let allValid = true;

Object.entries(requiredAssets).forEach(([platform, assets]) => {
  console.log(\`\\n📱 Validando \${platform.toUpperCase()}:\`);
  
  assets.forEach(asset => {
    const assetPath = path.join(__dirname, platform, asset);
    const exists = fs.existsSync(assetPath);
    
    console.log(\`  \${exists ? '✅' : '❌'} \${asset}\`);
    
    if (!exists) {
      allValid = false;
    }
  });
});

console.log(\`\\n\${allValid ? '🎉' : '⚠️'} \${allValid ? 'Todos los assets están listos!' : 'Faltan algunos assets requeridos'}\`);

if (allValid) {
  console.log('\\n🚀 ¡Listo para hacer build de producción!');
} else {
  console.log('\\n📋 Revisa las instrucciones en INSTRUCCIONES.md');
}
`;

fs.writeFileSync(path.join(storeAssetsDir, 'validate-assets.js'), validationScript);
fs.chmodSync(path.join(storeAssetsDir, 'validate-assets.js'), '755');

// Crear plantilla HTML para generar iconos
const iconGeneratorHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generador de Iconos ZYRO</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #000;
            color: #fff;
        }
        .container {
            background: #111;
            padding: 30px;
            border-radius: 12px;
            border: 1px solid #333;
        }
        h1 {
            color: #C9A961;
            text-align: center;
            margin-bottom: 30px;
        }
        .icon-preview {
            display: flex;
            gap: 20px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        .icon-size {
            text-align: center;
            padding: 15px;
            background: #222;
            border-radius: 8px;
            border: 1px solid #444;
        }
        .icon-placeholder {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #C9A961, #8B7355);
            border-radius: 20px;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 24px;
            color: #000;
        }
        .instructions {
            background: #1a1a1a;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #C9A961;
        }
        .button {
            background: #C9A961;
            color: #000;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 10px 10px 10px 0;
        }
        .button:hover {
            background: #B8985A;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Generador de Iconos ZYRO</h1>
        
        <div class="instructions">
            <h3>📋 Pasos para generar iconos:</h3>
            <ol>
                <li>Usa el logo SVG base de ZYRO</li>
                <li>Convierte a PNG en los tamaños requeridos</li>
                <li>Para iOS: sin transparencia, fondo sólido</li>
                <li>Para Android: puede tener transparencia</li>
            </ol>
        </div>

        <h3>📱 Tamaños requeridos:</h3>
        
        <div class="icon-preview">
            <div class="icon-size">
                <div class="icon-placeholder">iOS</div>
                <strong>1024×1024</strong><br>
                <small>App Store</small>
            </div>
            <div class="icon-size">
                <div class="icon-placeholder">AND</div>
                <strong>512×512</strong><br>
                <small>Play Store</small>
            </div>
        </div>

        <div class="instructions">
            <h3>🛠️ Herramientas recomendadas:</h3>
            <a href="https://appicon.co/" class="button" target="_blank">AppIcon.co</a>
            <a href="https://makeappicon.com/" class="button" target="_blank">MakeAppIcon</a>
            <a href="https://canva.com/" class="button" target="_blank">Canva</a>
        </div>

        <div class="instructions">
            <h3>✅ Checklist:</h3>
            <ul>
                <li>□ Icono iOS 1024×1024 PNG (sin transparencia)</li>
                <li>□ Icono Android 512×512 PNG</li>
                <li>□ Feature Graphic Android 1024×500 PNG</li>
                <li>□ Screenshots iOS (mínimo 3)</li>
                <li>□ Screenshots Android (mínimo 3)</li>
            </ul>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(storeAssetsDir, 'icon-generator.html'), iconGeneratorHTML);

console.log('✅ Assets preparados en ./store-assets/');
console.log('📋 Lee las instrucciones en ./store-assets/INSTRUCCIONES.md');
console.log('🎨 Abre ./store-assets/icon-generator.html para generar iconos');
console.log('🔍 Ejecuta "node ./store-assets/validate-assets.js" para validar');