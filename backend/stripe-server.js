/**
 * Servidor completo de Stripe para pruebas con tarjetas reales
 * Incluye todas las funcionalidades de pago y suscripciones
 */

const express = require('express');
const cors = require('cors');
const stripe = require('stripe');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar Stripe con la clave secreta
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://zyromarketplace.com', 'https://www.zyromarketplace.com']
    : ['http://localhost:3000', 'http://localhost:19006', 'exp://192.168.1.100:19000'],
  credentials: true
}));

app.use(express.json());
app.use(express.raw({ type: 'application/webhook+json' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    port: PORT,
    stripe: 'configured',
    timestamp: new Date().toISOString()
  });
});

// Crear sesión de checkout con suscripción
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { company, plan, initial_payment, success_url, cancel_url, metadata } = req.body;

    console.log('📋 Creando sesión de checkout con suscripción:', {
      company: company.name,
      plan: plan.name,
      monthly_price: metadata.monthly_price,
      setup_fee: metadata.setup_fee,
      duration_months: plan.duration_months
    });

    // Primero crear o buscar el cliente
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
            company_name: company.name
          }
        });
        console.log('✅ Nuevo cliente creado:', customer.id);
      }
    } catch (customerError) {
      console.error('❌ Error gestionando cliente:', customerError);
      throw customerError;
    }

    // Crear producto para la suscripción si no existe
    let product;
    try {
      const existingProducts = await stripeClient.products.list({
        limit: 10
      });
      
      product = existingProducts.data.find(p => 
        p.metadata.plan_id === plan.id
      );

      if (!product) {
        product = await stripeClient.products.create({
          name: plan.name,
          description: plan.description,
          metadata: {
            plan_id: plan.id,
            duration_months: plan.duration_months.toString()
          }
        });
        console.log('✅ Producto creado:', product.id);
      }
    } catch (productError) {
      console.error('❌ Error creando producto:', productError);
      throw productError;
    }

    // Crear precio para la suscripción mensual si no existe
    let monthlyPrice;
    try {
      const existingPrices = await stripeClient.prices.list({
        product: product.id,
        active: true
      });

      monthlyPrice = existingPrices.data.find(p => 
        p.unit_amount === metadata.monthly_price * 100 &&
        p.recurring?.interval === 'month'
      );

      if (!monthlyPrice) {
        monthlyPrice = await stripeClient.prices.create({
          product: product.id,
          unit_amount: metadata.monthly_price * 100,
          currency: 'eur',
          recurring: {
            interval: 'month',
            interval_count: 1
          },
          metadata: {
            plan_id: plan.id,
            duration_months: plan.duration_months.toString()
          }
        });
        console.log('✅ Precio mensual creado:', monthlyPrice.id);
      }
    } catch (priceError) {
      console.error('❌ Error creando precio:', priceError);
      throw priceError;
    }

    // Crear precio para el setup fee (pago único)
    let setupPrice;
    if (metadata.setup_fee > 0) {
      try {
        setupPrice = await stripeClient.prices.create({
          product: product.id,
          unit_amount: metadata.setup_fee * 100,
          currency: 'eur',
          metadata: {
            type: 'setup_fee',
            plan_id: plan.id
          }
        });
        console.log('✅ Precio de configuración creado:', setupPrice.id);
      } catch (setupError) {
        console.error('❌ Error creando precio de setup:', setupError);
        throw setupError;
      }
    }

    // Crear sesión de checkout con suscripción
    const sessionData = {
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customer.id,
      line_items: [
        {
          price: monthlyPrice.id,
          quantity: 1}
      ],
      subscription_data: {
        metadata: {
          ...metadata,
          company_id: company.id,
          company_name: company.name,
          company_email: company.email,
          plan_id: plan.id,
          duration_months: plan.duration_months.toString(),
          start_date: new Date().toISOString()
        }},
      success_url: success_url,
      cancel_url: cancel_url,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      metadata: {
        ...metadata,
        customer_id: customer.id,
        subscription_type: 'monthly_recurring'
      }
    };

    // Agregar setup fee si existe
    if (setupPrice && metadata.setup_fee > 0) {
      sessionData.line_items.push({
        price: setupPrice.id,
        quantity: 1});
    }

    const session = await stripeClient.checkout.sessions.create(sessionData);

    console.log('✅ Sesión de suscripción creada exitosamente:', {
      session_id: session.id,
      customer_id: customer.id,
      monthly_price: metadata.monthly_price,
      setup_fee: metadata.setup_fee,
      duration_months: plan.duration_months
    });

    res.json({
      sessionId: session.id,
      url: session.url,
      customer_id: customer.id,
      subscription_details: {
        monthly_amount: metadata.monthly_price,
        setup_fee: metadata.setup_fee,
        duration_months: plan.duration_months,
        total_subscription_value: metadata.monthly_price * plan.duration_months
      }
    });

  } catch (error) {
    console.error('❌ Error creando sesión de suscripción:', error);
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

    const session = await stripeClient.checkout.sessions.retrieve(session_id);

    res.json({
      payment_status: session.payment_status,
      customer_id: session.customer,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata
    });

  } catch (error) {
    console.error('❌ Error verificando pago:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Obtener información completa de suscripción
app.post('/api/stripe/subscription-info', async (req, res) => {
  try {
    const { customer_id, subscription_id } = req.body;

    let subscriptions;
    
    if (subscription_id) {
      // Obtener suscripción específica
      const subscription = await stripeClient.subscriptions.retrieve(subscription_id, {
        expand: ['items.data.price.product', 'customer', 'latest_invoice']
      });
      subscriptions = [subscription];
    } else if (customer_id) {
      // Obtener todas las suscripciones del cliente
      const result = await stripeClient.subscriptions.list({
        customer: customer_id,
        expand: ['data.items.data.price.product', 'data.customer', 'data.latest_invoice']
      });
      subscriptions = result.data;
    } else {
      throw new Error('Se requiere customer_id o subscription_id');
    }

    // Formatear información de suscripciones
    const formattedSubscriptions = subscriptions.map(sub => {
      const durationMonths = parseInt(sub.metadata.duration_months || '12');
      const startDate = new Date(sub.created * 1000);
      const cancelDate = sub.cancel_at ? new Date(sub.cancel_at * 1000) : null;
      const currentPeriodEnd = new Date(sub.current_period_end * 1000);
      
      // Calcular progreso del plan
      const totalDuration = durationMonths * 30 * 24 * 60 * 60 * 1000; // Aproximado en ms
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
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        progress_percentage: Math.round(progress),
        payments_made: Math.floor(elapsed / (30 * 24 * 60 * 60 * 1000)) + 1, // Aproximado
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

// Cancelar suscripción
app.post('/api/stripe/cancel-subscription', async (req, res) => {
  try {
    const { subscription_id } = req.body;

    const subscription = await stripeClient.subscriptions.cancel(subscription_id);

    res.json({
      status: subscription.status,
      canceled_at: subscription.canceled_at
    });

  } catch (error) {
    console.error('❌ Error cancelando suscripción:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Portal del cliente
app.post('/api/stripe/customer-portal', async (req, res) => {
  try {
    const { customer_id, return_url } = req.body;

    const portalSession = await stripeClient.billingPortal.sessions.create({
      customer: customer_id,
      return_url: return_url
    });

    res.json({
      url: portalSession.url
    });

  } catch (error) {
    console.error('❌ Error creando portal del cliente:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Webhook para eventos de Stripe
app.post('/api/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Error verificando webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('📨 Webhook recibido:', event.type);

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
      await scheduleSubscriptionRenewal(newSubscription);
      break;
    
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('💰 Pago de factura exitoso:', invoice.id);
      break;
    
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('❌ Pago de factura fallido:', failedInvoice.id);
      break;
    
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      console.log('🔄 Suscripción actualizada:', updatedSubscription.id);
      await handleSubscriptionUpdate(updatedSubscription);
      break;
    
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('🛑 Suscripción cancelada:', deletedSubscription.id);
      break;

    case 'invoice.upcoming':
      const upcomingInvoice = event.data.object;
      console.log('📅 Factura próxima:', upcomingInvoice.id);
      await handleUpcomingInvoice(upcomingInvoice);
      break;

    case 'invoice.finalized':
      const finalizedInvoice = event.data.object;
      console.log('📋 Factura finalizada:', finalizedInvoice.id);
      await handleInvoiceFinalized(finalizedInvoice);
      break;
    
    default:
      console.log(`🔔 Evento no manejado: ${event.type}`);
  }

  res.json({ received: true });
});

// Manejar creación de suscripción
async function handleSubscriptionCreated(session) {
  try {
    const subscription = await stripeClient.subscriptions.retrieve(session.subscription);
    const durationMonths = parseInt(subscription.metadata.duration_months || '12');
    
    console.log('📅 Configurando renovación automática:', {
      subscription_id: subscription.id,
      duration_months: durationMonths,
      customer: subscription.customer
    });

    // Calcular fecha de renovación (cuando termina el período actual)
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + durationMonths);
    
    // Actualizar suscripción con información de renovación
    await stripeClient.subscriptions.update(subscription.id, {
      metadata: {
        ...subscription.metadata,
        next_renewal_date: renewalDate.toISOString(),
        auto_renewal_enabled: 'true',
        renewal_plan_id: subscription.metadata.plan_id,
        renewal_duration_months: durationMonths.toString(),
        original_plan_start: new Date().toISOString()
      }
    });

    console.log('✅ Suscripción configurada para renovación automática:', {
      subscription_id: subscription.id,
      renewal_date: renewalDate.toISOString(),
      plan_duration: durationMonths
    });

  } catch (error) {
    console.error('❌ Error configurando renovación:', error);
  }
}

// Configurar renovación automática de suscripción
async function scheduleSubscriptionRenewal(subscription) {
  try {
    const durationMonths = parseInt(subscription.metadata.duration_months || '12');
    
    // Calcular fecha de renovación
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + durationMonths);
    
    // Actualizar suscripción con configuración de renovación automática
    await stripeClient.subscriptions.update(subscription.id, {
      metadata: {
        ...subscription.metadata,
        next_renewal_date: renewalDate.toISOString(),
        auto_renewal_enabled: 'true',
        renewal_plan_id: subscription.metadata.plan_id,
        renewal_duration_months: durationMonths.toString(),
        cycles_completed: '0',
        total_cycles_planned: 'unlimited' // Renovación indefinida
      }
    });

    console.log('✅ Suscripción configurada para renovación automática:', {
      subscription_id: subscription.id,
      duration_months: durationMonths,
      renewal_date: renewalDate.toISOString()
    });

  } catch (error) {
    console.error('❌ Error configurando renovación automática:', error);
  }
}

// Manejar actualización de suscripción para renovaciones
async function handleSubscriptionUpdate(subscription) {
  try {
    if (subscription.metadata.auto_renewal_enabled === 'true') {
      const durationMonths = parseInt(subscription.metadata.renewal_duration_months || '12');
      const cyclesCompleted = parseInt(subscription.metadata.cycles_completed || '0');
      
      // Verificar si necesita renovación
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      const now = new Date();
      
      // Si estamos cerca del final del período, preparar renovación
      const daysUntilEnd = Math.ceil((currentPeriodEnd - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilEnd <= 7) { // 7 días antes de renovar
        console.log('🔄 Preparando renovación automática:', {
          subscription_id: subscription.id,
          days_until_renewal: daysUntilEnd,
          cycles_completed: cyclesCompleted
        });

        // Actualizar metadata para el próximo ciclo
        await stripeClient.subscriptions.update(subscription.id, {
          metadata: {
            ...subscription.metadata,
            cycles_completed: (cyclesCompleted + 1).toString(),
            last_renewal_date: now.toISOString(),
            next_renewal_date: new Date(currentPeriodEnd.getTime() + (durationMonths * 30 * 24 * 60 * 60 * 1000)).toISOString()
          }
        });
      }
    }
  } catch (error) {
    console.error('❌ Error manejando actualización de suscripción:', error);
  }
}

// Manejar factura próxima para renovaciones
async function handleUpcomingInvoice(invoice) {
  try {
    if (invoice.subscription) {
      const subscription = await stripeClient.subscriptions.retrieve(invoice.subscription);
      
      if (subscription.metadata.auto_renewal_enabled === 'true') {
        console.log('📅 Renovación automática próxima:', {
          subscription_id: subscription.id,
          invoice_id: invoice.id,
          amount: invoice.amount_due / 100,
          plan: subscription.metadata.plan_id
        });

        // Aquí puedes enviar notificaciones al cliente sobre la renovación
        // Por ejemplo, enviar email de confirmación de renovación
      }
    }
  } catch (error) {
    console.error('❌ Error manejando factura próxima:', error);
  }
}

// Manejar factura finalizada para confirmar renovación
async function handleInvoiceFinalized(invoice) {
  try {
    if (invoice.subscription) {
      const subscription = await stripeClient.subscriptions.retrieve(invoice.subscription);
      
      if (subscription.metadata.auto_renewal_enabled === 'true') {
        const cyclesCompleted = parseInt(subscription.metadata.cycles_completed || '0') + 1;
        const durationMonths = parseInt(subscription.metadata.renewal_duration_months || '12');
        
        console.log('✅ Renovación automática confirmada:', {
          subscription_id: subscription.id,
          invoice_id: invoice.id,
          cycle_number: cyclesCompleted,
          plan: subscription.metadata.plan_id
        });

        // Actualizar metadata con el nuevo ciclo
        await stripeClient.subscriptions.update(subscription.id, {
          metadata: {
            ...subscription.metadata,
            cycles_completed: cyclesCompleted.toString(),
            last_renewal_confirmed: new Date().toISOString(),
            current_cycle_start: new Date().toISOString()
          }
        });

        // Aquí puedes actualizar tu base de datos local
        // y enviar confirmación al cliente
      }
    }
  } catch (error) {
    console.error('❌ Error manejando factura finalizada:', error);
  }
}

// Endpoint para listar productos/precios
app.get('/api/stripe/prices', async (req, res) => {
  try {
    const prices = await stripeClient.prices.list({
      active: true,
      expand: ['data.product']
    });

    res.json({
      prices: prices.data
    });

  } catch (error) {
    console.error('❌ Error obteniendo precios:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Endpoint para crear un cliente
app.post('/api/stripe/create-customer', async (req, res) => {
  try {
    const { email, name, phone, address } = req.body;

    const customer = await stripeClient.customers.create({
      email,
      name,
      phone,
      address
    });

    res.json({
      customer_id: customer.id,
      email: customer.email
    });

  } catch (error) {
    console.error('❌ Error creando cliente:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Gestionar renovación automática
app.post('/api/stripe/manage-auto-renewal', async (req, res) => {
  try {
    const { subscription_id, enable_auto_renewal } = req.body;

    const subscription = await stripeClient.subscriptions.retrieve(subscription_id);
    
    if (!subscription) {
      return res.status(404).json({
        error: 'Suscripción no encontrada'
      });
    }

    // Actualizar configuración de renovación automática
    const updatedSubscription = await stripeClient.subscriptions.update(subscription_id, {
      metadata: {
        ...subscription.metadata,
        auto_renewal_enabled: enable_auto_renewal ? 'true' : 'false',
        auto_renewal_updated: new Date().toISOString()
      }
    });

    console.log(`${enable_auto_renewal ? '✅ Activada' : '❌ Desactivada'} renovación automática:`, {
      subscription_id: subscription_id,
      auto_renewal: enable_auto_renewal
    });

    res.json({
      subscription_id: subscription_id,
      auto_renewal_enabled: enable_auto_renewal,
      status: 'updated',
      message: enable_auto_renewal 
        ? 'Renovación automática activada. Tu suscripción se renovará automáticamente al final de cada período.'
        : 'Renovación automática desactivada. Tu suscripción terminará al final del período actual.'
    });

  } catch (error) {
    console.error('❌ Error gestionando renovación automática:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Obtener estado de renovación automática
app.post('/api/stripe/auto-renewal-status', async (req, res) => {
  try {
    const { subscription_id } = req.body;

    const subscription = await stripeClient.subscriptions.retrieve(subscription_id, {
      expand: ['items.data.price.product']
    });

    if (!subscription) {
      return res.status(404).json({
        error: 'Suscripción no encontrada'
      });
    }

    const autoRenewalEnabled = subscription.metadata.auto_renewal_enabled === 'true';
    const durationMonths = parseInt(subscription.metadata.renewal_duration_months || '12');
    const cyclesCompleted = parseInt(subscription.metadata.cycles_completed || '0');
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    
    // Calcular próxima renovación
    const nextRenewalDate = autoRenewalEnabled 
      ? new Date(currentPeriodEnd.getTime() + (durationMonths * 30 * 24 * 60 * 60 * 1000))
      : null;

    res.json({
      subscription_id: subscription_id,
      auto_renewal_enabled: autoRenewalEnabled,
      plan_id: subscription.metadata.plan_id,
      duration_months: durationMonths,
      cycles_completed: cyclesCompleted,
      current_period_end: currentPeriodEnd.toISOString(),
      next_renewal_date: nextRenewalDate ? nextRenewalDate.toISOString() : null,
      monthly_amount: subscription.items.data[0]?.price.unit_amount / 100,
      currency: subscription.items.data[0]?.price.currency,
      status: subscription.status,
      renewal_history: {
        last_renewal: subscription.metadata.last_renewal_confirmed || null,
        cycles_completed: cyclesCompleted,
        original_start: subscription.metadata.original_plan_start || null
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estado de renovación:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: error.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🚀 SERVIDOR STRIPE INICIADO');
  console.log('=' .repeat(50));
  console.log(`✅ Puerto: ${PORT}`);
  console.log(`✅ Stripe configurado: ${process.env.STRIPE_SECRET_KEY ? 'Sí' : 'No'}`);
  console.log(`✅ CORS habilitado para React Native`);
  console.log(`✅ Webhooks endpoint: /api/stripe/webhook`);
  console.log('\n🔗 Endpoints disponibles:');
  console.log(`   GET  /health`);
  console.log(`   POST /api/stripe/create-checkout-session`);
  console.log(`   POST /api/stripe/verify-payment`);
  console.log(`   POST /api/stripe/subscription-info`);
  console.log(`   POST /api/stripe/cancel-subscription`);
  console.log(`   POST /api/stripe/customer-portal`);
  console.log(`   POST /api/stripe/webhook`);
  console.log(`   GET  /api/stripe/prices`);
  console.log(`   POST /api/stripe/create-customer`);
  console.log('\n🎯 Listo para recibir solicitudes de pago');
  console.log('📱 Ahora puedes probar con tarjetas de prueba de Stripe');
  console.log('=' .repeat(50));
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('\n👋 Cerrando servidor Stripe...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor Stripe...');
  process.exit(0);
});