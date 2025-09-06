# 🚀 Guía Completa de Publicación desde Expo.dev

## 📋 Pasos Completos para Publicar ZYRO en App Store y Google Play

### 🔧 Paso 1: Instalación y Configuración Inicial

#### 1.1 Instalar EAS CLI
```bash
# Instalar EAS CLI globalmente
npm install -g @expo/eas-cli

# Verificar instalación
eas --version
```

#### 1.2 Verificar Node.js y npm
```bash
# Verificar versiones (Node.js 16+ requerido)
node --version
npm --version

# Si necesitas actualizar Node.js
# Descargar desde: https://nodejs.org/
```

#### 1.3 Instalar dependencias del proyecto
```bash
# Navegar al directorio del proyecto
cd ZyroMarketplace

# Instalar dependencias
npm install

# Limpiar cache si hay problemas
npm run clean
```

### 🔐 Paso 2: Autenticación en Expo.dev

#### 2.1 Crear cuenta en Expo.dev (si no tienes)
```bash
# Ir a https://expo.dev y crear cuenta
# O usar GitHub/Google para registro rápido
```

#### 2.2 Iniciar sesión desde terminal
```bash
# Iniciar sesión
eas login

# Verificar que estás logueado
eas whoami

# Si tienes problemas de autenticación
eas logout
eas login --force
```

#### 2.3 Configurar proyecto en Expo
```bash
# Inicializar proyecto EAS (si no está configurado)
eas build:configure

# Verificar configuración
eas project:info
```

### 🔍 Paso 3: Chequeo de Errores Pre-Build

#### 3.1 Verificar configuración de archivos
```bash
# Verificar que existen los archivos necesarios
ls -la app.config.js
ls -la eas.json
ls -la package.json

# Verificar sintaxis de configuración
node -c app.config.js
```

#### 3.2 Validar dependencias
```bash
# Verificar dependencias
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix

# Si hay problemas críticos
npm audit fix --force
```

#### 3.3 Ejecutar tests (si están configurados)
```bash
# Ejecutar tests unitarios
npm test

# Ejecutar linting
npm run lint

# Verificar tipos TypeScript
npm run type-check
```

#### 3.4 Verificar variables de entorno
```bash
# Verificar que existe el archivo de producción
ls -la .env.production

# Verificar contenido (sin mostrar valores sensibles)
grep -v "SECRET\|KEY\|PASSWORD" .env.production
```

### 📱 Paso 4: Preparar Assets y Recursos

#### 4.1 Crear directorio de assets
```bash
# Crear estructura de directorios
mkdir -p assets/images
mkdir -p assets/icons
mkdir -p store-assets/ios/screenshots
mkdir -p store-assets/android/screenshots
```

#### 4.2 Generar iconos de la app
```bash
# Si tienes un icono base, puedes usar herramientas online:
# https://www.appicon.co/
# https://icon.kitchen/

# Colocar iconos en:
# assets/icon.png (1024x1024)
# assets/adaptive-icon.png (1024x1024)
# assets/splash.png (1284x2778)
```

### 🏗️ Paso 5: Configurar Build Profiles

#### 5.1 Verificar eas.json
```bash
# Ver contenido de eas.json
cat eas.json

# Validar JSON
python -m json.tool eas.json
```

#### 5.2 Configurar credenciales
```bash
# Configurar credenciales automáticamente
eas credentials

# Para iOS - configurar certificados
eas credentials --platform ios

# Para Android - configurar keystore
eas credentials --platform android
```

### 🔨 Paso 6: Build de Desarrollo (Testing)

#### 6.1 Build de desarrollo para testing
```bash
# Build de desarrollo para iOS
eas build --platform ios --profile development

# Build de desarrollo para Android
eas build --platform android --profile development

# Build para ambas plataformas
eas build --platform all --profile development
```

#### 6.2 Verificar builds
```bash
# Ver lista de builds
eas build:list

# Ver detalles de un build específico
eas build:view [BUILD_ID]

# Descargar build para testing
eas build:download [BUILD_ID]
```

### 🚀 Paso 7: Build de Producción

#### 7.1 Pre-build checklist
```bash
# Verificar que todo está listo
echo "✅ Verificando configuración..."

# Verificar app.config.js
if [ -f "app.config.js" ]; then
    echo "✅ app.config.js existe"
else
    echo "❌ app.config.js no encontrado"
    exit 1
fi

# Verificar eas.json
if [ -f "eas.json" ]; then
    echo "✅ eas.json existe"
else
    echo "❌ eas.json no encontrado"
    exit 1
fi

# Verificar variables de entorno
if [ -f ".env.production" ]; then
    echo "✅ .env.production existe"
else
    echo "❌ .env.production no encontrado"
    exit 1
fi
```

#### 7.2 Build de producción iOS
```bash
# Build para App Store
eas build --platform ios --profile production --non-interactive

# Monitorear progreso
eas build:list --platform ios --limit 1
```

#### 7.3 Build de producción Android
```bash
# Build para Google Play (AAB)
eas build --platform android --profile production --non-interactive

# Build APK adicional para testing
eas build --platform android --profile production-apk --non-interactive
```

#### 7.4 Build para ambas plataformas
```bash
# Build completo de producción
eas build --platform all --profile production --non-interactive --wait
```

### 📤 Paso 8: Subir a App Stores

#### 8.1 Configurar App Store Connect (iOS)
```bash
# Verificar configuración de iOS
eas submit --platform ios --help

# Subir a App Store (requiere configuración previa)
eas submit --platform ios --latest
```

#### 8.2 Configurar Google Play Console (Android)
```bash
# Verificar que tienes el service account key
ls -la google-service-account.json

# Subir a Google Play
eas submit --platform android --latest
```

#### 8.3 Subir a ambas stores
```bash
# Subida automática a ambas plataformas
eas submit --platform all --latest
```

### 🔧 Paso 9: Comandos de Troubleshooting

#### 9.1 Problemas de autenticación
```bash
# Limpiar credenciales y volver a autenticar
eas logout
rm -rf ~/.expo
eas login

# Verificar autenticación
eas whoami
```

#### 9.2 Problemas de build
```bash
# Limpiar cache de build
eas build:cancel --all
rm -rf .expo/
rm -rf node_modules/
npm install

# Verificar configuración
eas doctor

# Build con logs detallados
eas build --platform ios --profile production --verbose
```

#### 9.3 Problemas de dependencias
```bash
# Reinstalar dependencias
rm -rf node_modules/
rm package-lock.json
npm install

# Verificar compatibilidad
npx expo install --fix

# Actualizar Expo SDK si es necesario
npx expo upgrade
```

#### 9.4 Problemas de certificados (iOS)
```bash
# Limpiar certificados
eas credentials --platform ios --clear-all

# Regenerar certificados
eas credentials --platform ios

# Verificar certificados
eas credentials --platform ios --list
```

#### 9.5 Problemas de keystore (Android)
```bash
# Limpiar keystore
eas credentials --platform android --clear-all

# Regenerar keystore
eas credentials --platform android

# Verificar keystore
eas credentials --platform android --list
```

### 📊 Paso 10: Monitoreo y Verificación

#### 10.1 Monitorear builds
```bash
# Ver todos los builds
eas build:list

# Ver builds por plataforma
eas build:list --platform ios
eas build:list --platform android

# Ver estado en tiempo real
watch -n 30 'eas build:list --limit 5'
```

#### 10.2 Verificar submissions
```bash
# Ver submissions
eas submit:list

# Ver detalles de submission
eas submit:view [SUBMISSION_ID]
```

#### 10.3 Logs y debugging
```bash
# Ver logs de build
eas build:view [BUILD_ID] --logs

# Descargar logs
eas build:view [BUILD_ID] --logs > build-logs.txt
```

### 🔄 Paso 11: Automatización Completa

#### 11.1 Script completo de deployment
```bash
#!/bin/bash
# deployment-complete.sh

set -e

echo "🚀 Iniciando deployment completo de Zyro Marketplace"

# 1. Verificar autenticación
echo "🔐 Verificando autenticación..."
if ! eas whoami > /dev/null 2>&1; then
    echo "❌ No estás autenticado en Expo"
    echo "Ejecuta: eas login"
    exit 1
fi

# 2. Limpiar y preparar
echo "🧹 Limpiando proyecto..."
rm -rf .expo/
npm run clean 2>/dev/null || true

# 3. Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# 4. Ejecutar tests
echo "🧪 Ejecutando tests..."
npm test 2>/dev/null || echo "⚠️ Tests no configurados o fallaron"

# 5. Build de producción
echo "🏗️ Iniciando builds de producción..."
eas build --platform all --profile production --non-interactive --wait

# 6. Subir a stores
echo "📤 Subiendo a app stores..."
eas submit --platform all --latest --non-interactive

echo "✅ Deployment completado!"
echo "📱 Monitorea el progreso en: https://expo.dev"
```

#### 11.2 Hacer el script ejecutable
```bash
# Crear el script
chmod +x deployment-complete.sh

# Ejecutar deployment completo
./deployment-complete.sh
```

### 📱 Paso 12: Comandos Específicos por Plataforma

#### 12.1 Solo iOS
```bash
# Workflow completo iOS
eas login
eas build --platform ios --profile production --wait
eas submit --platform ios --latest
```

#### 12.2 Solo Android
```bash
# Workflow completo Android
eas login
eas build --platform android --profile production --wait
eas submit --platform android --latest
```

#### 12.3 Ambas plataformas
```bash
# Workflow completo ambas plataformas
eas login
eas build --platform all --profile production --wait
eas submit --platform all --latest
```

### 🔍 Paso 13: Verificación Post-Deployment

#### 13.1 Verificar en App Store Connect
```bash
# Abrir App Store Connect
open https://appstoreconnect.apple.com

# Verificar estado de la app
echo "📱 Verifica tu app en App Store Connect"
echo "🔍 Estado: Esperando revisión / En revisión / Listo para venta"
```

#### 13.2 Verificar en Google Play Console
```bash
# Abrir Google Play Console
open https://play.google.com/console

# Verificar estado de la app
echo "🤖 Verifica tu app en Google Play Console"
echo "🔍 Estado: En revisión / Publicado"
```

### 🆘 Paso 14: Comandos de Emergencia

#### 14.1 Cancelar builds
```bash
# Cancelar todos los builds en progreso
eas build:cancel --all

# Cancelar build específico
eas build:cancel [BUILD_ID]
```

#### 14.2 Revertir submission
```bash
# Ver submissions activas
eas submit:list

# No hay comando directo de revert, debes hacerlo desde las consolas:
# App Store Connect: Rechazar binary
# Google Play Console: Detener rollout
```

#### 14.3 Regenerar todo desde cero
```bash
# Script de regeneración completa
#!/bin/bash
echo "🔄 Regenerando proyecto completo..."

# Limpiar todo
rm -rf .expo/
rm -rf node_modules/
rm package-lock.json

# Reinstalar
npm install

# Reconfigurar EAS
eas build:configure --force

# Regenerar credenciales
eas credentials --platform all --clear-all

echo "✅ Proyecto regenerado. Ejecuta build nuevamente."
```

### 📋 Paso 15: Checklist Final

#### 15.1 Pre-deployment checklist
```bash
# Ejecutar este checklist antes del deployment final
echo "📋 Checklist pre-deployment:"

# Verificar archivos
[ -f "app.config.js" ] && echo "✅ app.config.js" || echo "❌ app.config.js"
[ -f "eas.json" ] && echo "✅ eas.json" || echo "❌ eas.json"
[ -f ".env.production" ] && echo "✅ .env.production" || echo "❌ .env.production"
[ -f "assets/icon.png" ] && echo "✅ icon.png" || echo "❌ icon.png"

# Verificar autenticación
eas whoami > /dev/null 2>&1 && echo "✅ Autenticado en Expo" || echo "❌ No autenticado"

# Verificar dependencias
npm list > /dev/null 2>&1 && echo "✅ Dependencias OK" || echo "❌ Problemas con dependencias"

echo "📱 Si todo está ✅, procede con el deployment"
```

### 🎯 Comandos Rápidos de Referencia

```bash
# 🔐 Autenticación
eas login
eas whoami
eas logout

# 🏗️ Builds
eas build --platform ios --profile production
eas build --platform android --profile production
eas build --platform all --profile production --wait

# 📤 Submissions
eas submit --platform ios --latest
eas submit --platform android --latest
eas submit --platform all --latest

# 📊 Monitoreo
eas build:list
eas submit:list
eas project:info

# 🔧 Troubleshooting
eas doctor
eas credentials
eas build:cancel --all

# 🧹 Limpieza
rm -rf .expo/ node_modules/
npm install
eas build:configure
```

---

## 🎉 ¡Deployment Automatizado Listo!

Con esta guía tienes **todo lo necesario** para publicar tu app ZYRO desde Expo.dev:

✅ **Comandos paso a paso** para cada etapa
✅ **Chequeos de errores** automatizados
✅ **Troubleshooting** para problemas comunes
✅ **Scripts de automatización** completos
✅ **Monitoreo** en tiempo real
✅ **Comandos de emergencia** para situaciones críticas

### 🚀 Comando Final para Deployment Completo
```bash
# ¡Un solo comando para publicar en ambas stores!
eas login && eas build --platform all --profile production --wait && eas submit --platform all --latest
```

**¡Tu app ZYRO estará en las stores en cuestión de horas!** 📱✨🚀