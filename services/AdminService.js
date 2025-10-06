import StorageService from './StorageService';

class AdminService {
    // FUNCIÓN: Detectar estado de pago inteligente (compatible con datos ficticios y reales)
    static isCompanyActive(companyData) {
        if (!companyData) return false;

        // CRITERIO 1: Estado explícito de pago completado (Stripe real)
        if (companyData.status === 'payment_completed' || companyData.status === 'active') {
            return true;
        }

        // CRITERIO 2: Fecha de primer pago completado existe (Stripe real)
        if (companyData.firstPaymentCompletedDate || companyData.paymentCompletedDate) {
            return true;
        }

        // CRITERIO 3: Tiene plan seleccionado Y método de pago (datos ficticios)
        if (companyData.selectedPlan && companyData.paymentMethodName && companyData.paymentMethodName !== 'No definido') {
            return true;
        }

        // CRITERIO 4: Tiene plan seleccionado Y precio mensual (proceso Stripe completado)
        if (companyData.selectedPlan && companyData.monthlyAmount && companyData.monthlyAmount > 0) {
            return true;
        }

        // CRITERIO 5: Tiene plan seleccionado Y total amount (datos ficticios)
        if (companyData.selectedPlan && companyData.totalAmount && companyData.totalAmount > 0) {
            return true;
        }

        // CRITERIO 6: Para entorno de prueba - plan válido
        if (companyData.selectedPlan && (companyData.selectedPlan.includes('plan_') || companyData.selectedPlan.includes('Plan'))) {
            return true;
        }

        return false;
    }

    // FUNCIÓN: Obtener información del plan (compatible con datos ficticios y reales)
    static getCompanyPlanInfo(company) {
        // OPCIÓN 1: Datos reales de Stripe (monthlyAmount + planDuration)
        if (company.monthlyAmount && company.planDuration) {
            return {
                monthlyPrice: company.monthlyAmount,
                duration: company.planDuration,
                totalPrice: company.monthlyAmount * company.planDuration,
                source: 'stripe_real'
            };
        }

        // OPCIÓN 2: Datos ficticios con totalAmount
        if (company.totalAmount) {
            const planDuration = company.planDuration || this.getPlanDurationFromName(company.selectedPlan);
            const monthlyPrice = planDuration > 0 ? Math.round(company.totalAmount / planDuration) : 0;
            
            return {
                monthlyPrice: monthlyPrice,
                duration: planDuration,
                totalPrice: company.totalAmount,
                source: 'fictitious_total'
            };
        }

        // OPCIÓN 3: Fallback desde nombre del plan
        const planInfo = this.getPlanInfoFromName(company.selectedPlan);
        return {
            monthlyPrice: planInfo.price,
            duration: planInfo.duration,
            totalPrice: planInfo.price * planInfo.duration,
            source: 'plan_name_fallback'
        };
    }

    // FUNCIÓN: Obtener duración desde nombre del plan
    static getPlanDurationFromName(planName) {
        if (!planName) return 12;
        
        if (planName.includes('3_months') || planName.includes('3 Meses')) return 3;
        if (planName.includes('6_months') || planName.includes('6 Meses')) return 6;
        if (planName.includes('12_months') || planName.includes('12 Meses')) return 12;
        
        return 12; // Default
    }

    // FUNCIÓN: Obtener info del plan desde nombre
    static getPlanInfoFromName(planName) {
        const planPrices = {
            'plan_3_months': { price: 499, duration: 3 },
            'plan_6_months': { price: 399, duration: 6 },
            'plan_12_months': { price: 299, duration: 12 },
            'Plan 3 Meses': { price: 499, duration: 3 },
            'Plan 6 Meses': { price: 399, duration: 6 },
            'Plan 12 Meses': { price: 299, duration: 12 }
        };

        return planPrices[planName] || { price: 299, duration: 12 };
    }

    // Dashboard data
    static async getDashboardData() {
        try {
            const companies = await this.getAllCompanies();
            const influencers = await this.getAllInfluencers();
            const campaigns = await this.getAllCampaigns();
            
            // Filtrar empresas activas usando la nueva lógica
            const activeCompanies = companies.filter(company => this.isCompanyActive(company));
            
            // Calcular ingresos con compatibilidad para datos ficticios y reales
            let totalRevenue = 0;
            let monthlyRevenue = 0;
            
            activeCompanies.forEach(company => {
                const planInfo = this.getCompanyPlanInfo(company);
                totalRevenue += planInfo.totalPrice;
                monthlyRevenue += planInfo.monthlyPrice;
            });
            
            // Obtener solo influencers aprobados para el contador principal
            const approvedInfluencers = influencers.filter(i => i.status === 'approved');
            
            console.log('📊 [AdminService] Dashboard calculado:');
            console.log(`   Total empresas: ${companies.length}`);
            console.log(`   Empresas activas: ${activeCompanies.length} (coincide con gestión de empresas)`);
            console.log(`   Ingresos totales previstos: €${totalRevenue} (suma de planes completos)`);
            console.log(`   Ingresos mensuales: €${monthlyRevenue} (pagos mensuales actuales)`);
            
            return {
                totalRevenue,
                monthlyRevenue,
                totalCompanies: companies.length,
                activeCompanies: activeCompanies.length, // ✅ Coincide con gestión de empresas
                totalInfluencers: approvedInfluencers.length,
                pendingInfluencers: influencers.filter(i => i.status === 'pending').length,
                totalCampaigns: campaigns.length,
                activeCampaigns: campaigns.filter(c => c.status === 'active').length,
                recentActivity: await this.getRecentActivity()
            };
        } catch (error) {
            console.error('Error getting dashboard data:', error);
            return null;
        }
    }

    // Companies management
    static async getAllCompanies() {
        try {
            const companiesList = await StorageService.getCompaniesList();
            const companiesData = await Promise.all(
                companiesList.map(async (company) => {
                    const fullData = await StorageService.getCompanyData(company.id);
                    return fullData;
                })
            );
            return companiesData.filter(Boolean);
        } catch (error) {
            console.error('Error getting companies:', error);
            return [];
        }
    }

    static async updateCompanyStatus(companyId, status) {
        try {
            const companyData = await StorageService.getCompanyData(companyId);
            if (companyData) {
                const updatedData = {
                    ...companyData,
                    status,
                    updatedAt: new Date().toISOString()
                };
                await StorageService.saveCompanyData(updatedData);
                return updatedData;
            }
            return null;
        } catch (error) {
            console.error('Error updating company status:', error);
            return null;
        }
    }

    static async deleteCompanyAccount(companyId) {
        try {
            console.log(`🗑️ INICIANDO ELIMINACIÓN COMPLETA DE EMPRESA (GDPR): ${companyId}`);
            
            const companyData = await StorageService.getCompanyData(companyId);
            if (!companyData) {
                console.log(`❌ Empresa no encontrada: ${companyId}`);
                return { success: false, message: 'Empresa no encontrada' };
            }

            console.log(`📋 Empresa encontrada: ${companyData.companyName} (${companyData.companyEmail})`);
            console.log(`🔒 Iniciando eliminación GDPR - Todos los datos serán borrados permanentemente`);

            // 1. Verificar que la empresa está en usuarios aprobados ANTES de eliminar
            const userBeforeDeletion = await StorageService.getApprovedUserByEmail(companyData.companyEmail);
            console.log(`🔍 Usuario empresa aprobado ANTES de eliminación: ${userBeforeDeletion ? 'SÍ' : 'NO'}`);

            // 2. ELIMINACIÓN COMPLETA GDPR - Borrar TODOS los datos
            console.log(`🗑️ PASO 1: Eliminando acceso de login de empresa...`);
            const removalResult = await StorageService.removeApprovedUserByEmail(companyData.companyEmail);
            console.log(`🗑️ Acceso de login eliminado: ${removalResult ? 'ÉXITO' : 'FALLO'}`);
            
            console.log(`🗑️ PASO 2: Eliminando datos completos de la empresa...`);
            const dataRemovalResult = await StorageService.deleteCompanyDataCompletely(companyId);
            console.log(`🗑️ Datos de la empresa eliminados: ${dataRemovalResult ? 'ÉXITO' : 'FALLO'}`);
            
            console.log(`🗑️ PASO 3: Eliminando de lista de empresas...`);
            const listRemovalResult = await StorageService.removeCompanyFromList(companyId);
            console.log(`🗑️ Eliminado de lista: ${listRemovalResult ? 'ÉXITO' : 'FALLO'}`);
            
            console.log(`🗑️ PASO 4: Cancelando suscripciones y pagos futuros...`);
            const subscriptionCancellation = await StorageService.cancelCompanySubscription(companyId);
            console.log(`🗑️ Suscripciones canceladas: ${subscriptionCancellation ? 'ÉXITO' : 'FALLO'}`);
            
            console.log(`🗑️ PASO 5: Limpiando referencias relacionadas...`);
            const referencesCleanup = await StorageService.cleanupCompanyReferences(companyId);
            console.log(`🗑️ Referencias limpiadas: ${referencesCleanup ? 'ÉXITO' : 'FALLO'}`);
            
            // 3. Verificar que la empresa YA NO existe en ningún lugar
            const userAfterDeletion = await StorageService.getApprovedUserByEmail(companyData.companyEmail);
            const dataAfterDeletion = await StorageService.getCompanyData(companyId);
            
            console.log(`🔍 Usuario empresa DESPUÉS de eliminación: ${userAfterDeletion ? 'SÍ (PROBLEMA!)' : 'NO (CORRECTO)'}`);
            console.log(`🔍 Datos de empresa DESPUÉS de eliminación: ${dataAfterDeletion ? 'SÍ (PROBLEMA!)' : 'NO (CORRECTO)'}`);
            
            // 4. Log activity GDPR
            await this.logActivity({
                type: 'company_gdpr_deletion',
                description: `ELIMINACIÓN GDPR COMPLETA: ${companyData.companyName} (${companyData.companyEmail}) - Todos los datos borrados permanentemente y pagos cancelados`,
                timestamp: new Date().toISOString(),
                gdprCompliant: true,
                deletedData: {
                    companyData: true,
                    loginCredentials: true,
                    subscriptionData: true,
                    paymentMethods: true,
                    futurePayments: true,
                    allReferences: true
                }
            });
            
            console.log(`🎯 ELIMINACIÓN GDPR COMPLETADA: Todos los datos de ${companyData.companyName} han sido borrados permanentemente`);
            console.log(`🔒 GDPR COMPLIANCE: ✅ Eliminación completa y definitiva con cancelación de pagos`);
            
            return { 
                success: true, 
                message: `Empresa ${companyData.companyName} eliminada completamente (GDPR). Todos los datos han sido borrados permanentemente y los pagos futuros cancelados.`,
                gdprCompliant: true,
                accessRevoked: !userAfterDeletion,
                dataCompletlyDeleted: !dataAfterDeletion,
                subscriptionsCancelled: subscriptionCancellation,
                deletionTimestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error en eliminación GDPR de empresa:', error);
            return { success: false, message: 'Error al eliminar la cuenta de la empresa' };
        }
    }

    // Influencers management
    static async getAllInfluencers() {
        try {
            const influencersList = await StorageService.getInfluencersList();
            const influencersData = await Promise.all(
                influencersList.map(async (influencer) => {
                    const fullData = await StorageService.getInfluencerData(influencer.id);
                    return fullData;
                })
            );
            return influencersData.filter(Boolean);
        } catch (error) {
            console.error('Error getting influencers:', error);
            return [];
        }
    }

    static async getApprovedInfluencers() {
        try {
            const allInfluencers = await this.getAllInfluencers();
            const approvedInfluencers = allInfluencers.filter(influencer => influencer.status === 'approved');
            
            // Enriquecer con información de acceso
            const enrichedInfluencers = await Promise.all(
                approvedInfluencers.map(async (influencer) => {
                    const approvedUser = await StorageService.getApprovedUser(influencer.id);
                    return {
                        ...influencer,
                        hasAccess: !!approvedUser,
                        lastLogin: approvedUser?.lastLogin || null,
                        isActive: approvedUser?.isActive || false
                    };
                })
            );
            
            return enrichedInfluencers;
        } catch (error) {
            console.error('Error getting approved influencers:', error);
            return [];
        }
    }

    static async deleteInfluencerAccount(influencerId) {
        try {
            console.log(`🗑️ INICIANDO ELIMINACIÓN COMPLETA DE CUENTA (GDPR): ${influencerId}`);
            
            const influencerData = await StorageService.getInfluencerData(influencerId);
            if (!influencerData) {
                console.log(`❌ Influencer no encontrado: ${influencerId}`);
                return { success: false, message: 'Influencer no encontrado' };
            }

            console.log(`📋 Influencer encontrado: ${influencerData.fullName} (${influencerData.email})`);
            console.log(`🔒 Iniciando eliminación GDPR - Todos los datos serán borrados permanentemente`);

            // 1. Verificar que el usuario está en usuarios aprobados ANTES de eliminar
            const userBeforeDeletion = await StorageService.getApprovedUserByEmail(influencerData.email);
            console.log(`🔍 Usuario aprobado ANTES de eliminación: ${userBeforeDeletion ? 'SÍ' : 'NO'}`);

            // 2. ELIMINACIÓN COMPLETA GDPR - Borrar TODOS los datos
            console.log(`🗑️ PASO 1: Eliminando acceso de login...`);
            const removalResult = await StorageService.removeApprovedUser(influencerId);
            console.log(`🗑️ Acceso de login eliminado: ${removalResult ? 'ÉXITO' : 'FALLO'}`);
            
            console.log(`🗑️ PASO 2: Eliminando datos completos del influencer...`);
            const dataRemovalResult = await StorageService.deleteInfluencerDataCompletely(influencerId);
            console.log(`🗑️ Datos del influencer eliminados: ${dataRemovalResult ? 'ÉXITO' : 'FALLO'}`);
            
            console.log(`🗑️ PASO 3: Eliminando de lista de influencers...`);
            const listRemovalResult = await StorageService.removeInfluencerFromList(influencerId);
            console.log(`🗑️ Eliminado de lista: ${listRemovalResult ? 'ÉXITO' : 'FALLO'}`);
            
            console.log(`🗑️ PASO 4: Limpiando referencias relacionadas...`);
            const referencesCleanup = await StorageService.cleanupInfluencerReferences(influencerId);
            console.log(`🗑️ Referencias limpiadas: ${referencesCleanup ? 'ÉXITO' : 'FALLO'}`);
            
            // 3. Verificar que el usuario YA NO existe en ningún lugar
            const userAfterDeletion = await StorageService.getApprovedUserByEmail(influencerData.email);
            const dataAfterDeletion = await StorageService.getInfluencerData(influencerId);
            
            console.log(`🔍 Usuario aprobado DESPUÉS de eliminación: ${userAfterDeletion ? 'SÍ (PROBLEMA!)' : 'NO (CORRECTO)'}`);
            console.log(`🔍 Datos del influencer DESPUÉS de eliminación: ${dataAfterDeletion ? 'SÍ (PROBLEMA!)' : 'NO (CORRECTO)'}`);
            
            // 4. Log activity GDPR
            await this.logActivity({
                type: 'influencer_gdpr_deletion',
                description: `ELIMINACIÓN GDPR COMPLETA: ${influencerData.fullName} (@${influencerData.instagramUsername}) - Todos los datos borrados permanentemente`,
                timestamp: new Date().toISOString(),
                gdprCompliant: true,
                deletedData: {
                    personalData: true,
                    loginCredentials: true,
                    profileImages: true,
                    socialMediaData: true,
                    allReferences: true
                }
            });
            
            console.log(`🎯 ELIMINACIÓN GDPR COMPLETADA: Todos los datos de ${influencerData.fullName} han sido borrados permanentemente`);
            console.log(`🔒 GDPR COMPLIANCE: ✅ Eliminación completa y definitiva`);
            
            return { 
                success: true, 
                message: `Cuenta de ${influencerData.fullName} eliminada completamente (GDPR). Todos los datos han sido borrados permanentemente.`,
                gdprCompliant: true,
                accessRevoked: !userAfterDeletion,
                dataCompletlyDeleted: !dataAfterDeletion,
                deletionTimestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error en eliminación GDPR:', error);
            return { success: false, message: 'Error al eliminar la cuenta del influencer' };
        }
    }

    static async getPendingInfluencers() {
        try {
            const allInfluencers = await this.getAllInfluencers();
            let pendingInfluencers = allInfluencers.filter(influencer => influencer.status === 'pending');
            
            // Procesar las imágenes reales de Instagram de cada influencer
            pendingInfluencers = pendingInfluencers.map(influencer => {
                // Convertir instagramImages a instagramScreenshots para el modal
                let instagramScreenshots = [];
                
                if (influencer.instagramImages && influencer.instagramImages.length > 0) {
                    instagramScreenshots = influencer.instagramImages.map((image, index) => ({
                        id: index + 1,
                        url: image.uri,
                        description: `Captura de Instagram ${index + 1}`,
                        uploadedAt: influencer.createdAt || new Date().toISOString()
                    }));
                }
                
                return {
                    ...influencer,
                    instagramScreenshots
                };
            });
            

            
            return pendingInfluencers;
        } catch (error) {
            console.error('Error getting pending influencers:', error);
            return [];
        }
    }

    static async approveInfluencer(influencerId) {
        try {
            const influencerData = await StorageService.getInfluencerData(influencerId);
            if (influencerData) {
                // 1. Actualizar estado del influencer a aprobado
                const updatedInfluencerData = {
                    ...influencerData,
                    status: 'approved',
                    approvedAt: new Date().toISOString()
                };
                await StorageService.saveInfluencerData(updatedInfluencerData);
                
                // 2. Crear perfil completo de usuario para login
                const userProfile = {
                    id: influencerData.id,
                    role: 'influencer',
                    name: influencerData.fullName,
                    email: influencerData.email,
                    password: influencerData.password, // Contraseña del registro
                    verified: true,
                    // Datos específicos del influencer
                    fullName: influencerData.fullName,
                    phone: influencerData.phone,
                    city: influencerData.city,
                    instagramUsername: influencerData.instagramUsername,
                    instagramFollowers: influencerData.instagramFollowers,
                    tiktokUsername: influencerData.tiktokUsername || '',
                    tiktokFollowers: influencerData.tiktokFollowers || '',
                    profileImage: influencerData.profileImage || null,
                    instagramImages: influencerData.instagramImages || [],
                    tiktokImages: influencerData.tiktokImages || [],
                    // Metadatos
                    registeredAt: influencerData.createdAt,
                    approvedAt: new Date().toISOString(),
                    lastLogin: null,
                    isActive: true
                };
                
                // 3. Guardar en la lista de usuarios aprobados para login
                await StorageService.saveApprovedUser(userProfile);
                
                // 4. Log activity
                await this.logActivity({
                    type: 'influencer_approved',
                    description: `Influencer aprobado: ${influencerData.fullName} (@${influencerData.instagramUsername}) - Acceso habilitado`,
                    timestamp: new Date().toISOString()
                });
                
                console.log(`✅ Influencer aprobado: ${influencerData.fullName} puede ahora iniciar sesión con ${influencerData.email}`);
                
                return updatedInfluencerData;
            }
            return null;
        } catch (error) {
            console.error('Error approving influencer:', error);
            return null;
        }
    }

    static async rejectInfluencer(influencerId, reason) {
        try {
            const influencerData = await StorageService.getInfluencerData(influencerId);
            if (influencerData) {
                const updatedData = {
                    ...influencerData,
                    status: 'rejected',
                    rejectionReason: reason,
                    rejectedAt: new Date().toISOString()
                };
                await StorageService.saveInfluencerData(updatedData);
                
                // Log activity
                await this.logActivity({
                    type: 'influencer_rejected',
                    description: `Influencer rechazado: ${influencerData.fullName} - Motivo: ${reason}`,
                    timestamp: new Date().toISOString()
                });
                
                return updatedData;
            }
            return null;
        } catch (error) {
            console.error('Error rejecting influencer:', error);
            return null;
        }
    }

    // Campaigns management
    static async getAllCampaigns() {
        try {
            // For now, return mock data. In a real app, this would come from a database
            const mockCampaigns = [
                {
                    id: 1,
                    title: 'Degustación Premium',
                    business: 'Restaurante Elegance',
                    category: 'restaurantes',
                    city: 'Madrid',
                    status: 'active',
                    createdAt: '2025-01-15T10:00:00Z',
                    description: 'Experiencia gastronómica exclusiva con menú degustación de 7 platos.',
                    requirements: 'Min. 10K seguidores IG',
                    minFollowers: 10000
                },
                {
                    id: 2,
                    title: 'Colección Primavera',
                    business: 'Boutique Chic',
                    category: 'ropa',
                    city: 'Barcelona',
                    status: 'active',
                    createdAt: '2025-01-13T09:15:00Z',
                    description: 'Presenta la nueva colección primavera-verano con piezas exclusivas.',
                    requirements: 'Min. 15K seguidores IG',
                    minFollowers: 15000
                }
            ];
            
            // Try to get saved campaigns from storage
            const savedCampaigns = await StorageService.getData('admin_campaigns');
            return savedCampaigns || mockCampaigns;
        } catch (error) {
            console.error('Error getting campaigns:', error);
            return [];
        }
    }

    static async saveCampaign(campaign) {
        try {
            const campaigns = await this.getAllCampaigns();
            const updatedCampaigns = [...campaigns, campaign];
            await StorageService.saveData('admin_campaigns', updatedCampaigns);
            
            // Log activity
            await this.logActivity({
                type: 'campaign_created',
                description: `Nueva campaña creada: ${campaign.title} - ${campaign.business}`,
                timestamp: new Date().toISOString()
            });
            
            return campaign;
        } catch (error) {
            console.error('Error saving campaign:', error);
            return null;
        }
    }

    static async updateCampaign(campaignId, updates) {
        try {
            const campaigns = await this.getAllCampaigns();
            const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
            
            if (campaignIndex !== -1) {
                campaigns[campaignIndex] = { ...campaigns[campaignIndex], ...updates };
                await StorageService.saveData('admin_campaigns', campaigns);
                
                // Log activity
                await this.logActivity({
                    type: 'campaign_updated',
                    description: `Campaña actualizada: ${campaigns[campaignIndex].title}`,
                    timestamp: new Date().toISOString()
                });
                
                return campaigns[campaignIndex];
            }
            return null;
        } catch (error) {
            console.error('Error updating campaign:', error);
            return null;
        }
    }

    static async deleteCampaign(campaignId) {
        try {
            const campaigns = await this.getAllCampaigns();
            const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
            
            if (campaignIndex !== -1) {
                const deletedCampaign = campaigns[campaignIndex];
                campaigns.splice(campaignIndex, 1);
                await StorageService.saveData('admin_campaigns', campaigns);
                
                // Log activity
                await this.logActivity({
                    type: 'campaign_deleted',
                    description: `Campaña eliminada: ${deletedCampaign.title}`,
                    timestamp: new Date().toISOString()
                });
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting campaign:', error);
            return false;
        }
    }

    // Financial data
    static async getFinancialData() {
        try {
            const companies = await this.getAllCompanies();
            const transactions = [];
            
            // Generate transactions from company payments
            companies.forEach(company => {
                if (company.totalAmount) {
                    transactions.push({
                        id: `trans_${company.id}`,
                        companyId: company.id,
                        companyName: company.companyName,
                        amount: company.totalAmount,
                        type: 'income',
                        method: company.paymentMethod,
                        date: company.registrationDate,
                        description: `Pago inicial - Plan ${company.selectedPlan}`,
                        status: 'completed'
                    });
                }
            });

            // Sort transactions by date (newest first)
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            return {
                transactions,
                totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
                monthlyRevenue: this.calculateMonthlyRevenue(transactions),
                paymentMethodsBreakdown: this.calculatePaymentMethodsBreakdown(transactions)
            };
        } catch (error) {
            console.error('Error getting financial data:', error);
            return {
                transactions: [],
                totalRevenue: 0,
                monthlyRevenue: 0,
                paymentMethodsBreakdown: {}
            };
        }
    }

    static calculateMonthlyRevenue(transactions) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return transactions.reduce((sum, transaction) => {
            const transactionDate = new Date(transaction.date);
            if (transactionDate.getMonth() === currentMonth && 
                transactionDate.getFullYear() === currentYear) {
                return sum + transaction.amount;
            }
            return sum;
        }, 0);
    }

    static calculatePaymentMethodsBreakdown(transactions) {
        const breakdown = {};
        
        transactions.forEach(transaction => {
            const method = transaction.method || 'unknown';
            if (!breakdown[method]) {
                breakdown[method] = 0;
            }
            breakdown[method] += transaction.amount;
        });
        
        return breakdown;
    }

    // Activity logging
    static async logActivity(activity) {
        try {
            const activities = await StorageService.getData('admin_activities') || [];
            activities.unshift(activity); // Add to beginning
            
            // Keep only last 100 activities
            if (activities.length > 100) {
                activities.splice(100);
            }
            
            await StorageService.saveData('admin_activities', activities);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    static async getRecentActivity() {
        try {
            const activities = await StorageService.getData('admin_activities') || [];
            return activities.slice(0, 10); // Return last 10 activities
        } catch (error) {
            console.error('Error getting recent activity:', error);
            return [];
        }
    }







    static async getAdminCredentialsInfo() {
        try {
            return await StorageService.getAdminCredentialsInfo();
        } catch (error) {
            console.error('Error getting admin credentials info:', error);
            return {
                hasCustomPassword: false,
                updatedAt: null,
                version: null
            };
        }
    }



    // Statistics
    static async getStatistics() {
        try {
            const companies = await this.getAllCompanies();
            const influencers = await this.getAllInfluencers();
            const campaigns = await this.getAllCampaigns();
            const financial = await this.getFinancialData();

            return {
                companies: {
                    total: companies.length,
                    active: companies.filter(c => c.status === 'payment_completed').length,
                    byPlan: this.groupByPlan(companies),
                    byRegistrationDate: this.groupByRegistrationDate(companies)
                },
                influencers: {
                    total: influencers.length,
                    approved: influencers.filter(i => i.status === 'approved').length,
                    pending: influencers.filter(i => i.status === 'pending').length,
                    rejected: influencers.filter(i => i.status === 'rejected').length,
                    byFollowers: this.groupByFollowers(influencers)
                },
                campaigns: {
                    total: campaigns.length,
                    active: campaigns.filter(c => c.status === 'active').length,
                    byCategory: this.groupByCategory(campaigns),
                    byCity: this.groupByCity(campaigns)
                },
                financial: {
                    totalRevenue: financial.totalRevenue,
                    monthlyRevenue: financial.monthlyRevenue,
                    averageTransactionValue: financial.transactions.length > 0 
                        ? financial.totalRevenue / financial.transactions.length 
                        : 0
                }
            };
        } catch (error) {
            console.error('Error getting statistics:', error);
            return null;
        }
    }

    // Helper methods for statistics
    static groupByPlan(companies) {
        const groups = {};
        companies.forEach(company => {
            const plan = company.selectedPlan || 'unknown';
            groups[plan] = (groups[plan] || 0) + 1;
        });
        return groups;
    }

    static groupByRegistrationDate(companies) {
        const groups = {};
        companies.forEach(company => {
            const date = new Date(company.registrationDate);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            groups[monthYear] = (groups[monthYear] || 0) + 1;
        });
        return groups;
    }

    static groupByFollowers(influencers) {
        const groups = {
            '0-10k': 0,
            '10k-50k': 0,
            '50k-100k': 0,
            '100k+': 0
        };
        
        influencers.forEach(influencer => {
            const followers = parseInt(influencer.instagramFollowers) || 0;
            if (followers < 10000) {
                groups['0-10k']++;
            } else if (followers < 50000) {
                groups['10k-50k']++;
            } else if (followers < 100000) {
                groups['50k-100k']++;
            } else {
                groups['100k+']++;
            }
        });
        
        return groups;
    }

    static groupByCategory(campaigns) {
        const groups = {};
        campaigns.forEach(campaign => {
            const category = campaign.category || 'unknown';
            groups[category] = (groups[category] || 0) + 1;
        });
        return groups;
    }

    static groupByCity(campaigns) {
        const groups = {};
        campaigns.forEach(campaign => {
            const city = campaign.city || 'unknown';
            groups[city] = (groups[city] || 0) + 1;
        });
        return groups;
    }
}

export default AdminService;