/**
 * Servicio para calcular métricas avanzadas del dashboard de empresa
 * Proporciona análisis completos de rendimiento, alcance y eficiencia
 */

import StorageService from './StorageService';
import EMVCalculationService from './EMVCalculationService';

class CompanyAnalyticsService {
  
  /**
   * Calcular todas las métricas del dashboard para una empresa
   * @param {string} companyName - Nombre de la empresa
   * @param {string} userId - ID del usuario de la empresa
   * @returns {Object} Métricas completas del dashboard
   */
  static async calculateCompanyAnalytics(companyName, userId) {
    try {
      console.log(`📊 Calculando analytics completos para: ${companyName}`);
      
      // Obtener datos base
      const { allRequests, completedCollaborations, pendingRequests, upcomingRequests } = 
        await this.getBaseCollaborationData(companyName, userId);
      
      // Calcular métricas principales
      const reachMetrics = await this.calculateReachMetrics(completedCollaborations);
      const efficiencyMetrics = this.calculateEfficiencyMetrics(allRequests, completedCollaborations);
      const influencerMetrics = await this.calculateInfluencerMetrics(completedCollaborations);
      const temporalMetrics = this.calculateTemporalMetrics(completedCollaborations, allRequests);
      const topPerformers = await this.calculateTopPerformers(completedCollaborations);
      
      const analytics = {
        // Métricas de alcance
        reach: reachMetrics,
        
        // Métricas de eficiencia
        efficiency: efficiencyMetrics,
        
        // Métricas de influencers
        influencers: influencerMetrics,
        
        // Métricas temporales
        temporal: temporalMetrics,
        
        // Top performers
        topPerformers: topPerformers,
        
        // Contadores básicos
        counts: {
          totalRequests: allRequests.length,
          completedCollaborations: completedCollaborations.length,
          pendingRequests: pendingRequests.length,
          upcomingRequests: upcomingRequests.length
        },
        
        // Metadatos
        calculatedAt: new Date().toISOString(),
        companyName,
        userId
      };
      
      console.log('📈 Analytics calculados:', analytics);
      return analytics;
      
    } catch (error) {
      console.error('❌ Error calculando analytics:', error);
      return this.getEmptyAnalytics(companyName, userId);
    }
  }
  
  /**
   * Obtener datos base de colaboraciones
   */
  static async getBaseCollaborationData(companyName, userId) {
    const CollaborationRequestService = (await import('./CollaborationRequestService')).default;
    const allRequests = await CollaborationRequestService.getAllRequests();
    
    // Filtrar solicitudes de esta empresa
    const companyRequests = allRequests.filter(request => {
      return request.businessName === companyName || 
             request.collaborationTitle?.includes(companyName) ||
             request.companyId === userId;
    });
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Clasificar solicitudes
    const completedCollaborations = companyRequests.filter(request => {
      if (request.status !== 'approved') return false;
      if (!request.selectedDate) return false;
      
      const collaborationDate = new Date(request.selectedDate);
      collaborationDate.setHours(0, 0, 0, 0);
      return collaborationDate < currentDate;
    });
    
    const pendingRequests = companyRequests.filter(request => request.status === 'pending');
    
    const upcomingRequests = companyRequests.filter(request => {
      if (request.status !== 'approved') return false;
      if (!request.selectedDate) return true; // Sin fecha = próxima
      
      const collaborationDate = new Date(request.selectedDate);
      collaborationDate.setHours(0, 0, 0, 0);
      return collaborationDate >= currentDate;
    });
    
    return {
      allRequests: companyRequests,
      completedCollaborations,
      pendingRequests,
      upcomingRequests
    };
  }
  
  /**
   * Calcular métricas de alcance
   */
  static async calculateReachMetrics(completedCollaborations) {
    let totalFollowers = 0;
    let totalImpressions = 0;
    const cityReach = {};
    const categoryReach = {};
    
    for (const collaboration of completedCollaborations) {
      // Obtener datos del influencer
      const influencerData = await EMVCalculationService.getInfluencerData(collaboration.userId);
      const followers = influencerData?.followers || 0;
      
      if (followers > 0) {
        totalFollowers += followers;
        
        // Calcular impresiones estimadas
        const emvData = EMVCalculationService.calculateInfluencerEMV(followers);
        totalImpressions += emvData.impressions;
        
        // Agrupar por ciudad
        const city = collaboration.city || 'Sin especificar';
        cityReach[city] = (cityReach[city] || 0) + followers;
        
        // Agrupar por categoría
        const category = collaboration.category || 'Sin especificar';
        categoryReach[category] = (categoryReach[category] || 0) + followers;
      }
    }
    
    return {
      totalFollowers,
      totalImpressions,
      averageFollowersPerCollaboration: completedCollaborations.length > 0 ? 
        Math.round(totalFollowers / completedCollaborations.length) : 0,
      cityReach: this.sortObjectByValue(cityReach),
      categoryReach: this.sortObjectByValue(categoryReach)
    };
  }
  
  /**
   * Calcular métricas de eficiencia
   */
  static calculateEfficiencyMetrics(allRequests, completedCollaborations) {
    const approvedRequests = allRequests.filter(r => r.status === 'approved');
    const rejectedRequests = allRequests.filter(r => r.status === 'rejected');
    const pendingRequests = allRequests.filter(r => r.status === 'pending');
    
    const approvalRate = allRequests.length > 0 ? 
      (approvedRequests.length / allRequests.length) * 100 : 0;
    
    const completionRate = approvedRequests.length > 0 ? 
      (completedCollaborations.length / approvedRequests.length) * 100 : 0;
    
    // Calcular tiempo promedio hasta colaboración
    let totalDays = 0;
    let validCollaborations = 0;
    
    completedCollaborations.forEach(collaboration => {
      if (collaboration.createdAt && collaboration.selectedDate) {
        const createdDate = new Date(collaboration.createdAt);
        const collaborationDate = new Date(collaboration.selectedDate);
        const daysDiff = Math.ceil((collaborationDate - createdDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 0 && daysDiff < 365) { // Filtrar valores extremos
          totalDays += daysDiff;
          validCollaborations++;
        }
      }
    });
    
    const averageDaysToCollaboration = validCollaborations > 0 ? 
      Math.round(totalDays / validCollaborations) : 0;
    
    return {
      approvalRate: Math.round(approvalRate * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      rejectionRate: Math.round((rejectedRequests.length / allRequests.length) * 100 * 100) / 100,
      averageDaysToCollaboration,
      totalApproved: approvedRequests.length,
      totalRejected: rejectedRequests.length,
      totalPending: pendingRequests.length
    };
  }
  
  /**
   * Calcular métricas de influencers
   */
  static async calculateInfluencerMetrics(completedCollaborations) {
    const influencerStats = {};
    const tierCounts = { NANO: 0, MICRO: 0, MACRO: 0, MEGA: 0 };
    let uniqueInfluencers = new Set();
    
    for (const collaboration of completedCollaborations) {
      const userId = collaboration.userId;
      uniqueInfluencers.add(userId);
      
      // Contar colaboraciones por influencer
      if (!influencerStats[userId]) {
        influencerStats[userId] = {
          name: collaboration.userName,
          instagram: collaboration.userInstagram,
          collaborations: 0,
          totalEMV: 0
        };
      }
      influencerStats[userId].collaborations++;
      
      // Obtener datos del influencer para tier y EMV
      const influencerData = await EMVCalculationService.getInfluencerData(userId);
      const followers = influencerData?.followers || 0;
      
      if (followers > 0) {
        const tier = EMVCalculationService.getFollowerTier(followers);
        tierCounts[tier]++;
        
        const emvData = EMVCalculationService.calculateInfluencerEMV(followers);
        influencerStats[userId].totalEMV += emvData.emv;
        influencerStats[userId].followers = followers;
        influencerStats[userId].tier = tier;
      }
    }
    
    // Encontrar influencers recurrentes
    const recurrentInfluencers = Object.values(influencerStats)
      .filter(inf => inf.collaborations > 1).length;
    
    return {
      uniqueInfluencers: uniqueInfluencers.size,
      recurrentInfluencers,
      tierDistribution: tierCounts,
      averageCollaborationsPerInfluencer: uniqueInfluencers.size > 0 ? 
        Math.round((completedCollaborations.length / uniqueInfluencers.size) * 100) / 100 : 0
    };
  }
  
  /**
   * Calcular métricas temporales
   */
  static calculateTemporalMetrics(completedCollaborations, allRequests) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Colaboraciones este mes
    const thisMonthCollaborations = completedCollaborations.filter(collab => {
      if (!collab.selectedDate) return false;
      const collabDate = new Date(collab.selectedDate);
      return collabDate.getMonth() === currentMonth && collabDate.getFullYear() === currentYear;
    });
    
    // Colaboraciones mes anterior
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthCollaborations = completedCollaborations.filter(collab => {
      if (!collab.selectedDate) return false;
      const collabDate = new Date(collab.selectedDate);
      return collabDate.getMonth() === lastMonth && collabDate.getFullYear() === lastMonthYear;
    });
    
    // Calcular crecimiento
    const monthlyGrowth = lastMonthCollaborations.length > 0 ? 
      ((thisMonthCollaborations.length - lastMonthCollaborations.length) / lastMonthCollaborations.length) * 100 : 
      (thisMonthCollaborations.length > 0 ? 100 : 0);
    
    // Solicitudes este mes
    const thisMonthRequests = allRequests.filter(request => {
      if (!request.createdAt) return false;
      const requestDate = new Date(request.createdAt);
      return requestDate.getMonth() === currentMonth && requestDate.getFullYear() === currentYear;
    });
    
    return {
      thisMonthCollaborations: thisMonthCollaborations.length,
      lastMonthCollaborations: lastMonthCollaborations.length,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
      thisMonthRequests: thisMonthRequests.length
    };
  }
  
  /**
   * Calcular top performers
   */
  static async calculateTopPerformers(completedCollaborations) {
    const influencerPerformance = {};
    
    for (const collaboration of completedCollaborations) {
      const userId = collaboration.userId;
      
      if (!influencerPerformance[userId]) {
        influencerPerformance[userId] = {
          name: collaboration.userName,
          instagram: collaboration.userInstagram,
          collaborations: 0,
          totalEMV: 0,
          followers: 0
        };
      }
      
      influencerPerformance[userId].collaborations++;
      
      // Calcular EMV
      const influencerData = await EMVCalculationService.getInfluencerData(userId);
      const followers = influencerData?.followers || 0;
      
      if (followers > 0) {
        const emvData = EMVCalculationService.calculateInfluencerEMV(followers);
        influencerPerformance[userId].totalEMV += emvData.emv;
        influencerPerformance[userId].followers = followers;
      }
    }
    
    // Ordenar por EMV total
    const topInfluencers = Object.values(influencerPerformance)
      .filter(inf => inf.totalEMV > 0)
      .sort((a, b) => b.totalEMV - a.totalEMV)
      .slice(0, 5);
    
    return {
      topInfluencersByEMV: topInfluencers
    };
  }
  
  /**
   * Ordenar objeto por valores (descendente)
   */
  static sortObjectByValue(obj) {
    return Object.entries(obj)
      .sort(([,a], [,b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  }
  
  /**
   * Formatear números grandes
   */
  static formatLargeNumber(num) {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }
  
  /**
   * Obtener analytics vacíos en caso de error
   */
  static getEmptyAnalytics(companyName, userId) {
    return {
      reach: {
        totalFollowers: 0,
        totalImpressions: 0,
        averageFollowersPerCollaboration: 0,
        cityReach: {},
        categoryReach: {}
      },
      efficiency: {
        approvalRate: 0,
        completionRate: 0,
        rejectionRate: 0,
        averageDaysToCollaboration: 0,
        totalApproved: 0,
        totalRejected: 0,
        totalPending: 0
      },
      influencers: {
        uniqueInfluencers: 0,
        recurrentInfluencers: 0,
        tierDistribution: { NANO: 0, MICRO: 0, MACRO: 0, MEGA: 0 },
        averageCollaborationsPerInfluencer: 0
      },
      temporal: {
        thisMonthCollaborations: 0,
        lastMonthCollaborations: 0,
        monthlyGrowth: 0,
        thisMonthRequests: 0
      },
      topPerformers: {
        topInfluencersByEMV: []
      },
      counts: {
        totalRequests: 0,
        completedCollaborations: 0,
        pendingRequests: 0,
        upcomingRequests: 0
      },
      calculatedAt: new Date().toISOString(),
      companyName,
      userId,
      error: true
    };
  }
}

export default CompanyAnalyticsService;