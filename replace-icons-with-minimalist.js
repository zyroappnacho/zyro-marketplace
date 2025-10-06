#!/usr/bin/env node

/**
 * Script para reemplazar todos los emojis por iconos minimalistas elegantes
 * Actualiza todos los componentes de la app ZYRO
 */

const fs = require('fs');
const path = require('path');

// Mapeo de emojis a iconos minimalistas
const EMOJI_TO_ICON_MAP = {
    // Navegación principal
    '🏠': { name: 'home', description: 'Inicio' },
    '🗺️': { name: 'map', description: 'Mapa' },
    '🕐': { name: 'history', description: 'Historial' },
    '👤': { name: 'profile', description: 'Perfil' },
    
    // Funcionalidad
    '🔍': { name: 'search', description: 'Buscar' },
    '📍': { name: 'location', description: 'Ubicación' },
    '🌍': { name: 'world', description: 'Mundo/Todas las ciudades' },
    '⚙️': { name: 'settings', description: 'Configuración' },
    '✓': { name: 'check', description: 'Verificado/Seleccionado' },
    '→': { name: 'arrow', description: 'Flecha derecha' },
    '›': { name: 'arrow', description: 'Flecha derecha' },
    '←': { name: 'back', description: 'Volver' },
    '✕': { name: 'close', description: 'Cerrar' },
    
    // Comunicación
    '💬': { name: 'chat', description: 'Chat' },
    '🔔': { name: 'notification', description: 'Notificaciones' },
    '✉️': { name: 'message', description: 'Mensaje' },
    '📞': { name: 'phone', description: 'Teléfono' },
    
    // Negocio
    '🏢': { name: 'business', description: 'Empresa' },
    '💼': { name: 'briefcase', description: 'Maletín/Trabajo' },
    '🎯': { name: 'target', description: 'Objetivo/Meta' },
    '📊': { name: 'chart', description: 'Estadísticas' },
    '📈': { name: 'trending', description: 'Tendencias' },
    '🌟': { name: 'star', description: 'Estrella/Favorito' },
    
    // Redes sociales
    '📸': { name: 'instagram', description: 'Instagram' },
    '🎵': { name: 'tiktok', description: 'TikTok' },
    '🎬': { name: 'tiktok', description: 'TikTok/Video' },
    
    // Categorías de negocio
    '🍽️': { name: 'restaurant', description: 'Restaurante' },
    '🚗': { name: 'mobility', description: 'Movilidad' },
    '👕': { name: 'clothing', description: 'Ropa' },
    '🎪': { name: 'events', description: 'Eventos' },
    '🚚': { name: 'delivery', description: 'Delivery' },
    '💄': { name: 'beauty', description: 'Belleza' },
    '🏨': { name: 'accommodation', description: 'Alojamiento' },
    '🍸': { name: 'nightlife', description: 'Vida nocturna' },
    
    // Acciones
    '🚪': { name: 'logout', description: 'Cerrar sesión' },
    '▷': { name: 'logout', description: 'Cerrar sesión' },
    '🗑️': { name: 'delete', description: 'Eliminar' },
    '✏️': { name: 'edit', description: 'Editar' },
    '📝': { name: 'edit', description: 'Editar' },
    
    // Admin
    '🛡️': { name: 'admin', description: 'Administrador' },
    '🚀': { name: 'campaign', description: 'Campaña' },
    '👥': { name: 'users', description: 'Usuarios' },
    
    // Otros símbolos comunes
    '◉': { name: 'circle', description: 'Punto/Círculo' },
    '💳': { name: 'card', description: 'Tarjeta' },
    '🏦': { name: 'bank', description: 'Banco' }
};

// Función para generar el código de reemplazo de emoji
function generateIconReplacement(emoji, iconData, isActive = false, size = 24) {
    return `<MinimalistIcons name="${iconData.name}" size={${size}} color={${isActive ? "'#C9A961'" : "'#888888'"}} isActive={${isActive}} />`;
}

// Función para procesar un archivo
function processFile(filePath) {
    console.log(`📝 Procesando: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Verificar si ya tiene el import de MinimalistIcons
    const hasMinimalistImport = content.includes('MinimalistIcons');
    
    // Agregar import si no existe
    if (!hasMinimalistImport && Object.keys(EMOJI_TO_ICON_MAP).some(emoji => content.includes(emoji))) {
        const importLine = "import MinimalistIcons from './MinimalistIcons';";
        
        // Buscar la línea de imports de React Native
        const reactNativeImportMatch = content.match(/import.*from 'react-native';/);
        if (reactNativeImportMatch) {
            const insertIndex = content.indexOf(reactNativeImportMatch[0]) + reactNativeImportMatch[0].length;
            content = content.slice(0, insertIndex) + '\n' + importLine + content.slice(insertIndex);
            hasChanges = true;
            console.log(`  ✅ Agregado import de MinimalistIcons`);
        }
    }
    
    // Reemplazar emojis en Text components
    for (const [emoji, iconData] of Object.entries(EMOJI_TO_ICON_MAP)) {
        const emojiRegex = new RegExp(`<Text[^>]*>${emoji}</Text>`, 'g');
        const matches = content.match(emojiRegex);
        
        if (matches) {
            matches.forEach(match => {
                // Extraer el style del Text original si existe
                const styleMatch = match.match(/style=\{([^}]+)\}/);
                let size = 24;
                let isActive = false;
                
                // Intentar determinar si es un icono activo basado en el contexto
                if (match.includes('activeTab') || match.includes('Active') || match.includes('selected')) {
                    isActive = true;
                }
                
                // Intentar extraer el tamaño del fontSize si existe
                if (styleMatch) {
                    const sizeMatch = styleMatch[1].match(/fontSize:\s*(\d+)/);
                    if (sizeMatch) {
                        size = parseInt(sizeMatch[1]);
                    }
                }
                
                const replacement = generateIconReplacement(emoji, iconData, isActive, size);
                content = content.replace(match, replacement);
                hasChanges = true;
                console.log(`  🔄 Reemplazado ${emoji} con icono ${iconData.name}`);
            });
        }
    }
    
    // Reemplazar emojis directos en strings (sin Text wrapper)
    for (const [emoji, iconData] of Object.entries(EMOJI_TO_ICON_MAP)) {
        // Buscar emojis en strings que no estén dentro de Text components
        const directEmojiRegex = new RegExp(`'${emoji}'|"${emoji}"|{['"]${emoji}['"]`, 'g');
        if (content.match(directEmojiRegex)) {
            // Para estos casos, necesitamos reemplazar con un componente Text que contenga el icono
            content = content.replace(directEmojiRegex, `<MinimalistIcons name="${iconData.name}" size={20} />`);
            hasChanges = true;
            console.log(`  🔄 Reemplazado emoji directo ${emoji} con icono ${iconData.name}`);
        }
    }
    
    // Casos especiales para navegación
    if (content.includes('tabIcon') || content.includes('TabIcon')) {
        // Reemplazar iconos de navegación específicos
        const tabIconReplacements = [
            { pattern: /tab\.type === 'home' \? '🏠'/, replacement: `tab.type === 'home' ? <MinimalistIcons name="home" size={24} isActive={activeTab === index} />` },
            { pattern: /tab\.type === 'map' \? '🗺️'/, replacement: `tab.type === 'map' ? <MinimalistIcons name="map" size={24} isActive={activeTab === index} />` },
            { pattern: /tab\.type === 'history' \? '🕐'/, replacement: `tab.type === 'history' ? <MinimalistIcons name="history" size={24} isActive={activeTab === index} />` },
            { pattern: /tab\.type === 'profile' \? '👤'/, replacement: `tab.type === 'profile' ? <MinimalistIcons name="profile" size={24} isActive={activeTab === index} />` }
        ];
        
        tabIconReplacements.forEach(({ pattern, replacement }) => {
            if (content.match(pattern)) {
                content = content.replace(pattern, replacement);
                hasChanges = true;
                console.log(`  🔄 Reemplazado icono de navegación`);
            }
        });
    }
    
    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ Archivo actualizado con iconos minimalistas`);
    } else {
        console.log(`  ⏭️  Sin cambios necesarios`);
    }
    
    return hasChanges;
}

// Función principal
function main() {
    console.log('🎨 ZYRO - Reemplazando emojis con iconos minimalistas elegantes');
    console.log('=' .repeat(60));
    
    const componentsDir = path.join(__dirname, 'components');
    let totalFilesProcessed = 0;
    let totalFilesChanged = 0;
    
    // Procesar todos los archivos .js en el directorio components
    const files = fs.readdirSync(componentsDir).filter(file => file.endsWith('.js'));
    
    files.forEach(file => {
        const filePath = path.join(componentsDir, file);
        totalFilesProcessed++;
        
        if (processFile(filePath)) {
            totalFilesChanged++;
        }
    });
    
    console.log('=' .repeat(60));
    console.log(`📊 Resumen:`);
    console.log(`   Archivos procesados: ${totalFilesProcessed}`);
    console.log(`   Archivos modificados: ${totalFilesChanged}`);
    console.log(`   Iconos disponibles: ${Object.keys(EMOJI_TO_ICON_MAP).length}`);
    console.log('');
    console.log('✨ ¡Todos los iconos han sido actualizados a diseño minimalista!');
    console.log('🎯 Los iconos ahora son elegantes, sin colores, solo líneas limpias');
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('   1. Ejecutar: npm start');
    console.log('   2. Verificar que todos los iconos se muestren correctamente');
    console.log('   3. Ajustar tamaños si es necesario');
}

// Ejecutar el script
if (require.main === module) {
    main();
}

module.exports = { processFile, EMOJI_TO_ICON_MAP };