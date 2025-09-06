# 🌐 Zyro Marketplace - Preview en Chrome

## 🚀 Inicio Rápido en Chrome

### Opción 1: Script Automático (Recomendado)
```bash
cd ZyroMarketplace
npm run chrome
```

### Opción 2: PowerShell (Windows)
```powershell
cd ZyroMarketplace
.\start-chrome.ps1
```

### Opción 3: Batch File (Windows)
```cmd
cd ZyroMarketplace
start-chrome.bat
```

### Opción 4: Página HTML de Inicio
1. Abre el archivo `chrome-launcher.html` en Chrome
2. Haz clic en "Iniciar Preview en Chrome"
3. Espera a que se inicie el servidor
4. ¡Disfruta la preview!

## 🎯 Usuarios de Prueba

### 👑 Administrador
- **Usuario**: `admin_zyrovip`
- **Contraseña**: `xarrec-2paqra-guftoN`

### 📱 Influencer
- **Usuario**: `pruebainflu`
- **Contraseña**: `12345`

### 🏢 Empresa
- Hacer clic en "SOY EMPRESA" para auto-crear
- **Usuario**: `empresa_auto`
- **Contraseña**: `empresa123`

## 🌐 Funcionalidades Web

### ✅ Completamente Funcional en Chrome
- ✅ Navegación por 4 pestañas
- ✅ Estética premium con colores dorados
- ✅ Sistema de colaboraciones completo
- ✅ Filtros por ciudad y categoría
- ✅ Panel de administración
- ✅ Gestión de perfil
- ✅ Mapa interactivo (requiere API key para funcionalidad completa)
- ✅ Responsive design para diferentes tamaños de pantalla

### 🎨 Experiencia Visual
- **Colores Premium**: Dorados (#C9A961, #A68B47, #D4AF37) sobre fondos oscuros
- **Tipografía**: Logo Zyro con fuente Cinzel y espaciado específico
- **Efectos**: Gradientes, sombras doradas, transiciones suaves
- **Componentes**: Botones premium, tarjetas elegantes, modales con blur

## 📱 Navegación Web

### 🏠 Pestaña 1: Colaboraciones
- Selector de ciudad "ZYRO [CIUDAD]" funcional
- Filtros por 8 categorías
- Tarjetas de colaboración con validación de seguidores
- Navegación a pantalla detallada

### 🗺️ Pestaña 2: Mapa
- Mapa de España (placeholder en web, funcional con API key)
- Marcadores de ubicaciones
- Información emergente

### 📅 Pestaña 3: Historial
- Sub-pestañas: PRÓXIMOS, PASADOS, CANCELADOS
- Lista de colaboraciones organizadas
- Estados y fechas

### 👤 Pestaña 4: Perfil
- Logo Zyro prominente
- Información editable
- Configuración completa
- Opciones de cuenta

## 🔧 Configuración Web

### Requisitos del Sistema
- **Navegador**: Chrome 80+ (recomendado)
- **Node.js**: 16.0+
- **npm**: 7.0+
- **Conexión**: Internet para dependencias

### Puertos Utilizados
- **Web Server**: http://localhost:19006
- **Metro Bundler**: http://localhost:8081
- **DevTools**: http://localhost:19002

### Resolución de Problemas

#### Si Chrome no se abre automáticamente:
1. Ve manualmente a: http://localhost:19006
2. Verifica que el servidor esté corriendo
3. Revisa la consola por errores

#### Si hay errores de carga:
1. Refresca la página (F5)
2. Limpia caché del navegador (Ctrl+Shift+R)
3. Verifica la consola de desarrollador (F12)

#### Si las dependencias fallan:
```bash
rm -rf node_modules
npm install
npm run chrome
```

## 🎮 Casos de Uso Web

### Como Influencer
1. **Login**: Usar `pruebainflu` / `12345`
2. **Explorar**: Navegar por las 4 pestañas usando la barra inferior
3. **Filtrar**: Cambiar ciudad en el selector superior
4. **Categorías**: Usar el filtro desplegable de categorías
5. **Detalles**: Hacer clic en "Ver Detalles" en cualquier colaboración
6. **Perfil**: Ir a la pestaña perfil y explorar configuraciones

### Como Administrador
1. **Login**: Usar `admin_zyrovip` / `xarrec-2paqra-guftoN`
2. **Dashboard**: Ver estadísticas generales
3. **Usuarios**: Gestionar aprobaciones
4. **Campañas**: Crear nuevas colaboraciones
5. **Configuración**: Ajustar parámetros del sistema

### Como Empresa
1. **Registro**: Hacer clic en "SOY EMPRESA" en la pantalla de bienvenida
2. **Login**: Usar `empresa_auto` / `empresa123`
3. **Dashboard**: Ver métricas de colaboraciones
4. **Influencers**: Revisar solicitudes recibidas

## 🌐 Ventajas de la Preview Web

### ✅ Ventajas
- **Acceso Inmediato**: No requiere instalación de apps
- **Desarrollo Rápido**: Hot reload automático
- **Debug Fácil**: DevTools de Chrome disponibles
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Compartible**: Fácil de mostrar a otros usuarios

### ⚠️ Limitaciones Web
- **Mapas**: Requiere API key de Google Maps para funcionalidad completa
- **Notificaciones**: Push notifications no disponibles en web
- **Cámara**: Funcionalidades de cámara limitadas
- **Almacenamiento**: Usa localStorage en lugar de almacenamiento nativo

## 📊 Datos de Prueba Web

### Campañas Disponibles
1. **Cena Premium en La Terraza** (Madrid, Restaurantes)
2. **Sesión Spa Completa** (Madrid, Salud y Belleza)
3. **Noche VIP en Club Exclusive** (Madrid, Discotecas)
4. **Colección Primavera Exclusiva** (Barcelona, Ropa)
5. **Experiencia Gastronómica Delivery** (Madrid, Delivery)
6. **Fin de Semana en Hotel Boutique** (Sevilla, Alojamiento)

### Ciudades y Categorías
- **8 Ciudades**: Madrid, Barcelona, Valencia, Sevilla, Bilbao, Málaga, Zaragoza, Murcia
- **8 Categorías**: Restaurantes, Movilidad, Ropa, Eventos, Delivery, Salud y Belleza, Alojamiento, Discotecas

## 🎯 Próximos Pasos

### Para Producción Web
1. **API Real**: Conectar con backend real
2. **Google Maps**: Configurar API key
3. **PWA**: Convertir en Progressive Web App
4. **SEO**: Optimizar para motores de búsqueda
5. **Analytics**: Integrar Google Analytics
6. **CDN**: Configurar distribución de contenido

### Mejoras Web Específicas
1. **Offline Support**: Funcionalidad sin conexión
2. **Web Push**: Notificaciones web
3. **Geolocation**: API de ubicación del navegador
4. **Web Share**: API para compartir contenido
5. **Performance**: Optimización de carga

## 🎉 ¡Disfruta la Preview Web!

La aplicación Zyro Marketplace está completamente optimizada para Chrome y ofrece una experiencia premium completa en el navegador. 

**¡Explora todas las funcionalidades y disfruta de la estética dorada premium!** ✨🌐