import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    FlatList,
    Dimensions,
    SafeAreaView,
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MinimalistIcons from './MinimalistIcons';
import { useSelector } from 'react-redux';
import StorageService from '../services/StorageService';

const { width } = Dimensions.get('window');

const CompanyLocationsScreen = ({ onBack }) => {
    const { user } = useSelector(state => state.auth);
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [companyName, setCompanyName] = useState('Mi Empresa');

    useEffect(() => {
        loadCompanyData();
    }, []);

    const loadCompanyData = async () => {
        try {
            setIsLoading(true);
            console.log('🏢 Cargando datos de empresa y locales para usuario:', user.id);
            
            // Cargar datos de empresa para obtener el nombre
            const companyData = await StorageService.getCompanyData(user.id);
            if (companyData && companyData.companyName) {
                setCompanyName(companyData.companyName);
            }
            
            // Cargar locales de la empresa
            await loadCompanyLocations();
            
        } catch (error) {
            console.error('❌ Error cargando datos de empresa:', error);
            Alert.alert('Error', 'No se pudieron cargar los datos de la empresa');
        } finally {
            setIsLoading(false);
        }
    };

    const loadCompanyLocations = async () => {
        try {
            console.log(`📍 Cargando locales para empresa ${user.id}...`);
            
            const locationsData = await StorageService.getCompanyLocations(user.id);
            
            if (!Array.isArray(locationsData)) {
                console.error('❌ Datos de locales no válidos:', locationsData);
                setLocations([]);
                return;
            }

            setLocations(locationsData);
            console.log(`✅ Locales cargados exitosamente: ${locationsData.length}`);
            
        } catch (error) {
            console.error('❌ Error cargando locales:', error);
            Alert.alert(
                'Error de Carga', 
                'No se pudieron cargar los locales. Se mostrará una lista vacía.'
            );
            setLocations([]);
        }
    };

    const handleCallPhone = (phone) => {
        if (!phone) return;
        
        const phoneUrl = `tel:${phone}`;
        Linking.canOpenURL(phoneUrl)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(phoneUrl);
                } else {
                    Alert.alert('Error', 'No se puede realizar la llamada desde este dispositivo');
                }
            })
            .catch((error) => {
                console.error('Error opening phone:', error);
                Alert.alert('Error', 'No se pudo abrir la aplicación de teléfono');
            });
    };

    const handleSendEmail = (email) => {
        if (!email) return;
        
        const emailUrl = `mailto:${email}`;
        Linking.canOpenURL(emailUrl)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(emailUrl);
                } else {
                    Alert.alert('Error', 'No se puede enviar email desde este dispositivo');
                }
            })
            .catch((error) => {
                console.error('Error opening email:', error);
                Alert.alert('Error', 'No se pudo abrir la aplicación de email');
            });
    };

    const handleOpenMaps = (location) => {
        if (!location.address) {
            Alert.alert('Error', 'No hay dirección disponible para este local');
            return;
        }

        const address = encodeURIComponent(location.address);
        const mapsUrl = `https://maps.apple.com/?q=${address}`;
        
        Linking.canOpenURL(mapsUrl)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(mapsUrl);
                } else {
                    // Fallback a Google Maps
                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
                    return Linking.openURL(googleMapsUrl);
                }
            })
            .catch((error) => {
                console.error('Error opening maps:', error);
                Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
            });
    };

    const renderLocationCard = ({ item }) => (
        <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
                <Text style={styles.locationName}>{item.name}</Text>
                <TouchableOpacity
                    style={styles.mapsButton}
                    onPress={() => handleOpenMaps(item)}
                >
                    <MinimalistIcons name="location" size={20} color="#4A90E2" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.locationInfoRow}>
                <MinimalistIcons name="location" size={16} color="#CCCCCC" />
                <Text style={styles.locationInfoText}>{item.address}</Text>
            </View>
            
            {item.city && (
                <View style={styles.locationInfoRow}>
                    <MinimalistIcons name="business" size={16} color="#CCCCCC" />
                    <Text style={styles.locationInfoText}>{item.city}</Text>
                </View>
            )}
            
            {item.phone && (
                <TouchableOpacity 
                    style={styles.locationInfoRow}
                    onPress={() => handleCallPhone(item.phone)}
                >
                    <MinimalistIcons name="phone" size={16} color="#4A90E2" />
                    <Text style={[styles.locationInfoText, styles.clickableText]}>{item.phone}</Text>
                </TouchableOpacity>
            )}
            
            {item.email && (
                <TouchableOpacity 
                    style={styles.locationInfoRow}
                    onPress={() => handleSendEmail(item.email)}
                >
                    <MinimalistIcons name="message" size={16} color="#4A90E2" />
                    <Text style={[styles.locationInfoText, styles.clickableText]}>{item.email}</Text>
                </TouchableOpacity>
            )}
            
            {item.description && (
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Descripción:</Text>
                    <Text style={styles.locationDescription}>{item.description}</Text>
                </View>
            )}
            
            <Text style={styles.locationDate}>
                Registrado: {new Date(item.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#1a1a1a', '#2d2d2d']}
                style={styles.header}
            >
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <MinimalistIcons name="back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Mis Locales</Text>
                    <Text style={styles.headerSubtitle}>
                        {companyName} • {locations.length} {locations.length === 1 ? 'local' : 'locales'}
                    </Text>
                </View>
            </LinearGradient>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <MinimalistIcons name="location" size={48} color="#C9A961" />
                        <Text style={styles.loadingText}>Cargando locales...</Text>
                    </View>
                ) : locations.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MinimalistIcons name="business" size={64} color="#666666" />
                        <Text style={styles.emptyTitle}>No hay locales registrados</Text>
                        <Text style={styles.emptySubtitle}>
                            Aún no tienes locales registrados para tu empresa.
                            {'\n\n'}Los locales son añadidos por el administrador desde el panel de administración.
                            {'\n\n'}Contacta al administrador si necesitas que se registren tus locales.
                        </Text>
                        
                        <View style={styles.infoCard}>
                            <MinimalistIcons name="help" size={24} color="#C9A961" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoTitle}>¿Cómo se añaden los locales?</Text>
                                <Text style={styles.infoText}>
                                    1. El administrador accede al panel de administración{'\n'}
                                    2. Va a la sección "Empresas"{'\n'}
                                    3. Selecciona tu empresa "{companyName}"{'\n'}
                                    4. Hace clic en "Ver Locales"{'\n'}
                                    5. Añade los locales con toda la información
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <>
                        <View style={styles.summaryCard}>
                            <MinimalistIcons name="help" size={24} color="#C9A961" />
                            <View style={styles.summaryContent}>
                                <Text style={styles.summaryTitle}>Resumen de Locales</Text>
                                <Text style={styles.summaryText}>
                                    Tienes {locations.length} {locations.length === 1 ? 'local registrado' : 'locales registrados'} para tu empresa.
                                    {'\n'}Puedes contactar directamente con cada local usando los botones de teléfono y email.
                                </Text>
                            </View>
                        </View>

                        <FlatList
                            data={locations}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderLocationCard}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
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
        paddingTop: 10,
        paddingBottom: 20,
        paddingHorizontal: 20
    },
    backButton: {
        marginRight: 15,
        padding: 5
    },
    headerContent: {
        flex: 1
    },
    headerTitle: {
        fontSize: 22,
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
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60
    },
    loadingText: {
        color: '#CCCCCC',
        fontSize: 16,
        marginTop: 15
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: 20,
        marginBottom: 15
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#AAAAAA',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333333',
        marginTop: 20,
        width: '100%'
    },
    infoContent: {
        flex: 1,
        marginLeft: 15
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#C9A961',
        marginBottom: 10
    },
    infoText: {
        fontSize: 14,
        color: '#CCCCCC',
        lineHeight: 20
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333333',
        marginBottom: 20
    },
    summaryContent: {
        flex: 1,
        marginLeft: 15
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#C9A961',
        marginBottom: 8
    },
    summaryText: {
        fontSize: 14,
        color: '#CCCCCC',
        lineHeight: 20
    },
    locationCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 18,
        borderWidth: 1,
        borderColor: '#333333'
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    locationName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        flex: 1
    },
    mapsButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#2A2A2A'
    },
    locationInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    locationInfoText: {
        fontSize: 15,
        color: '#CCCCCC',
        marginLeft: 12,
        flex: 1
    },
    clickableText: {
        color: '#4A90E2',
        textDecorationLine: 'underline'
    },
    descriptionContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#333333'
    },
    descriptionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#C9A961',
        marginBottom: 8
    },
    locationDescription: {
        fontSize: 14,
        color: '#CCCCCC',
        lineHeight: 20,
        fontStyle: 'italic'
    },
    locationDate: {
        fontSize: 12,
        color: '#888888',
        marginTop: 15,
        textAlign: 'right'
    },
    separator: {
        height: 15
    }
});

export default CompanyLocationsScreen;