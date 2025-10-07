# Guía Completa de Deployment a Apple App Store - ZyroMarketplace

## PASO 1: Configuración Inicial (HACER FUERA DE KIRO)

### 1.1 Instalar EAS CLI
```bash
npm install -g @expo/eas-cli
```

### 1.2 Login en Expo
```bash
expo login
# Usa tus credenciales de Expo.dev
```

### 1.3 Login en EAS
```bash
eas login
# Usa las mismas credenciales
```

## PASO 2: Configurar el Proyecto

### 2.1 Inicializar EAS en el proyecto
```bash
cd ZyroMarketplace
eas build:configure
```

### 2.2 Actualizar app.json con tus datos reales
Necesitas cambiar estos valores en `app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "TU_PROJECT_ID_REAL_DE_EXPO"
      }
    },
    "owner": "TU_USERNAME_DE_EXPO"
  }
}
```

### 2.3 Actualizar eas.json con tus datos de Apple
En `eas.json`, actualiza la sección submit:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "TU_APPLE_ID@email.com",
        "ascAppId": "ID_DE_TU_APP_EN_APP_STORE_CONNECT",
        "appleTeamId": "TU_TEAM_ID_DE_APPLE_DEVELOPER"
      }
    }
  }
}
```

## PASO 3: Crear App en App Store Connect (HACER EN NAVEGADOR)

### 3.1 Ir a App Store Connect
- Ve a https://appstoreconnect.apple.com
- Inicia sesión con tu Apple Developer Account

### 3.2 Crear Nueva App
1. Haz clic en "My Apps" → "+" → "New App"
2. Completa:
   - **Platform**: iOS
   - **Name**: ZYRO Marketplace
   - **Primary Language**: Spanish (Spain)
   - **Bundle ID**: com.zyro.marketplace
   - **SKU**: zyro-marketplace-001

### 3.3 Obtener IDs necesarios
- **App Store Connect ID**: Lo encuentras en la URL de tu app
- **Team ID**: En Apple Developer → Membership

## PASO 4: Preparar Metadata y Screenshots

### 4.1 Descripción de la App (para App Store Connect)
```
ZYRO Marketplace - Conecta Marcas con Influencers

🚀 CARACTERÍSTICAS PRINCIPALES:
• Plataforma completa de marketing de influencers
• Gestión avanzada de campañas publicitarias
• Perfiles detallados con métricas EMV (Earned Media Value)
• Sistema de pagos seguro con Stripe
• Geolocalización de campañas por ciudades
• Panel administrativo completo

💼 PARA EMPRESAS:
• Encuentra influencers perfectos para tu marca
• Gestiona múltiples campañas simultáneamente
• Suscripciones flexibles (mensual, trimestral, anual)
• Analíticas detalladas de rendimiento

📱 PARA INFLUENCERS:
• Monetiza tu contenido en redes sociales
• Conecta con marcas relevantes de tu sector
• Gestión simplificada de colaboraciones
• Registro gratuito y fácil de usar

🔒 SEGURIDAD Y PRIVACIDAD:
• Cumplimiento total con GDPR
• Pagos externos seguros (sin comisiones de Apple)
• Datos encriptados y protegidos
• Autenticación segura

Únete a la revolución del marketing de influencers con ZYRO Marketplace.
```

### 4.2 Keywords
```
influencer, marketing, campañas, marcas, colaboraciones, redes sociales, monetización, publicidad, contenido, instagram, emv, earned media value
```

### 4.3 Screenshots Necesarios
Necesitas tomar screenshots en estos tamaños:
- **iPhone 6.7"**: 1290 x 2796 pixels (iPhone 14 Pro Max)
- **iPhone 6.5"**: 1242 x 2688 pixels (iPhone 11 Pro Max)
- **iPhone 5.5"**: 1242 x 2208 pixels (iPhone 8 Plus)

**Screenshots recomendados:**
1. Pantalla de bienvenida/login
2. Dashboard de influencer
3. Dashboard de empresa
4. Mapa de campañas
5. Perfil de influencer con métricas EMV

## PASO 5: Información para Revisores de Apple

### 5.1 Cuentas de Prueba (usar estas credenciales exactas)
```
INFLUENCER:
Email: colabos.nachodeborbon@gmail.com
Password: Nacho12345

EMPRESA:
Email: empresa@zyro.com
Password: Empresa1234

ADMINISTRADOR:
Email: admin_zyrovip
Password: xarrec-2paqra-guftoN5
```

### 5.2 Notas para el Review
```
INFORMACIÓN PARA REVISORES DE APPLE:

ZYRO Marketplace es una plataforma B2B que conecta marcas con influencers para campañas de marketing.

FUNCIONALIDADES PRINCIPALES:
1. Registro como Influencer o Empresa (gratuito para influencers)
2. Sistema de suscripciones para empresas (pagos externos con Stripe)
3. Geolocalización para campañas locales
4. Métricas EMV (Earned Media Value) para influencers
5. Panel administrativo para gestión de la plataforma

SISTEMA DE PAGOS:
- Los pagos se procesan externamente a través de Stripe
- NO hay compras in-app ni bienes digitales
- Las empresas pagan suscripciones para acceder a la plataforma
- Los influencers NO reciben pagos a través de la app
- Cumple con las directrices de Apple sobre pagos externos

PRIVACIDAD Y SEGURIDAD:
- Cumplimiento total con GDPR
- Política de privacidad completa incluida
- Términos de servicio disponibles
- Datos encriptados y seguros

La app está completamente funcional y lista para producción.
```

## PASO 6: Build de Producción

### 6.1 Limpiar y preparar
```bash
cd ZyroMarketplace
expo r -c
```

### 6.2 Crear build para iOS
```bash
eas build --platform ios --profile production
```

Este proceso tomará 15-25 minutos. Recibirás un enlace para descargar el .ipa cuando termine.

## PASO 7: Subir a App Store

### 7.1 Opción 1: EAS Submit (Recomendado)
```bash
eas submit --platform ios --profile production
```

### 7.2 Opción 2: Transporter (Manual)
1. Descarga el .ipa del build
2. Usa la app Transporter de Apple para subirlo

## PASO 8: Configurar en App Store Connect

### 8.1 Completar Información de la App
1. Ve a tu app en App Store Connect
2. Crea versión 1.0.0
3. Sube screenshots
4. Completa metadata
5. Selecciona el build subido

### 8.2 Pricing and Availability
- **Price**: Free
- **Availability**: All countries and regions

### 8.3 App Review Information
- **Demo Account**: Usar las credenciales proporcionadas arriba
- **Notes**: Copiar las notas para revisores
- **Contact Information**: Tu información de contacto

## PASO 9: Envío para Revisión

### 9.1 Verificar que todo esté completo
- [ ] Build subido y seleccionado
- [ ] Screenshots subidos
- [ ] Metadata completa
- [ ] Cuentas de prueba configuradas
- [ ] Notas para revisores añadidas

### 9.2 Enviar para Review
1. Haz clic en "Submit for Review"
2. Responde las preguntas:
   - **Export Compliance**: No
   - **Content Rights**: Apropiado
   - **Advertising Identifier**: Sí (si usas analytics)

## TIEMPOS ESPERADOS
- **Build**: 15-25 minutos
- **Review de Apple**: 24-48 horas (primera vez puede ser hasta 7 días)

## POSIBLES PROBLEMAS Y SOLUCIONES

### Problema: Rechazo por pagos
**Solución**: Enfatizar que son pagos externos, no in-app purchases

### Problema: Metadata incompleta
**Solución**: Verificar que todos los campos estén completos

### Problema: Screenshots no válidos
**Solución**: Asegurar que muestren funcionalidad real de la app

¡Tu app está lista para el App Store! 🚀