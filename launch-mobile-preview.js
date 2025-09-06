const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3001;
const PREVIEW_FILE = path.join(__dirname, 'mobile-preview-complete.html');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/mobile-preview.html' || req.url === '/mobile-preview-fixed.html' || req.url === '/mobile-preview-complete.html') {
    // Serve the mobile preview
    fs.readFile(PREVIEW_FILE, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading preview');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  } else {
    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Zyro Marketplace - Vista Previa Móvil`);
  console.log(`📱 Servidor iniciado en: http://localhost:${PORT}`);
  console.log(`✨ Vista previa interactiva con simulación de iPhone 14 Pro Max`);
  console.log(`🔄 Cambio de roles disponible en tiempo real`);
  console.log(`\n📋 Funcionalidades incluidas:`);
  console.log(`   • Sistema multirol (Influencer, Empresa, Admin)`);
  console.log(`   • Navegación inferior con 4 pestañas`);
  console.log(`   • Pantalla de colaboraciones con filtros`);
  console.log(`   • Mapa interactivo de España`);
  console.log(`   • Historial de colaboraciones`);
  console.log(`   • Perfil completo con configuraciones`);
  console.log(`   • Diseño premium con colores dorado y negro`);
  console.log(`   • Animaciones y transiciones suaves`);
  console.log(`   • Responsive para móviles`);
  console.log(`\n🎯 Para cambiar de rol, usa los botones en la esquina superior derecha`);
  console.log(`\n⚡ Presiona Ctrl+C para detener el servidor`);
  
  // Try to open browser automatically
  const url = `http://localhost:${PORT}`;
  
  // Detect OS and open browser
  const platform = process.platform;
  let command;
  
  if (platform === 'win32') {
    command = `start ${url}`;
  } else if (platform === 'darwin') {
    command = `open ${url}`;
  } else {
    command = `xdg-open ${url}`;
  }
  
  exec(command, (error) => {
    if (error) {
      console.log(`\n🌐 Abre manualmente: ${url}`);
    } else {
      console.log(`\n🌐 Abriendo navegador automáticamente...`);
    }
  });
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Cerrando servidor de vista previa...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Error del servidor:', error.message);
  process.exit(1);
});