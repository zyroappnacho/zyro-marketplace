import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { setCurrentScreen } from '../store/slices/uiSlice';
import { updateUser } from '../store/slices/authSlice';
import StorageService from '../services/StorageService';
// Importaciones removidas - ahora cargamos datos específicos de la empresa directamente
import CompanyDataSyncService from '../services/CompanyDataSyncService';

const CompanyDataScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companyData, setCompanyData] = useState({
    // Los 12 campos exactos especificados por el usuario
    companyName: '',              // 1. Nombre de la empresa
    cifNif: '',                   // 2. CIF/NIF
    companyAddress: '',           // 3. Dirección completa
    companyPhone: '',             // 4. Teléfono de la empresa
    companyEmail: '',             // 5. Email corporativo
    password: '',                 // 6. Contraseña
    representativeName: '',       // 7. Nombre del representante
    representativeEmail: '',      // 8. Email del representante
    representativePosition: '',   // 9. Cargo del representante
    businessType: '',             // 10. Tipo de negocio
    businessDescription: '',      // 11. Descripción del negocio
    website: ''                   // 12. Sitio web
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      console.log('📋 CompanyDataScreen: CARGA ESPECÍFICA DE DATOS DE EMPRESA');
      console.log('🆔 CompanyDataScreen: ID de usuario:', user.id);
      console.log('📧 CompanyDataScreen: Email de empresa:', user.companyEmail || user.email);
      console.log('🏢 CompanyDataScreen: Nombre de empresa:', user.companyName || user.fullName);
      
      // VALIDACIÓN ESTRICTA: Solo empresas pueden acceder
      if (!user || user.role !== 'company') {
        console.error('❌ CompanyDataScreen: Usuario no es de tipo empresa');
        Alert.alert('Error', 'Acceso no autorizado. Solo empresas pueden ver esta pantalla.');
        return;
      }

      // BÚSQUEDA EXHAUSTIVA DE DATOS ESPECÍFICOS DE ESTA EMPRESA
      console.log('🔍 CompanyDataScreen: Iniciando búsqueda exhaustiva de datos...');
      
      // FUENTE 1: Datos directos de empresa por ID
      console.log('📂 Fuente 1: Buscando datos directos por ID:', user.id);
      const directCompanyData = await StorageService.getCompanyData(user.id);
      
      // FUENTE 2: Buscar en lista de empresas por ID
      console.log('📋 Fuente 2: Buscando en lista de empresas...');
      const companiesList = await StorageService.getCompaniesList() || [];
      const companyInList = companiesList.find(c => c.id === user.id);
      
      // FUENTE 3: Buscar por email en lista de empresas
      console.log('📧 Fuente 3: Buscando por email en lista...');
      const companyByEmail = companiesList.find(c => 
        c.email === user.companyEmail || 
        c.email === user.email
      );
      
      // FUENTE 4: Buscar usuario aprobado por ID
      console.log('👤 Fuente 4: Buscando usuario aprobado...');
      const approvedUser = await StorageService.getApprovedUser(user.id);
      
      // FUENTE 5: Buscar usuario aprobado por email
      console.log('📧 Fuente 5: Buscando usuario aprobado por email...');
      let approvedUserByEmail = null;
      if (user.companyEmail || user.email) {
        approvedUserByEmail = await StorageService.getApprovedUserByEmail(user.companyEmail || user.email);
      }
      
      console.log('📊 CompanyDataScreen: RESULTADOS DE BÚSQUEDA:');
      console.log(`   📂 Datos directos: ${directCompanyData ? '✅ ENCONTRADO' : '❌ No encontrado'}`);
      console.log(`   📋 En lista por ID: ${companyInList ? '✅ ENCONTRADO' : '❌ No encontrado'}`);
      console.log(`   📧 En lista por email: ${companyByEmail ? '✅ ENCONTRADO' : '❌ No encontrado'}`);
      console.log(`   👤 Usuario aprobado: ${approvedUser ? '✅ ENCONTRADO' : '❌ No encontrado'}`);
      console.log(`   📧 Usuario por email: ${approvedUserByEmail ? '✅ ENCONTRADO' : '❌ No encontrado'}`);
      
      // COMBINACIÓN INTELIGENTE DE DATOS CON VERIFICACIÓN DE IDENTIDAD
      let finalCompanyData = null;
      let dataSource = 'none';
      
      // PRIORIDAD 1: Datos directos de empresa (más confiables)
      if (directCompanyData && directCompanyData.id === user.id) {
        console.log('✅ CompanyDataScreen: Usando datos directos de empresa');
        finalCompanyData = directCompanyData;
        dataSource = 'direct_company_data';
      }
      // PRIORIDAD 2: Usuario aprobado por ID
      else if (approvedUser && approvedUser.id === user.id) {
        console.log('✅ CompanyDataScreen: Usando datos de usuario aprobado por ID');
        finalCompanyData = approvedUser;
        dataSource = 'approved_user_by_id';
      }
      // PRIORIDAD 3: Usuario aprobado por email
      else if (approvedUserByEmail && (
        approvedUserByEmail.companyEmail === user.companyEmail ||
        approvedUserByEmail.email === user.email ||
        approvedUserByEmail.companyEmail === user.email
      )) {
        console.log('✅ CompanyDataScreen: Usando datos de usuario aprobado por email');
        finalCompanyData = approvedUserByEmail;
        dataSource = 'approved_user_by_email';
      }
      // PRIORIDAD 4: Empresa en lista por ID
      else if (companyInList && companyInList.id === user.id) {
        console.log('✅ CompanyDataScreen: Usando datos de lista por ID');
        // Intentar cargar datos completos
        const fullData = await StorageService.getCompanyData(companyInList.id);
        finalCompanyData = fullData || companyInList;
        dataSource = 'company_list_by_id';
      }
      // PRIORIDAD 5: Empresa en lista por email
      else if (companyByEmail && (
        companyByEmail.email === user.companyEmail ||
        companyByEmail.email === user.email
      )) {
        console.log('✅ CompanyDataScreen: Usando datos de lista por email');
        // Intentar cargar datos completos
        const fullData = await StorageService.getCompanyData(companyByEmail.id);
        finalCompanyData = fullData || companyByEmail;
        dataSource = 'company_list_by_email';
      }
      
      // MAPEO DE DATOS ESPECÍFICOS CON VALIDACIÓN DE IDENTIDAD
      if (finalCompanyData) {
        console.log('✅ CompanyDataScreen: Datos encontrados desde:', dataSource);
        console.log('🏢 CompanyDataScreen: Empresa:', finalCompanyData.companyName || finalCompanyData.name);
        console.log('📧 CompanyDataScreen: Email:', finalCompanyData.companyEmail || finalCompanyData.email);
        
        // VALIDACIÓN FINAL: Asegurar que los datos corresponden a la empresa correcta
        const isValidCompany = (
          finalCompanyData.id === user.id ||
          finalCompanyData.companyEmail === user.companyEmail ||
          finalCompanyData.email === user.companyEmail ||
          finalCompanyData.companyEmail === user.email ||
          finalCompanyData.email === user.email
        );
        
        if (!isValidCompany) {
          console.warn('⚠️ CompanyDataScreen: ADVERTENCIA - Los datos pueden no corresponder a la empresa actual');
          console.warn('   - Datos ID:', finalCompanyData.id);
          console.warn('   - Usuario ID:', user.id);
          console.warn('   - Datos Email:', finalCompanyData.companyEmail || finalCompanyData.email);
          console.warn('   - Usuario Email:', user.companyEmail || user.email);
        }
        
        // MAPEO EXHAUSTIVO DE LOS 12 CAMPOS REQUERIDOS
        const mappedData = {
          // 1. Nombre de la empresa
          companyName: finalCompanyData.companyName || 
                      finalCompanyData.name || 
                      finalCompanyData.businessName || 
                      user.companyName || 
                      user.fullName || '',
          
          // 2. CIF/NIF
          cifNif: finalCompanyData.cifNif || 
                 finalCompanyData.nif || 
                 finalCompanyData.cif || '',
          
          // 3. Dirección completa
          companyAddress: finalCompanyData.companyAddress || 
                         finalCompanyData.address || 
                         finalCompanyData.businessAddress || '',
          
          // 4. Teléfono de la empresa
          companyPhone: finalCompanyData.companyPhone || 
                       finalCompanyData.phone || 
                       finalCompanyData.businessPhone || '',
          
          // 5. Email corporativo
          companyEmail: finalCompanyData.companyEmail || 
                       finalCompanyData.email || 
                       user.companyEmail || 
                       user.email || '',
          
          // 6. Contraseña (siempre protegida)
          password: '••••••••',
          
          // 7. Nombre del representante
          representativeName: finalCompanyData.representativeName || 
                             finalCompanyData.fullName || 
                             finalCompanyData.contactName || '',
          
          // 8. Email del representante
          representativeEmail: finalCompanyData.representativeEmail || 
                              finalCompanyData.email || 
                              finalCompanyData.contactEmail || '',
          
          // 9. Cargo del representante
          representativePosition: finalCompanyData.representativePosition || 
                                 finalCompanyData.position || 
                                 finalCompanyData.jobTitle || '',
          
          // 10. Tipo de negocio
          businessType: finalCompanyData.businessType || 
                       finalCompanyData.category || 
                       finalCompanyData.sector || '',
          
          // 11. Descripción del negocio
          businessDescription: finalCompanyData.businessDescription || 
                              finalCompanyData.description || 
                              finalCompanyData.about || '',
          
          // 12. Sitio web
          website: finalCompanyData.website || 
                  finalCompanyData.webUrl || 
                  finalCompanyData.url || ''
        };
        
        setCompanyData(mappedData);
        
        console.log('📊 CompanyDataScreen: DATOS ESPECÍFICOS CARGADOS EXITOSAMENTE:');
        Object.entries(mappedData).forEach(([key, value]) => {
          if (value && value !== '••••••••') {
            console.log(`   ✅ ${key}: "${value}"`);
          } else if (value === '••••••••') {
            console.log(`   🔒 ${key}: protegido`);
          } else {
            console.log(`   ⚪ ${key}: vacío`);
          }
        });
        
        // Mostrar mensaje de éxito
        Alert.alert(
          '✅ Datos Cargados',
          `Los datos de tu empresa "${mappedData.companyName}" han sido cargados correctamente.`,
          [{ text: 'OK' }]
        );
        
        return; // Datos específicos cargados exitosamente
      }
      
      // CASO: NO SE ENCONTRARON DATOS ESPECÍFICOS
      console.log('⚠️ CompanyDataScreen: NO SE ENCONTRARON DATOS ESPECÍFICOS');
      console.log('📝 CompanyDataScreen: Inicializando formulario vacío para completar datos');
      
      // Inicializar con datos básicos del usuario actual
      const emptyData = {
        companyName: user.companyName || user.fullName || '',
        cifNif: '',
        companyAddress: '',
        companyPhone: '',
        companyEmail: user.companyEmail || user.email || '',
        password: '••••••••', // Contraseña protegida
        representativeName: user.fullName || '',
        representativeEmail: user.email || '',
        representativePosition: '',
        businessType: '',
        businessDescription: '',
        website: ''
      };
      
      setCompanyData(emptyData);
      
      // Mostrar mensaje informativo
      Alert.alert(
        'Completar Datos de Empresa',
        `Hola ${user.companyName || user.fullName}. No se encontraron datos específicos de tu empresa. Por favor, completa la información para actualizar tu perfil empresarial.`,
        [{ text: 'Entendido' }]
      );
      
    } catch (error) {
      console.error('❌ CompanyDataScreen: ERROR CRÍTICO cargando datos específicos:', error);
      
      // FALLBACK DE EMERGENCIA
      const emergencyData = {
        companyName: user.companyName || user.fullName || 'Mi Empresa',
        cifNif: '',
        companyAddress: '',
        companyPhone: '',
        companyEmail: user.companyEmail || user.email || '',
        password: '••••••••',
        representativeName: user.fullName || '',
        representativeEmail: user.email || '',
        representativePosition: '',
        businessType: '',
        businessDescription: '',
        website: ''
      };
      
      setCompanyData(emergencyData);
      
      Alert.alert(
        'Error de Carga',
        'Hubo un problema cargando los datos de tu empresa. Se ha inicializado un formulario básico. Por favor, completa la información.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      console.log('💾 CompanyDataScreen: INICIANDO GUARDADO ESPECÍFICO DE EMPRESA');
      console.log('🆔 CompanyDataScreen: ID de empresa:', user.id);
      console.log('🏢 CompanyDataScreen: Nombre de empresa:', companyData.companyName);

      // VALIDACIÓN ESTRICTA DE CAMPOS OBLIGATORIOS
      const requiredFields = [
        'companyName', 'cifNif', 'companyAddress', 'companyPhone', 'companyEmail', 
        'representativeName', 'representativeEmail', 'representativePosition', 
        'businessType', 'businessDescription', 'website'
      ];

      const missingFields = requiredFields.filter(field => !companyData[field] || !companyData[field].trim());
      
      if (missingFields.length > 0) {
        console.warn('⚠️ CompanyDataScreen: Campos faltantes:', missingFields);
        Alert.alert(
          'Campos Requeridos',
          `Por favor completa los siguientes campos:\n\n${missingFields.map(field => {
            const fieldNames = {
              'companyName': 'Nombre de la empresa',
              'cifNif': 'CIF/NIF',
              'companyAddress': 'Dirección completa',
              'companyPhone': 'Teléfono de la empresa',
              'companyEmail': 'Email corporativo',
              'representativeName': 'Nombre del representante',
              'representativeEmail': 'Email del representante',
              'representativePosition': 'Cargo del representante',
              'businessType': 'Tipo de negocio',
              'businessDescription': 'Descripción del negocio',
              'website': 'Sitio web'
            };
            return `• ${fieldNames[field] || field}`;
          }).join('\n')}`
        );
        setIsSaving(false);
        return;
      }

      // PREPARAR DATOS COMPLETOS PARA GUARDADO ESPECÍFICO
      const updatedCompanyData = {
        // DATOS BASE DEL USUARIO (preservar información existente)
        ...user,
        
        // DATOS ESPECÍFICOS DE LA EMPRESA (los 12 campos editados)
        ...companyData,
        
        // METADATOS CRÍTICOS (asegurar integridad)
        id: user.id, // ID único e inmutable de la empresa
        role: 'company', // Rol fijo para empresas
        
        // INFORMACIÓN DE AUDITORÍA
        lastUpdated: new Date().toISOString(),
        updatedFrom: 'company_data_screen',
        updatedBy: user.id,
        version: '2.1',
        
        // PRESERVAR DATOS IMPORTANTES EXISTENTES
        selectedPlan: user.selectedPlan || 'Plan 6 Meses',
        status: user.status || 'active',
        registrationDate: user.registrationDate || new Date().toISOString(),
        
        // ASEGURAR CONSISTENCIA DE EMAILS
        email: companyData.companyEmail, // Email principal = email corporativo
        companyEmail: companyData.companyEmail, // Email corporativo explícito
        
        // DATOS DE SINCRONIZACIÓN
        syncEnabled: true,
        lastSyncUpdate: new Date().toISOString()
      };

      console.log('💾 CompanyDataScreen: GUARDANDO DATOS ESPECÍFICOS:');
      console.log(`   🆔 ID: ${updatedCompanyData.id}`);
      console.log(`   🏢 Empresa: ${updatedCompanyData.companyName}`);
      console.log(`   📧 Email: ${updatedCompanyData.companyEmail}`);
      console.log(`   👤 Representante: ${updatedCompanyData.representativeName}`);
      console.log(`   🏪 Tipo: ${updatedCompanyData.businessType}`);
      
      // GUARDADO PRINCIPAL CON VERIFICACIÓN
      const saveResult = await StorageService.saveCompanyData(updatedCompanyData);
      
      if (!saveResult) {
        throw new Error('No se pudieron guardar los datos de la empresa en el almacenamiento principal');
      }
      
      console.log('✅ CompanyDataScreen: Datos guardados exitosamente en almacenamiento principal');
      
      // GUARDADO ADICIONAL COMO USUARIO APROBADO (para compatibilidad)
      try {
        console.log('💾 CompanyDataScreen: Guardando también como usuario aprobado...');
        await StorageService.saveApprovedUser(updatedCompanyData);
        console.log('✅ CompanyDataScreen: Guardado como usuario aprobado exitoso');
      } catch (approvedUserError) {
        console.warn('⚠️ CompanyDataScreen: Error guardando como usuario aprobado:', approvedUserError);
        // No fallar el proceso principal por este error
      }
      
      // SINCRONIZACIÓN EN TIEMPO REAL CON PANEL DE ADMINISTRADOR
      console.log('📢 CompanyDataScreen: Notificando cambios al panel de administrador...');
      try {
        await CompanyDataSyncService.notifyCompanyDataChange(
          user.id, 
          updatedCompanyData, 
          'company_data_screen'
        );
        console.log('✅ CompanyDataScreen: Cambios notificados al panel de administrador exitosamente');
      } catch (syncError) {
        console.warn('⚠️ CompanyDataScreen: Error en sincronización con admin (no crítico):', syncError);
        // No fallar el guardado por error de sincronización
      }
      
      // ACTUALIZAR ESTADO DE REDUX
      console.log('🔄 CompanyDataScreen: Actualizando estado de Redux...');
      dispatch(updateUser(updatedCompanyData));
      console.log('✅ CompanyDataScreen: Estado de Redux actualizado');

      // FINALIZAR PROCESO
      setIsEditing(false);
      setIsSaving(false);

      // CONFIRMACIÓN AL USUARIO
      Alert.alert(
        '✅ Datos Actualizados Exitosamente',
        `Los datos de tu empresa "${updatedCompanyData.companyName}" han sido guardados correctamente y sincronizados con el panel de administrador.`,
        [{ 
          text: 'Perfecto', 
          onPress: () => {
            console.log('✅ CompanyDataScreen: Proceso de guardado completado exitosamente');
          }
        }]
      );

    } catch (error) {
      console.error('❌ CompanyDataScreen: ERROR CRÍTICO guardando datos:', error);
      setIsSaving(false);
      
      Alert.alert(
        'Error al Guardar',
        `No se pudieron guardar los datos de tu empresa. Error: ${error.message}. Por favor, inténtalo de nuevo.`,
        [{ text: 'Reintentar' }]
      );
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadCompanyData(); // Recargar datos originales
  };

  const getPlanDisplayName = (planId) => {
    const planNames = {
      'basic': 'Plan 3 Meses (499€/mes)',
      'plan_3_months': 'Plan 3 Meses (499€/mes)',
      'premium': 'Plan 6 Meses (399€/mes)',
      'plan_6_months': 'Plan 6 Meses (399€/mes)',
      'enterprise': 'Plan 12 Meses (299€/mes)',
      'plan_12_months': 'Plan 12 Meses (299€/mes)'
    };
    
    return planNames[planId] || planId;
  };

  const handleFixData = async () => {
    try {
      Alert.alert(
        'Recargar Datos',
        '¿Deseas recargar los datos específicos de tu empresa?',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Recargar',
            onPress: async () => {
              console.log('🔄 CompanyDataScreen: Recargando datos específicos de empresa...');
              await loadCompanyData();
              Alert.alert(
                '✅ Datos Recargados',
                'Los datos específicos de tu empresa han sido recargados.',
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error recargando datos:', error);
      Alert.alert('Error', 'Error al recargar los datos de la empresa');
    }
  };

  const renderField = (label, field, placeholder, multiline = false, keyboardType = 'default', editable = true) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing && editable ? (
          <TextInput
            style={[styles.input, multiline && styles.textArea]}
            value={companyData[field]}
            onChangeText={(text) => setCompanyData({ ...companyData, [field]: text })}
            placeholder={placeholder}
            placeholderTextColor="#666666"
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            keyboardType={keyboardType}
            autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          />
        ) : (
          <View style={styles.valueContainer}>
            <Text style={styles.fieldValue}>
              {companyData[field] || 'No especificado'}
            </Text>
            {!editable && (
              <Text style={styles.fieldHint}>
                Campo protegido (no editable)
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => dispatch(setCurrentScreen('company'))}
        >
          <Ionicons name="arrow-back" size={24} color="#C9A961" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Datos de la Empresa</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.fixButton}
            onPress={handleFixData}
          >
            <Ionicons name="refresh" size={20} color="#C9A961" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => isEditing ? handleCancel() : setIsEditing(true)}
          >
            <Ionicons 
              name={isEditing ? "close" : "pencil"} 
              size={24} 
              color="#C9A961" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Datos de la Empresa - Los 12 campos especificados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de la Empresa</Text>
          <Text style={styles.sectionSubtitle}>Información sincronizada con el formulario de registro</Text>
          
          {/* 1. Nombre de la empresa */}
          {renderField('Nombre de la empresa', 'companyName', 'Ingresa el nombre de tu empresa')}
          
          {/* 2. CIF/NIF */}
          {renderField('CIF/NIF', 'cifNif', 'Número de identificación fiscal')}
          
          {/* 3. Dirección completa */}
          {renderField('Dirección completa', 'companyAddress', 'Dirección completa de la empresa')}
          
          {/* 4. Teléfono de la empresa */}
          {renderField('Teléfono de la empresa', 'companyPhone', '+34 XXX XXX XXX', false, 'phone-pad')}
          
          {/* 5. Email corporativo */}
          {renderField('Email corporativo', 'companyEmail', 'contacto@empresa.com', false, 'email-address', false)}
          
          {/* 6. Contraseña */}
          {renderField('Contraseña', 'password', '••••••••', false, 'default', false)}
          
          {/* 7. Nombre del representante */}
          {renderField('Nombre del representante', 'representativeName', 'Nombre completo del representante')}
          
          {/* 8. Email del representante */}
          {renderField('Email del representante', 'representativeEmail', 'email@representante.com', false, 'email-address')}
          
          {/* 9. Cargo del representante */}
          {renderField('Cargo del representante', 'representativePosition', 'Director, Gerente, CEO, etc.')}
          
          {/* 10. Tipo de negocio */}
          {renderField('Tipo de negocio', 'businessType', 'Restaurante, Tienda, Servicios, etc.')}
          
          {/* 11. Descripción del negocio */}
          {renderField('Descripción del negocio', 'businessDescription', 'Describe tu negocio y servicios...', true)}
          
          {/* 12. Sitio web */}
          {renderField('Sitio web', 'website', 'https://www.tuempresa.com', false, 'url')}
        </View>



        {/* Botón de guardar */}
        {isEditing && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isSaving}
          >
            <LinearGradient
              colors={['#C9A961', '#D4AF37']}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fixButton: {
    padding: 5,
    marginRight: 10,
  },
  editButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 8,
  },
  valueContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  fieldValue: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },

  fieldHint: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
    fontStyle: 'italic',
  },

  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#C9A961',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginHorizontal: 20,
    marginVertical: 30,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default CompanyDataScreen;