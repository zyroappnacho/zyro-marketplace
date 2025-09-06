# ✅ Checklist Pre-Build

## 🔧 Configuración del Sistema

### Android
- [ ] Android Studio instalado
- [ ] ANDROID_HOME configurado
- [ ] ADB funciona (`adb version`)
- [ ] SDK Platform-Tools instalado

### iOS (Solo en macOS)
- [ ] Xcode instalado
- [ ] Xcode Command Line Tools
- [ ] Cuenta de desarrollador Apple

## 📱 Configuración del Proyecto

### Dependencias
- [ ] `npm install` ejecutado sin errores
- [ ] react-native-maps versión correcta (1.20.1)
- [ ] Todas las dependencias compatibles con Expo SDK

### Assets
- [ ] icon.png (1024x1024)
- [ ] splash.png
- [ ] adaptive-icon.png (Android)
- [ ] favicon.png (Web)

### Configuración
- [ ] app.config.js completo
- [ ] eas.json configurado
- [ ] Variables de entorno definidas
- [ ] Bundle identifiers únicos

## 🔐 Credenciales

### EAS
- [ ] EAS CLI instalado (`npm i -g @expo/eas-cli`)
- [ ] Autenticado (`eas login`)
- [ ] Proyecto configurado (`eas build:configure`)

### Apple (iOS)
- [ ] Apple ID configurado en eas.json
- [ ] Team ID disponible
- [ ] App Store Connect configurado

### Google (Android)
- [ ] Google Play Console configurado
- [ ] Service Account JSON (para auto-submit)

## 🧪 Testing

### Local
- [ ] `expo start` funciona
- [ ] Web preview funciona
- [ ] No errores en consola

### Build Test
- [ ] `eas build --profile development` exitoso
- [ ] APK/IPA instala correctamente
- [ ] App funciona en dispositivo

## 🚀 Comandos de Build

```bash
# Preparar entorno
./scripts/prepare-build.ps1

# Build de desarrollo
eas build --profile development --platform all

# Build de producción
eas build --profile production --platform all

# Submit a stores
eas submit --platform all
```

## ⚠️ Problemas Comunes

1. **Android SDK no encontrado**
   - Instalar Android Studio
   - Configurar ANDROID_HOME

2. **Dependencias incompatibles**
   - Verificar versiones en package.json
   - Ejecutar `expo doctor`

3. **Credenciales faltantes**
   - Configurar Apple ID en eas.json
   - Generar service account para Google Play

4. **Assets faltantes**
   - Verificar que todos los iconos existen
   - Usar dimensiones correctas