/**
 * Servidor optimizado de Stripe para producción
 * Usa IDs de precios predefinidos para mayor eficiencia
 */

const express = require('express');
const cors = require('cors');
const stripe = require('stripe');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar Stripe con la clave secreta
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Cargar IDs de precios predefinidos
const priceIds = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'stripe-price-ids.json'), 'utf8'));

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
      'https://zyromarketplace.com',
      'https://www.zyromarketplace.com',
      /\.onrender\.com$/,  // Permitir dominios de Render
      /\.vercel\.app$/     // Permitir dominios de Vercel
    ]
    : ['http://localhost:3000', 'http://localhost:19006', 'exp://192.168.1.100:19000'],
  credentials: true
}));

// Middleware especial para webhooks - debe ir antes del JSON parser
app.use('/webhook/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Zyro Marketplace Backend API',
    status: 'running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    stripe_configured: !!process.env.STRIPE_SECRET_KEY,
    prices_loaded: Object.keys(priceIds).length,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      stripe_checkout: '/api/stripe/create-checkout-session',
      stripe_webhook: '/webhook/stripe'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    port: PORT,
    stripe: 'configured',
    environment: process.env.NODE_ENV,
    prices_loaded: Object.keys(priceIds).length,
    timestamp: new Date().toISOString()
  });
});

// Crear sesión de checkout optimizada
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { company, plan, success_url, cancel_url, metadata } = req.body;

    console.log('📋 Creando sesión de checkout optimizada:', {
      company: company.name,
      plan: plan.id,
      monthly_price: metadata.monthly_price,
      setup_fee: metadata.setup_fee
    });

    // Obtener IDs de precios predefinidos
    const planPriceId = priceIds[plan.id]?.price_id;
    const setupPriceId = priceIds.setup_fee?.price_id;

    if (!planPriceId) {
      throw new Error(`Plan ${plan.id} no encontrado en configuración de precios`);
    }

    if (!setupPriceId && metadata.setup_fee > 0) {
      throw new Error('Setup fee no encontrado en configuración de precios');
    }

    // Crear o buscar cliente
    let customer;
    try {
      const existingCustomers = await stripeClient.customers.list({
        email: company.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log('✅ Cliente existente encontrado:', customer.id);
      } else {
        customer = await stripeClient.customers.create({
          email: company.email,
          name: company.name,
          phone: company.phone || '',
          metadata: {
            company_id: company.id,
            company_name: company.name,
            cif: company.cif || '',
            sector: company.sector || ''
          }
        });
        console.log('✅ Nuevo cliente creado:', customer.id);
      }
    } catch (customerError) {
      console.error('❌ Error gestionando cliente:', customerError);
      throw customerError;
    }

    // Preparar line items
    const lineItems = [
      {
        price: planPriceId,
        quantity: 1
      }
    ];

    // Agregar setup fee si existe
    if (setupPriceId && metadata.setup_fee > 0) {
      lineItems.push({
        price: setupPriceId,
        quantity: 1
      });
    }

    // Crear sesión de checkout
    const sessionData = {
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customer.id,
      line_items: lineItems,
      subscription_data: {
        metadata: {
          ...metadata,
          company_id: company.id,
          company_name: company.name,
          company_email: company.email,
          plan_id: plan.id,
          duration_months: priceIds[plan.id]?.duration_months?.toString() || '3',
          start_date: new Date().toISOString(),
          price_id_used: planPriceId,
          setup_price_id_used: setupPriceId || 'none'
        }
      },
      success_url: success_url,
      cancel_url: cancel_url,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      metadata: {
        ...metadata,
        customer_id: customer.id,
        subscription_type: 'monthly_recurring',
        plan_price_id: planPriceId,
        setup_price_id: setupPriceId || 'none'
      }
    };

    const session = await stripeClient.checkout.sessions.create(sessionData);

    console.log('✅ Sesión de checkout creada exitosamente:', {
      session_id: session.id,
      customer_id: customer.id,
      plan_price_id: planPriceId,
      setup_price_id: setupPriceId,
      amount_total: session.amount_total
    });

    res.json({
      sessionId: session.id,
      url: session.url,
      customer_id: customer.id,
      subscription_details: {
        plan_id: plan.id,
        monthly_amount: priceIds[plan.id]?.amount / 100,
        setup_fee: metadata.setup_fee,
        duration_months: priceIds[plan.id]?.duration_months,
        total_subscription_value: (priceIds[plan.id]?.amount / 100) * (priceIds[plan.id]?.duration_months || 3)
      }
    });

  } catch (error) {
    console.error('❌ Error creando sesión de checkout:', error);
    res.status(400).json({
      error: error.message,
      type: error.type || 'stripe_error',
      details: error.code || 'unknown_error'
    });
  }
});

// Verificar estado del pago
app.post('/api/stripe/verify-payment', async (req, res) => {
  try {
    const { session_id } = req.body;

    console.log('🔍 Verificando pago para sesión:', session_id);

    const session = await stripeClient.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer']
    });

    res.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_id: session.customer,
      subscription_id: session.subscription?.id,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      subscription_details: session.subscription ? {
        id: session.subscription.id,
        status: session.subscription.status,
        current_period_start: session.subscription.current_period_start,
        current_period_end: session.subscription.current_period_end
      } : null
    });

  } catch (error) {
    console.error('❌ Error verificando pago:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Obtener información de suscripción
app.post('/api/stripe/subscription-info', async (req, res) => {
  try {
    const { customer_id, subscription_id } = req.body;

    let subscriptions;

    if (subscription_id) {
      const subscription = await stripeClient.subscriptions.retrieve(subscription_id, {
        expand: ['items.data.price.product', 'customer', 'latest_invoice']
      });
      subscriptions = [subscription];
    } else if (customer_id) {
      const result = await stripeClient.subscriptions.list({
        customer: customer_id,
        expand: ['data.items.data.price.product', 'data.customer', 'data.latest_invoice']
      });
      subscriptions = result.data;
    } else {
      throw new Error('Se requiere customer_id o subscription_id');
    }

    const formattedSubscriptions = subscriptions.map(sub => {
      const durationMonths = parseInt(sub.metadata.duration_months || '12');
      const startDate = new Date(sub.created * 1000);
      const cancelDate = sub.cancel_at ? new Date(sub.cancel_at * 1000) : null;
      const currentPeriodEnd = new Date(sub.current_period_end * 1000);

      const totalDuration = durationMonths * 30 * 24 * 60 * 60 * 1000;
      const elapsed = Date.now() - startDate.getTime();
      const progress = Math.min((elapsed / totalDuration) * 100, 100);

      return {
        id: sub.id,
        status: sub.status,
        customer_id: sub.customer,
        plan_id: sub.metadata.plan_id,
        company_name: sub.metadata.company_name,
        monthly_amount: sub.items.data[0]?.price.unit_amount / 100,
        currency: sub.items.data[0]?.price.currency,
        duration_months: durationMonths,
        created: startDate.toISOString(),
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        cancel_at: cancelDate ? cancelDate.toISOString() : null,
        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
        progress_percentage: Math.round(progress),
        payments_made: Math.floor(elapsed / (30 * 24 * 60 * 60 * 1000)) + 1,
        payments_remaining: Math.max(0, durationMonths - Math.floor(elapsed / (30 * 24 * 60 * 60 * 1000))),
        total_paid: sub.latest_invoice ? (sub.latest_invoice.amount_paid / 100) : 0,
        next_payment_date: sub.status === 'active' ? currentPeriodEnd.toISOString() : null,
        auto_cancel_scheduled: !!sub.cancel_at,
        metadata: sub.metadata
      };
    });

    res.json({
      subscriptions: formattedSubscriptions,
      total_count: formattedSubscriptions.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo información de suscripción:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Endpoint GET para testing del webhook
app.get('/webhook/stripe', (req, res) => {
  res.json({
    message: 'Webhook endpoint is active',
    status: 'ready',
    method: 'POST required for Stripe webhooks',
    timestamp: new Date().toISOString(),
    info: 'This endpoint receives Stripe webhook events via POST requests'
  });
});

// Webhook para eventos de Stripe - Endpoint correcto para Render
app.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // Log inicial para debugging
  console.log('📨 Webhook recibido:', {
    headers: req.headers['stripe-signature'] ? 'Signature present' : 'No signature',
    bodyType: typeof req.body,
    bodyLength: req.body ? req.body.length : 0,
    timestamp: new Date().toISOString()
  });

  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ Webhook verificado exitosamente:', event.type);
  } catch (err) {
    console.error('❌ Error verificando webhook:', {
      error: err.message,
      signature: sig ? 'Present' : 'Missing',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'Configured' : 'Missing',
      timestamp: new Date().toISOString()
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar diferentes tipos de eventos
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Checkout completado:', session.id);

      if (session.mode === 'subscription') {
        await handleSubscriptionCreated(session);
      }
      break;

    case 'customer.subscription.created':
      const newSubscription = event.data.object;
      console.log('🔄 Suscripción creada:', newSubscription.id);
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('💰 Pago de factura exitoso:', {
        invoice_id: invoice.id,
        customer_id: invoice.customer,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        subscription_id: invoice.subscription
      });
      await handleInvoicePaymentSucceeded(invoice);
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('❌ Pago de factura fallido:', failedInvoice.id);
      break;

    default:
      console.log(`🔔 Evento no manejado: ${event.type}`);
  }

  res.json({ received: true });
});

async function handleSubscriptionCreated(session) {
  try {
    const subscription = await stripeClient.subscriptions.retrieve(session.subscription);
    const durationMonths = parseInt(subscription.metadata.duration_months || '12');

    console.log('📅 Suscripción creada exitosamente:', {
      subscription_id: subscription.id,
      duration_months: durationMonths,
      customer: subscription.customer,
      plan_id: subscription.metadata.plan_id
    });

  } catch (error) {
    console.error('❌ Error procesando suscripción creada:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log('💳 Procesando pago exitoso de factura:', {
      invoice_id: invoice.id,
      customer_id: invoice.customer,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      subscription_id: invoice.subscription,
      billing_reason: invoice.billing_reason
    });

    // Si es el primer pago de una suscripción
    if (invoice.billing_reason === 'subscription_create') {
      console.log('🎉 Primer pago de suscripción completado');

      // Aquí puedes agregar lógica para:
      // - Activar la cuenta de la empresa
      // - Enviar email de bienvenida
      // - Actualizar estado en tu base de datos
    }

    // Si es un pago recurrente
    if (invoice.billing_reason === 'subscription_cycle') {
      console.log('🔄 Pago recurrente de suscripción completado');

      // Aquí puedes agregar lógica para:
      // - Extender el período de suscripción
      // - Enviar confirmación de renovación
      // - Actualizar métricas
    }

    return true;
  } catch (error) {
    console.error('❌ Error procesando pago de factura:', error);
    return false;
  }
}

// Endpoint para obtener configuración de precios
app.get('/api/stripe/price-config', (req, res) => {
  res.json({
    prices: priceIds,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: error.message
  });
});

// Sistema Keep-Alive para evitar suspensión en Render Free
if (process.env.NODE_ENV === 'production') {
  const keepAliveInterval = setInterval(() => {
    // Auto-ping cada 14 minutos para mantener activo
    const startTime = Date.now();

    // Hacer request interno al health endpoint
    const http = require('http');
    const req = http.get(`http://localhost:${PORT}/health`, (res) => {
      const responseTime = Date.now() - startTime;
      console.log(`🏓 Keep-alive ping: ${res.statusCode} - ${responseTime}ms`);
    });

    req.on('error', (err) => {
      console.log('⚠️  Keep-alive ping error:', err.message);
    });

    req.setTimeout(10000); // 10 segundos timeout
  }, 14 * 60 * 1000); // 14 minutos

  // Limpiar interval al cerrar
  process.on('SIGTERM', () => {
    clearInterval(keepAliveInterval);
  });

  process.on('SIGINT', () => {
    clearInterval(keepAliveInterval);
  });
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🚀 SERVIDOR STRIPE OPTIMIZADO INICIADO');
  console.log('='.repeat(50));
  console.log(`✅ Puerto: ${PORT}`);
  console.log(`✅ Entorno: ${process.env.NODE_ENV}`);
  console.log(`✅ Stripe configurado: ${process.env.STRIPE_SECRET_KEY ? 'Sí' : 'No'}`);
  console.log(`✅ Precios cargados: ${Object.keys(priceIds).length}`);
  console.log(`✅ CORS habilitado para producción`);
  console.log(`✅ Webhooks endpoint: /webhook/stripe`);

  console.log('\n💰 PRECIOS CONFIGURADOS:');
  Object.entries(priceIds).forEach(([key, config]) => {
    console.log(`   ${key}: ${config.price_id} (${config.amount / 100}€)`);
  });

  console.log('\n🔗 Endpoints disponibles:');
  console.log(`   GET  /health`);
  console.log(`   GET  /api/stripe/price-config`);
  console.log(`   POST /api/stripe/create-checkout-session`);
  console.log(`   POST /api/stripe/verify-payment`);
  console.log(`   POST /api/stripe/subscription-info`);
  console.log(`   POST /webhook/stripe`);

  console.log('\n🎯 Listo para recibir solicitudes de pago');
  console.log('📱 Optimizado para producción con precios predefinidos');
  console.log('='.repeat(50));
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('\n👋 Cerrando servidor Stripe optimizado...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor Stripe optimizado...');
  process.exit(0);
});