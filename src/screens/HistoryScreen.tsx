import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../styles/theme';
import { ZyroLogo } from '../components/ZyroLogo';
import {
  getCollaborationsByInfluencer,
  selectUpcomingCollaborations,
  selectPastCollaborations,
  selectCancelledCollaborations,
  selectCollaborationLoading,
  selectCollaborationError,
} from '../store/slices/collaborationSlice';
import { useCurrentInfluencer } from '../hooks/useCurrentInfluencer';
import { CollaborationRequest, Campaign } from '../types';
import { CampaignRepository } from '../database/repositories/CampaignRepository';
import { DatabaseMappers } from '../database/mappers';

type HistoryTab = 'upcoming' | 'past' | 'cancelled';

interface CollaborationWithCampaign extends CollaborationRequest {
  campaign?: Campaign;
}

export const HistoryScreen = () => {
  const dispatch = useDispatch();
  const currentInfluencer = useCurrentInfluencer();
  
  const upcomingCollaborations = useSelector(selectUpcomingCollaborations);
  const pastCollaborations = useSelector(selectPastCollaborations);
  const cancelledCollaborations = useSelector(selectCancelledCollaborations);
  const loading = useSelector(selectCollaborationLoading);
  const error = useSelector(selectCollaborationError);
  
  const [activeTab, setActiveTab] = useState<HistoryTab>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [collaborationsWithCampaigns, setCollaborationsWithCampaigns] = useState<CollaborationWithCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // Load collaborations on mount
  useEffect(() => {
    if (currentInfluencer?.id) {
      dispatch(getCollaborationsByInfluencer(currentInfluencer.id) as any);
    }
  }, [dispatch, currentInfluencer?.id]);

  // Load campaign details for current tab collaborations
  useEffect(() => {
    const loadCampaignDetails = async () => {
      setLoadingCampaigns(true);
      try {
        const currentCollaborations = getCurrentTabCollaborations();
        const campaignRepository = new CampaignRepository();
        
        const collaborationsWithCampaignData = await Promise.all(
          currentCollaborations.map(async (collaboration) => {
            try {
              const campaignEntity = await campaignRepository.findById(collaboration.campaignId);
              const campaign = campaignEntity ? DatabaseMappers.mapCampaignEntityToCampaign(campaignEntity) : undefined;
              return { ...collaboration, campaign };
            } catch (error) {
              console.warn(`Failed to load campaign ${collaboration.campaignId}:`, error);
              return collaboration;
            }
          })
        );
        
        setCollaborationsWithCampaigns(collaborationsWithCampaignData);
      } catch (error) {
        console.error('Error loading campaign details:', error);
        setCollaborationsWithCampaigns(getCurrentTabCollaborations());
      } finally {
        setLoadingCampaigns(false);
      }
    };

    loadCampaignDetails();
  }, [activeTab, upcomingCollaborations, pastCollaborations, cancelledCollaborations]);

  const getCurrentTabCollaborations = (): CollaborationRequest[] => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingCollaborations;
      case 'past':
        return pastCollaborations;
      case 'cancelled':
        return cancelledCollaborations;
      default:
        return [];
    }
  };

  const onRefresh = async () => {
    if (!currentInfluencer?.id) return;
    
    setRefreshing(true);
    try {
      await dispatch(getCollaborationsByInfluencer(currentInfluencer.id) as any);
    } finally {
      setRefreshing(false);
    }
  };

  const getTabTitle = (tab: HistoryTab): string => {
    switch (tab) {
      case 'upcoming':
        return 'PRÓXIMOS';
      case 'past':
        return 'PASADOS';
      case 'cancelled':
        return 'CANCELADOS';
      default:
        return '';
    }
  };

  const getTabCount = (tab: HistoryTab): number => {
    switch (tab) {
      case 'upcoming':
        return upcomingCollaborations.length;
      case 'past':
        return pastCollaborations.length;
      case 'cancelled':
        return cancelledCollaborations.length;
      default:
        return 0;
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatTime = (time: string): string => {
    return time || '--:--';
  };

  const getStatusText = (collaboration: CollaborationRequest): string => {
    switch (collaboration.status) {
      case 'pending':
        return 'Pendiente de aprobación';
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return collaboration.status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return colors.goldElegant;
      case 'approved':
        return colors.success || colors.goldElegant;
      case 'completed':
        return colors.success || colors.goldElegant;
      case 'rejected':
      case 'cancelled':
        return colors.error || colors.mediumGray;
      default:
        return colors.mediumGray;
    }
  };

  const renderTabButton = (tab: HistoryTab) => {
    const isActive = activeTab === tab;
    const count = getTabCount(tab);
    
    return (
      <TouchableOpacity
        key={tab}
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
      >
        <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
          {getTabTitle(tab)}
        </Text>
        {count > 0 && (
          <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCollaborationCard = (collaboration: CollaborationWithCampaign) => {
    const campaign = collaboration.campaign;
    const hasReservation = !!collaboration.reservationDetails;
    const reservationDate = hasReservation ? new Date(collaboration.reservationDetails!.date) : null;
    
    return (
      <View key={collaboration.id} style={styles.collaborationCard}>
        {/* Campaign Image */}
        {campaign?.images && campaign.images.length > 0 && (
          <Image
            source={{ uri: campaign.images[0] }}
            style={styles.collaborationImage}
            resizeMode="cover"
          />
        )}
        
        {/* Content */}
        <View style={styles.collaborationContent}>
          {/* Header */}
          <View style={styles.collaborationHeader}>
            <Text style={styles.businessName}>
              {campaign?.businessName || 'Negocio no disponible'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(collaboration.status) }]}>
              <Text style={styles.statusText}>
                {getStatusText(collaboration)}
              </Text>
            </View>
          </View>
          
          {/* Campaign Title */}
          {campaign?.title && (
            <Text style={styles.campaignTitle}>{campaign.title}</Text>
          )}
          
          {/* Details */}
          <View style={styles.collaborationDetails}>
            {/* Date and Time */}
            {hasReservation && reservationDate && (
              <View style={styles.detailRow}>
                <Icon name="event" size={16} color={colors.goldElegant} />
                <Text style={styles.detailText}>
                  {formatDate(reservationDate)} a las {formatTime(collaboration.reservationDetails!.time)}
                </Text>
              </View>
            )}
            
            {/* Location */}
            {campaign?.city && (
              <View style={styles.detailRow}>
                <Icon name="location-on" size={16} color={colors.goldElegant} />
                <Text style={styles.detailText}>{campaign.city}</Text>
              </View>
            )}
            
            {/* Category */}
            {campaign?.category && (
              <View style={styles.detailRow}>
                <Icon name="category" size={16} color={colors.goldElegant} />
                <Text style={styles.detailText}>
                  {campaign.category.charAt(0).toUpperCase() + campaign.category.slice(1)}
                </Text>
              </View>
            )}
            
            {/* Companions */}
            {hasReservation && collaboration.reservationDetails!.companions > 0 && (
              <View style={styles.detailRow}>
                <Icon name="group" size={16} color={colors.goldElegant} />
                <Text style={styles.detailText}>
                  +{collaboration.reservationDetails!.companions} acompañantes
                </Text>
              </View>
            )}
            
            {/* Request Date */}
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color={colors.mediumGray} />
              <Text style={[styles.detailText, { color: colors.mediumGray }]}>
                Solicitado el {formatDate(collaboration.requestDate)}
              </Text>
            </View>
          </View>
          
          {/* Admin Notes */}
          {collaboration.adminNotes && (
            <View style={styles.adminNotesContainer}>
              <Text style={styles.adminNotesLabel}>Nota del administrador:</Text>
              <Text style={styles.adminNotesText}>{collaboration.adminNotes}</Text>
            </View>
          )}
          
          {/* Content Delivered */}
          {collaboration.contentDelivered && (
            <View style={styles.contentDeliveredContainer}>
              <Text style={styles.contentDeliveredLabel}>Contenido entregado:</Text>
              {collaboration.contentDelivered.instagramStories.length > 0 && (
                <Text style={styles.contentDeliveredText}>
                  • {collaboration.contentDelivered.instagramStories.length} historias de Instagram
                </Text>
              )}
              {collaboration.contentDelivered.tiktokVideos.length > 0 && (
                <Text style={styles.contentDeliveredText}>
                  • {collaboration.contentDelivered.tiktokVideos.length} videos de TikTok
                </Text>
              )}
              {collaboration.contentDelivered.deliveredAt && (
                <Text style={[styles.contentDeliveredText, { color: colors.mediumGray }]}>
                  Entregado el {formatDate(collaboration.contentDelivered.deliveredAt)}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    const messages = {
      upcoming: 'No tienes colaboraciones próximas',
      past: 'No tienes colaboraciones pasadas',
      cancelled: 'No tienes colaboraciones canceladas',
    };
    
    const descriptions = {
      upcoming: 'Cuando tengas colaboraciones aprobadas aparecerán aquí',
      past: 'Tus colaboraciones completadas se mostrarán en esta sección',
      cancelled: 'Las colaboraciones rechazadas o canceladas aparecerán aquí',
    };
    
    return (
      <View style={styles.emptyState}>
        <Icon name="history" size={64} color={colors.mediumGray} />
        <Text style={styles.emptyStateTitle}>{messages[activeTab]}</Text>
        <Text style={styles.emptyStateDescription}>{descriptions[activeTab]}</Text>
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ZyroLogo size="small" />
          <Text style={styles.headerTitle}>Historial</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={colors.error || colors.mediumGray} />
          <Text style={styles.errorText}>Error al cargar el historial</Text>
          <Text style={styles.errorDescription}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ZyroLogo size="small" />
        <Text style={styles.headerTitle}>Historial</Text>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['upcoming', 'past', 'cancelled'] as HistoryTab[]).map(renderTabButton)}
      </View>
      
      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.goldElegant]}
            tintColor={colors.goldElegant}
          />
        }
      >
        {loading || loadingCampaigns ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.goldElegant} />
            <Text style={styles.loadingText}>Cargando historial...</Text>
          </View>
        ) : collaborationsWithCampaigns.length === 0 ? (
          renderEmptyState()
        ) : (
          collaborationsWithCampaigns.map(renderCollaborationCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.goldElegant,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
    marginLeft: spacing.md,
  },
  
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.darkGray,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.goldElegant,
  },
  tabButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.mediumGray,
  },
  tabButtonTextActive: {
    color: colors.black,
  },
  tabBadge: {
    backgroundColor: colors.mediumGray,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  tabBadgeActive: {
    backgroundColor: colors.black,
  },
  tabBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.black,
  },
  tabBadgeTextActive: {
    color: colors.goldElegant,
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  
  // Collaboration Card
  collaborationCard: {
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.goldElegant + '30',
  },
  collaborationImage: {
    width: '100%',
    height: 120,
  },
  collaborationContent: {
    padding: spacing.md,
  },
  collaborationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  businessName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.white,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.black,
  },
  campaignTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.goldElegant,
    marginBottom: spacing.sm,
  },
  
  // Details
  collaborationDetails: {
    marginTop: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
    marginLeft: spacing.sm,
    flex: 1,
  },
  
  // Admin Notes
  adminNotesContainer: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.black + '50',
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.goldElegant,
  },
  adminNotesLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.goldElegant,
    marginBottom: spacing.xs,
  },
  adminNotesText: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
    lineHeight: 20,
  },
  
  // Content Delivered
  contentDeliveredContainer: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.goldElegant + '10',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.goldElegant + '30',
  },
  contentDeliveredLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.goldElegant,
    marginBottom: spacing.xs,
  },
  contentDeliveredText: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
    marginBottom: spacing.xs,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    fontSize: fontSizes.md,
    color: colors.mediumGray,
    marginTop: spacing.md,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.lightGray,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: fontSizes.md,
    color: colors.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.lightGray,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: fontSizes.md,
    color: colors.mediumGray,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.goldElegant,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
});