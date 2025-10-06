import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    TextInput,
    Modal,
    FlatList,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MinimalistIcons from './MinimalistIcons';
import * as StorageServiceModule from '../services/StorageService';
const StorageService = StorageServiceModule.default;

const { width } = Dimensions.get('window');

const AdminCompanyLocationsScreen = ({ companyId, companyName, onBack }) => {
    const [locations, setLocations] = useState([]);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationModalMode, setLocationModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [locationForm, setLocationForm] = useState({
        name: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        description: '',
        coordinates: {
            latitude: 40.4168,
            longitude: -3.7038
        }
    });

    useEffect(() => {
        loadCompanyLocations();
    }, [companyId]);

    const loadCompanyLocations = async () => {
        try {
            setIsLoading(true);
            console.log(`📍 Cargando locales para empresa ${companyId}...`);
            
            // Verificar que StorageService está disponible
            if (!StorageService || typeof StorageService.getCompanyLocations !== 'function') {
                console.error('❌ StorageService no está disponible o getCompanyLocations no es una función');
                console.log('StorageService:', StorageService);
                Alert.alert('Error', 'Servicio de almacenamiento no disponible. Reinicia la aplicación.');
                return;
            }

            // Verificar que companyId es válido
            if (!companyId) {
                console.error('❌ Company ID no está disponible');
                Alert.alert('Error', 'ID de empresa no válido. Vuelve e inténtalo de nuevo.');
                return;
            }
            
            const locationsData = await StorageService.getCompanyLocations(companyId);
            
            // Validar datos cargados
            if (!Array.isArray(locationsData)) {
                console.error('❌ Datos de locales no válidos:', locationsData);
                Alert.alert('Error', 'Datos de locales corruptos. Se inicializará una lista vacía.');
                setLocations([]);
                return;
            }

            setLocations(locationsData);
            
            console.log(`✅ Locales cargados exitosamente: ${locationsData.length}`);
            
            // Log detallado para debugging
            if (locationsData.length > 0) {
                console.log('📍 Locales encontrados:', locationsData.map(loc => ({
                    id: loc.id,
                    name: loc.name,
                    address: loc.address,
                    createdAt: loc.createdAt
                })));
            }
            
        } catch (error) {
            console.error('❌ Error cargando locales:', error);
            Alert.alert(
                'Error de Carga', 
                `No se pudieron cargar los locales: ${error.message}\n\nSe mostrará una lista vacía.`
            );
            setLocations([]); // Fallback a lista vacía
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLocation = () => {
        setLocationModalMode('add');
        setSelectedLocation(null);
        setLocationForm({
            name: '',
            address: '',
            city: '',
            phone: '',
            email: '',
            description: '',
            coordinates: {
                latitude: 40.4168,
                longitude: -3.7038
            }
        });
        setShowLocationModal(true);
    };

    const handleEditLocation = (location) => {
        setLocationModalMode('edit');
        setSelectedLocation(location);
        setLocationForm({
            name: location.name || '',
            address: location.address || '',
            city: location.city || '',
            phone: location.phone || '',
            email: location.email || '',
            description: location.description || '',
            coordinates: location.coordinates || {
                latitude: 40.4168,
                longitude: -3.7038
            }
        });
        setShowLocationModal(true);
    };

    const handleSaveLocation = async () => {
        try {
            // Validaciones de campos obligatorios
            if (!locationForm.name.trim()) {
                Alert.alert('Error', 'El nombre del local es requerido');
                return;
            }

            if (!locationForm.address.trim()) {
                Alert.alert('Error', 'La dirección del local es requerida');
                return;
            }

            console.log(`💾 Iniciando guardado de local para empresa ${companyId}...`);

            const locationData = {
                id: locationModalMode === 'add' ? Date.now().toString() : selectedLocation.id,
                companyId: companyId,
                name: locationForm.name.trim(),
                address: locationForm.address.trim(),
                city: locationForm.city.trim(),
                phone: locationForm.phone.trim(),
                email: locationForm.email.trim(),
                description: locationForm.description.trim(),
                coordinates: locationForm.coordinates,
                createdAt: locationModalMode === 'add' ? new Date().toISOString() : selectedLocation.createdAt,
                updatedAt: new Date().toISOString(),
                version: 1 // Para control de versiones
            };

            let updatedLocations;
            if (locationModalMode === 'add') {
                updatedLocations = [...locations, locationData];
                console.log('📍 Añadiendo nuevo local:', locationData.name);
            } else {
                updatedLocations = locations.map(loc => 
                    loc.id === selectedLocation.id ? locationData : loc
                );
                console.log('📍 Editando local:', locationData.name);
            }

            // Guardar en storage con verificación
            console.log('💾 Guardando en AsyncStorage...');
            const saveResult = await StorageService.saveCompanyLocations(companyId, updatedLocations);
            
            if (!saveResult) {
                throw new Error('Error al guardar en AsyncStorage');
            }

            // Verificar que se guardó correctamente
            console.log('🔍 Verificando guardado...');
            const verificationData = await StorageService.getCompanyLocations(companyId);
            
            if (!verificationData || verificationData.length !== updatedLocations.length) {
                throw new Error('Error en verificación de guardado');
            }

            // Verificar que el local específico existe
            const savedLocation = verificationData.find(loc => loc.id === locationData.id);
            if (!savedLocation) {
                throw new Error('El local no se encontró después del guardado');
            }

            console.log('✅ Local guardado y verificado correctamente');
            
            // Actualizar estado local solo después de verificación exitosa
            setLocations(updatedLocations);
            setShowLocationModal(false);

            Alert.alert(
                'Éxito', 
                locationModalMode === 'add' ? 
                    `Local "${locationData.name}" añadido correctamente` : 
                    `Local "${locationData.name}" actualizado correctamente`
            );

        } catch (error) {
            console.error('❌ Error guardando local:', error);
            Alert.alert(
                'Error de Persistencia', 
                `No se pudo guardar el local permanentemente: ${error.message}\n\nPor favor, inténtalo de nuevo.`
            );
        }
    };

    const handleDeleteLocation = async (location) => {
        try {
            Alert.alert(
                'Eliminar Local',
                `¿Estás seguro de que quieres eliminar "${location.name}"?\n\nEsta acción no se puede deshacer y se guardará permanentemente.`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Eliminar Permanentemente',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                console.log(`🗑️ Iniciando eliminación permanente de local: ${location.name}`);
                                
                                const updatedLocations = locations.filter(loc => loc.id !== location.id);
                                
                                // Guardar cambios en storage con verificación
                                console.log('💾 Guardando cambios en AsyncStorage...');
                                const saveResult = await StorageService.saveCompanyLocations(companyId, updatedLocations);
                                
                                if (!saveResult) {
                                    throw new Error('Error al guardar cambios en AsyncStorage');
                                }

                                // Verificar que se eliminó correctamente
                                console.log('🔍 Verificando eliminación...');
                                const verificationData = await StorageService.getCompanyLocations(companyId);
                                
                                // Verificar que el local ya no existe
                                const deletedLocation = verificationData.find(loc => loc.id === location.id);
                                if (deletedLocation) {
                                    throw new Error('El local aún existe después de la eliminación');
                                }

                                // Verificar que el número de locales es correcto
                                if (verificationData.length !== updatedLocations.length) {
                                    throw new Error('Error en verificación del número de locales');
                                }

                                console.log('✅ Local eliminado y verificado correctamente');
                                
                                // Actualizar estado local solo después de verificación exitosa
                                setLocations(updatedLocations);
                                
                                Alert.alert(
                                    'Eliminación Exitosa', 
                                    `El local "${location.name}" ha sido eliminado permanentemente.`
                                );
                                
                            } catch (error) {
                                console.error('❌ Error eliminando local:', error);
                                Alert.alert(
                                    'Error de Eliminación', 
                                    `No se pudo eliminar el local permanentemente: ${error.message}\n\nPor favor, inténtalo de nuevo.`
                                );
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('❌ Error en eliminación de local:', error);
            Alert.alert('Error', 'No se pudo procesar la eliminación del local');
        }
    };

    const renderLocationCard = ({ item }) => (
        <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
                <Text style={styles.locationName}>{item.name}</Text>
                <View style={styles.locationActions}>
                    <TouchableOpacity
                        style={styles.editLocationButton}
                        onPress={() => handleEditLocation(item)}
                    >
                        <MinimalistIcons name="edit" size={16} color="#4A90E2" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteLocationButton}
                        onPress={() => handleDeleteLocation(item)}
                    >
                        <MinimalistIcons name="close" size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </View>
            
            <View style={styles.locationInfoRow}>
                <MinimalistIcons name="location" size={14} color="#CCCCCC" />
                <Text style={styles.locationInfoText}>{item.address}</Text>
            </View>
            {item.city && (
                <View style={styles.locationInfoRow}>
                    <MinimalistIcons name="business" size={14} color="#CCCCCC" />
                    <Text style={styles.locationInfoText}>{item.city}</Text>
                </View>
            )}
            {item.phone && (
                <View style={styles.locationInfoRow}>
                    <MinimalistIcons name="phone" size={14} color="#CCCCCC" />
                    <Text style={styles.locationInfoText}>{item.phone}</Text>
                </View>
            )}
            {item.email && (
                <View style={styles.locationInfoRow}>
                    <MinimalistIcons name="message" size={14} color="#CCCCCC" />
                    <Text style={styles.locationInfoText}>{item.email}</Text>
                </View>
            )}
            {item.description && <Text style={styles.locationDescription}>{item.description}</Text>}
            
            <Text style={styles.locationDate}>
                Creado: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#1a1a1a', '#2d2d2d']}
                style={styles.header}
            >
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <MinimalistIcons name="back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Locales de {companyName}</Text>
                    <Text style={styles.headerSubtitle}>{locations.length} locales registrados</Text>
                </View>
            </LinearGradient>

            {/* Content */}
            <ScrollView style={styles.content}>
                {/* Add Location Button */}
                <TouchableOpacity style={styles.addLocationButton} onPress={handleAddLocation}>
                    <MinimalistIcons name="plus" size={20} color="#FFFFFF" />
                    <Text style={styles.addLocationButtonText}>Añadir Nuevo Local</Text>
                </TouchableOpacity>

                {/* Locations List */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Cargando locales...</Text>
                    </View>
                ) : locations.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MinimalistIcons name="map-pin" size={48} color="#666666" />
                        <Text style={styles.emptyTitle}>No hay locales registrados</Text>
                        <Text style={styles.emptySubtitle}>
                            Añade el primer local de esta empresa para comenzar
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={locations}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderLocationCard}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </ScrollView>

            {/* Location Modal */}
            <Modal
                visible={showLocationModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowLocationModal(false)}
            >
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={['#1a1a1a', '#2d2d2d']}
                        style={styles.modalHeader}
                    >
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowLocationModal(false)}
                        >
                            <MinimalistIcons name="back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {locationModalMode === 'add' ? 'Añadir Local' : 'Editar Local'}
                        </Text>
                    </LinearGradient>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Nombre del Local *</Text>
                            <TextInput
                                style={styles.formInput}
                                value={locationForm.name}
                                onChangeText={(text) => setLocationForm({...locationForm, name: text})}
                                placeholder="Ej: Restaurante Centro, Tienda Principal..."
                                placeholderTextColor="#666666"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Dirección *</Text>
                            <TextInput
                                style={styles.formInput}
                                value={locationForm.address}
                                onChangeText={(text) => setLocationForm({...locationForm, address: text})}
                                placeholder="Calle, número, código postal"
                                placeholderTextColor="#666666"
                                multiline
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Ciudad</Text>
                            <TextInput
                                style={styles.formInput}
                                value={locationForm.city}
                                onChangeText={(text) => setLocationForm({...locationForm, city: text})}
                                placeholder="Madrid, Barcelona, Valencia..."
                                placeholderTextColor="#666666"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Teléfono</Text>
                            <TextInput
                                style={styles.formInput}
                                value={locationForm.phone}
                                onChangeText={(text) => setLocationForm({...locationForm, phone: text})}
                                placeholder="+34 XXX XXX XXX"
                                placeholderTextColor="#666666"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Email</Text>
                            <TextInput
                                style={styles.formInput}
                                value={locationForm.email}
                                onChangeText={(text) => setLocationForm({...locationForm, email: text})}
                                placeholder="local@empresa.com"
                                placeholderTextColor="#666666"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Descripción</Text>
                            <TextInput
                                style={[styles.formInput, styles.formTextArea]}
                                value={locationForm.description}
                                onChangeText={(text) => setLocationForm({...locationForm, description: text})}
                                placeholder="Descripción del local, horarios, características especiales..."
                                placeholderTextColor="#666666"
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveLocation}>
                            <Text style={styles.saveButtonText}>
                                {locationModalMode === 'add' ? 'Añadir Local' : 'Guardar Cambios'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20
    },
    backButton: {
        marginRight: 15
    },
    headerContent: {
        flex: 1
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#CCCCCC'
    },
    content: {
        flex: 1,
        padding: 20
    },
    addLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4A90E2',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 20
    },
    addLocationButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40
    },
    loadingText: {
        color: '#CCCCCC',
        fontSize: 16
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: 16,
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#CCCCCC',
        textAlign: 'center',
        lineHeight: 20
    },
    locationCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333333'
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    locationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        flex: 1
    },
    locationActions: {
        flexDirection: 'row',
        gap: 8
    },
    editLocationButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#2a2a2a'
    },
    deleteLocationButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#2a2a2a'
    },
    locationInfo: {
        fontSize: 14,
        color: '#CCCCCC',
        marginBottom: 4
    },
    locationInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4
    },
    locationInfoText: {
        fontSize: 14,
        color: '#CCCCCC',
        marginLeft: 8,
        flex: 1
    },
    locationDescription: {
        fontSize: 14,
        color: '#CCCCCC',
        marginTop: 8,
        lineHeight: 18,
        fontStyle: 'italic'
    },
    locationDate: {
        fontSize: 12,
        color: '#888888',
        marginTop: 8
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#000000'
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20
    },
    modalCloseButton: {
        marginRight: 15
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF'
    },
    modalContent: {
        flex: 1,
        padding: 20
    },
    formGroup: {
        marginBottom: 20
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8
    },
    formInput: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#FFFFFF'
    },
    formTextArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    saveButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600'
    }
});

export default AdminCompanyLocationsScreen;