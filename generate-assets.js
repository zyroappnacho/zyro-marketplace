#!/usr/bin/env node

/**
 * ZYRO Marketplace - Asset Generator
 * Genera todos los assets necesarios para iOS y Android
 */

const fs = require('fs');
const path = require('path');

// Crear directorio de assets si no existe
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generar HTML para crear iconos manualmente
const iconGeneratorHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZYRO Icon Generator</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: #000;
            color: #fff;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .icon-container {
            width: 512px;
            height: 512px;
            background: linear-gradient(135deg, #C9A961, #D4AF37, #B8860B);
            border-radius: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px;
            position: relative;
            box-shadow: 0 20px 40px rgba(201, 169, 97, 0.3);
        }
        
        .logo-text {
            font-size: 180px;
            font-weight: 700;
            color: #000;
            letter-spacing: 8px;
            font-family: 'Times New Roman', serif;
        }
        
        .atom-symbol {
            position: absolute;
            right: 80px;
            top: 50%;
            transform: translateY(-50%);
            width: 120px;
            height: 120px;
        }
        
        .atom-core {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #000;
            position: absolute;
            top: 50px;
            left: 50px;
        }
        
        .atom-orbit {
            position: absolute;
            border: 3px solid #000;
            border-radius: 50%;
        }
        
        .orbit-1 {
            width: 120px;
            height: 120px;
            top: 0;
            left: 0;
        }
        
        .orbit-2 {
            width: 90px;
            height: 90px;
            top: 15px;
            left: 15px;
            transform: rotate(45deg);
        }
        
        .orbit-3 {
            width: 60px;
            height: 60px;
            top: 30px;
            left: 30px;
            transform: rotate(90deg);
        }
        
        .instructions {
            max-width: 600px;
            text-align: center;
            margin: 20px;
            padding: 20px;
            background: #111;
            border-radius: 12px;
            border: 1px solid #333;
        }
        
        .size-variants {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
            margin: 20px 0;
        }
        
        .size-variant {
            text-align: center;
        }
        
        .size-variant .icon-container {
            box-shadow: 0 4px 8px rgba(201, 169, 97, 0.2);
        }
        
        .size-1024 { width: 200px; height: 200px; border-radius: 48px; }
        .size-1024 .logo-text { font-size: 72px; letter-spacing: 3px; }
        .size-1024 .atom-symbol { width: 48px; height: 48px; right: 32px; }
        .size-1024 .atom-core { width: 8px; height: 8px; top: 20px; left: 20px; }
        .size-1024 .orbit-1 { width: 48px; height: 48px; border-width: 1px; }
        .size-1024 .orbit-2 { width: 36px; height: 36px; top: 6px; left: 6px; border-width: 1px; }
        .size-1024 .orbit-3 { width: 24px; height: 24px; top: 12px; left: 12px; border-width: 1px; }
        
        .size-512 { width: 150px; height: 150px; border-radius: 36px; }
        .size-512 .logo-text { font-size: 54px; letter-spacing: 2px; }
        .size-512 .atom-symbol { width: 36px; height: 36px; right: 24px; }
        .size-512 .atom-core { width: 6px; height: 6px; top: 15px; left: 15px; }
        .size-512 .orbit-1 { width: 36px; height: 36px; border-width: 1px; }
        .size-512 .orbit-2 { width: 27px; height: 27px; top: 4px; left: 4px; border-width: 1px; }
        .size-512 .orbit-3 { width: 18px; height: 18px; top: 9px; left: 9px; border-width: 1px; }
        
        .download-btn {
            background: linear-gradient(135deg, #C9A961, #D4AF37);
            color: #000;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin: 10px;
        }
        
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(201, 169, 97, 0.4);
        }
    </style>
</head>
<body>
    <h1>ZYRO Marketplace - Generador de Iconos</h1>
    
    <div class="instructions">
        <h2>📱 Instrucciones para Generar Assets</h2>
        <p>1. Usa la herramienta de captura de pantalla de tu sistema</p>
        <p>2. Captura cada icono individualmente</p>
        <p>3. Guarda con los nombres especificados</p>
        <p>4. Coloca los archivos en la carpeta <code>assets/</code></p>
    </div>
    
    <div class="size-variants">
        <div class="size-variant">
            <div class="icon-container size-1024">
                <span class="logo-text">ZYR</span>
                <div class="atom-symbol">
                    <div class="atom-core"></div>
                    <div class="atom-orbit orbit-1"></div>
                    <div class="atom-orbit orbit-2"></div>
                    <div class="atom-orbit orbit-3"></div>
                </div>
            </div>
            <p><strong>icon.png</strong><br>1024x1024px<br>iOS App Store</p>
        </div>
        
        <div class="size-variant">
            <div class="icon-container size-512">
                <span class="logo-text">ZYR</span>
                <div class="atom-symbol">
                    <div class="atom-core"></div>
                    <div class="atom-orbit orbit-1"></div>
                    <div class="atom-orbit orbit-2"></div>
                    <div class="atom-orbit orbit-3"></div>
                </div>
            </div>
            <p><strong>adaptive-icon.png</strong><br>512x512px<br>Android</p>
        </div>
    </div>
    
    <div style="width: 100%; max-width: 1200px; height: 300px; background: linear-gradient(135deg, #C9A961, #D4AF37); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 20px 0;">
        <div style="text-align: center;">
            <div style="font-size: 72px; font-weight: 700; color: #000; letter-spacing: 4px; margin-bottom: 10px;">ZYR</div>
            <div style="font-size: 24px; color: rgba(0,0,0,0.7);">Conectamos influencers con marcas</div>
        </div>
    </div>
    <p><strong>splash.png</strong> - 1200x300px - Splash Screen</p>
    
    <div style="width: 192px; height: 192px; background: linear-gradient(135deg, #C9A961, #D4AF37); border-radius: 48px; display: flex; align-items: center; justify-content: center; margin: 20px;">
        <span style="font-size: 48px; font-weight: 700; color: #000; letter-spacing: 2px;">🔔</span>
    </div>
    <p><strong>notification-icon.png</strong> - 192x192px - Notificaciones</p>
    
    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #C9A961, #D4AF37); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 20px;">
        <span style="font-size: 24px; font-weight: 700; color: #000;">Z</span>
    </div>
    <p><strong>favicon.png</strong> - 64x64px - Web</p>
    
    <div class="instructions">
        <h3>📋 Lista de Assets Requeridos</h3>
        <ul style="text-align: left;">
            <li><code>icon.png</code> - 1024x1024px (iOS App Store)</li>
            <li><code>adaptive-icon.png</code> - 512x512px (Android)</li>
            <li><code>splash.png</code> - 1200x300px (Splash screen)</li>
            <li><code>notification-icon.png</code> - 192x192px (Notificaciones)</li>
            <li><code>favicon.png</code> - 64x64px (Web)</li>
        </ul>
        
        <h3>🎨 Especificaciones de Color</h3>
        <ul style="text-align: left;">
            <li>Dorado principal: <code>#C9A961</code></li>
            <li>Dorado claro: <code>#D4AF37</code></li>
            <li>Dorado oscuro: <code>#B8860B</code></li>
            <li>Negro: <code>#000000</code></li>
        </ul>
    </div>
    
    <script>
        // Función para descargar como imagen (requiere canvas)
        function downloadIcon(elementId, filename) {
            // Esta función requeriría html2canvas o similar
            alert('Usa la herramienta de captura de pantalla de tu sistema para guardar: ' + filename);
        }
    </script>
</body>
</html>
`;

// Escribir el archivo HTML
fs.writeFileSync(path.join(assetsDir, 'icon-generator.html'), iconGeneratorHTML);

// Crear archivo de configuración de assets
const assetConfig = {
  "ios": {
    "icon": {
      "size": "1024x1024",
      "filename": "icon.png",
      "description": "iOS App Store icon"
    },
    "splash": {
      "size": "1200x300",
      "filename": "splash.png", 
      "description": "iOS splash screen"
    }
  },
  "android": {
    "icon": {
      "size": "512x512",
      "filename": "adaptive-icon.png",
      "description": "Android adaptive icon"
    },
    "splash": {
      "size": "1200x300", 
      "filename": "splash.png",
      "description": "Android splash screen"
    }
  },
  "web": {
    "favicon": {
      "size": "64x64",
      "filename": "favicon.png",
      "description": "Web favicon"
    }
  },
  "notifications": {
    "icon": {
      "size": "192x192",
      "filename": "notification-icon.png",
      "description": "Push notification icon"
    }
  }
};

fs.writeFileSync(
  path.join(assetsDir, 'asset-config.json'), 
  JSON.stringify(assetConfig, null, 2)
);

console.log('✅ Asset generator creado exitosamente!');
console.log('📁 Archivos generados:');
console.log('   - assets/icon-generator.html');
console.log('   - assets/asset-config.json');
console.log('');
console.log('🎨 Próximos pasos:');
console.log('1. Abre assets/icon-generator.html en tu navegador');
console.log('2. Captura cada icono usando la herramienta de captura de pantalla');
console.log('3. Guarda los archivos con los nombres especificados');
console.log('4. Coloca todos los assets en la carpeta assets/');
console.log('');
console.log('🚀 Una vez que tengas todos los assets, ejecuta:');
console.log('   eas build --platform all --profile production');