# ZYRO Marketplace - Guía Completa de Build y Deploy

## 📋 Requisitos Previos

### Herramientas Necesarias
- **Node.js** (v18 o superior)
- **npm** o **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **EAS CLI** (`npm install -g eas-cli`)
- **Xcode** (para builds de iOS - solo macOS)
- **Android Studio** (para builds de Android)

### Cuentas Requeridas
- **Cuenta Expo.dev** (gratuita)
- **Apple Developer Account** ($99/año para iOS)
- **Google Play Console** ($25 pago único para Android)

## 🚀 Configuración Inicial

### 1. Instalar Dependencias
```bash
cd ZyroMarketplace
npm install
```

### 2. Configurar EAS
```bash
# Iniciar sesión en Expo
eas login

# Configurar el proyecto
eas build:configure
```

### 3. Configurar Credenciales

#### Para iOS:
```bash
# Generar certificados automáticamente
eas credentials -p ios

# O configurar manualmente en eas.json
```

#### Para Android:
```bash
# Generar keystore automáticamente
eas credentials -p android

# O usar keystore existente
```

## 📱 Builds de Desarrollo y Testing

### Build de Preview (Testing Interno)
```bash
# iOS Simulator
eas build --profile preview --platform ios

# Android APK
eas build --profile preview --platform android

# Ambas plataformas
eas build --profile preview --platform all
```

### Build de Development (Con Dev Client)
```bash
# Para desarrollo con hot reload
eas build --profile development --platform ios
eas build --profile development --platform android
```

## 🏗️ Builds de Producción

### 1. Preparar Assets
Asegúrate de tener todos los assets necesarios:
- `assets/icon.png` (1024x1024)
- `assets/adaptive-icon.png` (1024x1024)
- `assets/splash.png` (1284x2778 para iPhone 12 Pro Max)
- `assets/favicon.png` (48x48)

### 2. Actualizar Versiones
En `app.json`:
```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

### 3. Build de Producción

#### iOS:
```bash
# Build para App Store
eas build --profile production --platform ios

# El build generará un archivo .ipa
```

#### Android:
```bash
# Build para Google Play Store
eas build --profile production --platform android

# El build generará un archivo .aab
```

#### Ambas Plataformas:
```bash
eas build --profile production --platform all
```

## 📤 Proceso de Publicación

### iOS - App Store

#### 1. Preparar App Store Connect
1. Ir a [App Store Connect](https://appstoreconnect.apple.com)
2. Crear nueva app:
   - **Nombre**: ZYRO Marketplace
   - **Bundle ID**: com.zyro.marketplace
   - **SKU**: zyro-marketplace-2025
   - **Categoría**: Business

#### 2. Configurar Información de la App
```
Nombre: ZYRO Marketplace
Subtítulo: Conecta influencers con marcas
Descripción: Plataforma exclusiva que conecta influencers con empresas para colaboraciones auténticas. Descubre oportunidades únicas, gestiona campañas y construye relaciones duraderas en el mundo del marketing de influencers.

Palabras clave: influencer, marketing, colaboraciones, marcas, empresas, contenido, redes sociales

Categoría principal: Business
Categoría secundaria: Social Networking

Clasificación de contenido: 4+ (Apto para todas las edades)
```

#### 3. Subir Build
```bash
# Método automático con EAS
eas submit --platform ios

# O manualmente usando Xcode/Transporter
```

#### 4. Configurar Información Adicional
- **Política de Privacidad**: https://zyro.com/privacy
- **Términos de Uso**: https://zyro.com/terms
- **Información de Contacto**: support@zyro.com
- **URL de Marketing**: https://zyro.com

#### 5. Screenshots Requeridos
- iPhone 6.7" (1290x2796): 3-10 screenshots
- iPhone 6.5" (1242x2688): 3-10 screenshots  
- iPhone 5.5" (1242x2208): 3-10 screenshots
- iPad Pro 12.9" (2048x2732): 3-10 screenshots

### Android - Google Play Store

#### 1. Preparar Google Play Console
1. Ir a [Google Play Console](https://play.google.com/console)
2. Crear nueva aplicación:
   - **Nombre**: ZYRO Marketplace
   - **Idioma predeterminado**: Español (España)
   - **Tipo de app**: Aplicación
   - **Gratuita o de pago**: Gratuita

#### 2. Configurar Información de la App
```
Descripción breve: Conecta influencers con marcas para colaboraciones exclusivas

Descripción completa: 
ZYRO Marketplace es la plataforma líder que conecta influencers con empresas para colaboraciones auténticas y mutuamente beneficiosas.

🌟 Para Influencers:
• Descubre colaboraciones exclusivas en tu ciudad
• Accede a experiencias premium en restaurantes, moda, belleza y más
• Gestiona tus solicitudes y historial de colaboraciones
• Construye relaciones duraderas con marcas de calidad

🏢 Para Empresas:
• Conecta con influencers verificados y de calidad
• Gestiona campañas de marketing de influencers
• Accede a métricas detalladas y reportes de rendimiento
• Planes de suscripción flexibles y transparentes

✨ Características principales:
• Interfaz premium con diseño elegante
• Sistema de aprobación manual para garantizar calidad
• Mapa interactivo de colaboraciones por ciudad
• Notificaciones en tiempo real
• Soporte 24/7

Únete a la revolución del marketing de influencers con ZYRO Marketplace.

Categoría: Empresa
```

#### 3. Subir Build
```bash
# Método automático con EAS
eas submit --platform android

# Configurar en eas.json el track inicial
```

#### 4. Configurar Información Adicional
- **Política de Privacidad**: https://zyro.com/privacy
- **Clasificación de contenido**: PEGI 3
- **Público objetivo**: 18-65 años
- **Países de distribución**: España, México, Argentina, Colombia, Chile

#### 5. Assets Requeridos
- **Icono**: 512x512 PNG
- **Gráfico de funciones**: 1024x500 PNG
- **Screenshots**: Mínimo 2, máximo 8 (16:9 o 9:16)
- **Video promocional** (opcional): Máximo 30 segundos

## 🔄 Actualizaciones OTA (Over-The-Air)

### Configurar Updates
```bash
# Publicar actualización
eas update --branch production --message "Fix: Corrección de errores menores"

# Actualización específica por plataforma
eas update --branch production --platform ios --message "iOS: Mejoras de rendimiento"
```

### Configuración en app.json
```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/zyro-marketplace-2025"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

## 🧪 Testing y QA

### 1. Testing Local
```bash
# Ejecutar en simulador iOS
npm run ios

# Ejecutar en emulador Android
npm run android

# Ejecutar en web
npm run web
```

### 2. Testing en Dispositivos Reales
```bash
# Generar QR para Expo Go
expo start

# O usar development build
eas build --profile development
```

### 3. TestFlight (iOS)
- Los builds automáticamente van a TestFlight
- Invitar testers beta por email
- Recopilar feedback antes del lanzamiento

### 4. Internal Testing (Android)
- Configurar track "internal" en Google Play Console
- Invitar testers por email
- Probar funcionalidades críticas

## 📊 Monitoreo y Analytics

### 1. Configurar Crashlytics
```bash
# Instalar Firebase
expo install @react-native-firebase/app @react-native-firebase/crashlytics

# Configurar en app.json
```

### 2. Analytics de Uso
```bash
# Instalar Expo Analytics
expo install expo-analytics-amplitude

# O Google Analytics
expo install @react-native-google-analytics/google-analytics
```

### 3. Performance Monitoring
- Usar Flipper para debugging
- Configurar Sentry para error tracking
- Monitorear métricas de rendimiento

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Limpiar cache
expo start --clear

# Reset Metro bundler
npx react-native start --reset-cache

# Verificar configuración
eas build:configure
```

### Builds
```bash
# Ver status de builds
eas build:list

# Cancelar build
eas build:cancel [BUILD_ID]

# Ver logs de build
eas build:view [BUILD_ID]
```

### Submissions
```bash
# Ver status de submissions
eas submit:list

# Resubmit con mismo build
eas submit --id [BUILD_ID]
```

## 🚨 Troubleshooting

### Errores Comunes

#### Build Failures
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install

# Verificar compatibilidad de dependencias
npx expo doctor

# Actualizar Expo SDK
npx expo upgrade
```

#### Problemas de Certificados iOS
```bash
# Regenerar certificados
eas credentials -p ios --clear-all
eas credentials -p ios
```

#### Problemas de Keystore Android
```bash
# Regenerar keystore
eas credentials -p android --clear-all
eas credentials -p android
```

### Logs y Debugging
```bash
# Ver logs de build
eas build:view [BUILD_ID]

# Ver logs de runtime
expo logs

# Debug en dispositivo
expo start --dev-client
```

## 📋 Checklist Pre-Launch

### Técnico
- [ ] Todas las funcionalidades probadas
- [ ] Performance optimizado
- [ ] Crashes resueltos
- [ ] Assets de alta calidad incluidos
- [ ] Configuración de producción aplicada
- [ ] Políticas de privacidad y términos actualizados

### App Store
- [ ] Metadata completo
- [ ] Screenshots de calidad
- [ ] Descripción optimizada para ASO
- [ ] Palabras clave relevantes
- [ ] Clasificación de contenido correcta
- [ ] Información de contacto actualizada

### Marketing
- [ ] Landing page preparada
- [ ] Materiales promocionales listos
- [ ] Estrategia de lanzamiento definida
- [ ] Canales de soporte configurados
- [ ] Plan de comunicación preparado

## 🎯 Post-Launch

### Monitoreo
- Revisar métricas de descarga diariamente
- Monitorear reviews y ratings
- Analizar crashes y errores
- Seguir engagement de usuarios

### Actualizaciones
- Planificar releases regulares
- Recopilar feedback de usuarios
- Priorizar mejoras basadas en datos
- Mantener compatibilidad con nuevas versiones de OS

### Soporte
- Responder reviews en stores
- Mantener documentación actualizada
- Proporcionar soporte técnico
- Gestionar comunidad de usuarios

---

## 📞 Contacto y Soporte

Para cualquier duda durante el proceso de build y deploy:

- **Email técnico**: dev@zyro.com
- **Documentación**: https://docs.zyro.com
- **Slack**: #zyro-dev-team
- **Issues**: GitHub Issues del proyecto

¡Buena suerte con el lanzamiento de ZYRO Marketplace! 🚀