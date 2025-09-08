const fs = require('fs');
const path = require('path');

// Crear directorio assets si no existe
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Crear un SVG básico para el icono
const iconSVG = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#C9A961;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#D4AF37;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B8860B;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="230" fill="url(#grad)"/>
  <text x="512" y="600" font-family="serif" font-size="300" font-weight="bold" text-anchor="middle" fill="#000" letter-spacing="8">ZYR</text>
  <circle cx="750" cy="400" r="4" fill="#000"/>
  <circle cx="750" cy="400" r="60" fill="none" stroke="#000" stroke-width="3"/>
  <circle cx="750" cy="400" r="45" fill="none" stroke="#000" stroke-width="2" transform="rotate(45 750 400)"/>
  <circle cx="750" cy="400" r="30" fill="none" stroke="#000" stroke-width="2" transform="rotate(90 750 400)"/>
</svg>
`;

// Crear un SVG para splash
const splashSVG = `
<svg width="1200" height="300" viewBox="0 0 1200 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#C9A961;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#D4AF37;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B8860B;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="300" fill="url(#grad)"/>
  <text x="600" y="180" font-family="serif" font-size="120" font-weight="bold" text-anchor="middle" fill="#000" letter-spacing="6">ZYR</text>
  <text x="600" y="220" font-family="sans-serif" font-size="24" text-anchor="middle" fill="rgba(0,0,0,0.7)">Conectamos influencers con marcas</text>
</svg>
`;

// Crear SVG para notificaciones
const notificationSVG = `
<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#C9A961;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D4AF37;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="192" height="192" rx="48" fill="url(#grad)"/>
  <text x="96" y="120" font-size="64" text-anchor="middle" fill="#000">🔔</text>
</svg>
`;

// Crear SVG para favicon
const faviconSVG = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#C9A961;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D4AF37;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#grad)"/>
  <text x="32" y="42" font-family="serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#000">Z</text>
</svg>
`;

// Escribir los archivos SVG
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSVG);
fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSVG);
fs.writeFileSync(path.join(assetsDir, 'notification-icon.svg'), notificationSVG);
fs.writeFileSync(path.join(assetsDir, 'favicon.svg'), faviconSVG);

// Crear archivos PNG básicos (placeholder)
const createPlaceholderPNG = (width, height, filename) => {
  const content = `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#C9A961"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="24" fill="#000">ZYR</text>
    </svg>
  `).toString('base64')}`;
  
  // Para desarrollo, creamos archivos de texto que referencian los SVG
  fs.writeFileSync(path.join(assetsDir, filename), `<!-- Placeholder for ${filename} -->\n<!-- Use: ${content} -->`);
};

// Crear placeholders para los PNG requeridos
createPlaceholderPNG(1024, 1024, 'icon.png');
createPlaceholderPNG(512, 512, 'adaptive-icon.png');
createPlaceholderPNG(1200, 300, 'splash.png');
createPlaceholderPNG(192, 192, 'notification-icon.png');
createPlaceholderPNG(64, 64, 'favicon.png');

console.log('✅ Assets básicos creados:');
console.log('   - assets/icon.svg');
console.log('   - assets/splash.svg');
console.log('   - assets/notification-icon.svg');
console.log('   - assets/favicon.svg');
console.log('   - Placeholders PNG creados');
console.log('');
console.log('📝 Para producción, convierte los SVG a PNG usando:');
console.log('   - Figma, Sketch, o herramientas online');
console.log('   - O usa el generador HTML: assets/icon-generator.html');