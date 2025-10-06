# 📧 Guía de Configuración de Email para Producción

## 🎯 Resumen

El sistema de recuperación de contraseña ahora está configurado para enviar **emails reales** en producción. Esta guía te ayudará a configurar el servicio de email paso a paso.

## 🚀 Opción 1: SendGrid (Recomendado)

SendGrid es el servicio más confiable y fácil de configurar para aplicaciones móviles.

### Paso 1: Crear cuenta en SendGrid

1. Ve a [SendGrid.com](https://sendgrid.com)
2. Crea una cuenta gratuita (incluye 100 emails/día gratis)
3. Verifica tu email y completa el setup inicial

### Paso 2: Obtener API Key

1. Ve a **Settings** → **API Keys**
2. Haz clic en **Create API Key**
3. Selecciona **Full Access** (o **Restricted Access** con permisos de Mail Send)
4. Copia la API Key generada

### Paso 3: Verificar dominio (Importante)

1. Ve a **Settings** → **Sender Authentication**
2. Haz clic en **Verify a Single Sender** (para pruebas)
3. O configura **Domain Authentication** (para producción)
4. Completa la verificación siguiendo las instrucciones

### Paso 4: Configurar variables de entorno

Edita el archivo `.env`:

```bash
# Pega tu API Key real aquí
SENDGRID_API_KEY=SG.tu_api_key_real_aqui

# Usa el email verificado en SendGrid
FROM_EMAIL=noreply@tudominio.com
FROM_NAME=Tu App Name
```

### Paso 5: Probar configuración

```javascript
// Ejecutar en la consola de desarrollo
import EmailService from './services/EmailService';

// Verificar estado
console.log(EmailService.getServiceStatus());

// Enviar email de prueba
await EmailService.sendPasswordRecoveryEmail('tu_email@gmail.com', '123456', 'influencer');
```

## 🚀 Opción 2: Gmail/SMTP (Alternativa)

Si prefieres usar Gmail u otro proveedor SMTP:

### Paso 1: Configurar Gmail

1. Activa la **verificación en 2 pasos** en tu cuenta Gmail
2. Ve a **Configuración** → **Seguridad** → **Contraseñas de aplicaciones**
3. Genera una **contraseña de aplicación** para "Correo"

### Paso 2: Configurar variables

```bash
# En .env
SMTP_EMAIL=tu_email@gmail.com
SMTP_PASSWORD=tu_password_de_aplicacion_generada
```

### Paso 3: Cambiar proveedor en EmailService

```javascript
// En EmailService.js, cambiar:
this.provider = 'smtp'; // en lugar de 'sendgrid'
```

## 🚀 Opción 3: AWS SES (Para usuarios de AWS)

Si ya usas AWS, SES es muy económico:

### Paso 1: Configurar AWS SES

1. Ve a la consola de AWS SES
2. Verifica tu dominio o email
3. Obtén tus credenciales de acceso

### Paso 2: Configurar variables

```bash
# En .env
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_REGION=us-east-1
```

## 📱 Configuración para React Native/Expo

### Paso 1: Instalar dependencias

```bash
npm install @sendgrid/mail nodemailer
```

### Paso 2: Configurar variables de entorno en Expo

Para Expo, usa `expo-constants` y configura en `app.json`:

```json
{
  "expo": {
    "extra": {
      "sendgridApiKey": "tu_api_key",
      "fromEmail": "noreply@tudominio.com"
    }
  }
}
```

O usa variables de entorno con prefijo `EXPO_PUBLIC_`:

```bash
EXPO_PUBLIC_SENDGRID_API_KEY=tu_api_key
```

## 🧪 Pruebas de Funcionamiento

### Script de prueba completo

```javascript
// test-email-production.js
import EmailService from './services/EmailService';
import PasswordRecoveryService from './services/PasswordRecoveryService';

const testEmailProduction = async () => {
    console.log('🧪 Probando sistema de email en producción...');
    
    try {
        // 1. Verificar configuración
        const status = EmailService.getServiceStatus();
        console.log('Estado del servicio:', status);
        
        if (!status.isConfigured) {
            throw new Error('❌ Servicio de email no configurado');
        }
        
        // 2. Probar envío de email de recuperación
        const testEmail = 'tu_email_de_prueba@gmail.com';
        const testCode = '123456';
        
        const result = await EmailService.sendPasswordRecoveryEmail(testEmail, testCode, 'influencer');
        
        if (result.success) {
            console.log('✅ Email enviado exitosamente');
            console.log('Message ID:', result.messageId);
        } else {
            throw new Error('❌ Error enviando email');
        }
        
        // 3. Probar flujo completo
        console.log('🔄 Probando flujo completo...');
        
        // Simular verificación de email
        const emailExists = await PasswordRecoveryService.verifyEmailExists(testEmail);
        console.log('Email existe:', emailExists);
        
        // Generar y enviar código
        const code = PasswordRecoveryService.generateVerificationCode(testEmail);
        await PasswordRecoveryService.sendRecoveryEmail(testEmail, code);
        
        console.log('🎉 ¡Pruebas completadas exitosamente!');
        console.log('📧 Revisa tu bandeja de entrada');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
};

// Ejecutar pruebas
testEmailProduction();
```

## 🔒 Seguridad y Mejores Prácticas

### Variables de entorno seguras

```bash
# ❌ NUNCA hagas esto
SENDGRID_API_KEY=SG.mi_api_key_real

# ✅ Usa variables de entorno del sistema
export SENDGRID_API_KEY="tu_api_key_real"
```

### Validación de emails

```javascript
// Validar formato de email antes de enviar
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};
```

### Rate limiting

```javascript
// Limitar envíos por IP/usuario
const rateLimiter = {
    attempts: new Map(),
    maxAttempts: 3,
    timeWindow: 3600000, // 1 hora
    
    canSend(identifier) {
        const now = Date.now();
        const attempts = this.attempts.get(identifier) || [];
        const recentAttempts = attempts.filter(time => now - time < this.timeWindow);
        
        return recentAttempts.length < this.maxAttempts;
    }
};
```

## 📊 Monitoreo y Métricas

### Logs importantes

```javascript
// Registrar eventos importantes
const logEmailEvent = (event, email, success, error = null) => {
    console.log(`📧 [${new Date().toISOString()}] ${event}:`, {
        email: email.replace(/(.{3}).*@/, '$1***@'), // Ofuscar email
        success,
        error: error?.message,
        timestamp: Date.now()
    });
};
```

### Métricas de SendGrid

1. Ve a **Activity** en tu dashboard de SendGrid
2. Monitorea tasas de entrega, rebotes y spam
3. Configura webhooks para eventos en tiempo real

## 🚨 Solución de Problemas

### Error: "API Key not configured"

```bash
# Verificar que la variable esté configurada
echo $SENDGRID_API_KEY

# O en Node.js
console.log(process.env.SENDGRID_API_KEY);
```

### Error: "Sender not verified"

1. Ve a SendGrid → Settings → Sender Authentication
2. Verifica tu email o dominio
3. Espera la confirmación por email

### Emails van a spam

1. Configura SPF, DKIM y DMARC records
2. Usa un dominio propio verificado
3. Evita palabras spam en el contenido
4. Mantén buena reputación de envío

### Error: "Rate limit exceeded"

```javascript
// Implementar retry con backoff exponencial
const sendWithRetry = async (emailData, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await EmailService.sendPasswordRecoveryEmail(...emailData);
        } catch (error) {
            if (error.code === 429 && i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                continue;
            }
            throw error;
        }
    }
};
```

## ✅ Checklist de Producción

- [ ] API Key de SendGrid configurada
- [ ] Dominio/email verificado en SendGrid
- [ ] Variables de entorno configuradas
- [ ] Pruebas de envío realizadas
- [ ] Templates de email revisados
- [ ] Rate limiting implementado
- [ ] Logs y monitoreo configurados
- [ ] Manejo de errores implementado
- [ ] Fallbacks configurados
- [ ] Documentación actualizada

## 🎉 ¡Listo para Producción!

Una vez completados estos pasos, tu sistema de recuperación de contraseña enviará emails reales y profesionales a tus usuarios. Los emails incluyen:

- ✅ Diseño profesional y responsive
- ✅ Código de verificación destacado
- ✅ Instrucciones claras paso a paso
- ✅ Medidas de seguridad explicadas
- ✅ Branding de tu aplicación
- ✅ Versión texto plano para compatibilidad

¡Tu aplicación ahora tiene un sistema de recuperación de contraseña de nivel empresarial! 🚀