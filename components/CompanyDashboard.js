import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  FlatList,
  Dimensions
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import MinimalistIcons from './MinimalistIcons';
import * as ImagePicker from 'expo-image-picker';
import { logoutUser, updateUser } from '../store/slices/authSlice';
import { setCurrentScreen } from '../store/slices/uiSlice';
import StorageService from '../services/StorageService';
import CollaborationDetailScreenNew from './CollaborationDetailScreenNew';

const CompanyDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // Estado local para la foto de perfil y datos de empresa
  const [profileImage, setProfileImage] = useState(null);
  const [companyName, setCompanyName] = useState('Mi Empresa');
  const [currentPlan, setCurrentPlan] = useState('Cargando plan...'); // Estado inicial de carga
  const [isLoading, setIsLoading] = useState(true);
  const [myCollaboration, setMyCollaboration] = useState(null);
  const [showCollaborationDetail, setShowCollaborationDetail] = useState(false);
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);

  // Cargar datos de empresa al montar el componente
  useEffect(() => {
    loadCompanyData();
  }, []);

  // Recargar datos cuando el componente recibe focus (regresa de otras pantallas)
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      loadCompanyData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadCompanyData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Cargando datos de empresa para usuario:', user.id);
      
      // Cargar datos de empresa desde múltiples fuentes
      const companyData = await StorageService.getCompanyData(user.id);
      console.log('📋 Datos de empresa obtenidos:', companyData);
      
      let profileImageUri = null;
      
      if (companyData) {
        setCompanyName(companyData.companyName || 'Mi Empresa');
        profileImageUri = companyData.profileImage;
        console.log('📸 Imagen de perfil desde datos de empresa:', profileImageUri);
      }

      // Si no hay imagen en los datos de empresa, buscar en respaldo
      if (!profileImageUri) {
        const imageBackup = await StorageService.getData(`company_profile_image_${user.id}`);
        if (imageBackup && imageBackup.profileImage) {
          profileImageUri = imageBackup.profileImage;
          console.log('📸 Imagen de perfil desde respaldo:', profileImageUri);
        }
      }

      // Si aún no hay imagen, buscar en el usuario de Redux/Storage
      if (!profileImageUri && user?.profileImage) {
        profileImageUri = user.profileImage;
        console.log('📸 Imagen de perfil desde usuario Redux:', profileImageUri);
      }

      // Establecer la imagen encontrada
      setProfileImage(profileImageUri);
      console.log('📸 Imagen de perfil final establecida:', profileImageUri);

      // Cargar datos de suscripción para obtener el plan actual
      await loadCompanySubscriptionPlan(companyData);

      // Cargar la colaboración que coincida con el nombre del negocio
      await loadMyCollaboration(companyData?.companyName || 'Mi Empresa');
      
      setIsLoading(false);
      console.log('✅ Datos de empresa cargados completamente');
    } catch (error) {
      console.error('❌ Error cargando datos de empresa:', error);
      setIsLoading(false);
    }
  };

  const loadCompanySubscriptionPlan = async (companyData) => {
    try {
      console.log('📋 Cargando plan de suscripción para empresa...');
      
      if (companyData && companyData.selectedPlan) {
        // Convertir el plan guardado al formato de visualización
        const planInfo = convertStoredPlanToDisplayFormat(companyData.selectedPlan, companyData);
        setCurrentPlan(planInfo.name);
        console.log('✅ Plan detectado desde datos de empresa:', planInfo.name);
      } else {
        console.log('⚠️ No hay selectedPlan en datos de empresa, usando plan por defecto');
        setCurrentPlan('Plan 12 Meses');
      }
    } catch (error) {
      console.error('❌ Error cargando plan de suscripción:', error);
      setCurrentPlan('Plan 12 Meses');
    }
  };

  const convertStoredPlanToDisplayFormat = (storedPlan, companyData) => {
    // Mapear el plan guardado al formato de visualización (misma lógica que CompanySubscriptionPlans)
    const planMappings = {
      'plan_3_months': {
        id: 'plan_3_months',
        name: 'Plan 3 Meses',
        price: 499,
        duration: 3,
        description: 'Perfecto para campañas cortas'
      },
      'plan_6_months': {
        id: 'plan_6_months', 
        name: 'Plan 6 Meses',
        price: 399,
        duration: 6,
        description: 'Ideal para estrategias a medio plazo'
      },
      'plan_12_months': {
        id: 'plan_12_months',
        name: 'Plan 12 Meses', 
        price: 299,
        duration: 12,
        description: 'Máximo ahorro para estrategias anuales'
      }
    };

    // Si el plan guardado es un string simple, mapearlo
    if (typeof storedPlan === 'string') {
      const mappedPlan = planMappings[storedPlan];
      if (mappedPlan) {
        return {
          ...mappedPlan,
          status: companyData.status || 'active'
        };
      }
    }

    // Si el plan ya es un objeto, usarlo directamente pero asegurar campos necesarios
    if (typeof storedPlan === 'object' && storedPlan !== null) {
      return {
        id: storedPlan.id || 'plan_12_months',
        name: storedPlan.name || 'Plan Personalizado',
        price: storedPlan.price || 299,
        duration: storedPlan.duration || 12,
        description: storedPlan.description || 'Plan personalizado',
        status: companyData.status || 'active'
      };
    }

    // Fallback al plan por defecto
    console.log('⚠️ Plan no reconocido en dashboard, usando plan por defecto:', storedPlan);
    return {
      id: 'plan_12_months',
      name: 'Plan 12 Meses',
      price: 299,
      duration: 12,
      description: 'Máximo ahorro para estrategias anuales',
      status: 'active'
    };
  };

  const [myCollaborations, setMyCollaborations] = useState([]);

  const loadMyCollaboration = async (businessName) => {
    try {
      // Obtener todas las colaboraciones disponibles para influencers
      const collaborations = await getAvailableCollaborations();
      
      // Buscar TODAS las colaboraciones que coincidan con el nombre del negocio
      const matchingCollaborations = collaborations.filter(
        collab => collab.business === businessName
      );
      
      console.log(`Buscando colaboraciones para negocio: "${businessName}"`);
      console.log(`Colaboraciones encontradas: ${matchingCollaborations.length}`);
      
      // Guardar todas las colaboraciones encontradas
      setMyCollaborations(matchingCollaborations);
      
      // Mantener compatibilidad con el código existente (primera colaboración)
      setMyCollaboration(matchingCollaborations[0] || null);
    } catch (error) {
      console.error('Error cargando colaboraciones de empresa:', error);
      setMyCollaborations([]);
      setMyCollaboration(null);
    }
  };

  // Función para obtener las colaboraciones reales creadas por el administrador
  const getAvailableCollaborations = async () => {
    try {
      // Obtener las campañas reales del administrador desde el storage
      const adminCampaigns = await StorageService.getData('admin_campaigns');
      
      if (!adminCampaigns || adminCampaigns.length === 0) {
        console.log('No hay campañas del administrador disponibles');
        return [];
      }

      console.log(`Encontradas ${adminCampaigns.length} campañas del administrador`);
      
      // Transformar las campañas del admin al formato esperado por los influencers
      const collaborations = adminCampaigns.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        business: campaign.business, // ← Campo clave para la coincidencia
        category: campaign.category,
        city: campaign.city,
        description: campaign.description,
        requirements: campaign.requirements || `Min. ${campaign.minFollowers || 0} seguidores IG`,
        minFollowers: parseInt(campaign.minFollowers) || 0,
        status: campaign.status || 'active',
        whatIncludes: campaign.whatIncludes || 'Detalles por confirmar',
        contentRequired: campaign.contentRequired || 'Contenido por definir',
        deadline: campaign.deadline || '48 horas después de la experiencia',
        address: campaign.address || '',
        phone: campaign.phone || '',
        email: campaign.email || '',
        companyInstagram: campaign.companyInstagram || '',
        images: campaign.images || ['https://via.placeholder.com/400x300/C9A961/FFFFFF?text=Imagen+No+Disponible'],
        coordinates: campaign.coordinates || {
          latitude: 40.4168,
          longitude: -3.7038
        },
        // Metadatos adicionales
        createdAt: campaign.createdAt,
        createdBy: 'admin'
      }));

      console.log('Colaboraciones transformadas:', collaborations.map(c => `${c.business} - ${c.title}`));
      return collaborations;
      
    } catch (error) {
      console.error('Error obteniendo campañas del administrador:', error);
      
      // Fallback: devolver array vacío en lugar de datos mock
      console.log('Devolviendo array vacío como fallback');
      return [];
    }
  };

  const handleImagePicker = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos Requeridos',
          'Necesitamos acceso a tu galería para cambiar la foto de perfil.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Mostrar opciones
      Alert.alert(
        'Cambiar Foto de Perfil',
        'Selecciona una opción',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Seleccionar de Galería',
            onPress: selectFromGallery,
          },
          {
            text: 'Tomar Foto',
            onPress: takePhoto,
          },
        ]
      );
    } catch (error) {
      console.error('Error al abrir selector de imagen:', error);
      Alert.alert('Error', 'No se pudo abrir el selector de imagen');
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await saveProfileImage(imageUri);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos Requeridos',
          'Necesitamos acceso a la cámara para tomar una foto.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await saveProfileImage(imageUri);
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const saveProfileImage = async (imageUri) => {
    try {
      console.log('📸 Guardando imagen de perfil de empresa:', imageUri);
      
      // Actualizar estado local inmediatamente
      setProfileImage(imageUri);

      // Cargar datos existentes de empresa
      const existingData = await StorageService.getCompanyData(user.id) || {};
      console.log('📋 Datos existentes de empresa:', existingData);
      
      // Actualizar con nueva imagen y datos esenciales
      const updatedData = {
        ...existingData,
        id: user.id,
        companyName: companyName || existingData.companyName || 'Mi Empresa',
        profileImage: imageUri,
        lastUpdated: new Date().toISOString(),
        imageUpdatedAt: new Date().toISOString()
      };

      console.log('💾 Guardando datos actualizados:', updatedData);

      // Guardar en storage con múltiples puntos de persistencia
      const saveSuccess = await StorageService.saveCompanyData(updatedData);
      
      if (saveSuccess) {
        console.log('✅ Datos de empresa guardados exitosamente');
        
        // Guardar también una copia de respaldo específica para la imagen
        await StorageService.saveData(`company_profile_image_${user.id}`, {
          userId: user.id,
          profileImage: imageUri,
          savedAt: new Date().toISOString()
        });
        
        // Actualizar usuario en Redux con persistencia
        const updatedUser = {
          ...user,
          profileImage: imageUri,
          lastProfileImageUpdate: new Date().toISOString()
        };
        dispatch(updateUser(updatedUser));
        
        // Guardar también el usuario actualizado
        await StorageService.saveUser(updatedUser);
        
        console.log('✅ Usuario actualizado en Redux y storage');

        Alert.alert(
          '✅ Foto Actualizada',
          'Tu foto de perfil ha sido actualizada y guardada permanentemente.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('No se pudo guardar en el storage');
      }

    } catch (error) {
      console.error('❌ Error guardando imagen:', error);
      
      // Revertir estado local si hay error
      setProfileImage(null);
      
      Alert.alert(
        'Error', 
        'No se pudo guardar la imagen. Por favor, inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logoutUser()).unwrap();
              // Redirigir a la pantalla de bienvenida
              dispatch(setCurrentScreen('welcome'));
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              // Aún así redirigir a bienvenida en caso de error
              dispatch(setCurrentScreen('welcome'));
            }
          },
        },
      ]
    );
  };

  // Si se está mostrando la pantalla de detalles, renderizar solo esa pantalla en pantalla completa
  if (showCollaborationDetail && selectedCollaboration) {
    return (
      <CollaborationDetailScreenNew
        collaboration={selectedCollaboration}
        onBack={() => {
          setShowCollaborationDetail(false);
          setSelectedCollaboration(null);
        }}
        currentUser={user}
        onRequest={() => {
          // Las empresas no pueden solicitar su propia colaboración
          Alert.alert(
            'Información',
            'Esta es tu propia colaboración. Los influencers pueden ver estos detalles y solicitar participar.',
            [{ text: 'Entendido' }]
          );
        }}
      />
    );
  }

  // Función para renderizar cada tarjeta de colaboración en el carrusel
  const renderCollaborationCard = ({ item, index }) => {
    const screenWidth = Dimensions.get('window').width;
    const cardWidth = screenWidth - 60; // 30px de margen a cada lado
    
    return (
      <View style={[styles.campaignCard, { width: cardWidth, marginRight: 15 }]}>
        <View style={styles.campaignHeader}>
          <Text style={styles.campaignTitle}>{item.business}</Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: item.status === 'active' ? '#34C759' : '#FF9500' 
          }]}>
            <Text style={styles.statusText}>
              {item.status === 'active' ? 'ACTIVA' : 'INACTIVA'}
            </Text>
          </View>
        </View>
        <Text style={styles.campaignSubtitle}>{item.title}</Text>
        
        <View style={styles.campaignDescription}>
          <Text style={styles.campaignDescText} numberOfLines={3}>
            {item.description}
          </Text>
        </View>
        
        <View style={styles.campaignStats}>
          <View style={styles.statItem}>
            <MinimalistIcons name="users" size={16} color="#FFFFFF" />
            <Text style={styles.statText}>
              {item.minFollowers >= 1000 
                ? `${(item.minFollowers / 1000).toFixed(0)}K min`
                : `${item.minFollowers} min`
              }
            </Text>
          </View>
          <View style={styles.statItem}>
            <MinimalistIcons name="location" size={16} color="#FFFFFF" />
            <Text style={styles.statText}>{item.city}</Text>
          </View>
          <View style={styles.statItem}>
            <MinimalistIcons name="target" size={16} color="#FFFFFF" />
            <Text style={styles.statText}>{item.category}</Text>
          </View>
        </View>

        <View style={styles.campaignContent}>
          <Text style={styles.contentLabel}>Contenido requerido:</Text>
          <Text style={styles.contentText} numberOfLines={2}>
            {item.contentRequired}
          </Text>
        </View>

        <View style={styles.campaignIncludes}>
          <Text style={styles.includesLabel}>Qué incluye:</Text>
          <Text style={styles.includesText} numberOfLines={2}>
            {item.whatIncludes}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => {
            setSelectedCollaboration(item);
            setShowCollaborationDetail(true);
          }}
        >
          <Text style={styles.detailsButtonText}>Ver Detalles</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Renderizar el dashboard normal
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Perfil de empresa */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handleImagePicker}
            activeOpacity={0.7}
          >
            <Image 
              source={{ 
                uri: profileImage || user?.profileImage || 'https://via.placeholder.com/80x80/C9A961/FFFFFF?text=' + (companyName.charAt(0) || 'E')
              }}
              style={styles.profileImage}
            />
            <View style={styles.cameraOverlay}>
              <MinimalistIcons name="edit" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.companyName}>
            {isLoading ? 'Cargando...' : companyName}
          </Text>
          <Text style={styles.planText}>{currentPlan}</Text>
        </View>

        {/* Mis Anuncios de Colaboración */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Anuncios de Colaboración</Text>
            {myCollaborations.length > 0 && (
              <Text style={styles.collaborationCounter}>
                {myCollaborations.length} anuncio{myCollaborations.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          
          {myCollaborations.length > 0 ? (
            <View style={styles.collaborationsContainer}>
              <FlatList
                data={myCollaborations}
                renderItem={renderCollaborationCard}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={Dimensions.get('window').width - 45} // Para snap suave
                decelerationRate="fast"
                contentContainerStyle={styles.collaborationsList}
                ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
              />
              
              {myCollaborations.length > 1 && (
                <View style={styles.carouselIndicator}>
                  <Text style={styles.indicatorText}>
                    Desliza para ver más anuncios →
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noCollaborationCard}>
              <MinimalistIcons name="campaign" size={48} color="#666666" />
              <Text style={styles.noCollaborationTitle}>Sin colaboraciones activas</Text>
              <Text style={styles.noCollaborationText}>
                No se encontraron colaboraciones que coincidan con "{companyName}".
                {'\n\n'}Para que aparezcan aquí:
                {'\n'}1. El administrador debe crear campañas desde el panel de administración
                {'\n'}2. El campo "Negocio" de las campañas debe coincidir exactamente con "{companyName}"
                {'\n'}3. Las campañas deben estar activas
                {'\n\n'}Contacta al administrador si necesitas que se creen tus campañas.
              </Text>
            </View>
          )}
        </View>

        {/* Control Total de la Empresa */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.controlSectionTitle]}>Control Total de la Empresa</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => dispatch(setCurrentScreen('company-dashboard-main'))}
          >
            <MinimalistIcons name="chart" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Dashboard de Empresa</Text>
            <MinimalistIcons name="arrow" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => dispatch(setCurrentScreen('company-requests'))}
          >
            <MinimalistIcons name="users" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Solicitudes de Influencers</Text>
            <MinimalistIcons name="arrow" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => dispatch(setCurrentScreen('company-data'))}
          >
            <MinimalistIcons name="business" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Datos de la Empresa</Text>
            <MinimalistIcons name="arrow" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => dispatch(setCurrentScreen('company-locations'))}
          >
            <MinimalistIcons name="location" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Locales</Text>
            <MinimalistIcons name="arrow" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation?.navigate('subscription-plans')}
          >
            <MinimalistIcons name="target" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Gestionar Planes de Suscripción</Text>
            <MinimalistIcons name="arrow" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation?.navigate('CompanyPasswordScreen')}
          >
            <MinimalistIcons name="settings" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Contraseña y Seguridad</Text>
            <MinimalistIcons name="arrow" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Botón rojo inferior */}
        <TouchableOpacity style={styles.redButton} onPress={handleLogout}>
          <Text style={styles.redButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  scrollView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#C9A961',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C9A961',
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 5,
    textAlign: 'center',
  },
  planText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C9A961',
  },
  controlSectionTitle: {
    marginBottom: 25, // Espacio adicional entre el título y el primer botón
  },
  collaborationCounter: {
    fontSize: 14,
    color: '#AAAAAA',
    fontWeight: '500',
  },
  collaborationsContainer: {
    marginHorizontal: -20, // Compensar el padding del section
  },
  collaborationsList: {
    paddingLeft: 20,
    paddingRight: 5,
  },
  carouselIndicator: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  indicatorText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  campaignCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
    minHeight: 280, // Altura mínima consistente para todas las tarjetas
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  campaignSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  campaignDescription: {
    marginBottom: 12,
  },
  campaignDescText: {
    fontSize: 13,
    color: '#AAAAAA',
    lineHeight: 18,
  },
  campaignStats: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  detailsButton: {
    backgroundColor: '#C9A961',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  campaignContent: {
    marginBottom: 10,
  },
  contentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C9A961',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  campaignIncludes: {
    marginBottom: 15,
  },
  includesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C9A961',
    marginBottom: 4,
  },
  includesText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  noCollaborationCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  noCollaborationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 10,
  },
  noCollaborationText: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 15,
  },
  redButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  redButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default CompanyDashboard;