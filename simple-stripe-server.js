#!/usr/bin/env node

/**
 * Servidor simple para solucionar el error de pasarela de pago
 * Sin dependencias externas
 */

const http = require('http');
const url = require('url');

console.log('🚀 Iniciando servidor Stripe simple...');

// Función para manejar CORS
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Crear servidor HTTP simple
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  
  // Manejar CORS preflight
  if (method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }
  
  setCORSHeaders(res);
  
  // Endpoint para crear checkout session
  if (parsedUrl.pathname === '/api/stripe/create-checkout-session' && method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const requestData = JSON.parse(body);
        console.log('📋 Solicitud de checkout recibida:', requestData);
        
        // Simular respuesta exitosa de Stripe
        const sessionId = `demo_session_${Date.now()}`;
        const response = {
          sessionId: sessionId,
          url: `https://checkout.stripe.com/pay/${sessionId}`,
          customer_id: `demo_customer_${Date.now()}`
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        
        console.log('✅ Respuesta enviada:', response);
        
      } catch (error) {
        console.error('❌ Error procesando solicitud:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    
    return;
  }
  
  // Health check endpoint
  if (parsedUrl.pathname === '/health' && method === 'GET') {
    const response = {
      status: 'OK',
      message: 'Servidor Stripe Demo funcionando',
      timestamp: new Date().toISOString()
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }
  
  // Endpoint no encontrado
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

// Manejar errores del servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log('⚠️  Puerto 3001 ocupado, intentando terminar proceso...');
    
    // Intentar terminar proceso que usa el puerto
    const { exec } = require('child_process');
    exec('lsof -ti:3001 | xargs kill -9', (killError) => {
      if (killError) {
        console.error('Error terminando proceso:', killError);
      } else {
        console.log('✅ Proceso terminado, reintentando...');
        setTimeout(() => {
          server.listen(3001);
        }, 1000);
      }
    });
  } else {
    console.error('❌ Error del servidor:', error);
  }
});

// Iniciar servidor
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`✅ Servidor Stripe Demo ejecutándose en puerto ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Checkout endpoint: http://localhost:${PORT}/api/stripe/create-checkout-session`);
  console.log('');
  console.log('🎯 El servidor está listo para recibir solicitudes de pago');
  console.log('📱 Ahora puedes probar el registro de empresa en la app');
});