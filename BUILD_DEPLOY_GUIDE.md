# ZYRO Marketplace - Guía Completa de Build y Deploy

## 📋 Prerrequisitos

### Herramientas Necesarias
- **Node.js** (v18 o superior)
- **npm** o **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **EAS CLI** (`npm install -g eas-cli`)
- **Xcode** (para iOS, solo en Mac)
- **Android Studio** (para Android)

### Cuentas Requeridas
- **Cuenta Expo.dev** (gratuita)
- **Apple Developer Account** ($99/año para iOS)
- **Google Play Console** ($25 una vez para Android)

## 🚀 Configuración Inicial

### 1. Instalar Dependencias
```bash
cd ZyroMarketplace
npm install
```

### 2. Configurar Expo
```bash
# Login en Expo
expo login

# Inicializar EAS
eas login
eas build:configure
```

### 3. Actualizar app.json
Edita `app.json` y actualiza:
- `extra.eas.projectId`: Tu project ID de Expo
- `owner`: Tu username de Expo

## 📱 Build para iOS

### Paso 1: Configurar Credenciales
```bash
# Configurar credenciales de Apple
eas credentials:configure -p ios

# Seguir las instrucciones para:
# - Apple ID
# - Team ID
# - Certificados de distribución
# - Provisioning profiles
```

### Paso 2: Build de Desarrollo
```bash
# Build para testing interno
eas build --platform ios --profile development
```

### Paso 3: Build de Producción
```bash
# Build para App Store
eas build --platform ios --profile production
```

### Paso 4: Submit a App Store
```bash
# Configurar App Store Connect primero
eas submit --platform ios --profile production
```

## 🤖 Build para Android

### Paso 1: Configurar Credenciales
```bash
# Generar keystore para Android
eas credentials:configure -p android
```

### Paso 2: Build de Desarrollo
```bash
# Build APK para testing
eas build --platform android --profile development
```

### Paso 3: Build de Producción
```bash
# Build AAB para Google Play
eas build --platform android --profile production
```

### Paso 4: Submit a Google Play
```bash
# Configurar Google Play Console primero
eas submit --platform android --profile production
```

## 🔧 Configuración Detallada

### App Store Connect (iOS)
1. **Crear App en App Store Connect**
   - Ir a https://appstoreconnect.apple.com
   - Crear nueva app
   - Bundle ID: `com.zyro.marketplace`
   - Nombre: "ZYRO Marketplace"

2. **Configurar Información de la App**
   - Descripción: "Marketplace privado para conectar influencers con empresas"
   - Categoría: Business
   - Palabras clave: "influencer, marketing, colaboraciones, empresas"
   - Screenshots (requeridos)

3. **Privacy Policy**
   - URL requerida para App Store
   - Debe incluir información sobre datos recopilados

### Google Play Console (Android)
1. **Crear App en Google Play Console**
   - Ir a https://play.google.com/console
   - Crear nueva app
   - Package name: `com.zyro.marketplace`

2. **Configurar Store Listing**
   - Título: "ZYRO Marketplace"
   - Descripción corta y larga
   - Screenshots y assets gráficos
   - Categoría: Business

## 📸 Assets Requeridos

### iOS
- **App Icon**: 1024x1024px
- **Screenshots**:
  - iPhone: 1290x2796px (iPhone 14 Pro)
  - iPad: 2048x2732px (iPad Pro 12.9")

### Android
- **App Icon**: 512x512px
- **Feature Graphic**: 1024x500px
- **Screenshots**: 
  - Phone: 1080x1920px mínimo
  - Tablet: 1200x1920px mínimo

## 🔐 Configuración de Seguridad

### Variables de Entorno
Crear archivo `.env`:
```
EXPO_PUBLIC_API_URL=https://api.zyro.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Secrets en EAS
```bash
# Configurar secrets
eas secret:create --scope project --name API_SECRET --value "your_secret"
eas secret:create --scope project --name STRIPE_SECRET_KEY --value "sk_live_..."
```

## 🧪 Testing

### Testing Local
```bash
# Ejecutar en simulador iOS
npm run ios

# Ejecutar en emulador Android
npm run android

# Ejecutar en web
npm run web
```

### Testing con EAS Build
```bash
# Build de desarrollo con Expo Dev Client
eas build --platform ios --profile development
eas build --platform android --profile development

# Instalar en dispositivo físico para testing
```

### Testing de Producción
```bash
# Build preview para testing final
eas build --platform all --profile preview
```

## 📊 Monitoreo y Analytics

### Configurar Sentry (Opcional)
```bash
npm install @sentry/react-native
```

### Configurar Analytics
- Google Analytics
- Firebase Analytics
- Expo Analytics

## 🚀 Comandos de Deploy Completo

### Deploy iOS Completo
```bash
# 1. Build
eas build --platform ios --profile production --auto-submit

# 2. Verificar en App Store Connect
# 3. Enviar para revisión
```

### Deploy Android Completo
```bash
# 1. Build
eas build --platform android --profile production --auto-submit

# 2. Verificar en Google Play Console
# 3. Publicar en track interno/alpha/beta/production
```

### Deploy Ambas Plataformas
```bash
# Build y submit automático para ambas plataformas
eas build --platform all --profile production --auto-submit
```

## 🔄 Updates Over-the-Air (OTA)

### Configurar EAS Update
```bash
# Instalar EAS Update
npm install expo-updates

# Configurar en app.json
# Publicar update
eas update --branch production --message "Fix critical bug"
```

## 📝 Checklist Pre-Launch

### Técnico
- [ ] Todas las funcionalidades probadas
- [ ] Performance optimizada
- [ ] Crashes corregidos
- [ ] Assets de alta calidad incluidos
- [ ] Privacy policy configurada
- [ ] Terms of service configurados

### App Store
- [ ] Screenshots subidos
- [ ] Descripción completa
- [ ] Palabras clave optimizadas
- [ ] Categoría correcta
- [ ] Pricing configurado
- [ ] Availability configurada

### Legal
- [ ] Privacy policy publicada
- [ ] Terms of service publicados
- [ ] GDPR compliance (si aplica)
- [ ] Age rating apropiado

## 🆘 Troubleshooting

### Errores Comunes iOS
```bash
# Error de certificados
eas credentials:configure -p ios --clear-credentials

# Error de provisioning
eas build --platform ios --clear-cache
```

### Errores Comunes Android
```bash
# Error de keystore
eas credentials:configure -p android --clear-credentials

# Error de build
eas build --platform android --clear-cache
```

### Logs y Debugging
```bash
# Ver logs de build
eas build:list
eas build:view [BUILD_ID]

# Ver logs de submit
eas submit:list
```

## 📞 Soporte

### Recursos Útiles
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

### Comandos de Ayuda
```bash
eas build --help
eas submit --help
eas credentials --help
```

---

## 🎯 Próximos Pasos

1. **Ejecutar build de desarrollo** para testing
2. **Configurar App Store Connect y Google Play Console**
3. **Crear assets gráficos** (iconos, screenshots)
4. **Ejecutar builds de producción**
5. **Submit para revisión**
6. **Monitorear el proceso de aprobación**

¡La app ZYRO Marketplace está lista para ser publicada! 🚀