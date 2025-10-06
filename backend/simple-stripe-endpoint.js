/**
 * Endpoint simplificado para crear sesiones de checkout de Stripe
 */

require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();

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
    message: 'Backend Stripe simplificado funcionando',
    timestamp: new Date().toISOString()
  });
});

// Crear sesión de checkout simplificada
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    console.log('📋 Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    const { company, plan, initial_payment } = req.body;

    // Validar datos requeridos
    if (!company?.email || !company?.name) {
      return res.status(400).json({ 
        error: 'Datos de empresa incompletos',
        message: 'Se requiere email y nombre de la empresa'
      });
    }

    if (!initial_payment?.price) {
      return res.status(400).json({ 
        error: 'Datos de plan incompletos',
        message: 'Se requiere precio del pago inicial'
      });
    }

    // Crear sesión de checkout directamente con line_items
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: plan.name || 'Plan de Suscripción',
              description: `Suscripción mensual para ${company.name}`,
            },
            unit_amount: Math.round(initial_payment.price * 100), // Convertir a centavos
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: req.body.success_url || 'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: req.body.cancel_url || 'http://localhost:3000/payment/cancel',
      customer_email: company.email,
      metadata: {
        company_id: company.id || `company_${Date.now()}`,
        company_name: company.name,
        plan_id: plan.id,
        registration_type: 'company'
      },
      subscription_data: {
        metadata: {
          company_id: company.id || `company_${Date.now()}`,
          plan_id: plan.id,
          company_name: company.name
        }
      },
      locale: 'es'
    });

    console.log('✅ Sesión creada:', session.id);

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('❌ Error creando sesión:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend Stripe simplificado ejecutándose en puerto ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});