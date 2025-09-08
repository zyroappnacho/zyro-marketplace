# ZYRO Marketplace

Una aplicación móvil premium que conecta influencers cualificados con empresas exclusivas para colaboraciones de alta calidad.

## 🚀 Características Principales

- **Marketplace Premium**: Plataforma exclusiva con estética dorada elegante
- **Control Centralizado**: El administrador gestiona todas las campañas y aprobaciones
- **Intercambio No Monetario**: Los influencers reciben productos/servicios, no dinero
- **Suscripción Fija**: Las empresas pagan planes mensuales sin comisiones adicionales
- **Compromiso de Contenido**: 2 historias Instagram o 1 TikTok obligatorio

## 📱 Funcionalidades

### Para Influencers
- ✅ Registro gratuito con aprobación manual (24-48h)
- ✅ Navegación por 4 pestañas específicas
- ✅ Filtros por ciudad y 9 categorías
- ✅ Mapa interactivo de España
- ✅ Historial de colaboraciones (próximos, pasados, cancelados)
- ✅ Gestión completa de perfil

### Para Empresas
- ✅ Planes de suscripción: 3 meses (€499), 6 meses (€399), 12 meses (€299)
- ✅ Dashboard limitado con métricas de colaboraciones
- ✅ Múltiples métodos de pago (tarjeta, SEPA, Bizum, Apple Pay, etc.)
- ✅ Facturación automática

### Para Administradores
- ✅ Control total de la plataforma
- ✅ Aprobación/rechazo de usuarios
- ✅ Creación y gestión de campañas
- ✅ Dashboard de ingresos y estadísticas
- ✅ Sistema de notificaciones push

## 🛠 Tecnologías

- **Frontend**: React Native + Expo
- **Estado**: Redux Toolkit + Redux Persist
- **Navegación**: React Navigation 6
- **Estilo**: Styled Components
- **Base de Datos**: SQLite (local) + Firebase (cloud)
- **Notificaciones**: Firebase Cloud Messaging
- **Pagos**: Stripe + múltiples métodos
- **Mapas**: React Native Maps
- **Testing**: Jest + React Native Testing Library

## 🎨 Diseño

### Paleta de Colores Premium
- **Dorado Elegante**: #C9A961
- **Dorado Oscuro**: #A68B47
- **Dorado Brillante**: #D4AF37
- **Negro**: #000000
- **Gris Oscuro**: #111111

### Tipografía
- **Logo**: Imagen logozyrotransparente.PNG
- **Textos**: Inter (Regular, Medium, SemiBold, Bold)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Expo CLI
- iOS Simulator / Android Emulator

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd ZyroMarketplace

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.development
# Editar .env.development con tus credenciales

# Descargar fuentes requeridas
# Ver assets/fonts/README.md para instrucciones
```

### Configuración de Assets
1. **Fuentes**: Descargar Cinzel e Inter desde Google Fonts
2. **Iconos**: Generar iconos de app desde `assets/icon-placeholder.svg`
3. **Firebase**: Configurar proyecto Firebase y actualizar credenciales

### Ejecución
```bash
# Desarrollo
npm start

# iOS
npm run ios

# Android
npm run android

# Web (para testing)
npm run web
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📦 Build y Deployment

### Desarrollo
```bash
# Build de desarrollo
eas build --profile development

# Preview build
eas build --profile preview
```

### Producción
```bash
# Build para stores
eas build --profile production

# Submit a App Store
eas submit --platform ios

# Submit a Google Play
eas submit --platform android
```

## 🔐 Credenciales de Administrador

**IMPORTANTE**: Estas credenciales están especificadas en los requirements y NO deben cambiarse:

- **Usuario**: `admin_zyrovip`
- **Contraseña**: `xarrec-2paqra-guftoN`

## 📋 Estructura del Proyecto

```
ZyroMarketplace/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── screens/            # Pantallas de la aplicación
│   ├── navigation/         # Configuración de navegación
│   ├── store/             # Redux store y slices
│   ├── services/          # Servicios y APIs
│   ├── database/          # Base de datos y repositorios
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilidades
│   ├── types/             # Tipos TypeScript
│   ├── config/            # Configuración
│   └── styles/            # Temas y estilos
├── assets/                # Assets estáticos
├── __tests__/            # Tests
└── docs/                 # Documentación
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno
Ver `.env.example` para todas las variables requeridas.

### Firebase Setup
1. Crear proyecto Firebase
2. Habilitar Authentication, Firestore, Cloud Messaging
3. Descargar `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
4. Actualizar credenciales en `.env.development`

### Stripe Setup
1. Crear cuenta Stripe
2. Obtener claves de test/producción
3. Configurar webhooks para suscripciones

## 📱 Funcionalidades Implementadas

### ✅ Completado
- [x] Sistema de autenticación completo
- [x] Registro de influencers y empresas
- [x] Panel de administración
- [x] Navegación por pestañas
- [x] Filtros por ciudad y categoría
- [x] Mapa interactivo
- [x] Sistema de colaboraciones
- [x] Gestión de perfil
- [x] Notificaciones push
- [x] Sistema de pagos
- [x] Políticas legales (GDPR compliant)

### 🔄 En Desarrollo
- [ ] Optimizaciones de rendimiento
- [ ] Tests E2E adicionales
- [ ] Métricas avanzadas

## 🐛 Problemas Conocidos

- Las fuentes personalizadas requieren instalación manual
- Firebase requiere configuración específica por entorno
- Los mapas necesitan API key de Google Maps

## 📞 Soporte

- **Email**: soporte@zyromarketplace.com
- **Legal**: legal@zyromarketplace.com
- **Privacidad**: privacy@zyromarketplace.com

## 📄 Licencia

Propietario - Zyro Marketplace S.L.

## 🤝 Contribución

Este es un proyecto privado. Para contribuir, contacta con el equipo de desarrollo.

---

**Desarrollado con ❤️ para conectar influencers con marcas de calidad**