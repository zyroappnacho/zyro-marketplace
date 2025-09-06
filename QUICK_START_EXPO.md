# 🚀 Guía Rápida de Publicación con Expo.dev

## ⚡ Comandos Rápidos para Publicar ZYRO

### 🔥 **Deployment Completo en 3 Comandos**

```bash
# 1. Verificar que todo está listo
npm run expo:check

# 2. Iniciar sesión en Expo (si no lo has hecho)
npm run expo:login

# 3. ¡Publicar en ambas stores!
npm run expo:deploy
```

**¡Eso es todo! Tu app estará en App Store y Google Play en 20-30 minutos.**

---

## 📋 Comandos Disponibles

### 🔐 **Autenticación**
```bash
# Iniciar sesión en Expo
npm run expo:login

# Ver usuario actual
npm run expo:whoami

# Cerrar sesión
eas logout
```

### 🔍 **Verificación Pre-Deployment**
```bash
# Chequeo completo antes de publicar
npm run expo:check

# Verificar configuración EAS
eas doctor

# Ver información del proyecto
eas project:info
```

### 🚀 **Deployment**
```bash
# Deployment completo (iOS + Android)
npm run expo:deploy

# Solo iOS
npm run expo:deploy -- --ios-only

# Solo Android  
npm run expo:deploy -- --android-only

# Build de desarrollo para testing
npm run expo:deploy -- --development

# Saltear tests
npm run expo:deploy -- --skip-tests

# Solo build, no subir a stores
npm run expo:deploy -- --skip-submit
```

### 📱 **Builds Individuales**
```bash
# Build iOS para App Store
npm run build:ios

# Build Android para Google Play
npm run build:android

# Ver lista de builds
npm run expo:builds

# Ver detalles de un build
eas build:view [BUILD_ID]
```

### 📤 **Submissions**
```bash
# Subir a App Store
npm run submit:ios

# Subir a Google Play
npm run submit:android

# Ver lista de submissions
npm run expo:submissions

# Ver detalles de submission
eas submit:view [SUBMISSION_ID]
```

### 🖥️ **Windows (PowerShell)**
```powershell
# Deployment completo en Windows
npm run expo:deploy:windows

# Con opciones
npm run expo:deploy:windows -- -iOSOnly
npm run expo:deploy:windows -- -AndroidOnly
npm run expo:deploy:windows -- -Development
```

---

## 🎯 Flujos de Trabajo Comunes

### 🆕 **Primera Vez Publicando**
```bash
# 1. Instalar EAS CLI
npm install -g @expo/eas-cli

# 2. Verificar todo está listo
npm run expo:check

# 3. Iniciar sesión
npm run expo:login

# 4. Configurar proyecto (si es necesario)
eas build:configure

# 5. ¡Publicar!
npm run expo:deploy
```

### 🔄 **Actualización de App Existente**
```bash
# 1. Verificar cambios
npm run expo:check

# 2. Publicar actualización
npm run expo:deploy

# 3. Monitorear progreso
npm run expo:builds
npm run expo:submissions
```

### 🧪 **Testing y Desarrollo**
```bash
# 1. Build de desarrollo
npm run expo:deploy -- --development --skip-submit

# 2. Descargar y probar en dispositivos
eas build:download [BUILD_ID]

# 3. Cuando esté listo, build de producción
npm run expo:deploy
```

### 🔧 **Solo Builds (Sin Subir a Stores)**
```bash
# Build de producción sin subir
npm run expo:deploy -- --skip-submit

# Después, subir manualmente cuando esté listo
npm run submit:ios
npm run submit:android
```

---

## 🛠️ Troubleshooting Rápido

### ❌ **Problemas Comunes y Soluciones**

#### **Error: "Not authenticated"**
```bash
eas logout
npm run expo:login
```

#### **Error: "Build failed"**
```bash
# Ver logs detallados
eas build:list
eas build:view [BUILD_ID] --logs

# Limpiar y reintentar
rm -rf .expo/ node_modules/
npm install
npm run expo:deploy
```

#### **Error: "Submission failed"**
```bash
# Verificar configuración de stores
npm run expo:check

# Para Android, verificar service account
ls -la google-service-account.json

# Para iOS, verificar App Store Connect
open https://appstoreconnect.apple.com
```

#### **Error: "Dependencies issues"**
```bash
# Reinstalar dependencias
rm -rf node_modules/ package-lock.json
npm install

# Verificar compatibilidad
npx expo install --fix
```

#### **Error: "Credentials issues"**
```bash
# Limpiar credenciales
eas credentials --platform all --clear-all

# Regenerar automáticamente
npm run expo:deploy
```

---

## 📊 Monitoreo y Estado

### 🔍 **Ver Estado de Builds**
```bash
# Lista de builds recientes
npm run expo:builds

# Builds por plataforma
eas build:list --platform ios
eas build:list --platform android

# Monitoreo en tiempo real
watch -n 30 'npm run expo:builds'
```

### 📤 **Ver Estado de Submissions**
```bash
# Lista de submissions
npm run expo:submissions

# Estado específico
eas submit:view [SUBMISSION_ID]
```

### 🌐 **Enlaces Útiles**
```bash
# Abrir dashboard de Expo
open https://expo.dev

# Abrir App Store Connect
open https://appstoreconnect.apple.com

# Abrir Google Play Console
open https://play.google.com/console
```

---

## 🎯 Casos de Uso Específicos

### 🍎 **Solo iOS (App Store)**
```bash
# Workflow completo iOS
npm run expo:check
npm run expo:login
npm run expo:deploy -- --ios-only
```

### 🤖 **Solo Android (Google Play)**
```bash
# Workflow completo Android
npm run expo:check
npm run expo:login
npm run expo:deploy -- --android-only
```

### ⚡ **Deployment Ultra Rápido**
```bash
# Si ya tienes todo configurado
npm run expo:deploy -- --skip-tests
```

### 🧪 **Testing en Dispositivos**
```bash
# Build de desarrollo
npm run expo:deploy -- --development --skip-submit

# Descargar APK/IPA
eas build:download [BUILD_ID]
```

---

## 📱 Información de la App

### 📋 **Detalles de ZYRO**
- **Nombre**: Zyro Marketplace
- **Bundle ID**: com.zyromarketplace.app
- **Package Name**: com.zyromarketplace.app
- **Categoría**: Business/Empresa
- **Precio**: Gratis
- **Clasificación**: 4+ / PEGI 3

### 🎨 **Assets Requeridos**
- **App Icon**: 1024x1024px (assets/icon.png)
- **Splash Screen**: 1284x2778px (assets/splash.png)
- **Adaptive Icon**: 1024x1024px (assets/adaptive-icon.png)

### 📄 **Documentos Legales**
- **Privacy Policy**: privacy-policy.md
- **Terms of Service**: terms-of-service.md

---

## 🎉 ¡Listo para Publicar!

Con estos comandos tienes todo lo necesario para publicar tu app ZYRO:

### 🚀 **Comando Final**
```bash
# ¡Un solo comando para publicar en ambas stores!
npm run expo:deploy
```

### ⏱️ **Timeline Esperado**
- **Build**: 10-20 minutos
- **Submission**: 2-5 minutos
- **Review**: 1-7 días (automático después)

### 📧 **Notificaciones**
Recibirás emails de Expo cuando:
- ✅ Build completado
- 📤 Submission enviada
- 🎉 App aprobada en stores

**¡Tu app premium ZYRO estará en las stores muy pronto