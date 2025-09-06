import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchCampaigns,
  updateCampaignStatus,
  deleteCampaign,
  setCurrentCampaign,
  clearError,
  Campaign,
} from '../store/slices/campaignSlice';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { theme } from '../styles/theme';

interface CampaignManagementScreenProps {
  navigation: any;
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: () => void;
  onStatusChange: (status: Campaign['status']) => void;
  onDelete: () => void;
  isUpdating: boolean;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onEdit,
  onStatusChange,
  onDelete,
  isUpdating,
}) => {
  const getStatusColor = (status: Campaign['status']): string => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'draft':
        return theme.colors.warning;
      case 'paused':
        return theme.colors.info;
      case 'completed':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusDisplayName = (status: Campaign['status']): string => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'draft':
        return 'Borrador';
      case 'paused':
        return 'Pausada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  const getCategoryEmoji = (category: Campaign['category']): string => {
    switch (category) {
      case 'restaurantes':
        return '🍽️';
      case 'movilidad':
        return '🚗';
      case 'ropa':
        return '👕';
      case 'eventos':
        return '🎉';
      case 'delivery':
        return '🛵';
      case 'salud-belleza':
        return '💄';
      case 'alojamiento':
        return '🏨';
      case 'discotecas':
        return '🎵';
      default:
        return '📋';
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Hoy';
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `hace ${diffInDays} días`;
    } else {
      return date.toLocaleDateString('es-ES');
    }
  };

  return (
    <View style={styles.campaignCard}>
      <View style={styles.campaignHeader}>
        <View style={styles.campaignInfo}>
          <View style={styles.campaignTitleRow}>
            <Text style={styles.categoryEmoji}>{getCategoryEmoji(campaign.category)}</Text>
            <Text style={styles.campaignTitle}>{campaign.title}</Text>
          </View>
          <Text style={styles.businessName}>{campaign.businessName}</Text>
          <Text style={styles.campaignLocation}>{campaign.city}</Text>
        </View>
        <View style={styles.campaignMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(campaign.status) }]}>
            <Text style={styles.statusText}>{getStatusDisplayName(campaign.status)}</Text>
          </View>
          <Text style={styles.campaignDate}>{getTimeAgo(campaign.updatedAt)}</Text>
        </View>
      </View>

      {campaign.images.length > 0 && (
        <Image source={{ uri: campaign.images[0] }} style={styles.campaignImage} />
      )}

      <Text style={styles.campaignDescription} numberOfLines={2}>
        {campaign.description}
      </Text>

      <View style={styles.campaignDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Seguidores mín.</Text>
          <Text style={styles.detailValue}>
            {campaign.requirements.minInstagramFollowers 
              ? `${campaign.requirements.minInstagramFollowers.toLocaleString()} IG`
              : 'Sin requisito'
            }
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Acompañantes</Text>
          <Text style={styles.detailValue}>+{campaign.requirements.maxCompanions}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Contenido</Text>
          <Text style={styles.detailValue}>
            {campaign.contentRequirements.instagramStories}IG + {campaign.contentRequirements.tiktokVideos}TT
          </Text>
        </View>
      </View>

      <View style={styles.campaignActions}>
        <PremiumButton
          title="Editar"
          onPress={onEdit}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        
        {campaign.status === 'draft' && (
          <PremiumButton
            title="Activar"
            onPress={() => onStatusChange('active')}
            loading={isUpdating}
            size="small"
            style={styles.actionButton}
          />
        )}
        
        {campaign.status === 'active' && (
          <PremiumButton
            title="Pausar"
            onPress={() => onStatusChange('paused')}
            loading={isUpdating}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
        )}
        
        {campaign.status === 'paused' && (
          <PremiumButton
            title="Reactivar"
            onPress={() => onStatusChange('active')}
            loading={isUpdating}
            size="small"
            style={styles.actionButton}
          />
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          disabled={isUpdating}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const CampaignManagementScreen: React.FC<CampaignManagementScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const {
    campaigns,
    draftCampaigns,
    activeCampaigns,
    completedCampaigns,
    isLoading,
    isUpdating,
    error,
  } = useAppSelector(state => state.campaigns);

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'active' | 'completed'>('all');

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCampaigns());
    setRefreshing(false);
  };

  const handleCreateCampaign = () => {
    navigation.navigate('CampaignEditor', { mode: 'create' });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    dispatch(setCurrentCampaign(campaign));
    navigation.navigate('CampaignEditor', { mode: 'edit', campaign });
  };

  const handleStatusChange = async (campaign: Campaign, newStatus: Campaign['status']) => {
    try {
      await dispatch(updateCampaignStatus({ id: campaign.id, status: newStatus }));
      Alert.alert('Éxito', `Campaña ${newStatus === 'active' ? 'activada' : newStatus === 'paused' ? 'pausada' : 'actualizada'} correctamente`);
    } catch (error) {
      console.error('Error updating campaign status:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado de la campaña');
    }
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    Alert.alert(
      'Eliminar Campaña',
      `¿Estás seguro de que quieres eliminar "${campaign.title}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteCampaign(campaign.id));
              Alert.alert('Éxito', 'Campaña eliminada correctamente');
            } catch (error) {
              console.error('Error deleting campaign:', error);
              Alert.alert('Error', 'No se pudo eliminar la campaña');
            }
          }
        }
      ]
    );
  };

  const getCurrentCampaigns = () => {
    switch (activeTab) {
      case 'draft':
        return draftCampaigns;
      case 'active':
        return activeCampaigns;
      case 'completed':
        return completedCampaigns;
      default:
        return campaigns;
    }
  };

  const getTabCount = (tab: typeof activeTab) => {
    switch (tab) {
      case 'draft':
        return draftCampaigns.length;
      case 'active':
        return activeCampaigns.length;
      case 'completed':
        return completedCampaigns.length;
      default:
        return campaigns.length;
    }
  };

  const currentCampaigns = getCurrentCampaigns();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <ZyroLogo size="small" />
        <PremiumButton
          title="+ Nueva"
          onPress={handleCreateCampaign}
          size="small"
          style={styles.createButton}
        />
      </View>

      <Text style={styles.title}>Gestión de Campañas</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Todas ({getTabCount('all')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'draft' && styles.activeTab]}
          onPress={() => setActiveTab('draft')}
        >
          <Text style={[styles.tabText, activeTab === 'draft' && styles.activeTabText]}>
            Borradores ({getTabCount('draft')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Activas ({getTabCount('active')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completadas ({getTabCount('completed')})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {isLoading && currentCampaigns.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando campañas...</Text>
          </View>
        ) : currentCampaigns.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay campañas en esta categoría</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'all' 
                ? 'Crea tu primera campaña para comenzar'
                : `No hay campañas ${activeTab === 'draft' ? 'en borrador' : activeTab === 'active' ? 'activas' : 'completadas'}`
              }
            </Text>
            {activeTab === 'all' && (
              <PremiumButton
                title="Crear Primera Campaña"
                onPress={handleCreateCampaign}
                style={styles.emptyActionButton}
              />
            )}
          </View>
        ) : (
          currentCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={() => handleEditCampaign(campaign)}
              onStatusChange={(status) => handleStatusChange(campaign, status)}
              onDelete={() => handleDeleteCampaign(campaign)}
              isUpdating={isUpdating}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  createButton: {
    minWidth: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Cinzel',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  campaignCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campaignInfo: {
    flex: 1,
    marginRight: 12,
  },
  campaignTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'Inter',
    flex: 1,
  },
  businessName: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'Inter',
    fontWeight: '500',
    marginBottom: 2,
  },
  campaignLocation: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
  },
  campaignMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  campaignDate: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
  },
  campaignImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.border,
  },
  campaignDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
    lineHeight: 20,
    marginBottom: 16,
  },
  campaignDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
    marginBottom: 2,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 12,
    color: theme.colors.text,
    fontFamily: 'Inter',
    fontWeight: '500',
    textAlign: 'center',
  },
  campaignActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter',
  },
  emptyActionButton: {
    minWidth: 200,
  },
});

export default CampaignManagementScreen;