// Script para encontrar el Price ID desde el Product ID
const findPriceIdFromProduct = async (productId) => {
  console.log('🔍 Buscando Price ID para el producto:', productId);
  
  if (!productId || !productId.startsWith('prod_')) {
    console.log('❌ Product ID inválido. Debe empezar con "prod_"');
    return;
  }
  
  console.log('\n📋 INSTRUCCIONES PARA ENCONTRAR EL PRICE ID:');
  console.log('1. Ve a https://dashboard.stripe.com');
  console.log('2. Products → Busca tu producto "PRUEBA TEMPORAL - 1€"');
  console.log('3. Haz clic en el producto');
  console.log('4. En la sección "Pricing", copia el Price ID');
  console.log('5. El Price ID empieza con "price_"');
  
  console.log('\n🔗 ENLACE DIRECTO:');
  console.log(`https://dashboard.stripe.com/products/${productId}`);
  
  console.log('\n💡 ALTERNATIVA:');
  console.log('Si no encuentras el Price ID, puedes:');
  console.log('1. Ir a Products → Tu producto');
  console.log('2. Hacer clic en "Add another price"');
  console.log('3. Configurar: 1.00 EUR, One-time');
  console.log('4. Guardar y copiar el nuevo Price ID');
  
  // Intentar crear checkout con datos mínimos para testing
  const testWithProductId = async () => {
    console.log('\n🧪 Intentando crear checkout de prueba...');
    
    const baseURL = 'https://zyro-marketplace.onrender.com';
    
    // Datos de prueba simplificados
    const testData = {
      company: {
        name: 'Test Company 1€',
        email: 'test@example.com',
        phone: '+34 600 000 000',
        businessType: 'Test',
        businessDescription: 'Test company',
        website: 'https://test.com',
        address: 'Test Address'
      },
      plan: {
        id: 'test_1euro',
        name: 'Test 1€',
        product_id: productId, // Usar Product ID
        amount: 100,
        currency: 'eur'
      },
      success_url: `${baseURL}/payment/success`,
      cancel_url: `${baseURL}/payment/cancel`,
      metadata: {
        test_payment: 'true',
        product_id: productId
      }
    };
    
    try {
      const response = await fetch(`${baseURL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      const responseText = await response.text();
      console.log('\n📋 Respuesta del servidor:');
      console.log('Status:', response.status);
      console.log('Response:', responseText);
      
      if (!response.ok) {
        console.log('\n❌ Como esperábamos, necesitamos el Price ID, no el Product ID');
        console.log('👆 Sigue las instrucciones de arriba para encontrar el Price ID');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  };
  
  await testWithProductId();
  
  console.log('\n🎯 UNA VEZ QUE TENGAS EL PRICE ID:');
  console.log('Ejecuta: createIOSCheckout("price_XXXXXXXXXX")');
};

// Ejecutar con el Product ID proporcionado
if (require.main === module) {
  findPriceIdFromProduct('prod_TBudMhV5FVbwuj');
}

module.exports = { findPriceIdFromProduct };