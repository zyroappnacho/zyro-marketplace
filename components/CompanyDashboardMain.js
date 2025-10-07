import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import MinimalistIcons from './MinimalistIcons';
import { setCurrentScreen } from '../store/slices/uiSlice';
import StorageService from '../services/StorageService';
import EMVCalculationService from '../services/EMVCalculationService';
import CompanyAnalyticsService from '../services/CompanyAnalyticsService';

const { width } = Dimensions.get('window');

const CompanyDashboardMain = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [dashboardStats, setDashboardStats] = useState({
    totalCollaborations: 0,
    instagramStories: 0,
    instagramEMV: 0,
  });
  
  const [emvDetails, setEmvDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculatingEMV, setIsCalculatingEMV] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Obtener datos de la empresa actual
      const companyData = await StorageService.getCompanyData(user.id);
      const companyName = companyData?.companyName || user?.companyName || 'Mi Empresa';
      
      console.log(`🏢 Cargando datos para empresa: "${companyName}"`);
      
      // Importar el servicio de solicitudes de colaboración
      const CollaborationRequestService = (await import('../services/CollaborationRequestService')).default;
      
      // Obtener TODAS las solicitudes de colaboración
      const allRequests = await CollaborationRequestService.getAllRequests();
      console.log(`📋 Total de solicitudes encontradas: ${allRequests.length}`);
      
      // Filtrar solicitudes aprobadas (confirmadas) para esta empresa específica
      const companyApprovedRequests = allRequests.filter(request => {
        // Verificar que la solicitud esté aprobada
        const isApproved = request.status === 'approved';
        
        // Verificar que corresponda a esta empresa específica
        const matchesCompany = request.businessName === companyName || 
                              request.collaborationTitle?.includes(companyName) ||
                              request.companyId === user.id;
        
        if (isApproved && matchesCompany) {
          console.log(`✅ Solicitud confirmada encontrada para ${companyName}:`, {
            id: request.id,
            businessName: request.businessName,
            collaborationTitle: request.collaborationTitle,
            influencer: request.userName,
            instagram: request.userInstagram,
            fecha: request.selectedDate,
            hora: request.selectedTime,
            estado: request.status
          });
        }
        
        return isApproved && matchesCompany;
      });
      
      console.log(`📋 Solicitudes confirmadas para ${companyName}: ${companyApprovedRequests.length}`);
      
      // Filtrar solo colaboraciones que ya han pasado la fecha (completadas)
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Establecer a medianoche para comparación precisa
      
      const completedCollaborations = companyApprovedRequests.filter(request => {
        if (request.selectedDate) {
          const collaborationDate = new Date(request.selectedDate);
          collaborationDate.setHours(0, 0, 0, 0);
          const isCompleted = collaborationDate < currentDate;
          
          console.log(`📅 Verificando fecha de colaboración:`, {
            solicitudId: request.id,
            colaboracion: request.collaborationTitle,
            fechaColaboracion: collaborationDate.toLocaleDateString(),
            fechaActual: currentDate.toLocaleDateString(),
            completada: isCompleted
          });
          
          return isCompleted;
        } else {
          // Si no hay fecha específica, verificar si tiene fecha de aprobación antigua
          if (request.reviewedAt) {
            const reviewedDate = new Date(request.reviewedAt);
            // Considerar completada si fue aprobada hace más de 7 días
            const daysSinceReview = (currentDate - reviewedDate) / (1000 * 60 * 60 * 24);
            const isCompleted = daysSinceReview > 7;
            
            console.log(`📅 Verificando por fecha de aprobación:`, {
              solicitudId: request.id,
              fechaAprobacion: reviewedDate.toLocaleDateString(),
              diasDesdeAprobacion: Math.floor(daysSinceReview),
              completada: isCompleted
            });
            
            return isCompleted;
          }
          
          // Si no hay fechas, no contar como completada
          console.log(`⚠️ Sin fecha para verificar completitud de colaboración ${request.id}`);
          return false;
        }
      });
      
      // Calcular estadísticas del dashboard
      const totalCollaborations = completedCollaborations.length;
      const instagramStories = totalCollaborations * 2; // Cada colaboración = 2 historias
      
      console.log(`📊 Dashboard Stats básicas para ${companyName}:`, {
        totalSolicitudesConfirmadas: companyApprovedRequests.length,
        colaboracionesCompletadas: totalCollaborations,
        instagramStories
      });
      
      // Log detallado de colaboraciones completadas
      if (completedCollaborations.length > 0) {
        console.log(`✅ Colaboraciones completadas para ${companyName}:`);
        completedCollaborations.forEach((collab, index) => {
          console.log(`  ${index + 1}. ${collab.collaborationTitle} - ${collab.userName} (@${collab.userInstagram}) - ${collab.selectedDate}`);
        });
      }
      
      // Calcular EMV usando el servicio especializado
      setIsCalculatingEMV(true);
      console.log(`💰 Iniciando cálculo de EMV para ${companyName}...`);
      
      const emvResult = await EMVCalculationService.calculateCompanyTotalEMV(companyName, user.id);
      
      console.log(`📊 Resultado EMV completo:`, emvResult);
      
      setDashboardStats({
        totalCollaborations,
        instagramStories,
        instagramEMV: emvResult.totalEMV,
      });
      
      setEmvDetails(emvResult);
      setIsCalculatingEMV(false);
      
      // Cargar analytics adicionales
      await loadAnalytics(companyName, user.id);
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      setIsLoading(false);
      setIsCalculatingEMV(false);
      setIsLoadingAnalytics(false);
    }
  };

  const handleEMVDetails = () => {
    if (!emvDetails || emvDetails.totalEMV === 0) {
      Alert.alert(
        'Instagram EMV',
        'Aún no hay colaboraciones completadas para calcular el EMV.\n\nEl EMV se calculará automáticamente cuando:\n• Los influencers completen colaboraciones\n• Las fechas de colaboración hayan pasado\n• Los influencers tengan datos de seguidores registrados',
        [{ text: 'Entendido' }]
      );
      return;
    }

    const detailsText = emvDetails.emvDetails.map((detail, index) => {
      // Limpiar el username de Instagram para evitar doble @
      const cleanInstagram = detail.influencerInstagram?.startsWith('@') 
        ? detail.influencerInstagram 
        : `@${detail.influencerInstagram}`;
      
      return `${index + 1}. ${detail.influencerName} (${cleanInstagram})\n` +
        `   Seguidores: ${detail.followers.toLocaleString()}\n` +
        `   EMV: €${detail.emv}\n` +
        `   Tier: ${detail.followerTier}\n`;
    }).join('\n');

    Alert.alert(
      'Detalles Instagram EMV',
      `EMV Total: €${emvDetails.totalEMV}\n` +
      `Colaboraciones: ${emvDetails.totalCollaborations}\n` +
      `Historias: ${emvDetails.totalStories}\n\n` +
      `Desglose por influencer:\n${detailsText}`,
      [{ text: 'Cerrar' }],
      { cancelable: true }
    );
  };

  const loadAnalytics = async (companyName, userId) => {
    try {
      setIsLoadingAnalytics(true);
      console.log('📊 Cargando analytics adicionales...');
      
      const analyticsData = await CompanyAnalyticsService.calculateCompanyAnalytics(companyName, userId);
      setAnalytics(analyticsData);
      
      console.log('✅ Analytics cargados:', analyticsData);
      setIsLoadingAnalytics(false);
    } catch (error) {
      console.error('❌ Error cargando analytics:', error);
      setIsLoadingAnalytics(false);
    }
  };

  const DashboardCard = ({ title, value, icon, color, subtitle, onPress, isLoading }) => (
    <TouchableOpacity 
      style={[styles.dashboardCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={isLoading}
    >
      <View style={styles.cardHeader}>
        <MinimalistIcons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      <Text style={styles.cardValue}>{isLoading ? '...' : value}</Text>
      {onPress && (
        <View style={styles.cardAction}>
          <MinimalistIcons name="help" size={20} color={color} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => dispatch(setCurrentScreen('company'))}
        >
          <MinimalistIcons name="back" size={24} color="#C9A961" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard de Empresa</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadDashboardData}
        >
          <MinimalistIcons name="refresh" size={24} color="#C9A961" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Dashboard Principal de Empresa */}
        <View style={styles.section}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
          ) : (
            <View style={styles.dashboardGrid}>
              {/* Colaboraciones */}
              <DashboardCard
                title="Colaboraciones"
                value={dashboardStats.totalCollaborations}
                icon="users"
                color="#C9A961"
                subtitle="Total realizadas"
              />
              
              {/* Historias Instagram */}
              <DashboardCard
                title="Historias Instagram"
                value={dashboardStats.instagramStories}
                icon="instagram"
                color="#E4405F"
                subtitle="Publicadas por influencers"
              />
              
              {/* Instagram EMV */}
              <DashboardCard
                title="Instagram EMV"
                value={dashboardStats.instagramEMV > 0 ? 
                  EMVCalculationService.formatEMV(dashboardStats.instagramEMV) : 
                  '€0'
                }
                icon="trending"
                color="#007AFF"
                subtitle="Valor mediático equivalente"
                onPress={handleEMVDetails}
                isLoading={isCalculatingEMV}
              />
            </View>
          )}
        </View>

        {/* Nuevas Secciones de Analytics */}
        {analytics && !isLoadingAnalytics && (
          <>
            {/* Sección de Alcance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alcance e Impacto</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <MinimalistIcons name="users" size={24} color="#34C759" />
                  <Text style={styles.metricValue}>
                    {CompanyAnalyticsService.formatLargeNumber(analytics.reach.totalFollowers)}
                  </Text>
                  <Text style={styles.metricLabel}>Seguidores Alcanzados</Text>
                </View>
                
                <View style={styles.metricCard}>
                  <MinimalistIcons name="trending" size={24} color="#FF9500" />
                  <Text style={styles.metricValue}>
                    {CompanyAnalyticsService.formatLargeNumber(analytics.reach.totalImpressions)}
                  </Text>
                  <Text style={styles.metricLabel}>Impresiones Estimadas</Text>
                </View>
              </View>
            </View>

            {/* Sección de Eficiencia */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Eficiencia Operativa</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <MinimalistIcons name="check" size={24} color="#34C759" />
                  <Text style={styles.metricValue}>{analytics.efficiency.approvalRate}%</Text>
                  <Text style={styles.metricLabel}>Tasa de Aprobación</Text>
                </View>
                
                <View style={styles.metricCard}>
                  <MinimalistIcons name="history" size={24} color="#007AFF" />
                  <Text style={styles.metricValue}>{analytics.efficiency.averageDaysToCollaboration}</Text>
                  <Text style={styles.metricLabel}>Días Promedio</Text>
                </View>
              </View>
            </View>

            {/* Sección de Influencers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gestión de Influencers</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <MinimalistIcons name="profile" size={24} color="#C9A961" />
                  <Text style={styles.metricValue}>{analytics.influencers.uniqueInfluencers}</Text>
                  <Text style={styles.metricLabel}>Influencers Únicos</Text>
                </View>
                
                <View style={styles.metricCard}>
                  <MinimalistIcons name="star" size={24} color="#8E44AD" />
                  <Text style={styles.metricValue}>{analytics.influencers.recurrentInfluencers}</Text>
                  <Text style={styles.metricLabel}>Influencers Recurrentes</Text>
                </View>
              </View>
            </View>

            {/* Sección de Tendencias */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tendencias Mensuales</Text>
              <View style={styles.trendCard}>
                <View style={styles.trendHeader}>
                  <Text style={styles.trendTitle}>Este Mes</Text>
                  <View style={[
                    styles.trendBadge, 
                    { backgroundColor: analytics.temporal.monthlyGrowth >= 0 ? '#34C759' : '#FF3B30' }
                  ]}>
                    <MinimalistIcons 
                      name="trending" 
                      size={12} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.trendBadgeText}>
                      {analytics.temporal.monthlyGrowth >= 0 ? '+' : ''}{analytics.temporal.monthlyGrowth}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.trendStats}>
                  <View style={styles.trendStat}>
                    <Text style={styles.trendStatValue}>{analytics.temporal.thisMonthCollaborations}</Text>
                    <Text style={styles.trendStatLabel}>Colaboraciones</Text>
                  </View>
                  <View style={styles.trendStat}>
                    <Text style={styles.trendStatValue}>{analytics.temporal.thisMonthRequests}</Text>
                    <Text style={styles.trendStatLabel}>Solicitudes</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Top Performers */}
            {analytics.topPerformers.topInfluencersByEMV.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Influencers por EMV</Text>
                {analytics.topPerformers.topInfluencersByEMV.slice(0, 3).map((influencer, index) => (
                  <View key={index} style={styles.topPerformerCard}>
                    <View style={styles.topPerformerRank}>
                      <Text style={styles.rankNumber}>{index + 1}</Text>
                    </View>
                    <View style={styles.topPerformerInfo}>
                      <Text style={styles.topPerformerName}>{influencer.name}</Text>
                      <Text style={styles.topPerformerInstagram}>
                        {influencer.instagram?.startsWith('@') ? influencer.instagram : `@${influencer.instagram}`}
                      </Text>
                    </View>
                    <View style={styles.topPerformerStats}>
                      <Text style={styles.topPerformerEMV}>€{influencer.totalEMV.toFixed(0)}</Text>
                      <Text style={styles.topPerformerCollabs}>{influencer.collaborations} colabs</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Loading Analytics */}
        {isLoadingAnalytics && (
          <View style={styles.section}>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando analytics avanzados...</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 25,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  dashboardGrid: {
    gap: 20,
  },
  dashboardCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    borderLeftWidth: 5,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '600',
    color: '#FFFFFF',
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#AAAAAA',
    fontStyle: 'italic',
  },
  cardAction: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.7,
  },
  
  // Nuevos estilos para analytics
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  trendCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trendStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trendStat: {
    alignItems: 'center',
  },
  trendStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trendStatLabel: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  topPerformerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  topPerformerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C9A961',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  topPerformerInfo: {
    flex: 1,
  },
  topPerformerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  topPerformerInstagram: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  topPerformerStats: {
    alignItems: 'flex-end',
  },
  topPerformerEMV: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 2,
  },
  topPerformerCollabs: {
    fontSize: 11,
    color: '#AAAAAA',
  },
});

export default CompanyDashboardMain;