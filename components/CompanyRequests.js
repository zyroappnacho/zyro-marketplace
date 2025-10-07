import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MinimalistIcons from './MinimalistIcons';
import { useDispatch } from 'react-redux';
import { setCurrentScreen } from '../store/slices/uiSlice';
import CollaborationRequestService from '../services/CollaborationRequestService';
import StorageService from '../services/StorageService';

const CompanyRequests = ({ navigation }) => {
  const dispatch = useDispatch();
  const [upcomingRequests, setUpcomingRequests] = useState([]);
  const [pastRequests, setPastRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past

  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      await loadCompanyData();
      await loadRequests();
    };
    
    initializeData();
  }, []);

  // Recargar solicitudes cuando cambien los datos de empresa
  useEffect(() => {
    if (companyData) {
      loadRequests();
    }
  }, [companyData]);

  const loadCompanyData = async () => {
    try {
      const currentUser = await StorageService.getUser();
      
      // Verificar si es usuario de empresa (más tolerante)
      const isCompanyUser = currentUser && (
        currentUser.userType === 'company' || 
        currentUser.email === 'empresa@zyro.com' ||
        currentUser.companyName ||
        currentUser.email?.includes('empresa')
      );
      
      if (isCompanyUser) {
        console.log(`🏢 Usuario empresa detectado: ${currentUser.id || currentUser.email}`);
        
        // Si no tiene userType correcto, corregirlo automáticamente
        if (currentUser.userType !== 'company') {
          console.log('🔧 Corrigiendo userType automáticamente...');
          const correctedUser = {
            ...currentUser,
            userType: 'company',
            companyName: currentUser.companyName || currentUser.name || 'Prueba Perfil Empresa'
          };
          
          // Guardar usuario corregido
          await StorageService.saveUser(correctedUser);
          console.log('✅ Usuario corregido con userType: company');
        }
        
        // Obtener datos completos de empresa desde el storage
        const fullCompanyData = await StorageService.getCompanyData(currentUser.id);
        
        if (fullCompanyData) {
          console.log(`📋 Datos completos de empresa cargados: "${fullCompanyData.companyName}"`);
          setCompanyData(fullCompanyData);
        } else {
          console.log(`⚠️ No se encontraron datos completos, usando datos básicos del usuario`);
          // Usar datos básicos del usuario si no hay datos completos de empresa
          const basicCompanyData = {
            ...currentUser,
            companyName: currentUser.companyName || currentUser.name || 'Prueba Perfil Empresa',
            userType: 'company'
          };
          setCompanyData(basicCompanyData);
          
          // Crear datos básicos de empresa si no existen
          const companyDataToSave = {
            id: currentUser.id,
            companyName: basicCompanyData.companyName,
            companyEmail: currentUser.email,
            status: 'active',
            lastSaved: new Date().toISOString()
          };
          
          await StorageService.saveCompanyData(companyDataToSave);
          console.log('✅ Datos básicos de empresa creados automáticamente');
        }
      } else {
        console.error('❌ Usuario actual no es de tipo empresa');
        console.log('💡 Sugerencia: Ejecuta el script fix-empresa-zyro-user.js para corregir el usuario');
      }
    } catch (error) {
      console.error('❌ Error loading company data:', error);
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Asegurar que tenemos datos de empresa antes de continuar
      if (!companyData) {
        console.log('⏳ Esperando datos de empresa...');
        setLoading(false);
        return;
      }
      
      // Obtener todas las solicitudes del sistema
      const allRequests = await CollaborationRequestService.getAllRequests();
      
      // Obtener las campañas del administrador para filtrar por empresa
      const adminCampaigns = await CollaborationRequestService.getAdminCampaigns();
      
      // Obtener el nombre del negocio de la empresa logueada
      const currentCompanyName = companyData.companyName || 'Mi Empresa';
      console.log(`🏢 Filtrando solicitudes para empresa: "${currentCompanyName}"`);
      console.log(`📋 Total solicitudes en el sistema: ${allRequests.length}`);
      console.log(`📋 Total campañas del admin: ${adminCampaigns.length}`);
      
      // Filtrar solicitudes que pertenecen a esta empresa específica
      // El filtro se basa en que el campo 'business' de la campaña coincida exactamente 
      // con el nombre de la empresa logueada
      const companyRequests = allRequests.filter(request => {
        const campaign = adminCampaigns.find(c => c.id.toString() === request.collaborationId?.toString());
        
        if (!campaign) {
          console.log(`⚠️ No se encontró campaña para solicitud ${request.id} (collaborationId: ${request.collaborationId})`);
          return false;
        }
        
        const isForThisCompany = campaign.business === currentCompanyName;
        
        if (isForThisCompany) {
          console.log(`✅ Solicitud ${request.id} pertenece a "${currentCompanyName}" (campaña: "${campaign.title}")`);
        } else {
          console.log(`❌ Solicitud ${request.id} es para "${campaign.business}", no para "${currentCompanyName}"`);
        }
        
        return isForThisCompany;
      });
      
      console.log(`📊 Total solicitudes encontradas para "${currentCompanyName}": ${companyRequests.length}`);

      // Separar en próximas y pasadas basado en la fecha de colaboración
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = [];
      const past = [];

      companyRequests.forEach(request => {
        const campaign = adminCampaigns.find(c => c.id.toString() === request.collaborationId?.toString());
        
        if (request.selectedDate) {
          const collaborationDate = new Date(request.selectedDate);
          collaborationDate.setHours(0, 0, 0, 0);
          
          const requestWithCampaign = {
            ...request,
            campaignTitle: campaign?.title || 'Campaña sin título',
            businessName: campaign?.business || 'Negocio no especificado',
            category: campaign?.category || 'Sin categoría',
            campaignDescription: campaign?.description || '',
          };

          if (collaborationDate >= today && (request.status === 'pending' || request.status === 'approved')) {
            upcoming.push(requestWithCampaign);
          } else if (collaborationDate < today) {
            past.push(requestWithCampaign);
          }
        } else {
          // Si no hay fecha, considerar como próxima si está pendiente o aprobada
          if (request.status === 'pending' || request.status === 'approved') {
            upcoming.push({
              ...request,
              campaignTitle: campaign?.title || 'Campaña sin título',
              businessName: campaign?.business || 'Negocio no especificado',
              category: campaign?.category || 'Sin categoría',
              campaignDescription: campaign?.description || '',
            });
          }
        }
      });

      setUpcomingRequests(upcoming);
      setPastRequests(past);



      setLoading(false);
    } catch (error) {
      console.error('Error loading requests:', error);
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Recargar datos de empresa y luego las solicitudes
    loadCompanyData().then(() => {
      loadRequests().finally(() => setRefreshing(false));
    });
  }, [companyData]);

  // Función para determinar si una colaboración está finalizada
  const isCollaborationFinished = (request) => {
    if (!request.selectedDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const collaborationDate = new Date(request.selectedDate);
    collaborationDate.setHours(0, 0, 0, 0);
    
    return collaborationDate < today && request.status === 'approved';
  };

  const getStatusColor = (status, request = null) => {
    // Si la colaboración está finalizada, usar color específico
    if (request && isCollaborationFinished(request)) {
      return '#007AFF'; // Azul para finalizada
    }
    
    switch (status) {
      case 'approved':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      case 'pending':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status, request = null) => {
    // Si la colaboración está finalizada, mostrar "Finalizada"
    if (request && isCollaborationFinished(request)) {
      return 'Finalizada';
    }
    
    switch (status) {
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const getStatusIcon = (status, request = null) => {
    // Si la colaboración está finalizada, usar icono específico
    if (request && isCollaborationFinished(request)) {
      return 'checkmark-done-circle'; // Icono de completado
    }
    
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
        return 'time';
      default:
        return 'help-circle';
    }
  };



  const getCurrentRequests = () => {
    return activeTab === 'upcoming' ? upcomingRequests : pastRequests;
  };

  const renderTabButton = (tabType, label, count) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tabType && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tabType)}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tabType && styles.activeTabButtonText
      ]}>
        {label}
      </Text>
      <View style={[
        styles.countBadge,
        activeTab === tabType && styles.activeCountBadge
      ]}>
        <Text style={[
          styles.countText,
          activeTab === tabType && styles.activeCountText
        ]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );



  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.influencerInfo}>
          <View style={styles.avatarContainer}>
            {item.userProfileImage ? (
              <Image source={{ uri: item.userProfileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MinimalistIcons name="profile" size={24} color="#AAAAAA" />
              </View>
            )}
          </View>
          <View style={styles.influencerDetails}>
            <Text style={styles.influencerName}>{item.userName || 'Usuario'}</Text>
            <Text style={styles.influencerUsername}>
              {item.userInstagram 
                ? (item.userInstagram.startsWith('@') ? item.userInstagram : `@${item.userInstagram}`)
                : '@usuario'
              }
            </Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>{item.userFollowers || '0'} seguidores</Text>
              {item.userCity && (
                <Text style={styles.statsText}>• {item.userCity}</Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, item) }]}>
          <Ionicons 
            name={getStatusIcon(item.status, item)} 
            size={12} 
            color="#FFFFFF" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{getStatusText(item.status, item)}</Text>
        </View>
      </View>

      <View style={styles.campaignInfo}>
        <Text style={styles.campaignTitle}>{item.campaignTitle}</Text>
        <Text style={styles.businessName}>Negocio: {item.businessName}</Text>
        <Text style={styles.categoryText}>Categoría: {item.category}</Text>
        {item.selectedDate && (
          <View style={styles.dateTimeInfo}>
            <MinimalistIcons name="events" size={14} color="#C9A961" />
            <Text style={styles.dateText}>
              {new Date(item.selectedDate).toLocaleDateString('es-ES')}
            </Text>
            {item.selectedTime && (
              <>
                <MinimalistIcons name="history" size={14} color="#C9A961" />
                <Text style={styles.timeText}>{item.selectedTime}</Text>
              </>
            )}
          </View>
        )}
      </View>

      {item.message && (
        <Text style={styles.requestMessage}>{item.message}</Text>
      )}

      <View style={styles.requestFooter}>
        <Text style={styles.requestDate}>
          Solicitud enviada: {new Date(item.submittedAt).toLocaleDateString('es-ES')}
        </Text>
        
        {item.status === 'pending' && activeTab === 'upcoming' && (
          <View style={styles.pendingInfo}>
            <MinimalistIcons name="help" size={16} color="#C9A961" />
            <Text style={styles.pendingInfoText}>
              Solo el administrador puede aprobar o rechazar solicitudes
            </Text>
          </View>
        )}

        {item.userEmail && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => {
              // Aquí se podría abrir el cliente de email o mostrar información de contacto
              Alert.alert(
                'Información de Contacto',
                `Email: ${item.userEmail}${item.userPhone ? `\nTeléfono: ${item.userPhone}` : ''}`,
                [
                  { text: 'Cerrar', style: 'cancel' },
                  { text: 'Copiar Email', onPress: () => {
                    // En una implementación real, copiaríamos al clipboard
                    console.log('Email copiado:', item.userEmail);
                  }}
                ]
              );
            }}
          >
            <MinimalistIcons name="message" size={16} color="#C9A961" />
            <Text style={styles.contactButtonText}>Contactar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const currentRequests = getCurrentRequests();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            // Navegar específicamente a la versión de usuario de empresa
            dispatch(setCurrentScreen('company'));
          }}
        >
          <MinimalistIcons name="back" size={24} color="#C9A961" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitudes de Influencers</Text>
        <View style={styles.headerSpacer} />
      </View>



      {/* Pestañas */}
      <View style={styles.tabContainer}>
        {renderTabButton('upcoming', 'Próximas', upcomingRequests.length)}
        {renderTabButton('past', 'Pasadas', pastRequests.length)}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <MinimalistIcons name="history" size={24} color="#AAAAAA" />
          <Text style={styles.loadingText}>Cargando solicitudes...</Text>
        </View>
      ) : currentRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name={activeTab === 'upcoming' ? "calendar-outline" : "time-outline"} 
            size={48} 
            color="#666666" 
          />
          <Text style={styles.emptyTitle}>
            {activeTab === 'upcoming' ? 'No hay solicitudes próximas' : 'No hay solicitudes pasadas'}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'upcoming' 
              ? 'Aún no has recibido solicitudes de colaboración próximas.'
              : 'No tienes colaboraciones pasadas aún.'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}


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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C9A961',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40, // Mismo ancho que tenía el botón de filtro para mantener el centrado
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#C9A961',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#AAAAAA',
    marginRight: 8,
  },
  activeTabButtonText: {
    color: '#C9A961',
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  activeCountBadge: {
    backgroundColor: '#C9A961',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AAAAAA',
  },
  activeCountText: {
    color: '#000000',
  },

  listContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  influencerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  influencerDetails: {
    flex: 1,
  },
  influencerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  influencerUsername: {
    fontSize: 14,
    color: '#C9A961',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statsText: {
    fontSize: 12,
    color: '#AAAAAA',
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
  campaignInfo: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  campaignTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#C9A961',
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  dateTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#C9A961',
    marginLeft: 4,
    fontWeight: '500',
  },
  timeIcon: {
    marginLeft: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#C9A961',
    marginLeft: 4,
    fontWeight: '500',
  },
  requestMessage: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 12,
  },
  requestFooter: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 12,
  },
  requestDate: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 12,
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C9A961',
  },
  pendingInfoText: {
    fontSize: 12,
    color: '#C9A961',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },

  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#333333',
    borderWidth: 1,
    borderColor: '#C9A961',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#C9A961',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CompanyRequests;