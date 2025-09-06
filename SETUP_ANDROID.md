# 🤖 Configuración Android SDK

## Instalar Android Studio
1. Descargar desde: https://developer.android.com/studio
2. Instalar con configuración por defecto
3. Abrir Android Studio y seguir setup wizard

## Configurar Variables de Entorno
Agregar a tu sistema (Panel de Control > Sistema > Variables de entorno):

```
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
```

Agregar al PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

## Verificar Instalación
```bash
adb version
```

## Instalar SDK Components
En Android Studio > SDK Manager, instalar:
- Android SDK Platform-Tools
- Android SDK Build-Tools
- Android 13 (API 33) o superior