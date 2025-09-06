import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchCompanyProfile,
  fetchCompanyCampaigns,
  fetchCompanyCollaborationRequests,
  fetchCompanyMetrics,
  clearError,
} from '../store/slices/companyDashboardSlice';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { theme } from '../styles/theme';
import { CollaborationRequest, Campaign } from '../types';

interface InfluencerRequestCardProps {
  request: CollaborationRequest;
  campaign: Campaign | undefined;
  onViewDetails: (request: CollaborationRequest) => void;
}

const InfluencerRequestCard: React.FC<InfluencerRequestCardProps> = ({
  request,
  campaign,
  onViewDetails,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'approved':
        return theme.colors.success;
      case 'completed':
        return theme.colors.primary;
      case 'rejected':
        return theme.colors.error;
      case 'cancelled':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'PENDIENTE';
      case 'approved':
        return 'APROBADA';
      case 'completed':
        return 'COMPLETADA';
      case 'rejected':
        return 'RECHAZADA';
      case 'cancelled':
        return 'CANCELADA';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => onViewDetails(request)}
      activeOpacity={0.8}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.campaignTitle}>
          {campaign?.title || 'Campaña no encontrada'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
          <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
        </View>
      </View>
      
      <View style={styles.requestDetails}>
        <Text style={styles.requestDate}>
          Solicitado: {new Date(request.requestDate).toLocaleDateString('es-ES')}
        </Text>
        
        {request.reservationDetails && (
          <Text style={styles.reservationInfo}>
            📅 {new Date(request.reservationDetails.date).toLocaleDateString('es-ES')} a las {request.reservationDetails.time}
            {request.reservationDetails.companions > 0 && ` • ${request.reservationDetails.companions} acompañantes`}
          </Text>
        )}
        
        {request.deliveryDetails && (
          <Text style={styles.deliveryInfo}>
            📦 Entrega: {request.deliveryDetails.address}
          </Text>
        )}
        
        <Text style={styles.proposedContent} numberOfLines={2}>
          💡 {request.proposedContent}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, color = theme.colors.primary }) => (
  <View style={styles.metricCard}>
    <Text style={[styles.metricValue, { color }]}>
      {value}
    </Text>
    <Text style={styles.metricTitle}>{title}</Text>
    {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
  </View>
);

export const CompanyDashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const {
    company,
    campaigns,
    collaborationRequests,
    metrics,
    loading,
    error,
  } = useAppSelector(state => state.companyDashboard);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      // First fetch company profile to get company ID
      const companyResult = await dispatch(fetchCompanyProfile(user.id)).unwrap();
      const companyId = companyResult.id;

      // Then fetch all other data
      await Promise.all([
        dispatch(fetchCompanyCampaigns(companyId)),
        dispatch(fetchCompanyCollaborationRequests(companyId)),
        dispatch(fetchCompanyMetrics(companyId)),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleViewRequestDetails = (request: CollaborationRequest) => {
    const campaign = campaigns.find(c => c.id === request.campaignId);
    
    Alert.alert(
      'Detalles de Solicitud',
      `Campaña: ${campaign?.title || 'No encontrada'}\n\n` +
      `Estado: ${request.status.toUpperCase()}\n` +
      `Fecha de solicitud: ${new Date(request.requestDate).toLocaleDateString('es-ES')}\n\n` +
      `Propuesta de contenido:\n${request.proposedContent}\n\n` +
      (request.reservationDetails ? 
        `Reserva: ${new Date(request.reservationDetails.date).toLocaleDateString('es-ES')} a las ${request.reservationDetails.time}\n` +
        `Acompañantes: ${request.reservationDetails.companions}\n` +
        (request.reservationDetails.specialRequests ? `Solicitudes especiales: ${request.reservationDetails.specialRequests}\n` : '') : '') +
      (request.deliveryDetails ? 
        `Dirección de entrega: ${request.deliveryDetails.address}\n` +
        `Teléfono: ${request.deliveryDetails.phone}\n` +
        `Horario preferido: ${request.deliveryDetails.preferredTime}\n` : '') +
      (request.adminNotes ? `\nNotas del administrador:\n${request.adminNotes}` : ''),
      [{ text: 'Cerrar', style: 'default' }]
    );
  };

  const renderRequestItem = ({ item }: { item: CollaborationRequest }) => {
    const campaign = campaigns.find(c => c.id === item.campaignId);
    return (
      <InfluencerRequestCard
        request={item}
        campaign={campaign}
        onViewDetails={handleViewRequestDetails}
      />
    );
  };

  if (loading.company) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ZyroLogo size="large" />
          <Text style={styles.loadingText}>Cargando dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ZyroLogo size="medium" />
          <Text style={styles.companyName}>
            {company?.companyName || 'Mi Empresa'}
          </Text>
          <Text style={styles.subscriptionStatus}>
            Plan {company?.subscription.plan} • {company?.subscription.status.toUpperCase()}
          </Text>
        </View>

        {/* Metrics Overview */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Campañas Activas"
              value={metrics.activeCampaigns}
              subtitle={`${metrics.totalCampaigns} total`}
              color={theme.colors.success}
            />
            <MetricCard
              title="Solicitudes Pendientes"
              value={metrics.pendingRequests}
              subtitle={`${metrics.totalRequests} total`}
              color={theme.colors.warning}
            />
            <MetricCard
              title="Colaboraciones Aprobadas"
              value={metrics.approvedRequests}
              color={theme.colors.primary}
            />
            <MetricCard
              title="Colaboraciones Completadas"
              value={metrics.completedRequests}
              color={theme.colors.primaryDark}
            />
          </View>
        </View>

        {/* Active Campaigns */}
        <View style={styles.campaignsContainer}>
          <Text style={styles.sectionTitle}>Mis Campañas</Text>
          {campaigns.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No tienes campañas activas
              </Text>
              <Text style={styles.emptyStateSubtext}>
                El administrador creará campañas para tu negocio
              </Text>
            </View>
          ) : (
            campaigns.map((campaign) => (
              <View key={campaign.id} style={styles.campaignCard}>
                <Text style={styles.campaignTitle}>{campaign.title}</Text>
                <Text style={styles.campaignBusiness}>{campaign.businessName}</Text>
                <View style={styles.campaignMeta}>
                  <Text style={styles.campaignCategory}>{campaign.category.toUpperCase()}</Text>
                  <Text style={styles.campaignCity}>{campaign.city}</Text>
                  <View style={[styles.campaignStatus, { backgroundColor: 
                    campaign.status === 'active' ? theme.colors.success : 
                    campaign.status === 'paused' ? theme.colors.warning : 
                    theme.colors.textSecondary 
                  }]}>
                    <Text style={styles.campaignStatusText}>{campaign.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.campaignRequirements}>
                  Min. seguidores: {campaign.requirements.minInstagramFollowers || 0} IG
                  {campaign.requirements.minTiktokFollowers && ` • ${campaign.requirements.minTiktokFollowers} TT`}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Collaboration Requests */}
        <View style={styles.requestsContainer}>
          <Text style={styles.sectionTitle}>
            Solicitudes de Influencers ({collaborationRequests.length})
          </Text>
          {collaborationRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No hay solicitudes de colaboración
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Los influencers podrán solicitar colaboraciones cuando tengas campañas activas
              </Text>
            </View>
          ) : (
            <FlatList
              data={collaborationRequests}
              renderItem={renderRequestItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 16,
    marginTop: 20,
    fontFamily: theme.fonts.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  companyName: {
    fontSize: 24,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
    marginTop: 15,
    textAlign: 'center',
  },
  subscriptionStatus: {
    fontSize: 14,
    fontFamily: theme.fonts.primary,
    color: theme.colors.primary,
    marginTop: 5,
  },
  metricsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  metricValue: {
    fontSize: 28,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  metricTitle: {
    fontSize: 12,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
  metricSubtitle: {
    fontSize: 10,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  campaignsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  campaignCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  campaignTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: 5,
  },
  campaignBusiness: {
    fontSize: 14,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },
  campaignMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  campaignCategory: {
    fontSize: 12,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  campaignCity: {
    fontSize: 12,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textSecondary,
    marginRight: 10,
  },
  campaignStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  campaignStatusText: {
    fontSize: 10,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.background,
  },
  campaignRequirements: {
    fontSize: 12,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textSecondary,
  },
  requestsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  requestCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  requestDetails: {
    gap: 5,
  },
  requestDate: {
    fontSize: 12,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textSecondary,
  },
  reservationInfo: {
    fontSize: 12,
    fontFamily: theme.fonts.primary,
    color: theme.colors.text,
  },
  deliveryInfo: {
    fontSize: 12,
    fontFamily: theme.fonts.primary,
    color: theme.colors.text,
  },
  proposedContent: {
    fontSize: 12,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.background,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});