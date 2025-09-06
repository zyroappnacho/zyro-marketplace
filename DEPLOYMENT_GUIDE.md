# Guía de Deployment - Zyro Marketplace

Esta guía te ayudará a preparar y deployar la aplicación Zyro Marketplace en iOS y Android usando Expo Application Services (EAS).

## 📋 Prerrequisitos

### Cuentas Necesarias
- [x] Cuenta de Expo (expo.dev)
- [x] Apple Developer Account ($99/año)
- [x] Google Play Console ($25 una vez)
- [x] Proyecto Firebase configurado
- [x] Cuenta Stripe para pagos

### Herramientas Requeridas
```bash
# Instalar EAS CLI globalmente
npm install -g @expo/eas-cli

# Login en Expo
eas login
```

## 🔧 Configuración Inicial

### 1. Configurar Variables de Entorno

Crear archivo `.env.production`:
```bash
# Production Environment
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://api.zyromarketplace.com/api
EXPO_PUBLIC_FIREBASE_PROJECT_ID=zyro-marketplace-prod
EXPO_PUBLIC_FIREBASE_API_KEY=your_production_firebase_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_key
```

### 2. Configurar Firebase

1. **Crear proyecto de producción en Firebase**
2. **Habilitar servicios necesarios**:
   - Authentication
   - Firestore Database
   - Cloud Messaging
   - Cloud Storage

3. **Descargar archivos de configuración**:
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS)

### 3. Configurar Credenciales de Stores

#### Apple App Store
```bash
# Configurar credenciales de Apple
eas credentials:configure --platform ios
```

#### Google Play Store
```bash
# Configurar credenciales de Google
eas credentials:configure --platform android
```

## 🏗 Proceso de Build

### Builds de Desarrollo
```bash
# Build para testing interno
eas build --profile development --platform all
```

### Builds de Preview
```bash
# Build para testing con stakeholders
eas build --profile preview --platform all
```

### Builds de Producción
```bash
# Build final para stores
eas build --profile production --platform all
```

## 📱 Configuración Específica por Plataforma

### iOS Configuration

#### app.config.js - Sección iOS
```javascript
ios: {
  supportsTablet: false,
  bundleIdentifier: "com.zyromarketplace.app",
  buildNumber: "1",
  icon: "./assets/icon.png",
  infoPlist: {
    NSLocationWhenInUseUsageDescription: "Esta app usa tu ubicación para mostrarte colaboraciones cercanas.",
    NSCameraUsageDescription: "Esta app necesita acceso a la cámara para subir fotos de perfil.",
    NSPhotoLibraryUsageDescription: "Esta app necesita acceso a tus fotos para subir imágenes de perfil."
  }
}
```

#### Pasos Adicionales iOS
1. **Configurar App Store Connect**
2. **Crear App ID en Apple Developer**
3. **Configurar Push Notifications**
4. **Subir metadata y screenshots**

### Android Configuration

#### app.config.js - Sección Android
```javascript
android: {
  adaptiveIcon: {
    foregroundImage: "./assets/adaptive-icon-foreground.png",
    backgroundImage: "./assets/adaptive-icon-background.png"
  },
  package: "com.zyromarketplace.app",
  versionCode: 1,
  icon: "./assets/icon.png",
  permissions: [
    "ACCESS_COARSE_LOCATION",
    "ACCESS_FINE_LOCATION",
    "CAMERA",
    "READ_EXTERNAL_STORAGE",
    "WRITE_EXTERNAL_STORAGE"
  ]
}
```

#### Pasos Adicionales Android
1. **Configurar Google Play Console**
2. **Crear keystore para signing**
3. **Configurar Firebase Cloud Messaging**
4. **Subir metadata y screenshots**

## 🚀 Deployment a Stores

### Submission Automática
```bash
# Submit a ambas stores
eas submit --platform all --latest

# Solo iOS
eas submit --platform ios --latest

# Solo Android
eas submit --platform android --latest
```

### Submission Manual

#### iOS App Store
1. Build con `eas build --profile production --platform ios`
2. Descargar .ipa desde Expo dashboard
3. Subir a App Store Connect usando Transporter
4. Configurar metadata en App Store Connect
5. Enviar para revisión

#### Google Play Store
1. Build con `eas build --profile production --platform android`
2. Descargar .aab desde Expo dashboard
3. Subir a Google Play Console
4. Configurar store listing
5. Publicar en track de testing/producción

## 📊 Monitoreo Post-Deployment

### Analytics y Crash Reporting
- **Firebase Analytics**: Configurado automáticamente
- **Sentry**: Para crash reporting detallado
- **Expo Analytics**: Métricas de uso básicas

### Métricas Importantes
- Tasa de instalación
- Retención de usuarios
- Crashes por versión
- Tiempo de carga de pantallas
- Conversión de registro a usuario activo

## 🔄 Updates Over-The-Air (OTA)

### Configurar Updates
```bash
# Publicar update menor
eas update --branch production --message "Fix minor bugs"

# Update para branch específico
eas update --branch preview --message "New features for testing"
```

### Estrategia de Updates
- **Patches críticos**: OTA inmediato
- **Features menores**: OTA programado
- **Features mayores**: Nueva versión en stores

## 🛡 Seguridad en Producción

### Checklist de Seguridad
- [x] Variables de entorno seguras
- [x] API keys de producción configuradas
- [x] Certificados SSL válidos
- [x] Obfuscación de código habilitada
- [x] Logs de producción configurados
- [x] Rate limiting en APIs
- [x] Validación de entrada robusta

### Configuración de Seguridad
```javascript
// app.config.js - Producción
extra: {
  eas: {
    projectId: "f317c76a-27e7-43e9-b5eb-df12fbea32cb"
  },
  enableHermes: true, // Mejor performance
  enableProguard: true, // Obfuscación Android
}
```

## 📋 Checklist Pre-Deployment

### Funcionalidad
- [ ] Todas las pantallas funcionan correctamente
- [ ] Sistema de autenticación completo
- [ ] Pagos funcionando con Stripe producción
- [ ] Notificaciones push configuradas
- [ ] Mapas con API key válida
- [ ] Base de datos de producción configurada

### Assets y Contenido
- [ ] Iconos de app en todas las resoluciones
- [ ] Splash screen optimizada
- [ ] Fuentes personalizadas incluidas
- [ ] Imágenes optimizadas
- [ ] Políticas de privacidad actualizadas
- [ ] Términos de servicio completos

### Testing
- [ ] Tests unitarios pasando
- [ ] Tests de integración completos
- [ ] Testing manual en dispositivos reales
- [ ] Performance testing realizado
- [ ] Testing de pagos en sandbox

### Compliance
- [ ] GDPR compliance verificado
- [ ] App Store guidelines cumplidas
- [ ] Google Play policies cumplidas
- [ ] Accesibilidad implementada
- [ ] Localización completada

## 🆘 Troubleshooting

### Problemas Comunes

#### Build Failures
```bash
# Limpiar cache y rebuilds
eas build:clear-cache
eas build --profile production --platform ios --clear-cache
```

#### Submission Rejections
- **iOS**: Revisar App Store Review Guidelines
- **Android**: Verificar Google Play Developer Policy
- **Ambos**: Asegurar metadata completa y screenshots

#### Performance Issues
- Optimizar imágenes y assets
- Implementar lazy loading
- Reducir bundle size
- Configurar Hermes engine

### Logs y Debugging
```bash
# Ver logs de build
eas build:view [build-id]

# Ver logs de submission
eas submit:view [submission-id]

# Logs de runtime
expo logs --type=device
```

## 📞 Soporte

### Contactos de Emergencia
- **Expo Support**: expo.dev/support
- **Apple Developer**: developer.apple.com/support
- **Google Play**: support.google.com/googleplay/android-developer

### Documentación Adicional
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)

---

**¡Listo para lanzar Zyro Marketplace al mundo! 🚀**