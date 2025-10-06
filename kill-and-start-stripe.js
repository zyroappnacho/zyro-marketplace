#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🔄 Limpiando procesos de Node.js en puerto 3001...');

// Función para matar procesos en puerto 3001
function killPort3001() {
    return new Promise((resolve) => {
        exec('lsof -ti:3001', (error, stdout) => {
            if (stdout.trim()) {
                const pids = stdout.trim().split('\n');
                console.log(`🔪 Matando procesos: ${pids.join(', ')}`);
                
                pids.forEach(pid => {
                    try {
                        process.kill(pid, 'SIGTERM');
                        console.log(`✅ Proceso ${pid} terminado`);
                    } catch (err) {
                        console.log(`⚠️ No se pudo terminar proceso ${pid}: ${err.message}`);
                    }
                });
                
                setTimeout(resolve, 2000); // Esperar 2 segundos
            } else {
                console.log('✅ No hay procesos en puerto 3001');
                resolve();
            }
        });
    });
}

// Función principal
async function main() {
    try {
        // Limpiar puerto 3001
        await killPort3001();
        
        console.log('🚀 Iniciando sistema de Stripe...');
        
        // Ejecutar el script de Stripe
        const stripeProcess = spawn('node', ['start-stripe-system.js'], {
            cwd: __dirname,
            stdio: 'inherit'
        });
        
        stripeProcess.on('close', (code) => {
            console.log(`\n🏁 Sistema de Stripe terminado con código: ${code}`);
        });
        
        stripeProcess.on('error', (error) => {
            console.error('❌ Error ejecutando sistema de Stripe:', error);
        });
        
        // Manejar Ctrl+C
        process.on('SIGINT', () => {
            console.log('\n🛑 Deteniendo sistema...');
            stripeProcess.kill('SIGTERM');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();