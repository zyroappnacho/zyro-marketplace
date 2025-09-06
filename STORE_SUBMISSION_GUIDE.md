# 📱 Zyro Marketplace - Guía Completa de Publicación en Stores

## 🚀 Resumen Ejecutivo

Esta guía te llevará paso a paso para publicar Zyro Marketplace en **App Store** (iOS) y **Google Play** (Android), siendo 100% fiel a todos los requirements, design y tasks definidos.

---

## 📋 Checklist Pre-Publicación

### ✅ Preparación General
- [ ] Cuenta de desarrollador Apple ($99/año)
- [ ] Cuenta de desarrollador Google Play ($25 único)
- [ ] EAS CLI instalado y configurado
- [ ] Todos los assets gráficos preparados
- [ ] Textos de store en español e inglés
- [ ] Política de privacidad publicada
- [ ] Términos de servicio publicados

### ✅ Configuración Técnica
- [ ] `app.config.js` configurado
- [ ] `eas.json` configurado
- [ ] Variables de entorno de producción
- [ ] Certificados y keystores configurados
- [ ] Firebase configurado para producción
- [ ] Analytics y crash reporting configurados

---

## 🍎 Publicación en App Store (iOS)

### Paso 1: Configuración de App Store Connect

#### 1.1 Crear la App
```bash
# Ir a https://appstoreconnect.apple.com
# Apps > + > Nueva App
```

**Información de la App:**
- **Nombre**: Zyro Marketplace
- **Idioma principal**: Español (España)
- **Bundle ID**: com.zyromarketplace.app
- **SKU**: zyro-marketplace-ios
- **Acceso de usuario**: Acceso completo

#### 1.2 Información de la App

**Información General:**
```
Nombre: Zyro Marketplace
Subtítulo: Colaboraciones Premium
```

**Descripción:**
```
Zyro es la plataforma premium que conecta influencers cualificados con empresas exclusivas para colaboraciones de alta calidad.

🌟 PARA INFLUENCERS:
• Accede a colaboraciones exclusivas con marcas premium
• Recibe productos y servicios de alta calidad
• Crea contenido auténtico y profesional
• Conecta con empresas verificadas
• Gestiona tus colaboraciones desde una app elegante

🏢 PARA EMPRESAS:
• Conecta con influencers verificados y de calidad
• Gestiona tus campañas desde un panel profesional
• Accede a métricas detalladas y analytics
• Suscripción fija sin comisiones por colaboración
• Soporte dedicado y personalizado

✨ CARACTERÍSTICAS PREMIUM:
• Diseño elegante con estética dorada
• Navegación intuitiva y fluida
• Sistema de aprobación manual para calidad
• Chat integrado entre todas las partes
• Mapa interactivo de colaboraciones
• Historial completo de actividades

🔒 SEGURIDAD Y PRIVACIDAD:
• Todos los usuarios son verificados manualmente
• Cumplimiento total con GDPR
• Datos encriptados y seguros
• Transacciones protegidas

Zyro no es solo una app, es tu puerta de entrada a colaboraciones premium y auténticas. Únete a la comunidad más exclusiva de influencers y empresas.
```

**Palabras clave:**
```
influencer,colaboraciones,marketing,empresas,premium,contenido,redes sociales,instagram,tiktok,marcas
```

**URL de soporte**: https://zyromarketplace.com/support
**URL de marketing**: https://zyromarketplace.com
**URL de política de privacidad**: https://zyromarketplace.com/privacy

#### 1.3 Precios y Disponibilidad
- **Precio**: Gratis
- **Disponibilidad**: Todos los territorios
- **Fecha de lanzamiento**: Manual

#### 1.4 Información de Revisión

**Información de contacto:**
- **Nombre**: Equipo Zyro
- **Apellido**: Marketplace
- **Teléfono**: +34-900-123-456
- **Email**: review@zyromarketplace.com

**Cuenta de demostración:**
- **Usuario**: demo_influencer
- **Contraseña**: Demo123!
- **Notas**: Cuenta de demostración para revisar todas las funcionalidades de influencer. También pueden usar 'demo_empresa' / 'Demo123!' para el rol de empresa.

**Notas adicionales:**
```
Zyro Marketplace es una plataforma premium que conecta influencers verificados con empresas exclusivas.

CÓMO PROBAR LA APP:
1. Usar cuenta demo: demo_influencer / Demo123!
2. O registrarse como nuevo usuario (requiere aprobación manual)
3. Explorar colaboraciones disponibles
4. Probar filtros por ciudad y categoría
5. Ver detalles de colaboraciones
6. Acceder al mapa interactivo
7. Revisar perfil y configuraciones

CARACTERÍSTICAS ÚNICAS:
• Todos los usuarios son verificados manualmente por el administrador
• Las empresas pagan suscripción fija (no comisiones)
• Los influencers reciben productos/servicios (no dinero)
• Diseño premium con colores dorado y negro
• Control total del administrador sobre campañas

La app cumple con todas las directrices de App Store y no contiene contenido objetable.
```

#### 1.5 Clasificación por Edades
- **Clasificación**: 4+
- **Contenido**: Sin contenido objetable

### Paso 2: Subir Assets

#### 2.1 Icono de la App
- **Tamaño**: 1024x1024px
- **Formato**: PNG sin transparencia
- **Contenido**: Logo Zyro con fondo dorado

#### 2.2 Screenshots (iPhone 6.7")
1. **Pantalla de Bienvenida** - Logo Zyro con opciones de rol
2. **Login** - Selección entre Influencer, Empresa, Admin
3. **Home** - Lista de colaboraciones con filtros
4. **Detalles** - Información completa de colaboración
5. **Mapa** - Mapa interactivo de España
6. **Perfil** - Gestión de perfil del usuario

#### 2.3 Video de Vista Previa (Opcional)
- **Duración**: 15-30 segundos
- **Resolución**: 1080x1920
- **Contenido**: Navegación fluida por la app

### Paso 3: Build y Subida

```bash
# Construir para iOS
eas build --platform ios --profile production

# Subir a App Store
eas submit --platform ios
```

---

## 🤖 Publicación en Google Play (Android)

### Paso 1: Configuración de Google Play Console

#### 1.1 Crear la App
```bash
# Ir a https://play.google.com/console
# Crear aplicación
```

**Información de la App:**
- **Nombre de la app**: Zyro Marketplace
- **Idioma predeterminado**: Español (España)
- **Tipo de app**: App
- **Gratis o de pago**: Gratis

#### 1.2 Ficha de Play Store

**Descripción breve:**
```
Plataforma premium para colaboraciones entre influencers y empresas exclusivas
```

**Descripción completa:**
```
Zyro es la plataforma premium que conecta influencers cualificados con empresas exclusivas para colaboraciones de alta calidad.

🌟 PARA INFLUENCERS:
• Accede a colaboraciones exclusivas con marcas premium
• Recibe productos y servicios de alta calidad
• Crea contenido auténtico y profesional
• Conecta con empresas verificadas
• Gestiona tus colaboraciones desde una app elegante

🏢 PARA EMPRESAS:
• Conecta con influencers verificados y de calidad
• Gestiona tus campañas desde un panel profesional
• Accede a métricas detalladas y analytics
• Suscripción fija sin comisiones por colaboración
• Soporte dedicado y personalizado

✨ CARACTERÍSTICAS PREMIUM:
• Diseño elegante con estética dorada
• Navegación intuitiva y fluida
• Sistema de aprobación manual para calidad
• Chat integrado entre todas las partes
• Mapa interactivo de colaboraciones
• Historial completo de actividades

🔒 SEGURIDAD Y PRIVACIDAD:
• Todos los usuarios son verificados manualmente
• Cumplimiento total con GDPR
• Datos encriptados y seguros
• Transacciones protegidas

🎯 CÓMO FUNCIONA:
1. Regístrate como influencer o empresa
2. Espera la aprobación manual (24-48h)
3. Explora colaboraciones disponibles
4. Solicita las que te interesen
5. Conecta y colabora con marcas premium

Zyro no es solo una app, es tu puerta de entrada a colaboraciones premium y auténticas. Únete a la comunidad más exclusiva de influencers y empresas.

📍 Disponible inicialmente en Madrid, Barcelona, Valencia y Sevilla.
🏷️ Categorías: Gastronomía, Moda, Belleza, Tecnología, Viajes y más.
```

#### 1.3 Assets Gráficos

**Icono de la app:**
- **Tamaño**: 512x512px
- **Formato**: PNG con transparencia

**Gráfico destacado:**
- **Tamaño**: 1024x500px
- **Contenido**: Logo Zyro con texto "Colaboraciones Premium"

**Screenshots del teléfono (mínimo 2, máximo 8):**
1. Pantalla de bienvenida
2. Sistema de login
3. Lista de colaboraciones
4. Detalles de colaboración
5. Mapa interactivo
6. Perfil de usuario
7. Dashboard de empresa
8. Panel de administrador

#### 1.4 Categorización y Detalles

**Categoría de la app**: Empresa
**Etiquetas**: influencer, colaboraciones, marketing, empresas, premium

**Información de contacto:**
- **Email**: soporte@zyromarketplace.com
- **Teléfono**: +34-900-123-456
- **Sitio web**: https://zyromarketplace.com
- **Política de privacidad**: https://zyromarketplace.com/privacy

### Paso 2: Clasificación de Contenido

#### 2.1 Cuestionario de Clasificación
- **Violencia**: No
- **Contenido sexual**: No
- **Lenguaje soez**: No
- **Drogas**: No
- **Apuestas simuladas**: No
- **Compras digitales**: No
- **Ubicación**: Sí (para mostrar colaboraciones cercanas)
- **Información personal**: Sí (perfil de usuario)

**Clasificación resultante**: PEGI 3

### Paso 3: Público Objetivo y Contenido

#### 3.1 Público Objetivo
- **Grupo de edad principal**: 18-24, 25-34
- **Intereses**: Marketing, redes sociales, negocios
- **Dirigido a niños**: No

#### 3.2 Configuración de Contenido
- **Anuncios**: No contiene anuncios
- **Compras en la app**: No
- **Contenido generado por usuarios**: Sí (perfiles y mensajes)
- **Moderación**: Sí (aprobación manual)

### Paso 4: Build y Subida

```bash
# Configurar service account
# Descargar google-service-account.json desde Play Console

# Construir para Android
eas build --platform android --profile production

# Subir a Google Play
eas submit --platform android
```

---

## 🛠️ Scripts de Automatización

### Build de Producción
```bash
# Hacer ejecutable
chmod +x scripts/build-production.sh

# Ejecutar build completo
./scripts/build-production.sh

# Solo iOS
./scripts/build-production.sh --ios-only

# Solo Android
./scripts/build-production.sh --android-only
```

### Subida a Stores
```bash
# Hacer ejecutable
chmod +x scripts/submit-stores.sh

# Ejecutar subida
./scripts/submit-stores.sh
```

### PowerShell (Windows)
```powershell
# Build de producción
.\scripts\build-production.ps1

# Solo iOS
.\scripts\build-production.ps1 -iOSOnly

# Solo Android
.\scripts\build-production.ps1 -AndroidOnly
```

---

## 📊 Monitoreo Post-Lanzamiento

### Métricas Clave a Seguir
- **Descargas**: Número de instalaciones
- **Retención**: Usuarios activos diarios/mensuales
- **Ratings**: Puntuación en stores
- **Reviews**: Comentarios de usuarios
- **Crashes**: Estabilidad de la app
- **Performance**: Tiempo de carga y respuesta

### Herramientas de Analytics
- **Firebase Analytics**: Comportamiento de usuarios
- **Crashlytics**: Reportes de crashes
- **App Store Connect**: Métricas de iOS
- **Google Play Console**: Métricas de Android

---

## 🔧 Troubleshooting

### Problemas Comunes

#### iOS
- **Certificado expirado**: Renovar en Apple Developer
- **Bundle ID duplicado**: Verificar unicidad
- **Metadata rechazada**: Revisar guidelines de App Store

#### Android
- **Keystore perdido**: Usar Android App Bundle
- **Permisos excesivos**: Revisar permisos necesarios
- **Target SDK**: Mantener actualizado

### Contactos de Soporte
- **Apple Developer Support**: https://developer.apple.com/support/
- **Google Play Support**: https://support.google.com/googleplay/android-developer/
- **Expo Support**: https://expo.dev/support

---

## 📅 Timeline de Publicación

### Semana 1: Preparación
- [ ] Configurar cuentas de desarrollador
- [ ] Crear assets gráficos
- [ ] Escribir descripciones de store
- [ ] Configurar analytics y monitoring

### Semana 2: Build y Testing
- [ ] Configurar builds de producción
- [ ] Testing en dispositivos reales
- [ ] Optimización de performance
- [ ] Preparación de certificados

### Semana 3: Subida y Revisión
- [ ] Subir a App Store Connect
- [ ] Subir a Google Play Console
- [ ] Completar información de stores
- [ ] Enviar para revisión

### Semana 4: Lanzamiento
- [ ] Monitorear proceso de revisión
- [ ] Responder a feedback de reviewers
- [ ] Lanzamiento público
- [ ] Marketing y promoción

---

## 🎉 ¡Listo para Publicar!

Con esta guía completa y todos los archivos de configuración creados, tu app Zyro Marketplace está lista para ser publicada en App Store y Google Play, manteniendo total fidelidad a todos los requirements, design y tasks definidos.

### Comandos Finales

```bash
# 1. Build de producción
./scripts/build-production.sh

# 2. Subir a stores
./scripts/submit-stores.sh

# 3. Monitorear estado
eas submit:list
```

**¡Tu app premium está lista para conquistar las stores!** 🚀📱✨