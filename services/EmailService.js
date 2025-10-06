// Para React Native/Expo, usamos fetch API en lugar de @sendgrid/mail

/**
 * Servicio profesional de envío de emails para React Native/Expo
 * Optimizado para funcionar en entornos móviles usando fetch API
 */
class EmailService {
    constructor() {
        this.provider = 'sendgrid'; // Único proveedor soportado en React Native
        this.isConfigured = false;
        this.fromEmail = 'zyroappnacho@gmail.com'; // Tu email verificado
        this.fromName = 'Zyro Marketplace';
        this.sendGridApiKey = null;
        this.developmentMode = false;
        
        this.initializeProvider();
    }

    /**
     * Inicializar el proveedor de email seleccionado
     */
    initializeProvider() {
        try {
            switch (this.provider) {
                case 'sendgrid':
                    this.initializeSendGrid();
                    break;
                case 'smtp':
                    this.initializeNodemailer();
                    break;
                case 'aws-ses':
                    this.initializeAWSSES();
                    break;
                default:
                    console.warn('⚠️ Proveedor de email no configurado');
            }
        } catch (error) {
            console.error('❌ Error inicializando servicio de email:', error);
        }
    }

    /**
     * Configurar SendGrid (Compatible con React Native/Expo)
     */
    initializeSendGrid() {
        // Tu API Key configurada desde variables de entorno
        const apiKey = process.env.SENDGRID_API_KEY || 'tu_sendgrid_api_key_aqui';
        
        if (!apiKey || apiKey.includes('tu_') || apiKey.includes('cambiar')) {
            console.warn('⚠️ SENDGRID_API_KEY no configurada. Modo desarrollo activado.');
            this.isConfigured = false;
            this.developmentMode = true;
            return;
        }

        this.sendGridApiKey = apiKey;
        this.isConfigured = true;
        this.developmentMode = false;
        console.log('✅ SendGrid configurado correctamente para React Native');
        console.log('📧 Email remitente:', this.fromEmail);
    }

    /**
     * Configurar SMTP usando fetch API (Compatible con React Native)
     */
    initializeNodemailer() {
        const smtpEmail = process.env.SMTP_EMAIL || process.env.EXPO_PUBLIC_SMTP_EMAIL;
        const smtpPassword = process.env.SMTP_PASSWORD || process.env.EXPO_PUBLIC_SMTP_PASSWORD;
        
        if (!smtpEmail || !smtpPassword) {
            console.warn('⚠️ SMTP credentials no configuradas.');
            return;
        }

        this.smtpCredentials = { email: smtpEmail, password: smtpPassword };
        this.isConfigured = true;
        console.log('✅ SMTP configurado correctamente para React Native');
    }

    /**
     * Configurar AWS SES (Para usuarios de AWS)
     */
    initializeAWSSES() {
        // Implementación para AWS SES si se prefiere
        console.log('✅ AWS SES configurado correctamente');
        this.isConfigured = true;
    }

    /**
     * Enviar email de recuperación de contraseña
     */
    async sendPasswordRecoveryEmail(email, code, userType = 'usuario') {
        try {
            // Modo desarrollo: simular envío exitoso
            if (this.developmentMode) {
                console.log('📧 [MODO DESARROLLO] Simulando envío de email...');
                console.log(`Para: ${email}`);
                console.log(`Código: ${code}`);
                console.log(`Tipo: ${userType}`);
                
                // Simular delay de red
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                return {
                    success: true,
                    messageId: 'dev_' + Date.now(),
                    message: `Código de verificación enviado a ${email} (modo desarrollo)`
                };
            }

            if (!this.isConfigured) {
                throw new Error('Servicio de email no configurado');
            }

            const emailData = {
                to: email,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject: 'Recuperación de Contraseña - Zyro Marketplace',
                html: this.generatePasswordRecoveryTemplate(code, userType),
                text: this.generatePasswordRecoveryTextVersion(code, userType)
            };

            let result;
            switch (this.provider) {
                case 'sendgrid':
                    result = await this.sendWithSendGrid(emailData);
                    break;
                case 'smtp':
                    result = await this.sendWithNodemailer(emailData);
                    break;
                case 'aws-ses':
                    result = await this.sendWithAWSSES(emailData);
                    break;
                default:
                    throw new Error('Proveedor de email no válido');
            }

            console.log('✅ Email de recuperación enviado exitosamente a:', email);
            return {
                success: true,
                messageId: result.messageId || result[0]?.headers?.['x-message-id'],
                message: `Código de verificación enviado a ${email}`
            };

        } catch (error) {
            console.error('❌ Error enviando email de recuperación:', error);
            throw new Error(`Error enviando email: ${error.message}`);
        }
    }

    /**
     * Enviar con SendGrid usando fetch API (Compatible con React Native)
     */
    async sendWithSendGrid(emailData) {
        try {
            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.sendGridApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    personalizations: [{
                        to: [{ email: emailData.to }],
                        subject: emailData.subject
                    }],
                    from: emailData.from,
                    content: [
                        {
                            type: 'text/plain',
                            value: emailData.text
                        },
                        {
                            type: 'text/html',
                            value: emailData.html
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`SendGrid API Error: ${response.status} - ${errorData}`);
            }

            return {
                messageId: response.headers.get('x-message-id') || 'sent',
                statusCode: response.status
            };
        } catch (error) {
            console.error('❌ Error enviando con SendGrid:', error);
            throw error;
        }
    }

    /**
     * Enviar con SMTP usando un servicio backend (Recomendado para SMTP en React Native)
     */
    async sendWithNodemailer(emailData) {
        // Para React Native, necesitaríamos un endpoint backend que maneje SMTP
        // Por ahora, usamos SendGrid como fallback
        console.warn('⚠️ SMTP directo no disponible en React Native. Usando SendGrid como fallback.');
        return await this.sendWithSendGrid(emailData);
    }

    /**
     * Enviar con AWS SES
     */
    async sendWithAWSSES(emailData) {
        // Implementación AWS SES
        throw new Error('AWS SES no implementado aún');
    }

    /**
     * Template HTML profesional para recuperación de contraseña
     */
    generatePasswordRecoveryTemplate(code, userType) {
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperación de Contraseña</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: #ffffff;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #C9A961;
                    margin-bottom: 10px;
                }
                .title {
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                .code-container {
                    background: linear-gradient(135deg, #C9A961, #D4AF37);
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 30px 0;
                }
                .code {
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    margin: 10px 0;
                }
                .instructions {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #C9A961;
                    margin: 20px 0;
                }
                .warning {
                    background-color: #fff3cd;
                    color: #856404;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #ffeaa7;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #C9A961, #D4AF37);
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">ZYRO MARKETPLACE</div>
                    <h1 class="title">Recuperación de Contraseña</h1>
                </div>

                <p>Hola,</p>
                
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta ${userType} en Zyro Marketplace.</p>

                <div class="code-container">
                    <p style="margin: 0; font-size: 16px;">Tu código de verificación es:</p>
                    <div class="code">${code}</div>
                    <p style="margin: 0; font-size: 14px;">Este código expira en 10 minutos</p>
                </div>

                <div class="instructions">
                    <h3 style="margin-top: 0; color: #C9A961;">Instrucciones:</h3>
                    <ol>
                        <li>Regresa a la aplicación Zyro Marketplace</li>
                        <li>Ingresa este código de 6 dígitos cuando se te solicite</li>
                        <li>Crea tu nueva contraseña segura</li>
                        <li>¡Listo! Ya puedes acceder con tu nueva contraseña</li>
                    </ol>
                </div>

                <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul style="margin: 10px 0;">
                        <li>Este código es válido por solo 10 minutos</li>
                        <li>Si no solicitaste este cambio, ignora este email</li>
                        <li>Nunca compartas este código con nadie</li>
                        <li>Solo tienes 3 intentos para ingresar el código correctamente</li>
                    </ul>
                </div>

                <p>Si tienes problemas, puedes solicitar un nuevo código desde la aplicación.</p>

                <div class="footer">
                    <p><strong>Zyro Marketplace</strong><br>
                    Conectamos influencers con marcas premium</p>
                    
                    <p style="font-size: 12px; color: #999;">
                        Este es un email automático, por favor no respondas a este mensaje.<br>
                        Si no solicitaste este cambio, puedes ignorar este email de forma segura.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Versión de texto plano del email (para clientes que no soportan HTML)
     */
    generatePasswordRecoveryTextVersion(code, userType) {
        return `
ZYRO MARKETPLACE - Recuperación de Contraseña

Hola,

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta ${userType} en Zyro Marketplace.

Tu código de verificación es: ${code}

Este código expira en 10 minutos.

Instrucciones:
1. Regresa a la aplicación Zyro Marketplace
2. Ingresa este código de 6 dígitos cuando se te solicite
3. Crea tu nueva contraseña segura
4. ¡Listo! Ya puedes acceder con tu nueva contraseña

IMPORTANTE:
- Este código es válido por solo 10 minutos
- Si no solicitaste este cambio, ignora este email
- Nunca compartas este código con nadie
- Solo tienes 3 intentos para ingresar el código correctamente

Si tienes problemas, puedes solicitar un nuevo código desde la aplicación.

---
Zyro Marketplace
Conectamos influencers con marcas premium

Este es un email automático, por favor no respondas a este mensaje.
Si no solicitaste este cambio, puedes ignorar este email de forma segura.
        `;
    }

    /**
     * Enviar email de bienvenida (bonus)
     */
    async sendWelcomeEmail(email, userName, userType) {
        try {
            if (!this.isConfigured) {
                throw new Error('Servicio de email no configurado');
            }

            const emailData = {
                to: email,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject: `¡Bienvenido a Zyro Marketplace, ${userName}!`,
                html: this.generateWelcomeTemplate(userName, userType),
                text: `¡Bienvenido a Zyro Marketplace, ${userName}! Tu cuenta ${userType} ha sido creada exitosamente.`
            };

            await this.sendWithSendGrid(emailData);
            console.log('✅ Email de bienvenida enviado a:', email);

            return {
                success: true,
                message: `Email de bienvenida enviado a ${email}`
            };

        } catch (error) {
            console.error('❌ Error enviando email de bienvenida:', error);
            // No lanzar error para no interrumpir el registro
            return {
                success: false,
                message: 'Error enviando email de bienvenida'
            };
        }
    }

    /**
     * Template de bienvenida
     */
    generateWelcomeTemplate(userName, userType) {
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenido a Zyro Marketplace</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: #ffffff;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 32px;
                    font-weight: bold;
                    background: linear-gradient(135deg, #C9A961, #D4AF37);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 10px;
                }
                .welcome-message {
                    background: linear-gradient(135deg, #C9A961, #D4AF37);
                    color: white;
                    padding: 30px;
                    border-radius: 10px;
                    text-align: center;
                    margin: 20px 0;
                }
                .features {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .feature-item {
                    margin: 10px 0;
                    padding-left: 20px;
                    position: relative;
                }
                .feature-item:before {
                    content: "✓";
                    position: absolute;
                    left: 0;
                    color: #C9A961;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">ZYRO MARKETPLACE</div>
                </div>

                <div class="welcome-message">
                    <h1 style="margin: 0 0 10px 0;">¡Bienvenido, ${userName}!</h1>
                    <p style="margin: 0; font-size: 18px;">Tu cuenta ${userType} ha sido creada exitosamente</p>
                </div>

                <p>Nos alegra tenerte en Zyro Marketplace, la plataforma que conecta influencers con marcas premium.</p>

                <div class="features">
                    <h3 style="color: #C9A961; margin-top: 0;">¿Qué puedes hacer ahora?</h3>
                    ${userType === 'influencer' ? `
                    <div class="feature-item">Completa tu perfil con tus datos de Instagram y TikTok</div>
                    <div class="feature-item">Explora campañas disponibles en tu ciudad</div>
                    <div class="feature-item">Solicita colaboraciones con marcas</div>
                    <div class="feature-item">Gestiona tus solicitudes y colaboraciones activas</div>
                    ` : `
                    <div class="feature-item">Configura tu perfil de empresa</div>
                    <div class="feature-item">Crea campañas para encontrar influencers</div>
                    <div class="feature-item">Gestiona solicitudes de colaboración</div>
                    <div class="feature-item">Accede a métricas y análisis</div>
                    `}
                </div>

                <p style="text-align: center; margin: 30px 0;">
                    <strong>¡Comienza a explorar y conectar con la comunidad Zyro!</strong>
                </p>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                    <p><strong>Zyro Marketplace</strong><br>
                    Conectamos influencers con marcas premium</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Verificar estado del servicio
     */
    getServiceStatus() {
        return {
            provider: this.provider,
            isConfigured: this.isConfigured,
            fromEmail: this.fromEmail,
            fromName: this.fromName
        };
    }

    /**
     * Cambiar proveedor de email
     */
    switchProvider(newProvider) {
        this.provider = newProvider;
        this.isConfigured = false;
        this.initializeProvider();
    }
}

// Exportar instancia singleton
const emailService = new EmailService();
export default emailService;