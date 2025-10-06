/**
 * Script para limpieza completa y configuración desde cero de Stripe
 * Elimina TODOS los productos y precios antiguos y crea una configuración limpia
 */

const stripe = require('stripe');
require('dotenv').config();

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

console.log('🧹 LIMPIEZA COMPLETA Y CONFIGURACIÓN DESDE CERO');
console.log('=' .repeat(60));

// Configuración final correcta
const FINAL_PRODUCTS_CONFIG = {
  setup_fee: {
    name: 'Configuración Inicial - Zyro Marketplace',
    description: 'Pago único para configuración de anuncios y promoción inicial en Instagram',
    price: 15000,
    currency: 'eur',
    metadata: { type: 'setup_fee', price_eur: '150' }
  },
  plan_3_months: {
    name: 'Plan 3 Meses - Zyro Marketplace',
    description: 'Plan de suscripción de 3 meses para empresas - 499€/mes',
    price: 49900,
    currency: 'eur',
    recurring: { interval: 'month' },
    metadata: { plan_id: 'plan_3_months', duration_months: '3', price_eur: '499' }
  },
  plan_6_months: {
    name: 'Plan 6 Meses - Zyro Marketplace',
    description: 'Plan de suscripción de 6 meses para empresas - 399€/mes',
    price: 39900,
    currency: 'eur',
    recurring: { interval: 'month' },
    metadata: { plan_id: 'plan_6_months', duration_months: '6', price_eur: '399' }
  },
  plan_12_months: {
    name: 'Plan 12 Meses - Zyro Marketplace',
    description: 'Plan de suscripción de 12 meses para empresas - 299€/mes',
    price: 29900,
    currency: 'eur',
    recurring: { interval: 'month' },
    metadata: { plan_id: 'plan_12_months', duration_months: '12', price_eur: '299' }
  }
};

async function archiveAllProducts() {
  console.log('\n🗃️  PASO 1: Archivando TODOS los productos existentes...');
  
  try {
    const products = await stripeClient.products.list({ limit: 100 });
    console.log(`📦 Productos encontrados: ${products.data.length}`);

    for (const product of products.data) {
      if (product.active) {
        try {
          await stripeClient.products.update(product.id, { active: false });
          console.log(`🗃️  Archivado: ${product.name} (${product.id})`);
        } catch (error) {
          console.log(`⚠️  Error archivando ${product.name}: ${error.message}`);
        }
      } else {
        console.log(`📁 Ya archivado: ${product.name}`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Error archivando productos:', error.message);
    return false;
  }
}

async function archiveAllPrices() {
  console.log('\n💰 PASO 2: Archivando TODOS los precios existentes...');
  
  try {
    const prices = await stripeClient.prices.list({ limit: 100 });
    console.log(`💰 Precios encontrados: ${prices.data.length}`);

    for (const price of prices.data) {
      if (price.active) {
        try {
          await stripeClient.prices.update(price.id, { active: false });
          console.log(`🗃️  Precio archivado: ${price.unit_amount / 100}€ (${price.id})`);
        } catch (error) {
          console.log(`⚠️  Error archivando precio ${price.id}: ${error.message}`);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Error archivando precios:', error.message);
    return false;
  }
}

async function createFreshProducts() {
  console.log('\n🏗️  PASO 3: Creando productos completamente nuevos...');
  
  const results = {};
  
  for (const [key, config] of Object.entries(FINAL_PRODUCTS_CONFIG)) {
    try {
      console.log(`\n📦 Creando: ${config.name}`);

      // Crear producto
      const product = await stripeClient.products.create({
        name: config.name,
        description: config.description,
        metadata: config.metadata
      });

      console.log(`✅ Producto creado: ${product.id}`);

      // Crear precio
      const priceData = {
        product: product.id,
        unit_amount: config.price,
        currency: config.currency,
        metadata: config.metadata
      };

      if (config.recurring) {
        priceData.recurring = config.recurring;
      }

      const price = await stripeClient.prices.create(priceData);
      console.log(`✅ Precio creado: ${price.id} (${price.unit_amount / 100}€)`);

      results[key] = {
        product_id: product.id,
        price_id: price.id,
        amount: config.price,
        currency: config.currency,
        description: config.description,
        success: true
      };

      if (config.recurring) {
        results[key].interval = config.recurring.interval;
        results[key].duration_months = parseInt(config.metadata.duration_months);
      }

      // Pausa entre creaciones
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error) {
      console.error(`❌ Error creando ${config.name}:`, error.message);
      results[key] = { success: false, error: error.message };
    }
  }

  return results;
}

async function updateConfigFiles(results) {
  console.log('\n📝 PASO 4: Actualizando archivos de configuración...');
  
  try {
    const fs = require('fs');
    
    // Filtrar solo resultados exitosos
    const successfulResults = {};
    Object.entries(results).forEach(([key, result]) => {
      if (result.success) {
        successfulResults[key] = {
          price_id: result.price_id,
          product_id: result.product_id,
          amount: result.amount,
          currency: result.currency,
          description: result.description
        };
        
        if (result.interval) {
          successfulResults[key].interval = result.interval;
          successfulResults[key].duration_months = result.duration_months;
        }
      }
    });

    // Actualizar stripe-price-ids.json
    fs.writeFileSync('stripe-price-ids.json', JSON.stringify(successfulResults, null, 2));
    console.log('✅ Archivo stripe-price-ids.json actualizado');

    // Actualizar stripe-real-prices.json con la estructura correcta
    const realPricesConfig = {
      setup_fee: 150,
      plans: {
        plan_3_months: {
          name: "Plan 3 Meses",
          monthly_price: 499,
          duration_months: 3,
          total_first_payment: 649,
          description: "499€/mes + 150€ pago inicial único"
        },
        plan_6_months: {
          name: "Plan 6 Meses",
          monthly_price: 399,
          duration_months: 6,
          total_first_payment: 549,
          description: "399€/mes + 150€ pago inicial único"
        },
        plan_12_months: {
          name: "Plan 12 Meses",
          monthly_price: 299,
          duration_months: 12,
          total_first_payment: 449,
          description: "299€/mes + 150€ pago inicial único"
        }
      }
    };

    fs.writeFileSync('stripe-real-prices.json', JSON.stringify(realPricesConfig, null, 2));
    console.log('✅ Archivo stripe-real-prices.json actualizado');

    return true;
  } catch (error) {
    console.error('❌ Error actualizando archivos:', error.message);
    return false;
  }
}

async function finalVerification() {
  console.log('\n🔍 PASO 5: Verificación final...');
  
  try {
    const products = await stripeClient.products.list({ active: true, limit: 100 });
    const prices = await stripeClient.prices.list({ active: true, limit: 100 });

    console.log(`\n📊 CONFIGURACIÓN FINAL:`);
    console.log(`   Productos activos: ${products.data.length}`);
    console.log(`   Precios activos: ${prices.data.length}`);

    if (products.data.length === 4 && prices.data.length === 4) {
      console.log('\n✅ CONFIGURACIÓN PERFECTA:');
      
      products.data.forEach((product, index) => {
        const relatedPrice = prices.data.find(p => p.product === product.id);
        const priceText = relatedPrice ? 
          `${relatedPrice.unit_amount / 100}€${relatedPrice.recurring ? '/mes' : ''}` : 
          'Sin precio';
        console.log(`   ${index + 1}. ${product.name} - ${priceText}`);
      });

      return true;
    } else {
      console.log('\n❌ CONFIGURACIÓN INCORRECTA:');
      console.log(`   Se esperaban 4 productos y 4 precios`);
      console.log(`   Se encontraron ${products.data.length} productos y ${prices.data.length} precios`);
      return false;
    }

  } catch (error) {
    console.error('❌ Error en verificación final:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🔗 Verificando conexión con Stripe...');
    const account = await stripeClient.accounts.retrieve();
    console.log(`✅ Conectado a cuenta: ${account.id} (${account.country})`);

    console.log('\n⚠️  ADVERTENCIA: Este script archivará TODOS los productos y precios existentes');
    console.log('   y creará una configuración completamente nueva y limpia.');
    
    // Ejecutar pasos
    const step1 = await archiveAllProducts();
    if (!step1) throw new Error('Error en paso 1');

    const step2 = await archiveAllPrices();
    if (!step2) throw new Error('Error en paso 2');

    const step3 = await createFreshProducts();
    const successCount = Object.values(step3).filter(r => r.success).length;
    if (successCount !== 4) throw new Error(`Solo se crearon ${successCount}/4 productos`);

    const step4 = await updateConfigFiles(step3);
    if (!step4) throw new Error('Error en paso 4');

    const step5 = await finalVerification();

    console.log('\n' + '=' .repeat(60));
    if (step5) {
      console.log('🎉 ¡LIMPIEZA Y CONFIGURACIÓN COMPLETADA EXITOSAMENTE!');
      console.log('\n📋 CONFIGURACIÓN FINAL LIMPIA:');
      console.log('   ✅ 4 productos separados (1 por plan)');
      console.log('   ✅ 4 precios únicos (150€, 299€, 399€, 499€)');
      console.log('   ✅ Productos antiguos archivados');
      console.log('   ✅ Precios antiguos archivados');
      console.log('   ✅ Archivos de configuración actualizados');
      console.log('\n🔗 Verifica en Stripe Dashboard:');
      console.log('   https://dashboard.stripe.com/products');
      console.log('\n🚀 ¡Tu catálogo está listo para producción!');
    } else {
      console.log('❌ CONFIGURACIÓN INCOMPLETA');
      console.log('Revisa los errores y ejecuta el script nuevamente');
    }

  } catch (error) {
    console.error('\n💥 ERROR CRÍTICO:', error.message);
    process.exit(1);
  }
}

// Ejecutar limpieza completa
main();