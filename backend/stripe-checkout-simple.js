/**
 * Endpoint simplificado para Stripe Checkout
 */

require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
const PORT = 3001;

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:19006', 'exp://192.168.1.100:19000'],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Stripe Checkout Backend funcionando',
    timestamp: new Date().toISOString()
  });
});

// Crear sesión de checkout simplificada
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    console.log('📋 Creando sesión de checkout...');
    console.log('📋 Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    const { company, plan, initial_payment } = req.body;

    // Validaciones básicas
    if (!company?.email || !company?.name) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        message: 'Se requiere email y nombre de la empresa'
      });
    }

    if (!initial_payment?.price) {
      return res.status(400).json({ 
        error: 'Precio requerido',
        message: 'Se requiere el precio del plan'
      });
    }

    // Calcular precios
    const setupFee = 150; // 150€ setup fee
    const monthlyPrice = initial_payment.price - setupFee; // Precio mensual sin setup fee
    
    console.log(`💰 Setup fee: ${setupFee}€`);
    console.log(`💰 Precio mensual: ${monthlyPrice}€`);
    console.log(`💰 Total primer pago: ${initial_payment.price}€`);

    // Crear sesión de checkout con setup fee + suscripción
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        // Setup fee (pago único)
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Configuración Inicial',
              description: 'Pago único para configuración de anuncios y promoción inicial',
            },
            unit_amount: setupFee * 100, // 150€ en centavos
          },
          quantity: 1,
        },
        // Suscripción mensual
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: plan?.name || 'Plan de Suscripción ZyroMarketplace',
              description: `Suscripción mensual para ${company.name}`,
            },
            unit_amount: Math.round(monthlyPrice * 100), // Precio mensual en centavos
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/payment/cancel',
      customer_email: company.email,
      metadata: {
        company_id: company.id || `company_${Date.now()}`,
        company_name: company.name,
        company_email: company.email,
        company_phone: company.phone || '',
        company_address: company.address || '',
        plan_id: plan?.id || 'default_plan',
        registration_type: 'company',
        payment_completed: 'true',
        account_creation_required: 'true'
      },
      subscription_data: {
        metadata: {
          company_id: company.id || `company_${Date.now()}`,
          plan_id: plan?.id || 'default_plan',
          company_name: company.name
        }
      },
      locale: 'es',
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    });

    console.log('✅ Sesión creada exitosamente:', session.id);
    console.log('🔗 URL de checkout:', session.url);

    res.json({
      sessionId: session.id,
      url: session.url,
      success: true
    });

  } catch (error) {
    console.error('❌ Error creando sesión de checkout:', error);
    res.status(500).json({ 
      error: 'Error del servidor',
      message: error.message,
      success: false
    });
  }
});

// Verificar estado del pago
app.get('/api/stripe/verify-payment/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      status: session.payment_status,
      customer_email: session.customer_email,
      metadata: session.metadata,
      success: true
    });
  } catch (error) {
    console.error('Error verificando pago:', error);
    res.status(500).json({ 
      error: 'Error verificando pago',
      message: error.message,
      success: false
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Stripe Checkout Backend ejecutándose en puerto ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Endpoint: http://localhost:${PORT}/api/stripe/create-checkout-session`);
});