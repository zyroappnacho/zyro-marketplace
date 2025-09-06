# 📱 Zyro Marketplace - Instrucciones de Build

## 🚀 Vista Previa Interactiva

### Lanzar Vista Previa Móvil Completa
```bash
# Opción 1: Usar script de Node.js
npm run mobile-preview

# Opción 2: Usar archivo batch (Windows)
./launch-mobile-preview.bat

# Opción 3: Lanzar manualmente
node launch-mobile-preview.js
```

La vista previa incluye:
- ✅ Simulación de iPhone 14 Pro Max
- ✅ Sistema multirol (Influencer, Empresa, Admin)
- ✅ Navegación completa con 4 pestañas
- ✅ Diseño premium con colores dorado y negro
- ✅ Animaciones y transiciones suaves
- ✅ Filtros de ciudad y categoría funcionales
- ✅ Cambio de rol en tiempo real
- ✅ Todas las pantallas implementadas

## 📦 Builds para Producción

### Prerrequisitos
```bash
# Instalar EAS CLI globalmente
npm install -g @expo/eas-cli

# Autenticarse con Expo
eas login

# Configurar proyecto
eas build:configure
```

### Builds de Desarrollo
```bash
# Build de desarrollo para testing
eas build --profile development --platform all

# Solo Android
eas build --profile development --platform android

# Solo iOS
eas build --profile development --platform ios
```

### Builds de Staging
```bash
# Build de staging para testing interno
eas build --profile staging --platform all

# Generar APK para Android (más rápido para testing)
eas build --profile staging --platform android
```

### Builds de Producción
```bash
# Build de producción para stores
eas build --profile production --platform all

# Android AAB para Google Play Store
eas build --profile production --platform android

# iOS para App Store
eas build --profile production --platform ios
```

## 🔧 Configuración de Entornos

### Variables de Entorno
Crear archivos `.env` según el entorno:

```bash
# .env.development
NODE_ENV=development
API_URL=http://localhost:3000
FIREBASE_PROJECT_ID=zyro-dev

# .env.staging
NODE_ENV=staging
API_URL=https://api-staging.zyromarketplace.com
FIREBASE_PROJECT_ID=zyro-staging

# .env.production
NODE_ENV=production
API_URL=https://api.zyromarketplace.com
FIREBASE_PROJECT_ID=zyro-production
```

### Configuración de Firebase
1. Crear proyectos en Firebase Console para cada entorno
2. Descargar `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
3. Colocar archivos en las carpetas correspondientes

## 📱 Testing en Dispositivos

### Expo Go (Desarrollo)
```bash
# Iniciar servidor de desarrollo
expo start

# Escanear QR con Expo Go app
```

### Development Build
```bash
# Instalar build de desarrollo en dispositivo
eas build --profile development --platform android
# Instalar APK generado

# Para iOS, usar TestFlight o instalación directa
```

### Testing Interno
```bash
# Generar build de staging
eas build --profile staging --platform all

# Distribuir via TestFlight (iOS) o Firebase App Distribution (Android)
```

## 🏪 Publicación en Stores

### Google Play Store
```bash
# Generar AAB de producción
eas build --profile production --platform android

# Subir automáticamente (configurar service account)
eas submit --platform android
```

### Apple App Store
```bash
# Generar build de producción
eas build --profile production --platform ios

# Subir automáticamente (configurar Apple ID)
eas submit --platform ios
```

## 🔍 Monitoreo y Analytics

### Configurar Sentry (Opcional)
```bash
# Instalar Sentry
expo install @sentry/react-native

# Configurar en app.config.js
```

### Configurar Analytics
- Firebase Analytics ya configurado
- Crashlytics para crash reporting
- Performance monitoring habilitado

## 🚨 Troubleshooting

### Problemas Comunes

1. **Error de certificados iOS**
   ```bash
   # Limpiar certificados
   eas credentials --platform ios --clear-all
   ```

2. **Error de keystore Android**
   ```bash
   # Generar nuevo keystore
   eas credentials --platform android --clear-all
   ```

3. **Error de dependencias**
   ```bash
   # Limpiar cache
   expo r -c
   npm install
   ```

4. **Error de Metro bundler**
   ```bash
   # Reiniciar con cache limpio
   expo start --clear
   ```

## 📊 Métricas de Build

### Tamaños Aproximados
- **Android APK**: ~25-30 MB
- **Android AAB**: ~20-25 MB  
- **iOS IPA**: ~30-35 MB

### Tiempos de Build
- **Development**: 5-10 minutos
- **Staging**: 10-15 minutos
- **Production**: 15-25 minutos

## 🔐 Seguridad

### Configuración de Secretos
```bash
# Configurar secretos en EAS
eas secret:create --scope project --name API_KEY --value "your-api-key"
eas secret:create --scope project --name FIREBASE_KEY --value "your-firebase-key"
```

### Code Signing
- iOS: Certificados automáticos via EAS
- Android: Keystore automático via EAS

## 📈 Optimización

### Reducir Tamaño de Bundle
```bash
# Analizar bundle
npx react-native-bundle-visualizer

# Optimizar imágenes
expo optimize

# Configurar ProGuard (Android)
# Configurar bitcode (iOS)
```

### Performance
- Lazy loading implementado
- Image optimization habilitado
- Bundle splitting configurado
- Cache strategies implementadas

## 🎯 Próximos Pasos

1. **Configurar CI/CD Pipeline**
   - GitHub Actions para builds automáticos
   - Testing automático en cada PR
   - Deploy automático a staging

2. **Configurar Monitoring**
   - Sentry para error tracking
   - Firebase Performance
   - Custom analytics events

3. **Optimizaciones Adicionales**
   - Code splitting avanzado
   - Preloading strategies
   - Offline capabilities

---

## 📞 Soporte

Para problemas con builds o deployment:
1. Revisar logs de EAS: `eas build:list`
2. Consultar documentación de Expo
3. Contactar soporte técnico

**¡La vista previa móvil está lista para usar! Ejecuta `npm run mobile-preview` para comenzar.**