/**
 * Servicio para calcular el EMV (Earned Media Value) de Instagram
 * Calcula el valor mediático equivalente basado en seguidores, engagement y CPM
 */

import StorageService from './StorageService';

class EMVCalculationService {
  // Configuración base para cálculos EMV - Datos del mercado español 2024
  static CONFIG = {
    CPM_BASE: 6.20, // €6.20 CPM promedio para Instagram Stories en España (actualizado)
    ENGAGEMENT_RATE_DEFAULT: 0.038, // 3.8% engagement rate promedio en España
    STORIES_PER_COLLABORATION: 2, // Historias por colaboración (ajustable)
    CURRENCY: 'EUR',
    // Factores de ajuste por rango de seguidores - Mercado español
    FOLLOWER_MULTIPLIERS: {
      NANO: { min: 1000, max: 10000, multiplier: 1.0, engagement: 0.055 }, // 1K-10K, 5.5% engagement
      MICRO: { min: 10000, max: 100000, multiplier: 1.3, engagement: 0.042 }, // 10K-100K, 4.2% engagement
      MACRO: { min: 100000, max: 1000000, multiplier: 1.7, engagement: 0.028 }, // 100K-1M, 2.8% engagement
      MEGA: { min: 1000000, max: Infinity, multiplier: 2.2, engagement: 0.018 } // 1M+, 1.8% engagement
    },
    // CPM específico por tier en España
    CPM_BY_TIER: {
      NANO: 4.80, // €4.80 para nano influencers
      MICRO: 6.20, // €6.20 para micro influencers
      MACRO: 8.50, // €8.50 para macro influencers
      MEGA: 12.00 // €12.00 para mega influencers
    }
  };

  /**
   * Calcular EMV para un influencer específico
   * @param {number} followers - Número de seguidores del influencer
   * @param {number} engagementRate - Tasa de engagement (opcional)
   * @param {number} storiesCount - Número de historias publicadas
   * @returns {Object} Datos del cálculo EMV
   */
  static calculateInfluencerEMV(followers, engagementRate = null, storiesCount = 2) {
    try {
      // Validar entrada
      if (!followers || followers <= 0) {
        return {
          emv: 0,
          impressions: 0,
          cpm: this.CONFIG.CPM_BASE,
          engagementRate: this.CONFIG.ENGAGEMENT_RATE_DEFAULT,
          storiesCount: storiesCount || 2,
          followerTier: 'NONE',
          error: 'Seguidores inválidos'
        };
      }

      // Determinar el tier del influencer
      const followerTier = this.getFollowerTier(followers);
      const tierMultiplier = this.getFollowerMultiplier(followers);
      
      // Usar engagement rate específico por tier o el proporcionado
      const tierEngagement = this.getTierEngagementRate(followerTier);
      const effectiveEngagementRate = engagementRate || tierEngagement;
      
      // Usar CPM específico por tier
      const tierCPM = this.getTierCPM(followerTier);
      
      // Calcular impresiones estimadas
      const baseImpressions = followers * effectiveEngagementRate * storiesCount;
      const adjustedImpressions = baseImpressions * tierMultiplier;
      
      // Calcular EMV con CPM específico del tier
      const emv = (adjustedImpressions * tierCPM) / 1000;
      
      console.log(`📊 EMV calculado para influencer (España):`, {
        seguidores: followers.toLocaleString(),
        tier: followerTier,
        engagementRate: `${(effectiveEngagementRate * 100).toFixed(1)}%`,
        cpm: `€${tierCPM}`,
        multiplicador: tierMultiplier,
        impresiones: Math.round(adjustedImpressions).toLocaleString(),
        emv: `€${Math.round(emv * 100) / 100}`
      });
      
      return {
        emv: Math.round(emv * 100) / 100, // Redondear a 2 decimales
        impressions: Math.round(adjustedImpressions),
        cpm: tierCPM,
        engagementRate: effectiveEngagementRate,
        storiesCount: storiesCount || 2,
        followerTier,
        tierMultiplier,
        followers
      };
      
    } catch (error) {
      console.error('Error calculando EMV para influencer:', error);
      return {
        emv: 0,
        impressions: 0,
        cpm: this.CONFIG.CPM_BASE,
        engagementRate: this.CONFIG.ENGAGEMENT_RATE_DEFAULT,
        storiesCount: storiesCount || 2,
        followerTier: 'ERROR',
        error: error.message
      };
    }
  }

  /**
   * Calcular EMV total para una empresa específica
   * @param {string} companyName - Nombre de la empresa
   * @param {string} userId - ID del usuario de la empresa
   * @returns {Object} EMV total y detalles
   */
  static async calculateCompanyTotalEMV(companyName, userId) {
    try {
      console.log(`🏢 Calculando EMV total para empresa: "${companyName}"`);
      
      // Importar el servicio de solicitudes de colaboración
      const CollaborationRequestService = (await import('./CollaborationRequestService')).default;
      
      // Obtener todas las solicitudes de colaboración
      const allRequests = await CollaborationRequestService.getAllRequests();
      
      // Filtrar solicitudes aprobadas para esta empresa específica
      const companyApprovedRequests = allRequests.filter(request => {
        const isApproved = request.status === 'approved';
        const matchesCompany = request.businessName === companyName || 
                              request.collaborationTitle?.includes(companyName) ||
                              request.companyId === userId;
        
        return isApproved && matchesCompany;
      });
      
      console.log(`📋 Solicitudes aprobadas encontradas: ${companyApprovedRequests.length}`);
      
      // Filtrar colaboraciones completadas (fechas pasadas)
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      const completedCollaborations = companyApprovedRequests.filter(request => {
        if (request.selectedDate) {
          const collaborationDate = new Date(request.selectedDate);
          collaborationDate.setHours(0, 0, 0, 0);
          return collaborationDate < currentDate;
        } else if (request.reviewedAt) {
          const reviewedDate = new Date(request.reviewedAt);
          const daysSinceReview = (currentDate - reviewedDate) / (1000 * 60 * 60 * 24);
          return daysSinceReview > 7; // Considerar completada si fue aprobada hace más de 7 días
        }
        return false;
      });
      
      console.log(`✅ Colaboraciones completadas: ${completedCollaborations.length}`);
      
      // Calcular EMV para cada colaboración completada
      let totalEMV = 0;
      const emvDetails = [];
      
      for (const collaboration of completedCollaborations) {
        try {
          // Obtener datos del influencer
          const influencerData = await this.getInfluencerData(collaboration.userId);
          const followers = influencerData?.followers || 0;
          
          if (followers > 0) {
            const emvData = this.calculateInfluencerEMV(followers);
            totalEMV += emvData.emv;
            
            // Limpiar username de Instagram para evitar doble @
            const cleanInstagram = this.cleanInstagramUsername(collaboration.userInstagram);
            
            emvDetails.push({
              collaborationId: collaboration.id,
              influencerName: collaboration.userName,
              influencerInstagram: cleanInstagram,
              followers: followers,
              emv: emvData.emv,
              impressions: emvData.impressions,
              followerTier: emvData.followerTier,
              collaborationTitle: collaboration.collaborationTitle,
              collaborationDate: collaboration.selectedDate
            });
            
            console.log(`💰 EMV calculado para ${collaboration.userName}: €${emvData.emv}`);
          } else {
            console.log(`⚠️ Sin datos de seguidores para ${collaboration.userName}`);
          }
        } catch (error) {
          console.error(`Error calculando EMV para colaboración ${collaboration.id}:`, error);
        }
      }
      
      const result = {
        totalEMV: Math.round(totalEMV * 100) / 100,
        totalCollaborations: completedCollaborations.length,
        totalStories: completedCollaborations.length * this.CONFIG.STORIES_PER_COLLABORATION,
        emvDetails,
        calculatedAt: new Date().toISOString(),
        companyName,
        currency: this.CONFIG.CURRENCY
      };
      
      console.log(`📊 EMV total calculado para ${companyName}: €${result.totalEMV}`);
      
      return result;
      
    } catch (error) {
      console.error('Error calculando EMV total de empresa:', error);
      return {
        totalEMV: 0,
        totalCollaborations: 0,
        totalStories: 0,
        emvDetails: [],
        error: error.message,
        calculatedAt: new Date().toISOString(),
        companyName,
        currency: this.CONFIG.CURRENCY
      };
    }
  }

  /**
   * Obtener datos del influencer desde múltiples fuentes
   * @param {string} userId - ID del usuario influencer
   * @returns {Object} Datos del influencer
   */
  static async getInfluencerData(userId) {
    try {
      console.log(`🔍 Buscando datos de seguidores para usuario: ${userId}`);
      
      // 1. Intentar obtener desde el usuario actual si coincide
      const currentUser = await StorageService.getUser();
      if (currentUser && currentUser.id === userId) {
        console.log(`📱 Verificando usuario actual:`, {
          id: currentUser.id,
          followers: currentUser.followers,
          seguidores: currentUser.seguidores,
          instagramFollowers: currentUser.instagramFollowers
        });
        
        // Buscar seguidores en diferentes campos posibles
        const followers = currentUser.followers || 
                         currentUser.seguidores || 
                         currentUser.instagramFollowers ||
                         currentUser.followersCount;
                         
        if (followers && followers > 0) {
          return {
            followers: parseInt(followers),
            instagram: currentUser.instagram,
            name: currentUser.name || currentUser.username,
            source: 'currentUser'
          };
        }
      }
      
      // 2. Intentar obtener desde datos específicos de usuario por ID
      const userById = await StorageService.getData(`user_${userId}`);
      if (userById) {
        console.log(`👤 Datos de usuario por ID:`, userById);
        const followers = userById.followers || 
                         userById.seguidores || 
                         userById.instagramFollowers ||
                         userById.followersCount;
                         
        if (followers && followers > 0) {
          return {
            followers: parseInt(followers),
            instagram: userById.instagram,
            name: userById.name || userById.username,
            source: 'userById'
          };
        }
      }
      
      // 3. Intentar obtener desde perfil persistente
      const profileData = await StorageService.getData(`user_profile_${userId}`);
      if (profileData) {
        console.log(`📋 Datos de perfil persistente:`, profileData);
        const followers = profileData.followers || 
                         profileData.seguidores || 
                         profileData.instagramFollowers ||
                         profileData.followersCount;
                         
        if (followers && followers > 0) {
          return {
            followers: parseInt(followers),
            instagram: profileData.instagram,
            name: profileData.name || profileData.username,
            source: 'profileData'
          };
        }
      }
      
      // 4. Intentar obtener desde datos específicos de influencer
      const influencerData = await StorageService.getData(`influencer_${userId}`);
      if (influencerData) {
        console.log(`🌟 Datos específicos de influencer:`, influencerData);
        const followers = influencerData.followers || 
                         influencerData.seguidores || 
                         influencerData.instagramFollowers ||
                         influencerData.followersCount;
                         
        if (followers && followers > 0) {
          return {
            followers: parseInt(followers),
            instagram: influencerData.instagram,
            name: influencerData.name || influencerData.username,
            source: 'influencerData'
          };
        }
      }
      
      // 5. Buscar en todos los usuarios registrados
      const allUsers = await StorageService.getData('all_users') || [];
      const foundUser = allUsers.find(user => user.id === userId);
      if (foundUser) {
        console.log(`👥 Usuario encontrado en lista completa:`, foundUser);
        const followers = foundUser.followers || 
                         foundUser.seguidores || 
                         foundUser.instagramFollowers ||
                         foundUser.followersCount;
                         
        if (followers && followers > 0) {
          return {
            followers: parseInt(followers),
            instagram: foundUser.instagram,
            name: foundUser.name || foundUser.username,
            source: 'allUsers'
          };
        }
      }
      
      console.log(`⚠️ No se encontraron datos de seguidores para usuario ${userId} en ninguna fuente`);
      
      // Como fallback, usar un valor estimado basado en el tier del usuario
      console.log(`🔄 Usando valor estimado de seguidores para cálculo EMV`);
      return {
        followers: 10000, // Valor por defecto para micro influencer
        instagram: 'unknown',
        name: 'Influencer',
        source: 'estimated',
        isEstimated: true
      };
      
    } catch (error) {
      console.error(`❌ Error obteniendo datos de influencer ${userId}:`, error);
      return null;
    }
  }

  /**
   * Determinar el tier del influencer basado en seguidores
   * @param {number} followers - Número de seguidores
   * @returns {string} Tier del influencer
   */
  static getFollowerTier(followers) {
    const tiers = this.CONFIG.FOLLOWER_MULTIPLIERS;
    
    if (followers >= tiers.MEGA.min) return 'MEGA';
    if (followers >= tiers.MACRO.min) return 'MACRO';
    if (followers >= tiers.MICRO.min) return 'MICRO';
    if (followers >= tiers.NANO.min) return 'NANO';
    
    return 'MICRO_NANO'; // Menos de 1K seguidores
  }

  /**
   * Obtener multiplicador basado en el tier de seguidores
   * @param {number} followers - Número de seguidores
   * @returns {number} Multiplicador para el cálculo
   */
  static getFollowerMultiplier(followers) {
    const tiers = this.CONFIG.FOLLOWER_MULTIPLIERS;
    
    if (followers >= tiers.MEGA.min) return tiers.MEGA.multiplier;
    if (followers >= tiers.MACRO.min) return tiers.MACRO.multiplier;
    if (followers >= tiers.MICRO.min) return tiers.MICRO.multiplier;
    if (followers >= tiers.NANO.min) return tiers.NANO.multiplier;
    
    return 0.8; // Multiplicador reducido para cuentas muy pequeñas
  }

  /**
   * Obtener engagement rate específico por tier
   * @param {string} tier - Tier del influencer
   * @returns {number} Engagement rate específico
   */
  static getTierEngagementRate(tier) {
    const tiers = this.CONFIG.FOLLOWER_MULTIPLIERS;
    
    switch (tier) {
      case 'MEGA': return tiers.MEGA.engagement;
      case 'MACRO': return tiers.MACRO.engagement;
      case 'MICRO': return tiers.MICRO.engagement;
      case 'NANO': return tiers.NANO.engagement;
      default: return this.CONFIG.ENGAGEMENT_RATE_DEFAULT;
    }
  }

  /**
   * Obtener CPM específico por tier
   * @param {string} tier - Tier del influencer
   * @returns {number} CPM específico para el tier
   */
  static getTierCPM(tier) {
    const cpmByTier = this.CONFIG.CPM_BY_TIER;
    
    switch (tier) {
      case 'MEGA': return cpmByTier.MEGA;
      case 'MACRO': return cpmByTier.MACRO;
      case 'MICRO': return cpmByTier.MICRO;
      case 'NANO': return cpmByTier.NANO;
      default: return this.CONFIG.CPM_BASE;
    }
  }

  /**
   * Formatear valor EMV para mostrar
   * @param {number} emv - Valor EMV
   * @returns {string} Valor formateado
   */
  static formatEMV(emv) {
    if (emv === 0) return '€0';
    if (emv < 1) return `€${emv.toFixed(2)}`;
    if (emv < 1000) return `€${Math.round(emv)}`;
    if (emv < 1000000) return `€${(emv / 1000).toFixed(1)}K`;
    return `€${(emv / 1000000).toFixed(1)}M`;
  }

  /**
   * Obtener configuración EMV personalizada para una empresa
   * @param {string} companyId - ID de la empresa
   * @returns {Object} Configuración personalizada
   */
  static async getCompanyEMVConfig(companyId) {
    try {
      const config = await StorageService.getData(`emv_config_${companyId}`);
      return config || this.CONFIG;
    } catch (error) {
      console.error('Error obteniendo configuración EMV:', error);
      return this.CONFIG;
    }
  }

  /**
   * Guardar configuración EMV personalizada para una empresa
   * @param {string} companyId - ID de la empresa
   * @param {Object} config - Nueva configuración
   * @returns {boolean} Éxito de la operación
   */
  static async saveCompanyEMVConfig(companyId, config) {
    try {
      const mergedConfig = { ...this.CONFIG, ...config };
      await StorageService.saveData(`emv_config_${companyId}`, mergedConfig);
      console.log(`✅ Configuración EMV guardada para empresa ${companyId}`);
      return true;
    } catch (error) {
      console.error('Error guardando configuración EMV:', error);
      return false;
    }
  }

  /**
   * Limpiar username de Instagram para evitar doble @
   * @param {string} instagram - Username de Instagram
   * @returns {string} Username limpio sin doble @
   */
  static cleanInstagramUsername(instagram) {
    if (!instagram) return '';
    
    // Remover @ al inicio si existe
    let cleanUsername = instagram.toString().trim();
    if (cleanUsername.startsWith('@')) {
      cleanUsername = cleanUsername.substring(1);
    }
    
    // Remover múltiples @ consecutivos
    cleanUsername = cleanUsername.replace(/^@+/, '');
    
    // Retornar sin @ (se agregará en la UI cuando sea necesario)
    return cleanUsername;
  }
}

export default EMVCalculationService;