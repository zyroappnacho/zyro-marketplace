/**
 * Servicio para manejar las solicitudes de colaboración
 * Gestiona el envío de solicitudes al administrador y el seguimiento del estado
 */

class CollaborationRequestService {
    constructor() {
        this.requests = [];
        this.requestIdCounter = 1;
        this.initialized = false;
    }

    /**
     * Inicializa el servicio cargando las solicitudes existentes
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            const StorageService = (await import('./StorageService')).default;
            
            // Cargar solicitudes existentes
            const savedRequests = await StorageService.getData('collaboration_requests');
            if (savedRequests && Array.isArray(savedRequests)) {
                this.requests = savedRequests;
                
                // Actualizar el contador para evitar IDs duplicados
                if (this.requests.length > 0) {
                    const maxId = Math.max(...this.requests.map(r => r.id));
                    this.requestIdCounter = maxId + 1;
                }
            }
            
            // Cargar el contador de IDs
            const savedCounter = await StorageService.getData('collaboration_request_counter');
            if (savedCounter) {
                this.requestIdCounter = Math.max(this.requestIdCounter, savedCounter);
            }
            
            this.initialized = true;
            console.log(`✅ CollaborationRequestService inicializado con ${this.requests.length} solicitudes`);
        } catch (error) {
            console.error('Error inicializando CollaborationRequestService:', error);
            this.initialized = true; // Marcar como inicializado aunque haya error
        }
    }

    /**
     * Guarda las solicitudes en el almacenamiento persistente
     */
    async saveRequests() {
        try {
            const StorageService = (await import('./StorageService')).default;
            
            await StorageService.saveData('collaboration_requests', this.requests);
            await StorageService.saveData('collaboration_request_counter', this.requestIdCounter);
            
            console.log(`💾 Guardadas ${this.requests.length} solicitudes de colaboración`);
        } catch (error) {
            console.error('Error guardando solicitudes:', error);
        }
    }

    /**
     * Obtiene los datos reales del perfil del usuario desde múltiples fuentes
     * @param {string} userId - ID del usuario
     * @returns {Promise<Object>} - Datos del perfil del usuario
     */
    async getUserProfileData(userId) {
        try {
            const StorageService = (await import('./StorageService')).default;
            
            console.log(`🔍 Obteniendo datos reales del perfil para usuario: ${userId}`);
            
            let userData = null;
            let influencerData = null;
            
            // 1. Obtener datos del usuario actual
            const currentUser = await StorageService.getUser();
            if (currentUser && currentUser.id === userId) {
                userData = currentUser;
                console.log(`✅ Datos de usuario actual encontrados para: ${userId}`);
            }
            
            // 2. Obtener datos específicos de influencer (más completos)
            try {
                influencerData = await StorageService.getInfluencerData(userId);
                if (influencerData && influencerData.id === userId) {
                    console.log(`✅ Datos de influencer encontrados para: ${userId}`);
                }
            } catch (error) {
                console.warn(`⚠️ No se pudieron obtener datos de influencer para ${userId}:`, error);
            }
            
            // 3. Buscar en la lista de usuarios registrados
            let registeredUser = null;
            try {
                const registeredUsers = await StorageService.getData('registered_users') || [];
                registeredUser = registeredUsers.find(u => u.id === userId);
                if (registeredUser) {
                    console.log(`✅ Usuario encontrado en lista de registrados: ${userId}`);
                }
            } catch (error) {
                console.warn(`⚠️ No se pudo buscar en usuarios registrados:`, error);
            }
            
            // 4. Buscar en backups si es necesario
            let backupData = null;
            if (!userData && !influencerData && !registeredUser) {
                try {
                    backupData = await StorageService.getData(`influencer_backup_${userId}`);
                    if (backupData && backupData.id === userId) {
                        console.log(`✅ Datos recuperados desde backup para: ${userId}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ No se pudo recuperar desde backup:`, error);
                }
            }
            
            // 5. Fusionar datos priorizando los más completos y recientes
            const allSources = [influencerData, userData, registeredUser, backupData].filter(Boolean);
            
            if (allSources.length === 0) {
                console.warn(`❌ No se encontraron datos para usuario ${userId}, usando valores por defecto`);
                return {
                    realName: 'Usuario no encontrado',
                    instagramUsername: 'usuario',
                    instagramFollowers: '0',
                    email: 'email@ejemplo.com',
                    phone: '',
                    city: '',
                    profileImage: null
                };
            }
            
            // Priorizar datos más recientes y completos
            let bestSource = allSources[0];
            for (const source of allSources) {
                const sourceDate = new Date(source.lastUpdated || 0);
                const bestDate = new Date(bestSource.lastUpdated || 0);
                
                // Priorizar si tiene más datos completos o es más reciente
                const sourceCompleteness = (source.fullName ? 1 : 0) + 
                                         (source.instagramUsername ? 1 : 0) + 
                                         (source.instagramFollowers ? 1 : 0);
                const bestCompleteness = (bestSource.fullName ? 1 : 0) + 
                                       (bestSource.instagramUsername ? 1 : 0) + 
                                       (bestSource.instagramFollowers ? 1 : 0);
                
                if (sourceCompleteness > bestCompleteness || 
                    (sourceCompleteness === bestCompleteness && sourceDate > bestDate)) {
                    bestSource = source;
                }
            }
            
            const profileData = {
                realName: bestSource.fullName || bestSource.name || 'Usuario',
                instagramUsername: bestSource.instagramUsername || bestSource.instagramHandle || 'usuario',
                instagramFollowers: bestSource.instagramFollowers || '0',
                email: bestSource.email || 'email@ejemplo.com',
                phone: bestSource.phone || '',
                city: bestSource.city || '',
                profileImage: bestSource.profileImage || null
            };
            
            console.log(`✅ Datos del perfil obtenidos para ${userId}:`, {
                nombre: profileData.realName,
                instagram: profileData.instagramUsername,
                seguidores: profileData.instagramFollowers,
                fuente: influencerData ? 'influencer' : userData ? 'usuario' : registeredUser ? 'registrados' : 'backup'
            });
            
            return profileData;
            
        } catch (error) {
            console.error('❌ Error obteniendo datos del perfil del usuario:', error);
            return {
                realName: 'Error al cargar',
                instagramUsername: 'usuario',
                instagramFollowers: '0',
                email: 'email@ejemplo.com',
                phone: '',
                city: '',
                profileImage: null
            };
        }
    }

    /**
     * Envía una solicitud de colaboración al administrador
     * @param {Object} requestData - Datos de la solicitud
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async submitRequest(requestData) {
        try {
            // Asegurar que el servicio esté inicializado
            await this.initialize();
            
            // Obtener los datos reales del perfil del usuario
            const userProfileData = await this.getUserProfileData(requestData.userId);
            
            const request = {
                id: this.requestIdCounter++,
                ...requestData,
                // Sobrescribir con los datos reales del perfil
                userName: userProfileData.realName,
                userEmail: userProfileData.email,
                userInstagram: userProfileData.instagramUsername,
                userFollowers: userProfileData.instagramFollowers,
                userPhone: userProfileData.phone,
                userCity: userProfileData.city,
                userProfileImage: userProfileData.profileImage,
                status: 'pending',
                submittedAt: new Date().toISOString(),
                reviewedAt: null,
                reviewedBy: null,
                adminNotes: null
            };

            // Simular envío al servidor
            await this.simulateNetworkDelay();

            // Guardar la solicitud
            this.requests.push(request);
            
            // Persistir en almacenamiento
            await this.saveRequests();

            // Notificar al administrador (simulado)
            this.notifyAdmin(request);

            console.log(`✅ Solicitud enviada con datos reales del usuario:`, {
                nombre: userProfileData.realName,
                instagram: userProfileData.instagramUsername,
                seguidores: userProfileData.instagramFollowers
            });

            return {
                success: true,
                requestId: request.id,
                message: 'Solicitud enviada correctamente'
            };
        } catch (error) {
            console.error('Error al enviar solicitud:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene todas las solicitudes de un usuario
     * @param {string} userId - ID del usuario
     * @returns {Promise<Array>} - Lista de solicitudes del usuario
     */
    async getUserRequests(userId) {
        await this.initialize();
        return this.requests.filter(request => request.userId === userId);
    }

    /**
     * Obtiene las solicitudes pendientes y aprobadas de un usuario (para pestaña "Próximos")
     * Solo incluye colaboraciones cuya fecha aún no ha pasado
     * @param {string} userId - ID del usuario
     * @returns {Promise<Array>} - Lista de solicitudes próximas
     */
    async getUserUpcomingRequests(userId) {
        await this.initialize();
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Establecer a medianoche para comparación de fechas
        
        return this.requests.filter(request => {
            const isUserRequest = request.userId === userId;
            const isActiveStatus = request.status === 'pending' || request.status === 'approved';
            
            // Verificar si la fecha de la colaboración aún no ha pasado
            if (request.selectedDate) {
                const collaborationDate = new Date(request.selectedDate);
                collaborationDate.setHours(0, 0, 0, 0);
                const isFutureDate = collaborationDate >= today;
                
                return isUserRequest && isActiveStatus && isFutureDate;
            }
            
            // Si no hay fecha, mantener en próximos por defecto
            return isUserRequest && isActiveStatus;
        });
    }

    /**
     * Obtiene las solicitudes pasadas de un usuario (para pestaña "Pasados")
     * Incluye colaboraciones cuya fecha ya ha pasado, independientemente del estado
     * @param {string} userId - ID del usuario
     * @returns {Promise<Array>} - Lista de solicitudes pasadas
     */
    async getUserPastRequests(userId) {
        await this.initialize();
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Establecer a medianoche para comparación de fechas
        
        return this.requests.filter(request => {
            const isUserRequest = request.userId === userId;
            
            // Verificar si la fecha de la colaboración ya ha pasado
            if (request.selectedDate) {
                const collaborationDate = new Date(request.selectedDate);
                collaborationDate.setHours(0, 0, 0, 0);
                const isPastDate = collaborationDate < today;
                
                // Incluir solo colaboraciones que tenían estado activo (pendiente o aprobada)
                // y cuya fecha ya pasó
                const wasActiveStatus = request.status === 'pending' || request.status === 'approved';
                
                return isUserRequest && wasActiveStatus && isPastDate;
            }
            
            return false; // Si no hay fecha, no puede estar en pasados
        });
    }

    /**
     * Obtiene las solicitudes rechazadas de un usuario (para pestaña "Cancelados")
     * @param {string} userId - ID del usuario
     * @returns {Promise<Array>} - Lista de solicitudes canceladas
     */
    async getUserCancelledRequests(userId) {
        await this.initialize();
        return this.requests.filter(request => 
            request.userId === userId && 
            request.status === 'rejected'
        );
    }

    /**
     * Obtiene todas las solicitudes pendientes para el administrador
     * @returns {Promise<Array>} - Lista de solicitudes pendientes
     */
    async getPendingRequests() {
        await this.initialize();
        return this.requests.filter(request => request.status === 'pending');
    }

    /**
     * Obtiene todas las solicitudes para el administrador
     * @returns {Promise<Array>} - Lista de todas las solicitudes
     */
    async getAllRequests() {
        await this.initialize();
        return [...this.requests];
    }

    /**
     * Actualiza el estado de una solicitud (usado por el administrador)
     * @param {number} requestId - ID de la solicitud
     * @param {string} status - Nuevo estado ('approved', 'rejected')
     * @param {string} adminNotes - Notas del administrador
     * @param {string} reviewedBy - ID del administrador que revisó
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async updateRequestStatus(requestId, status, adminNotes = '', reviewedBy = 'admin') {
        try {
            await this.initialize();
            
            const requestIndex = this.requests.findIndex(req => req.id === requestId);
            
            if (requestIndex === -1) {
                return {
                    success: false,
                    error: 'Solicitud no encontrada'
                };
            }

            this.requests[requestIndex] = {
                ...this.requests[requestIndex],
                status,
                adminNotes,
                reviewedBy,
                reviewedAt: new Date().toISOString()
            };

            // Persistir cambios
            await this.saveRequests();

            // Notificar al usuario sobre la decisión
            this.notifyUser(this.requests[requestIndex]);

            return {
                success: true,
                message: `Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`,
                request: this.requests[requestIndex]
            };
        } catch (error) {
            console.error('Error actualizando estado de solicitud:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene los detalles de una solicitud específica
     * @param {number} requestId - ID de la solicitud
     * @returns {Promise<Object|null>} - Datos de la solicitud o null si no existe
     */
    async getRequestById(requestId) {
        await this.initialize();
        return this.requests.find(request => request.id === requestId) || null;
    }

    /**
     * Obtiene estadísticas de solicitudes
     * @returns {Promise<Object>} - Estadísticas generales
     */
    async getRequestStats() {
        await this.initialize();
        
        const total = this.requests.length;
        const pending = this.requests.filter(req => req.status === 'pending').length;
        const approved = this.requests.filter(req => req.status === 'approved').length;
        const rejected = this.requests.filter(req => req.status === 'rejected').length;

        return {
            total,
            pending,
            approved,
            rejected,
            approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0
        };
    }

    /**
     * Obtiene las fechas y horarios disponibles para una colaboración
     * Lee directamente la configuración del administrador desde el almacenamiento
     * @param {string} collaborationId - ID de la colaboración
     * @returns {Object} - Fechas y horarios disponibles
     */
    async getAvailableSlots(collaborationId) {
        try {
            // Validar que collaborationId sea válido
            if (!collaborationId) {
                console.warn('collaborationId no proporcionado, usando configuración por defecto');
                return this.getDefaultSlots();
            }

            // Obtener las campañas configuradas por el administrador
            const adminCampaigns = await this.getAdminCampaigns();
            
            // Buscar la campaña específica
            const campaign = adminCampaigns.find(c => c.id.toString() === collaborationId.toString());
            
            if (!campaign) {
                console.warn(`Campaña ${collaborationId} no encontrada, usando configuración por defecto`);
                return this.getDefaultSlots();
            }

            // Usar las fechas y horarios EXACTOS configurados por el administrador
            const availableDates = {};
            const adminSelectedDates = campaign.availableDates || [];
            const adminSelectedTimes = campaign.availableTimes || [];

            // Crear el objeto de fechas disponibles con las fechas exactas del admin
            adminSelectedDates.forEach(dateString => {
                availableDates[dateString] = {
                    marked: true,
                    dotColor: '#C9A961',
                    times: adminSelectedTimes,
                    maxBookings: this.getMaxBookingsPerDate(campaign.category, dateString),
                    specialNotes: this.getDateSpecialNotes(campaign.category, dateString)
                };
            });

            console.log(`📅 Fechas configuradas por el admin para campaña ${collaborationId}:`, adminSelectedDates);
            console.log(`⏰ Horarios configurados por el admin:`, adminSelectedTimes);

            return {
                dates: availableDates,
                times: adminSelectedTimes,
                totalAvailableDates: adminSelectedDates.length,
                campaignInfo: {
                    title: campaign.title,
                    business: campaign.business,
                    category: campaign.category
                }
            };
        } catch (error) {
            console.error('Error obteniendo fechas del administrador:', error);
            return this.getDefaultSlots();
        }
    }

    /**
     * Obtiene las campañas configuradas por el administrador desde el almacenamiento
     * @returns {Array} - Lista de campañas del administrador
     */
    async getAdminCampaigns() {
        try {
            // Importar StorageService dinámicamente para evitar dependencias circulares
            const StorageService = (await import('./StorageService')).default;
            
            // Obtener las campañas desde el almacenamiento donde las guarda el admin
            const campaigns = await StorageService.getData('admin_campaigns');
            
            if (campaigns && Array.isArray(campaigns)) {
                return campaigns;
            }
            
            console.warn('No se encontraron campañas del administrador');
            return [];
        } catch (error) {
            console.error('Error obteniendo campañas del administrador:', error);
            return [];
        }
    }

    /**
     * Configuración por defecto cuando no se encuentran datos del admin
     * @returns {Object} - Fechas y horarios por defecto
     */
    getDefaultSlots() {
        const today = new Date();
        const defaultDates = {};
        const defaultTimes = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
        
        // Generar algunas fechas por defecto (próximos 7 días)
        for (let i = 1; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            
            defaultDates[dateString] = {
                marked: true,
                dotColor: '#C9A961',
                times: defaultTimes
            };
        }

        return {
            dates: defaultDates,
            times: defaultTimes,
            totalAvailableDates: 7
        };
    }

    /**
     * Obtiene el número máximo de reservas por fecha (configurado por el admin)
     * @param {string} category - Categoría de la colaboración
     * @param {string} dateString - Fecha específica
     * @returns {number} - Máximo de reservas permitidas
     */
    getMaxBookingsPerDate(category, dateString) {
        const maxBookings = {
            'restaurantes': 3, // 3 influencers por día en restaurantes
            'salud-belleza': 2, // 2 influencers por día en centros de belleza
            'ropa': 1,          // 1 influencer por día en sesiones de moda
            'eventos': 5,       // 5 influencers por evento
            'default': 2
        };
        
        return maxBookings[category] || maxBookings['default'];
    }

    /**
     * Obtiene notas especiales para fechas específicas (configuradas por el admin)
     * @param {string} category - Categoría de la colaboración
     * @param {string} dateString - Fecha específica
     * @returns {string} - Notas especiales para la fecha
     */
    getDateSpecialNotes(category, dateString) {
        const date = new Date(dateString);
        const dayOfWeek = date.getDay();
        
        // Notas especiales según el tipo de colaboración y día de la semana
        if (dayOfWeek === 5 || dayOfWeek === 6) {
            return 'Horario de fin de semana - Mayor afluencia esperada';
        } else if (dayOfWeek === 1) {
            return 'Lunes - Horario más flexible';
        }
        
        return '';
    }



    /**
     * Simula un retraso de red
     * @param {number} delay - Retraso en milisegundos
     * @returns {Promise}
     */
    async simulateNetworkDelay(delay = 1000) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Notifica al administrador sobre una nueva solicitud
     * @param {Object} request - Datos de la solicitud
     */
    notifyAdmin(request) {
        console.log('🔔 Nueva solicitud para el administrador:', {
            requestId: request.id,
            collaboration: request.collaborationId,
            user: request.userId,
            date: request.selectedDate,
            time: request.selectedTime
        });

        // En producción, aquí se enviaría una notificación push o email al administrador
    }

    /**
     * Notifica al usuario sobre la decisión del administrador
     * @param {Object} request - Datos de la solicitud actualizada
     */
    notifyUser(request) {
        console.log('🔔 Notificación para el usuario:', {
            requestId: request.id,
            status: request.status,
            userId: request.userId
        });

        // En producción, aquí se enviaría una notificación push al usuario
    }

    /**
     * Limpia las solicitudes antiguas (mantenimiento)
     * @param {number} daysOld - Días de antigüedad para limpiar
     */
    cleanOldRequests(daysOld = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const initialCount = this.requests.length;
        this.requests = this.requests.filter(request => {
            const requestDate = new Date(request.submittedAt);
            return requestDate > cutoffDate;
        });

        const cleanedCount = initialCount - this.requests.length;
        console.log(`🧹 Limpieza completada: ${cleanedCount} solicitudes antiguas eliminadas`);

        return cleanedCount;
    }
}

// Instancia singleton del servicio
const collaborationRequestService = new CollaborationRequestService();

export default collaborationRequestService;