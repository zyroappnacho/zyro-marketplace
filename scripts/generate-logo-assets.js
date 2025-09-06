const fs = require('fs');
const path = require('path');

// Script para generar todos los assets del logo ZYRO
// Basado en el nuevo diseño con letras doradas sobre fondo oscuro

const logoConfig = {
  // Colores del nuevo logo
  goldColor: '#C9A961',
  backgroundColor: '#1a1a1a',
  circleColor: '#2a2a2a',
  
  // Tamaños requeridos para iOS
  iosSizes: [
    { name: 'app-icon-1024x1024.png', size: 1024 },
    { name: 'app-icon-180x180.png', size: 180 },
    { name: 'app-icon-120x120.png', size: 120 },
    { name: 'app-icon-87x87.png', size: 87 },
    { name: 'app-icon-58x58.png', size: 58 },
    { name: 'app-icon-40x40.png', size: 40 }
  ],
  
  // Tamaños requeridos para Android
  androidSizes: [
    { name: 'app-icon-512x512.png', size: 512 },
    { name: 'adaptive-icon-foreground.png', size: 432 },
    { name: 'adaptive-icon-background.png', size: 432 }
  ],
  
  // Assets principales de Expo
  mainAssets: [
    { name: 'icon.png', size: 1024 },
    { name: 'adaptive-icon.png', size: 1024 },
    { name: 'favicon.png', size: 48 },
    { name: 'splash-icon.png', size: 200 }
  ]
};

// Función para generar SVG del logo
function generateLogoSVG(size, variant = 'full') {
  const fontSize = Math.floor(size * 0.25);
  const circleSize = Math.floor(size * 0.8);
  const circleRadius = circleSize / 2;
  
  let svgContent = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#D4AF37;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#C9A961;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#A68B47;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
  `;

  if (variant === 'full' || variant === 'background') {
    // Fondo del icono
    svgContent += `
      <rect width="${size}" height="${size}" fill="${logoConfig.backgroundColor}" rx="${size * 0.1}"/>
    `;
    
    // Círculo de fondo
    svgContent += `
      <circle cx="${size/2}" cy="${size/2}" r="${circleRadius}" 
              fill="${logoConfig.circleColor}" 
              stroke="url(#goldGradient)" 
              stroke-width="2" 
              opacity="0.8"/>
    `;
  }

  if (variant === 'full' || variant === 'foreground') {
    // Texto ZYRO
    svgContent += `
      <text x="${size/2}" y="${size/2 + fontSize/3}" 
            font-family="serif" 
            font-size="${fontSize}" 
            font-weight="bold" 
            fill="url(#goldGradient)" 
            text-anchor="middle" 
            letter-spacing="2px"
            filter="url(#glow)">ZYRO</text>
    `;
  }

  svgContent += '</svg>';
  return svgContent;
}

// Función para crear el splash screen
function generateSplashSVG() {
  const width = 1284;
  const height = 2778;
  const logoSize = 300;
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#1a1a1a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#D4AF37;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#C9A961;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#A68B47;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Fondo -->
      <rect width="${width}" height="${height}" fill="url(#backgroundGradient)"/>
      
      <!-- Logo centrado -->
      <g transform="translate(${width/2 - logoSize/2}, ${height/2 - logoSize/2})">
        <circle cx="${logoSize/2}" cy="${logoSize/2}" r="${logoSize * 0.4}" 
                fill="#2a2a2a" 
                stroke="url(#goldGradient)" 
                stroke-width="3" 
                opacity="0.8"/>
        <text x="${logoSize/2}" y="${logoSize/2 + 20}" 
              font-family="serif" 
              font-size="60" 
              font-weight="bold" 
              fill="url(#goldGradient)" 
              text-anchor="middle" 
              letter-spacing="4px"
              filter="url(#glow)">ZYRO</text>
      </g>
    </svg>
  `;
}

console.log('🎨 Generando assets del nuevo logo ZYRO...');
console.log('📝 Configuración del logo:');
console.log(`   - Color dorado: ${logoConfig.goldColor}`);
console.log(`   - Fondo: ${logoConfig.backgroundColor}`);
console.log(`   - Círculo: ${logoConfig.circleColor}`);
console.log('');

// Crear directorio de assets si no existe
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generar assets principales
console.log('📱 Generando assets principales...');
logoConfig.mainAssets.forEach(asset => {
  const svgContent = generateLogoSVG(asset.size, 'full');
  const svgPath = path.join(assetsDir, asset.name.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`   ✅ ${asset.name} (${asset.size}x${asset.size})`);
});

// Generar assets para iOS
console.log('🍎 Generando assets para iOS...');
const iosDir = path.join(assetsDir, 'ios');
if (!fs.existsSync(iosDir)) {
  fs.mkdirSync(iosDir, { recursive: true });
}

logoConfig.iosSizes.forEach(asset => {
  const svgContent = generateLogoSVG(asset.size, 'full');
  const svgPath = path.join(iosDir, asset.name.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`   ✅ ${asset.name} (${asset.size}x${asset.size})`);
});

// Generar assets para Android
console.log('🤖 Generando assets para Android...');
const androidDir = path.join(assetsDir, 'android');
if (!fs.existsSync(androidDir)) {
  fs.mkdirSync(androidDir, { recursive: true });
}

logoConfig.androidSizes.forEach(asset => {
  let variant = 'full';
  if (asset.name.includes('foreground')) {
    variant = 'foreground';
  } else if (asset.name.includes('background')) {
    variant = 'background';
  }
  
  const svgContent = generateLogoSVG(asset.size, variant);
  const svgPath = path.join(androidDir, asset.name.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`   ✅ ${asset.name} (${asset.size}x${asset.size}) - ${variant}`);
});

// Generar splash screen
console.log('🌟 Generando splash screen...');
const splashSvg = generateSplashSVG();
const splashPath = path.join(assetsDir, 'splash.svg');
fs.writeFileSync(splashPath, splashSvg);
console.log('   ✅ splash.svg (1284x2778)');

// Generar favicon
console.log('🌐 Generando favicon...');
const faviconSvg = generateLogoSVG(32, 'full');
const faviconPath = path.join(assetsDir, 'favicon.svg');
fs.writeFileSync(faviconPath, faviconSvg);
console.log('   ✅ favicon.svg (32x32)');

console.log('');
console.log('✨ ¡Assets del logo generados exitosamente!');
console.log('');
console.log('📋 Próximos pasos:');
console.log('1. Convertir archivos SVG a PNG usando un convertidor online o herramienta local');
console.log('2. Verificar que todos los assets se vean correctos');
console.log('3. Ejecutar "expo build" para generar los binarios');
console.log('4. Subir a las tiendas de aplicaciones');
console.log('');
console.log('🔧 Para convertir SVG a PNG, puedes usar:');
console.log('   - https://convertio.co/svg-png/');
console.log('   - ImageMagick: convert file.svg file.png');
console.log('   - Inkscape: inkscape --export-png=output.png input.svg');