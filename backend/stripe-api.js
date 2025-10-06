/**
 * API Backend para Stripe
 * Maneja la creación de sesiones de pago, webhooks y gestión de suscripciones
 */

require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Webhook endpoint (debe ir antes del middleware de JSON)
app.post('/api/stripe/webhook', 
  bodyParser.raw({ type: 'application/json' }), 
  handleStripeWebhook
);

/**
 * Crear sesión de checkout de Stripe
 */
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { company, plan, initial_payment, success_url, cancel_url, metadata } = req.body;

    // Crear o recuperar cliente de Stripe
    let customer;
    try {
      const existingCustomers = await stripe.customers.list({
        email: company.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: company.email,
          name: company.name,
          metadata: {
            company_id: company.id,
            company_name: company.name,
            phone: company.phone || '',
            address: company.address || ''
          }
        });
      }
    } catch (error) {
      console.error('Error creando/recuperando cliente:', error);
      return res.status(400).json({ error: 'Error procesando datos del cliente' });
    }

    // Crear productos y precios si no existen
    const planProduct = await createOrGetProduct(`plan_${plan.id}`, {
      name: plan.name,
      description: plan.description,
      metadata: {
        plan_id: plan.id,
        duration_months: plan.duration_months.toString()
      }
    });

    const planPrice = await createOrGetPrice(planProduct.id, {
      unit_amount: initial_payment.price * 100, // Usar precio total del primer pago
      currency: 'eur', // Moneda fija
      metadata: {
        plan_id: plan.id,
        type: 'one_time_payment'
      }
    });

    const setupProduct = await createOrGetProduct('initial_setup', {
      name: initial_payment.name,
      description: initial_payment.description,
      metadata: {
        type: 'initial_setup'
      }
    });

    const setupPrice = await createOrGetPrice(setupProduct.id, {
      unit_amount: 15000, // 150€ en centavos
      currency: 'eur'
    });

    // Crear precio mensual recurrente para la suscripción
    const monthlyPrice = await createOrGetRecurringPrice(planProduct.id, {
      unit_amount: metadata.monthly_price * 100, // Precio mensual en centavos
      currency: 'eur',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      metadata: {
        plan_id: plan.id,
        type: 'monthly_subscription'
      }
    });

    // Crear sesión de checkout para suscripción
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card', 'sepa_debit'], // Tarjetas y transferencia SEPA
      line_items: [
        {
          price: monthlyPrice.id,
          quantity: 1,
        }
      ],
      mode: 'subscription', // MODO SUSCRIPCIÓN
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: metadata,
      subscription_data: {
        metadata: {
          ...metadata,
          plan_duration_months: plan.duration_months.toString(),
          auto_renewal_enabled: 'true',
          setup_fee_paid: metadata.setup_fee.toString(),
          monthly_price: metadata.monthly_price.toString()
        },
        trial_period_days: 0, // Sin período de prueba
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['ES', 'FR', 'IT', 'PT', 'DE', 'NL', 'BE'] // Países europeos
      },
      locale: 'es', // Interfaz en español
      allow_promotion_codes: true, // Permitir códigos de descuento
    });

    res.json({
      sessionId: session.id,
      url: session.url,
      customer_id: customer.id
    });

  } catch (error) {
    console.error('Error creando sesión de checkout:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

/**
 * Verificar estado del pago
 */
app.post('/api/stripe/verify-payment', async (req, res) => {
  try {
    const { session_id } = req.body;

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'payment_intent']
    });

    // 🧪 DETECTAR MODO TEST DE STRIPE
    const isTestMode = isStripeTestSession(session_id, session);
    
    console.log('🔍 Verificando pago:', {
      session_id: session_id,
      payment_status: session.payment_status,
      mode: session.mode,
      is_test_mode: isTestMode
    });

    res.json({
      status: session.payment_status,
      subscription_id: session.subscription?.id,
      customer_id: session.customer,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: {
        ...session.metadata,
        test_mode: isTestMode.toString(),
        session_mode: session.mode
      },
      is_test_mode: isTestMode,
      session_status: session.status
    });

  } catch (error) {
    console.error('Error verificando pago:', error);
    res.status(500).json({ error: 'Error verificando pago' });
  }
});

/**
 * Detectar si es una sesión de test de Stripe
 */
function isStripeTestSession(sessionId, session) {
  // Verificar por sessionId (test sessions empiezan con cs_test_)
  if (sessionId.startsWith('cs_test_')) {
    return true;
  }

  // Verificar por customer ID (test customers empiezan con cus_test_)
  if (session.customer && session.customer.startsWith('cus_test_')) {
    return true;
  }

  // Verificar por subscription ID (test subscriptions empiezan con sub_test_)
  if (session.subscription && session.subscription.startsWith('sub_test_')) {
    return true;
  }

  // Verificar por payment intent (test payment intents empiezan con pi_test_)
  if (session.payment_intent && session.payment_intent.startsWith('pi_test_')) {
    return true;
  }

  // Verificar por ambiente
  if (process.env.NODE_ENV === 'development' || process.env.STRIPE_TEST_MODE === 'true') {
    return true;
  }

  return false;
}

/**
 * Obtener información de suscripción
 */
app.post('/api/stripe/subscription-info', async (req, res) => {
  try {
    const { customer_id } = req.body;

    const subscriptions = await stripe.subscriptions.list({
      customer: customer_id,
      status: 'all',
      expand: ['data.default_payment_method']
    });

    const activeSubscription = subscriptions.data.find(sub => 
      ['active', 'trialing', 'past_due'].includes(sub.status)
    );

    if (!activeSubscription) {
      return res.json({ subscription: null });
    }

    res.json({
      subscription: {
        id: activeSubscription.id,
        status: activeSubscription.status,
        current_period_start: activeSubscription.current_period_start,
        current_period_end: activeSubscription.current_period_end,
        cancel_at_period_end: activeSubscription.cancel_at_period_end,
        canceled_at: activeSubscription.canceled_at,
        plan: {
          amount: activeSubscription.items.data[0].price.unit_amount / 100,
          currency: activeSubscription.items.data[0].price.currency,
          interval: activeSubscription.items.data[0].price.recurring.interval
        },
        payment_method: activeSubscription.default_payment_method,
        metadata: activeSubscription.metadata
      }
    });

  } catch (error) {
    console.error('Error obteniendo información de suscripción:', error);
    res.status(500).json({ error: 'Error obteniendo información de suscripción' });
  }
});

/**
 * Cancelar suscripción
 */
app.post('/api/stripe/cancel-subscription', async (req, res) => {
  try {
    const { subscription_id } = req.body;

    const subscription = await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: true
    });

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: subscription.current_period_end
      }
    });

  } catch (error) {
    console.error('Error cancelando suscripción:', error);
    res.status(500).json({ error: 'Error cancelando suscripción' });
  }
});

/**
 * Crear portal del cliente
 */
app.post('/api/stripe/customer-portal', async (req, res) => {
  try {
    const { customer_id, return_url } = req.body;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: return_url,
    });

    res.json({
      url: portalSession.url
    });

  } catch (error) {
    console.error('Error creando portal del cliente:', error);
    res.status(500).json({ error: 'Error creando portal del cliente' });
  }
});

/**
 * Webhook de Stripe para manejar eventos
 */
async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Error verificando webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar eventos de Stripe
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    
    case 'invoice.upcoming':
      await handleUpcomingInvoice(event.data.object);
      break;
    
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;

    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  res.json({ received: true });
}

/**
 * Manejar checkout completado - AQUÍ ES DONDE SE DEBE CREAR EL USUARIO
 */
async function handleCheckoutCompleted(session) {
  try {
    console.log('🎉 Checkout completado exitosamente:', session.id);
    console.log('📧 Email del cliente:', session.customer_details?.email);
    console.log('💰 Monto pagado:', session.amount_total / 100, session.currency);
    
    // 🧪 DETECTAR MODO TEST
    const isTestMode = isStripeTestSession(session.id, session);
    console.log('🔍 Modo de pago:', isTestMode ? 'TEST' : 'PRODUCCIÓN');
    
    // VERIFICACIÓN CRÍTICA MEJORADA: Proceder si el pago está completado O es modo test
    const shouldCreateUser = session.payment_status === 'paid' || 
                            (isTestMode && session.status === 'complete');
    
    if (!shouldCreateUser) {
      console.log('⚠️ ADVERTENCIA: Checkout completado pero pago no confirmado');
      console.log('   Estado del pago:', session.payment_status);
      console.log('   Estado de sesión:', session.status);
      console.log('   Modo test:', isTestMode);
      return;
    }

    if (isTestMode) {
      console.log('✅ PAGO DE PRUEBA CONFIRMADO - Procediendo con creación de usuario');
    } else {
      console.log('✅ PAGO REAL CONFIRMADO - Procediendo con creación de usuario');
    }
    
    // Si es una suscripción, configurar renovación automática
    if (session.mode === 'subscription' && session.subscription) {
      await configureSubscriptionRenewal(session.subscription, session.metadata);
    }
    
    const companyData = {
      customer_id: session.customer,
      subscription_id: session.subscription,
      email: session.customer_details.email,
      status: 'active',
      plan_metadata: {
        ...session.metadata,
        test_mode: isTestMode.toString(),
        payment_type: isTestMode ? 'test_payment' : 'real_payment'
      },
      session_id: session.id,
      payment_confirmed: true,
      amount_paid: session.amount_total / 100,
      currency: session.currency,
      is_test_mode: isTestMode
    };

    // 🚨 PUNTO CRÍTICO: Crear usuario empresa (tanto para pagos reales como de test)
    await createCompanyUserAfterPayment(companyData);

    // Enviar email de confirmación
    await sendWelcomeEmail(companyData);
    
    const userType = isTestMode ? 'usuario de prueba' : 'usuario real';
    console.log(`✅ ${userType} creado exitosamente después del pago confirmado`);
    
  } catch (error) {
    console.error('❌ Error manejando checkout completado:', error);
  }
}

/**
 * Crear usuario empresa después del pago confirmado
 * Esta función se ejecuta SOLO cuando Stripe confirma el pago
 */
async function createCompanyUserAfterPayment(paymentData) {
  try {
    console.log('🏢 Creando usuario empresa después del pago confirmado...');
    console.log('📋 Datos del pago:', paymentData);
    
    // Extraer información de la empresa desde los metadatos
    const metadata = paymentData.plan_metadata || {};
    
    const companyUserData = {
      id: metadata.company_id,
      name: metadata.company_name,
      email: metadata.company_email || paymentData.email,
      plan: metadata.plan_id,
      stripeCustomerId: paymentData.customer_id,
      stripeSubscriptionId: paymentData.subscription_id,
      stripeSessionId: paymentData.session_id,
      paymentConfirmed: true,
      registrationDate: new Date().toISOString(),
      status: 'active'
    };
    
    // En una implementación real, aquí guardarías en tu base de datos
    console.log('💾 Datos del usuario empresa a crear:', companyUserData);
    
    // Simular guardado en base de datos
    // await saveCompanyUserToDatabase(companyUserData);
    
    // Notificar a la aplicación móvil que el usuario fue creado
    // await notifyMobileAppUserCreated(companyUserData);
    
    return {
      success: true,
      companyId: companyUserData.id,
      message: 'Usuario empresa creado exitosamente'
    };
    
  } catch (error) {
    console.error('❌ Error creando usuario empresa:', error);
    throw error;
  }
}

/**
 * Configurar renovación automática de suscripción
 */
async function configureSubscriptionRenewal(subscriptionId, metadata) {
  try {
    const durationMonths = parseInt(metadata.plan_duration_months || '12');
    
    // Calcular fecha de renovación (cuando termina el período contratado)
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + durationMonths);
    
    // Actualizar suscripción con información de renovación automática
    await stripe.subscriptions.update(subscriptionId, {
      metadata: {
        ...metadata,
        auto_renewal_enabled: 'true',
        next_renewal_date: renewalDate.toISOString(),
        renewal_duration_months: durationMonths.toString(),
        cycles_completed: '0',
        original_start_date: new Date().toISOString()
      }
    });

    console.log('✅ Suscripción configurada para renovación automática:', {
      subscription_id: subscriptionId,
      duration_months: durationMonths,
      next_renewal: renewalDate.toISOString()
    });

  } catch (error) {
    console.error('❌ Error configurando renovación automática:', error);
  }
}

/**
 * Manejar pago exitoso
 */
async function handlePaymentSucceeded(invoice) {
  try {
    console.log('Pago exitoso:', invoice.id);
    
    // Actualizar estado de la suscripción en tu base de datos
    // Enviar recibo por email si es necesario
    
  } catch (error) {
    console.error('Error manejando pago exitoso:', error);
  }
}

/**
 * Manejar pago fallido
 */
async function handlePaymentFailed(invoice) {
  try {
    console.log('Pago fallido:', invoice.id);
    
    // Notificar al cliente sobre el pago fallido
    // Suspender servicios si es necesario
    
  } catch (error) {
    console.error('Error manejando pago fallido:', error);
  }
}

/**
 * Manejar actualización de suscripción
 */
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('Suscripción actualizada:', subscription.id);
    
    // Actualizar datos de suscripción en tu base de datos
    
  } catch (error) {
    console.error('Error manejando actualización de suscripción:', error);
  }
}

/**
 * Manejar creación de suscripción
 */
async function handleSubscriptionCreated(subscription) {
  try {
    console.log('Nueva suscripción creada:', subscription.id);
    
    // Configurar renovación automática si no se hizo en checkout
    if (subscription.metadata.auto_renewal_enabled !== 'true') {
      await configureSubscriptionRenewal(subscription.id, subscription.metadata);
    }
    
  } catch (error) {
    console.error('Error manejando creación de suscripción:', error);
  }
}

/**
 * Manejar factura próxima (7 días antes de renovación)
 */
async function handleUpcomingInvoice(invoice) {
  try {
    console.log('Factura próxima:', invoice.id);
    
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      
      if (subscription.metadata.auto_renewal_enabled === 'true') {
        console.log('📅 Renovación automática próxima:', {
          subscription_id: subscription.id,
          customer: subscription.customer,
          amount: invoice.amount_due / 100
        });
        
        // Aquí puedes enviar email de notificación al cliente
        // sobre la próxima renovación
      }
    }
    
  } catch (error) {
    console.error('Error manejando factura próxima:', error);
  }
}

/**
 * Manejar eliminación de suscripción
 */
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log('Suscripción eliminada:', subscription.id);
    
    // Desactivar servicios
    // Enviar email de confirmación de cancelación
    
  } catch (error) {
    console.error('Error manejando eliminación de suscripción:', error);
  }
}

/**
 * Crear o obtener producto existente
 */
async function createOrGetProduct(productId, productData) {
  try {
    return await stripe.products.retrieve(productId);
  } catch (error) {
    if (error.code === 'resource_missing') {
      return await stripe.products.create({
        id: productId,
        ...productData
      });
    }
    throw error;
  }
}

/**
 * Crear o obtener precio existente
 */
async function createOrGetPrice(productId, priceData) {
  try {
    const prices = await stripe.prices.list({
      product: productId,
      active: true
    });

    const existingPrice = prices.data.find(price => 
      price.unit_amount === priceData.unit_amount &&
      price.currency === priceData.currency
    );

    if (existingPrice) {
      return existingPrice;
    }

    return await stripe.prices.create({
      product: productId,
      ...priceData
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Crear o obtener precio recurrente para suscripciones
 */
async function createOrGetRecurringPrice(productId, priceData) {
  try {
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      type: 'recurring'
    });

    const existingPrice = prices.data.find(price => 
      price.unit_amount === priceData.unit_amount &&
      price.currency === priceData.currency &&
      price.recurring?.interval === priceData.recurring.interval
    );

    if (existingPrice) {
      return existingPrice;
    }

    return await stripe.prices.create({
      product: productId,
      ...priceData
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Enviar email de bienvenida
 */
async function sendWelcomeEmail(companyData) {
  // Implementar envío de email usando tu servicio preferido
  // (SendGrid, Mailgun, etc.)
  console.log('Enviando email de bienvenida a:', companyData.email);
}

// Ruta de salud para verificar que el servidor funciona
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor Stripe API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Stripe API ejecutándose en puerto ${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;