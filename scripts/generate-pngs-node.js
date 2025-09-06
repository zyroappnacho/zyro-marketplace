const fs = require('fs');
const path = require('path');

// Intentar cargar sharp para generar PNG
let sharp;
try {
  sharp = require('sharp');
  console.log('✅ Sharp disponible para generar PNG');
} catch (e) {
  console.log('⚠️  Sharp no disponible, usando método alternativo');
}

// Colores del logo ZYRO
const colors = {
  gold: '#C9A961',
  darkGold: '#A68B47',
  brightGold: '#D4AF37',
  background: '#1a1a1a',
  circle: '#2a2a2a'
};

// Función para crear SVG del logo
function createLogoSVG(width, height, variant = 'full') {
  const fontSize = Math.floor(width * 0.12);
  const circleRadius = Math.floor(Math.min(width, height) * 0.35);
  const centerX = width / 2;
  const centerY = height / 2;
  
  let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Definir gradientes y filtros
  svgContent += `
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.brightGold};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${colors.gold};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.darkGold};stop-opacity:1" />
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

  if (variant === 'background') {
    // Solo fondo para adaptive icon background
    svgContent += `
      <defs>
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${colors.circle};stop-opacity:1" />
          <stop offset="70%" style="stop-color:${colors.background};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
    `;
  } else if (variant === 'splash') {
    // Fondo degradado para splash
    svgContent += `
      <defs>
        <linearGradient id="splashGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
          <stop offset="50%" style="stop-color:${colors.background};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#splashGradient)"/>
    `;
  } else if (variant === 'full') {
    // Fondo principal
    svgContent += `<rect width="${width}" height="${height}" fill="${colors.background}"/>`;
  }

  if (variant === 'full' || variant === 'splash' || variant === 'foreground') {
    // Círculo de fondo (excepto en background variant)
    if (variant !== 'foreground') {
      svgContent += `
        <circle cx="${centerX}" cy="${centerY}" r="${circleRadius}" 
                fill="${colors.circle}" 
                stroke="url(#goldGradient)" 
                stroke-width="${Math.max(2, width / 256)}" 
                opacity="0.8"/>
      `;
    }
    
    // Texto ZYRO
    svgContent += `
      <text x="${centerX}" y="${centerY + fontSize * 0.1}" 
            font-family="serif" 
            font-size="${fontSize}" 
            font-weight="bold" 
            fill="url(#goldGradient)" 
            text-anchor="middle" 
            dominant-baseline="middle"
            letter-spacing="${Math.max(1, fontSize / 20)}px"
            filter="url(#glow)">ZYRO</text>
    `;
  }

  svgContent += '</svg>';
  return svgContent;
}

// Función para convertir SVG a PNG usando Sharp
async function svgToPng(svgContent, outputPath, width, height) {
  if (sharp) {
    try {
      await sharp(Buffer.from(svgContent))
        .resize(width, height)
        .png()
        .toFile(outputPath);
      return true;
    } catch (error) {
      console.error(`Error con Sharp: ${error.message}`);
      return false;
    }
  }
  return false;
}

// Assets a generar
const assets = [
  { name: 'icon.png', width: 1024, height: 1024, variant: 'full' },
  { name: 'adaptive-icon.png', width: 1024, height: 1024, variant: 'full' },
  { name: 'favicon.png', width: 48, height: 48, variant: 'full' },
  { name: 'adaptive-icon-foreground.png', width: 432, height: 432, variant: 'foreground' },
  { name: 'adaptive-icon-background.png', width: 432, height: 432, variant: 'background' },
  { name: 'splash.png', width: 1284, height: 2778, variant: 'splash' }
];

async function generateAssets() {
  console.log('🎨 Generando assets PNG para ZYRO...');
  console.log('');
  
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  for (const asset of assets) {
    console.log(`📱 Generando ${asset.name} (${asset.width}x${asset.height})`);
    
    const svgContent = createLogoSVG(asset.width, asset.height, asset.variant);
    const outputPath = path.join(assetsDir, asset.name);
    
    // Intentar generar PNG con Sharp
    const success = await svgToPng(svgContent, outputPath, asset.width, asset.height);
    
    if (!success) {
      // Si Sharp no funciona, guardar SVG como referencia
      const svgPath = path.join(assetsDir, asset.name.replace('.png', '.svg'));
      fs.writeFileSync(svgPath, svgContent);
      console.log(`   ⚠️  Guardado como SVG: ${asset.name.replace('.png', '.svg')}`);
    } else {
      console.log(`   ✅ PNG creado: ${asset.name}`);
    }
  }

  console.log('');
  
  if (!sharp) {
    console.log('📋 SIGUIENTE PASO: Convertir SVG a PNG');
    console.log('');
    console.log('Opciones:');
    console.log('1. 🌐 Usar el generador web: abrir create-logo-pngs.html en tu navegador');
    console.log('2. 🔧 Instalar Sharp: npm install sharp');
    console.log('3. 🌍 Convertidor online: https://convertio.co/svg-png/');
    console.log('');
  }
  
  console.log('✅ Assets listos para Expo build!');
}

// Ejecutar generación
generateAssets().catch(console.error);