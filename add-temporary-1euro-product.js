// Script para añadir temporalmente producto de 1€ para prueba real
const addTemporary1EuroProduct = async () => {
  console.log('💳 Configurando producto temporal de 1€ para prueba REAL...\n');
  
  // IMPORTANTE: Este script es para añadir un producto temporal
  // que DEBE ser eliminado inmediatamente después de la prueba
  
  console.log('⚠️  ADVERTENCIA: PRUEBA CON DINERO REAL');
  console.log('Este producto procesará pagos reales de 1€\n');
  
  // Instrucciones paso a paso
  console.log('📋 PASOS PARA CREAR PRODUCTO DE 1€:');
  console.log('1. Ve a https://dashboard.stripe.com');
  console.log('2. ASEGÚRATE de estar en modo LIVE (no Test)');
  console.log('3. Products → Add product');
  console.log('4. Configuración:');
  console.log('   - Nombre: "PRUEBA TEMPORAL - 1€"');
  console.log('   - Precio: 1.00 EUR');
  console.log('   - Tipo: One-time payment');
  console.log('   - Statement descriptor: "ZYRO-TEST"');
  console.log('5. Guardar y copiar el Price ID\n');
  
  // Función para generar checkout con producto personalizado
  const generateTestCheckout = async (priceId) => {
    const baseURL = 'https://zyro-marketplace.onrender.com';
    
    const testData = {
      company: {
        name: 'Empresa Prueba Real 1€',
        email: 'prueba.real@test.com',
        phone: '+34 600 000 001',
        businessType: 'Prueba',
        businessDescription: 'Empresa de prueba para testing real',
        website: 'https://www.prueba-real.com',
        address: 'Calle Prueba Real 1, Madrid'
      },
      plan: {
        id: 'test_1_euro',
        name: 'Prueba 1€',
        price_id: priceId,
        amount: 100 // 1€ en centavos
      },
      success_url: 'https://zyro-marketplace.onrender.com/payment/success',
      cancel_url: 'https://zyro-marketplace.onrender.com/payment/cancel',
      metadata: {
        test_payment: true,
        amount: 1.00,
        currency: 'eur',
        description: 'Prueba real de 1€ - ELIMINAR DESPUÉS'
      }
    };
    
    try {
      console.log('🔄 Generando sesión de checkout...');
      
      const response = await fetch(`${baseURL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sesión de checkout creada!');
        console.log('🔗 URL de pago:', result.url);
        console.log('\n💳 USAR TARJETA REAL para esta prueba');
        console.log('⚠️  Se cobrará 1€ real a tu tarjeta');
        
        return result.url;
      } else {
        const error = await response.text();
        console.log('❌ Error:', error);
      }
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
    }
  };
  
  // Función para verificar el pago
  const verifyPayment = async () => {
    console.log('\n🔍 Para verificar el pago:');
    console.log('1. Ve a Stripe Dashboard → Payments');
    console.log('2. Busca el pago de 1€');
    console.log('3. Verifica que el estado sea "Succeeded"');
    console.log('4. Comprueba que el webhook se envió correctamente');
    console.log('5. Ve a Render logs para confirmar recepción');
  };
  
  // Función para limpiar después de la prueba
  const cleanupAfterTest = () => {
    console.log('\n🧹 DESPUÉS DE LA PRUEBA - LIMPIEZA OBLIGATORIA:');
    console.log('1. Ve a Stripe Dashboard → Products');
    console.log('2. Busca "PRUEBA TEMPORAL - 1€"');
    console.log('3. Haz clic en el producto');
    console.log('4. Archive product (no se puede eliminar si se usó)');
    console.log('5. Esto evitará que se use accidentalmente otra vez');
    console.log('\n⚠️  MUY IMPORTANTE: No olvides archivar el producto');
  };
  
  // Mostrar resumen de seguridad
  console.log('🛡️  MEDIDAS DE SEGURIDAD:');
  console.log('✅ Solo usar 1€ para minimizar riesgo');
  console.log('✅ Eliminar producto inmediatamente después');
  console.log('✅ Verificar que el dinero llega a tu cuenta');
  console.log('✅ Confirmar que los webhooks funcionan');
  
  console.log('\n🎯 RESULTADO ESPERADO:');
  console.log('- Recibirás 1€ en tu cuenta de Stripe');
  console.log('- Se enviará webhook a tu backend');
  console.log('- La empresa aparecerá registrada');
  console.log('- Confirmarás que todo el flujo funciona');
  
  // Preguntar si quiere continuar
  console.log('\n❓ ¿Tienes el Price ID del producto de 1€?');
  console.log('Si sí, ejecuta: generateTestCheckout("price_XXXXXXXXXX")');
  
  return {
    generateTestCheckout,
    verifyPayment,
    cleanupAfterTest
  };
};

// Función específica para generar checkout con Price ID
const createRealTestCheckout = async (priceId) => {
  if (!priceId || !priceId.startsWith('price_')) {
    console.log('❌ Error: Necesitas proporcionar un Price ID válido');
    console.log('Ejemplo: createRealTestCheckout("price_1ABC123...")');
    return;
  }
  
  console.log(`🔄 Creando checkout real con Price ID: ${priceId}`);
  
  const baseURL = 'https://zyro-marketplace.onrender.com';
  
  // Crear sesión de checkout directamente con Stripe
  const checkoutData = {
    mode: 'payment',
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    success_url: 'https://zyro-marketplace.onrender.com/payment/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://zyro-marketplace.onrender.com/payment/cancel',
    customer_email: 'prueba.real@test.com',
    metadata: {
      test_payment: 'true',
      company_name: 'Empresa Prueba Real 1€',
      amount: '1.00',
      currency: 'eur'
    }
  };
  
  try {
    // Nota: Este endpoint necesitaría ser creado en el backend
    // o usar directamente la API de Stripe desde aquí
    console.log('📋 Datos para crear checkout:', JSON.stringify(checkoutData, null, 2));
    console.log('\n🔗 Para crear el checkout, necesitarías:');
    console.log('1. Usar la API de Stripe directamente');
    console.log('2. O modificar tu backend para aceptar Price IDs personalizados');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  addTemporary1EuroProduct().then(({ generateTestCheckout, verifyPayment, cleanupAfterTest }) => {
    // Exponer funciones globalmente para uso interactivo
    global.generateTestCheckout = generateTestCheckout;
    global.verifyPayment = verifyPayment;
    global.cleanupAfterTest = cleanupAfterTest;
    global.createRealTestCheckout = createRealTestCheckout;
    
    console.log('\n🚀 Funciones disponibles:');
    console.log('- generateTestCheckout(priceId)');
    console.log('- createRealTestCheckout(priceId)');
    console.log('- verifyPayment()');
    console.log('- cleanupAfterTest()');
  });
}

module.exports = { 
  addTemporary1EuroProduct, 
  createRealTestCheckout 
};