import StorageService from './StorageService';
import EmailService from './EmailService';

class PasswordRecoveryService {
    constructor() {
        this.recoveryAttempts = new Map(); // Para limitar intentos
        this.generatedCodes = new Map(); // Para almacenar códigos temporalmente
    }

    // Verificar si el email existe en cualquier sistema
    async verifyEmailExists(email) {
        try {
            console.log('🔍 Verificando existencia del email:', email);

            // Buscar en usuarios aprobados
            const approvedUser = await StorageService.getApprovedUserByEmail(email);
            if (approvedUser) {
                console.log('✅ Email encontrado en usuarios aprobados');
                return { exists: true, userType: approvedUser.role, userId: approvedUser.id };
            }

            // Buscar en credenciales de login
            const loginCredentials = await StorageService.getData('login_credentials') || {};
            if (loginCredentials[email]) {
                console.log('✅ Email encontrado en credenciales de login');
                return { 
                    exists: true, 
                    userType: loginCredentials[email].role, 
                    userId: loginCredentials[email].userId 
                };
            }

            // Buscar en usuarios registrados
            const registeredUsers = await StorageService.getData('registered_users') || [];
            const foundUser = registeredUsers.find(user => user.email === email);
            if (foundUser) {
                console.log('✅ Email encontrado en usuarios registrados');
                return { exists: true, userType: foundUser.userType || 'influencer', userId: foundUser.id };
            }

            // Buscar en lista de influencers
            const influencersList = await StorageService.getInfluencersList() || [];
            const influencer = influencersList.find(i => i.email === email);
            if (influencer) {
                console.log('✅ Email encontrado en lista de influencers');
                return { exists: true, userType: 'influencer', userId: influencer.id };
            }

            // Buscar en lista de empresas
            const companiesList = await StorageService.getCompaniesList() || [];
            const company = companiesList.find(c => c.email === email);
            if (company) {
                console.log('✅ Email encontrado en lista de empresas');
                return { exists: true, userType: 'company', userId: company.id };
            }

            console.log('❌ Email no encontrado en ningún sistema');
            return { exists: false };
        } catch (error) {
            console.error('❌ Error verificando email:', error);
            return { exists: false };
        }
    }

    // Generar código de verificación
    generateVerificationCode(email) {
        // Verificar límite de intentos (máximo 3 por hora)
        const now = Date.now();
        const attempts = this.recoveryAttempts.get(email) || [];
        const recentAttempts = attempts.filter(time => now - time < 3600000); // 1 hora

        if (recentAttempts.length >= 3) {
            throw new Error('Demasiados intentos de recuperación. Inténtalo más tarde.');
        }

        // Generar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Almacenar código con expiración de 10 minutos
        this.generatedCodes.set(email, {
            code,
            expiresAt: now + 600000, // 10 minutos
            attempts: 0
        });

        // Registrar intento
        recentAttempts.push(now);
        this.recoveryAttempts.set(email, recentAttempts);

        console.log('🔐 Código de verificación generado para:', email);
        return code;
    }

    // Verificar código de verificación
    verifyCode(email, inputCode) {
        const codeData = this.generatedCodes.get(email);
        
        if (!codeData) {
            throw new Error('No se encontró código de verificación. Solicita uno nuevo.');
        }

        if (Date.now() > codeData.expiresAt) {
            this.generatedCodes.delete(email);
            throw new Error('El código ha expirado. Solicita uno nuevo.');
        }

        if (codeData.attempts >= 3) {
            this.generatedCodes.delete(email);
            throw new Error('Demasiados intentos fallidos. Solicita un código nuevo.');
        }

        if (codeData.code !== inputCode) {
            codeData.attempts++;
            throw new Error('Código incorrecto.');
        }

        // Código correcto, limpiar datos
        this.generatedCodes.delete(email);
        return true;
    }

    // Actualizar contraseña en todos los sistemas
    async updatePassword(email, newPassword) {
        try {
            console.log('🔄 Actualizando contraseña en todos los sistemas para:', email);
            let updatedSystems = [];

            // 1. Actualizar en usuarios aprobados
            const approvedUser = await StorageService.getApprovedUserByEmail(email);
            if (approvedUser) {
                approvedUser.password = newPassword;
                approvedUser.lastPasswordUpdate = new Date().toISOString();
                await StorageService.saveApprovedUser(approvedUser);
                updatedSystems.push('usuarios_aprobados');
                console.log('✅ Contraseña actualizada en usuarios aprobados');
            }

            // 2. Actualizar en credenciales de login
            const loginCredentials = await StorageService.getData('login_credentials') || {};
            if (loginCredentials[email]) {
                loginCredentials[email].password = newPassword;
                loginCredentials[email].lastPasswordUpdate = new Date().toISOString();
                await StorageService.saveData('login_credentials', loginCredentials);
                updatedSystems.push('credenciales_login');
                console.log('✅ Contraseña actualizada en credenciales de login');
            }

            // 3. Actualizar en usuarios registrados
            const registeredUsers = await StorageService.getData('registered_users') || [];
            const userIndex = registeredUsers.findIndex(user => user.email === email);
            if (userIndex !== -1) {
                registeredUsers[userIndex].password = newPassword;
                registeredUsers[userIndex].lastPasswordUpdate = new Date().toISOString();
                await StorageService.saveData('registered_users', registeredUsers);
                updatedSystems.push('usuarios_registrados');
                console.log('✅ Contraseña actualizada en usuarios registrados');
            }

            // 4. Actualizar en datos específicos de influencer
            const influencersList = await StorageService.getInfluencersList() || [];
            const influencer = influencersList.find(i => i.email === email);
            if (influencer) {
                const influencerData = await StorageService.getInfluencerData(influencer.id);
                if (influencerData) {
                    influencerData.password = newPassword;
                    influencerData.lastPasswordUpdate = new Date().toISOString();
                    await StorageService.saveInfluencerData(influencerData);
                    updatedSystems.push('datos_influencer');
                    console.log('✅ Contraseña actualizada en datos de influencer');
                }
            }

            // 5. Actualizar en datos específicos de empresa
            const companiesList = await StorageService.getCompaniesList() || [];
            const company = companiesList.find(c => c.email === email);
            if (company) {
                const companyData = await StorageService.getCompanyData(company.id);
                if (companyData) {
                    companyData.password = newPassword;
                    companyData.lastPasswordUpdate = new Date().toISOString();
                    await StorageService.saveCompanyData(companyData);
                    updatedSystems.push('datos_empresa');
                    console.log('✅ Contraseña actualizada en datos de empresa');
                }
            }

            // Registrar el cambio de contraseña
            await this.logPasswordChange(email, updatedSystems);

            console.log(`✅ Contraseña actualizada en ${updatedSystems.length} sistemas:`, updatedSystems);
            return { success: true, updatedSystems };
        } catch (error) {
            console.error('❌ Error actualizando contraseña:', error);
            throw error;
        }
    }

    // Registrar cambio de contraseña para auditoría
    async logPasswordChange(email, updatedSystems) {
        try {
            const passwordChanges = await StorageService.getData('password_changes') || [];
            passwordChanges.push({
                email,
                timestamp: new Date().toISOString(),
                updatedSystems,
                method: 'recovery'
            });

            // Mantener solo los últimos 100 cambios
            if (passwordChanges.length > 100) {
                passwordChanges.splice(0, passwordChanges.length - 100);
            }

            await StorageService.saveData('password_changes', passwordChanges);
        } catch (error) {
            console.warn('⚠️ Error registrando cambio de contraseña:', error);
        }
    }

    // Enviar email real de recuperación usando EmailService
    async sendRecoveryEmail(email, code) {
        try {
            console.log('📧 Enviando email de recuperación de contraseña...');
            console.log(`Para: ${email}`);
            console.log(`Código: ${code}`);
            
            // Determinar tipo de usuario para personalizar el email
            const emailVerification = await this.verifyEmailExists(email);
            const userType = emailVerification.userType === 'company' ? 'empresa' : 'influencer';
            
            // Enviar email real usando EmailService
            const result = await EmailService.sendPasswordRecoveryEmail(email, code, userType);
            
            if (result.success) {
                console.log('✅ Email de recuperación enviado exitosamente');
                return {
                    success: true,
                    messageId: result.messageId,
                    message: `Código de verificación enviado a ${email}`
                };
            } else {
                throw new Error('Error enviando email');
            }
            
        } catch (error) {
            console.error('❌ Error enviando email de recuperación:', error);
            
            // En modo desarrollo, ser más específico con los errores
            if (error.message.includes('modo desarrollo')) {
                return {
                    success: true,
                    message: 'Código enviado (modo desarrollo)'
                };
            }
            
            // En caso de error del servicio de email, mostrar mensaje genérico
            // pero no revelar el código por seguridad
            throw new Error('Error enviando el código de verificación. Por favor inténtalo más tarde.');
        }
    }

    // Limpiar códigos expirados (llamar periódicamente)
    cleanupExpiredCodes() {
        const now = Date.now();
        for (const [email, codeData] of this.generatedCodes.entries()) {
            if (now > codeData.expiresAt) {
                this.generatedCodes.delete(email);
            }
        }
    }

    // Obtener estadísticas de recuperación
    async getRecoveryStats() {
        try {
            const passwordChanges = await StorageService.getData('password_changes') || [];
            const recoveryChanges = passwordChanges.filter(change => change.method === 'recovery');
            
            return {
                totalRecoveries: recoveryChanges.length,
                recentRecoveries: recoveryChanges.filter(
                    change => Date.now() - new Date(change.timestamp).getTime() < 86400000 // 24 horas
                ).length,
                activeAttempts: this.recoveryAttempts.size,
                pendingCodes: this.generatedCodes.size
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return null;
        }
    }
}

// Exportar instancia singleton
const passwordRecoveryService = new PasswordRecoveryService();

// Limpiar códigos expirados cada 5 minutos
setInterval(() => {
    passwordRecoveryService.cleanupExpiredCodes();
}, 300000);

export default passwordRecoveryService;