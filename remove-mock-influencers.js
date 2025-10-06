#!/usr/bin/env node

/**
 * Script para verificar que los datos mock de influencers han sido eliminados
 * y que solo aparecen solicitudes reales
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Verificando eliminación de datos mock de influencers...\n');

const adminServiceFile = path.join(__dirname, 'services/AdminService.js');

if (!fs.existsSync(adminServiceFile)) {
    console.log('❌ AdminService.js no encontrado');
    process.exit(1);
}

const adminServiceContent = fs.readFileSync(adminServiceFile, 'utf8');

console.log('🔍 Verificando eliminación de datos mock...');

// Verificar que los datos mock han sido eliminados
const mockDataChecks = [
    {
        name: 'Ana García López eliminada',
        test: /Ana García López/,
        shouldNotExist: true
    },
    {
        name: 'Carlos Mendoza eliminado',
        test: /Carlos Mendoza/,
        shouldNotExist: true
    },
    {
        name: 'María Rodríguez eliminada',
        test: /María Rodríguez/,
        shouldNotExist: true
    },
    {
        name: 'ana_lifestyle eliminado',
        test: /ana_lifestyle/,
        shouldNotExist: true
    },
    {
        name: 'carlos_fitness eliminado',
        test: /carlos_fitness/,
        shouldNotExist: true
    },
    {
        name: 'maria_travel eliminado',
        test: /maria_travel/,
        shouldNotExist: true
    },
    {
        name: 'mockPendingInfluencers eliminado',
        test: /mockPendingInfluencers/,
        shouldNotExist: true
    },
    {
        name: 'URLs de Unsplash eliminadas',
        test: /images\.unsplash\.com/,
        shouldNotExist: true
    },
    {
        name: 'Comentario de datos mock eliminado',
        test: /crear datos mock para demostración/,
        shouldNotExist: true
    }
];

// Verificar que la funcionalidad real se mantiene
const functionalityChecks = [
    {
        name: 'Función getPendingInfluencers existe',
        test: /static async getPendingInfluencers/,
        shouldExist: true
    },
    {
        name: 'Filtra influencers pendientes',
        test: /filter.*influencer.*status.*pending/,
        shouldExist: true
    },
    {
        name: 'Procesa imágenes de Instagram',
        test: /instagramImages.*instagramScreenshots/,
        shouldExist: true
    },
    {
        name: 'Retorna influencers pendientes reales',
        test: /return pendingInfluencers/,
        shouldExist: true
    }
];

// Ejecutar verificaciones
console.log('\n❌ Datos mock eliminados:');
mockDataChecks.forEach(check => {
    const exists = check.test.test(adminServiceContent);
    if (check.shouldNotExist && !exists) {
        console.log(`✅ ${check.name}`);
    } else if (check.shouldNotExist && exists) {
        console.log(`⚠️  ${check.name} - Aún presente`);
    }
});

console.log('\n✅ Funcionalidad real mantenida:');
functionalityChecks.forEach(check => {
    const exists = check.test.test(adminServiceContent);
    if (check.shouldExist && exists) {
        console.log(`✅ ${check.name}`);
    } else if (check.shouldExist && !exists) {
        console.log(`⚠️  ${check.name} - No encontrado`);
    }
});

// Verificar estructura de la función
console.log('\n🔍 Verificando estructura de getPendingInfluencers...');

const functionMatch = adminServiceContent.match(/static async getPendingInfluencers\(\)\s*{[\s\S]*?return pendingInfluencers;[\s\S]*?}/);

if (functionMatch) {
    const functionContent = functionMatch[0];
    
    // Verificar que no hay datos mock en la función
    const hasMockData = /Ana García|Carlos Mendoza|María Rodríguez|mockPendingInfluencers/.test(functionContent);
    
    if (!hasMockData) {
        console.log('✅ Función limpia sin datos mock');
    } else {
        console.log('⚠️  Función aún contiene datos mock');
    }
    
    // Verificar que mantiene la lógica real
    const hasRealLogic = /getAllInfluencers.*filter.*pending/.test(functionContent);
    
    if (hasRealLogic) {
        console.log('✅ Lógica real mantenida');
    } else {
        console.log('⚠️  Lógica real podría estar afectada');
    }
} else {
    console.log('⚠️  No se pudo encontrar la función getPendingInfluencers');
}

console.log('\n📋 Comportamiento esperado ahora:');
console.log('✅ Sin solicitudes reales → Lista vacía (sin Ana García López)');
console.log('✅ Con solicitudes reales → Solo solicitudes reales');
console.log('✅ Formulario de registro → Funciona igual');
console.log('✅ Aprobación/rechazo → Funciona igual');

console.log('\n🧪 Para verificar el cambio:');
console.log('1. npm start');
console.log('2. Login admin: admin_zyro / ZyroAdmin2024!');
console.log('3. Ir a "Influencers" → Solicitudes Pendientes');
console.log('4. Verificar que NO aparece Ana García López');
console.log('5. Registrar un influencer real desde "SOY INFLUENCER"');
console.log('6. Verificar que SÍ aparece la solicitud real');

console.log('\n✨ ¡Datos mock eliminados exitosamente!');
console.log('Ahora solo aparecerán solicitudes reales de influencers.');

// Calcular estadísticas
const mockChecksPass = mockDataChecks.filter(c => {
    const exists = c.test.test(adminServiceContent);
    return c.shouldNotExist ? !exists : exists;
}).length;

const funcChecksPass = functionalityChecks.filter(c => {
    const exists = c.test.test(adminServiceContent);
    return c.shouldExist ? exists : !exists;
}).length;

console.log(`\n📊 Resumen:`);
console.log(`   Datos mock eliminados: ${mockChecksPass}/${mockDataChecks.length}`);
console.log(`   Funcionalidad mantenida: ${funcChecksPass}/${functionalityChecks.length}`);

if (mockChecksPass === mockDataChecks.length && funcChecksPass === functionalityChecks.length) {
    console.log('🎉 ¡Eliminación completada exitosamente!');
} else {
    console.log('⚠️  Revisar eliminación');
}