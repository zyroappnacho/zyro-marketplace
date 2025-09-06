# 🎯 Zyro Marketplace - Preview Completa

## 🚀 Inicio Rápido

```bash
cd ZyroMarketplace
npm run preview
```

### 🌐 Opción Chrome (Recomendada)
```bash
cd ZyroMarketplace
npm run chrome
```

### 🖥️ Windows PowerShell
```powershell
cd ZyroMarketplace
.\start-chrome.ps1
```

### 📄 Página de Inicio HTML
Abre `chrome-launcher.html` en tu navegador

### 📱 Expo Manual
```bash
cd ZyroMarketplace
npm install
npx expo start --web
```

## 👥 Usuarios de Prueba

### 👑 Administrador
- **Usuario**: `admin_zyrovip`
- **Contraseña**: `xarrec-2paqra-guftoN`
- **Funcionalidades**: Panel completo de administración, gestión de usuarios, creación de campañas

### 📱 Influencer
- **Usuario**: `pruebainflu`
- **Contraseña**: `12345`
- **Funcionalidades**: App completa con 4 pestañas, solicitud de colaboraciones, gestión de perfil

### 🏢 Empresa
- **Creación**: Automática al hacer clic en "SOY EMPRESA"
- **Usuario**: `empresa_auto`
- **Contraseña**: `empresa123`
- **Funcionalidades**: Dashboard limitado, métricas de colaboraciones

## 📱 Navegación de la App

### 🏠 Pestaña 1: Inicio (Colaboraciones)
- **Header**: Logo Zyro + Selector de ciudad "ZYRO [CIUDAD]"
- **Filtros**: Selector de categorías desplegable
- **Contenido**: Tarjetas de colaboración con:
  - Imagen de fondo elegante
  - Nombre de la colaboración
  - Requisitos de seguidores
  - Número de acompañantes permitidos
  - Indicador de elegibilidad (✅/❌)
  - Botón "Ver Detalles"

### 🗺️ Pestaña 2: Mapa
- **Mapa**: España interactivo con zoom
- **Marcadores**: Ubicaciones de todos los negocios
- **Funcionalidad**: Ampliable/desampliable, información emergente

### 📅 Pestaña 3: Historial
- **Sub-pestañas**: 
  - PRÓXIMOS: Colaboraciones confirmadas pendientes
  - PASADOS: Colaboraciones completadas
  - CANCELADOS: Colaboraciones canceladas/rechazadas
- **Información**: Fechas, estados, detalles de cada colaboración

### 👤 Pestaña 4: Perfil
- **Header**: Logo Zyro grande superior izquierda
- **Perfil**: Información de redes sociales, seguidores actualizables
- **Configuración**: 
  - Datos personales
  - Normas de uso
  - Política de privacidad
  - Contraseña y seguridad
  - Cerrar sesión
  - Borrar cuenta

## 🎨 Estética Premium

### 🎨 Paleta de Colores
- **Dorado Elegante**: #C9A961
- **Dorado Oscuro**: #A68B47
- **Dorado Brillante**: #D4AF37
- **Negro**: #000000
- **Gris Oscuro**: #111111

### 🔤 Tipografía
- **Logo**: Cinzel, peso 600, espaciado 3px entre letras
- **Textos**: Inter, varios pesos

### ✨ Efectos Premium
- Gradientes dorados en botones
- Bordes dorados en tarjetas
- Sombras elegantes con glow dorado
- Transiciones suaves de 0.2s
- Efectos hover y focus
- Backdrop blur en modales

## 📊 Datos de Prueba Incluidos

### 🏢 Campañas (6 ejemplos)
1. **Cena Premium en La Terraza** (Madrid, Restaurantes, 5K seguidores)
2. **Sesión Spa Completa** (Madrid, Salud y Belleza, 10K seguidores)
3. **Noche VIP en Club Exclusive** (Madrid, Discotecas, 20K seguidores)
4. **Colección Primavera Exclusiva** (Barcelona, Ropa, 8K seguidores)
5. **Experiencia Gastronómica Delivery** (Madrid, Delivery, 3K seguidores)
6. **Fin de Semana en Hotel Boutique** (Sevilla, Alojamiento, 15K seguidores)

### 🏙️ Ciudades Habilitadas (8)
Madrid, Barcelona, Valencia, Sevilla, Bilbao, Málaga, Zaragoza, Murcia

### 📂 Categorías (8)
- 🍽️ RESTAURANTES
- 🚗 MOVILIDAD
- 👕 ROPA
- 🎉 EVENTOS
- 🚚 DELIVERY
- 💄 SALUD Y BELLEZA
- 🏨 ALOJAMIENTO
- 🍸 DISCOTECAS

## 🔧 Funcionalidades Implementadas

### ✅ Sistema de Autenticación
- Pantalla de bienvenida premium
- Login con validación
- Registro multi-paso para influencers
- Registro empresarial con planes de suscripción
- Estados de usuario (pendiente, aprobado, rechazado)

### ✅ Panel de Administración
- Dashboard con estadísticas en tiempo real
- Gestión de usuarios (aprobación/rechazo)
- Creador de campañas con editor visual
- Configuración de ciudades y categorías
- Dashboard financiero con métricas
- Configuración de pagos empresariales

### ✅ Sistema de Colaboraciones
- Pantalla detallada con galería de fotos
- Información completa del negocio
- Sección "QUÉ INCLUYE" configurable
- Requisitos de contenido obligatorio
- Mapa pequeño con ubicación exacta
- Formulario de solicitud con validación

### ✅ Filtros y Búsqueda
- Validación automática de requisitos de seguidores
- Filtros por ciudad y categoría
- Indicadores visuales de elegibilidad
- Mensajes informativos cuando no se cumplen requisitos

### ✅ Gestión de Perfil
- Actualización de información personal
- Gestión de redes sociales
- Actualización manual de seguidores
- Configuración de privacidad y seguridad

### ✅ Seguridad y Privacidad
- Encriptación de datos sensibles
- Autenticación segura con JWT
- Detección de actividad sospechosa
- Cumplimiento GDPR
- Auditoría de acciones

## 🎮 Casos de Uso para Testing

### 🎯 Como Influencer
1. **Registro**: Completar formulario multi-paso
2. **Login**: Usar `pruebainflu` / `12345`
3. **Explorar**: Navegar por las 4 pestañas
4. **Filtrar**: Cambiar ciudad y categoría
5. **Ver Detalles**: Abrir colaboración específica
6. **Solicitar**: Aplicar a colaboración (si cumple requisitos)
7. **Perfil**: Actualizar información y seguidores
8. **Historial**: Ver colaboraciones pasadas y futuras

### 🎯 Como Empresa
1. **Registro**: Hacer clic en "SOY EMPRESA"
2. **Login**: Usar `empresa_auto` / `empresa123`
3. **Dashboard**: Ver métricas de colaboraciones
4. **Influencers**: Revisar solicitudes recibidas
5. **Métricas**: Analizar rendimiento de campañas

### 🎯 Como Administrador
1. **Login**: Usar `admin_zyrovip` / `xarrec-2paqra-guftoN`
2. **Dashboard**: Ver estadísticas generales
3. **Usuarios**: Aprobar/rechazar solicitudes
4. **Campañas**: Crear nuevas colaboraciones
5. **Configuración**: Gestionar ciudades y categorías
6. **Finanzas**: Ver dashboard de ingresos

## 🔍 Detalles Técnicos

### 📱 Compatibilidad
- **iOS**: 12.0+
- **Android**: API 21+ (Android 5.0)
- **Expo SDK**: 49+
- **React Native**: 0.72+

### 🛠️ Tecnologías
- **Frontend**: React Native + TypeScript
- **Estado**: Redux Toolkit
- **Navegación**: React Navigation
- **Estilo**: Styled Components
- **Datos**: React Query
- **Mapas**: React Native Maps
- **Iconos**: React Native Vector Icons

### 📦 Estructura del Proyecto
```
src/
├── components/          # Componentes reutilizables
├── screens/            # Pantallas de la app
├── navigation/         # Configuración de navegación
├── store/             # Redux store y slices
├── services/          # Servicios y APIs
├── hooks/             # Custom hooks
├── utils/             # Utilidades
├── types/             # Definiciones TypeScript
├── styles/            # Tema y estilos
└── data/              # Datos mock para preview
```

## 🚨 Notas Importantes

### ⚠️ Limitaciones de la Preview
- **Datos Mock**: No se conecta a APIs reales
- **Pagos**: Sistema simulado, no procesa transacciones
- **Notificaciones**: Requiere configuración de Firebase
- **Mapas**: Necesita API key de Google Maps para funcionalidad completa

### 🔧 Para Producción
1. Configurar APIs reales
2. Integrar sistema de pagos real (Stripe, PayPal)
3. Configurar Firebase para notificaciones
4. Añadir API key de Google Maps
5. Configurar base de datos real
6. Implementar autenticación con backend
7. Configurar CI/CD para deployment

## 📞 Soporte

Si encuentras algún problema durante la preview:

1. **Reinstalar dependencias**: `rm -rf node_modules && npm install`
2. **Limpiar caché**: `npx expo start -c`
3. **Verificar versiones**: `npx expo doctor`
4. **Revisar logs**: Buscar errores en la consola de Expo

## 🎉 ¡Disfruta la Preview!

La aplicación Zyro Marketplace está completamente funcional con todas las características especificadas en los requirements, design y tasks. Puedes interactuar con todas las pantallas, probar los diferentes roles de usuario y experimentar la estética premium implementada.

**¡Explora todas las funcionalidades y disfruta de la experiencia Zyro!** ✨