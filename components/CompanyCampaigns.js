import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CompanyCampaigns = ({ companyId }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Datos de ejemplo para las campañas de la empresa
  const mockCampaigns = [
    {
      id: '1',
      title: 'Campaña de Verano 2024',
      description: 'Promoción de productos de verano para influencers de lifestyle',
      budget: '€2,500',
      status: 'Activa',
      applicants: 12,
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      category: 'Lifestyle',
    },
    {
      id: '2',
      title: 'Lanzamiento Producto Tech',
      description: 'Colaboración para el lanzamiento de nuestro nuevo dispositivo',
      budget: '€5,000',
      status: 'En Revisión',
      applicants: 8,
      startDate: '2024-07-15',
      endDate: '2024-09-15',
      category: 'Tecnología',
    },
    {
      id: '3',
      title: 'Campaña Black Friday',
      description: 'Promoción especial para la temporada de descuentos',
      budget: '€3,200',
      status: 'Programada',
      applicants: 0,
      startDate: '2024-11-20',
      endDate: '2024-11-30',
      category: 'E-commerce',
    },
  ];

  useEffect(() => {
    loadCampaigns();
  }, [companyId]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      setTimeout(() => {
        setCampaigns(mockCampaigns);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadCampaigns();
      setRefreshing(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activa':
        return '#34C759';
      case 'En Revisión':
        return '#FF9500';
      case 'Programada':
        return '#007AFF';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Activa':
        return 'checkmark-circle';
      case 'En Revisión':
        return 'time';
      case 'Programada':
        return 'calendar';
      default:
        return 'help-circle';
    }
  };

  const renderCampaignItem = ({ item }) => (
    <TouchableOpacity style={styles.campaignCard}>
      <View style={styles.campaignHeader}>
        <Text style={styles.campaignTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={12} 
            color="#FFFFFF" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.campaignDescription}>{item.description}</Text>
      
      <View style={styles.campaignDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={16} color="#007AFF" />
          <Text style={styles.detailText}>Presupuesto: {item.budget}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={16} color="#007AFF" />
          <Text style={styles.detailText}>Solicitudes: {item.applicants}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="pricetag-outline" size={16} color="#007AFF" />
          <Text style={styles.detailText}>Categoría: {item.category}</Text>
        </View>
      </View>
      
      <View style={styles.dateRange}>
        <Text style={styles.dateText}>
          {new Date(item.startDate).toLocaleDateString('es-ES')} - {new Date(item.endDate).toLocaleDateString('es-ES')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && campaigns.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="hourglass-outline" size={24} color="#8E8E93" />
        <Text style={styles.loadingText}>Cargando campañas...</Text>
      </View>
    );
  }

  if (campaigns.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="megaphone-outline" size={48} color="#C7C7CC" />
        <Text style={styles.emptyTitle}>No hay campañas</Text>
        <Text style={styles.emptyText}>
          Aún no tienes campañas de colaboración creadas.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={campaigns}
      renderItem={renderCampaignItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 10,
  },
  campaignCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  campaignDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  campaignDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  dateRange: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CompanyCampaigns;