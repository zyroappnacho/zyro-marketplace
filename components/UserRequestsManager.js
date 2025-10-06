import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MinimalistIcons from './MinimalistIcons';
import CollaborationRequestService from '../services/CollaborationRequestService';

const { width } = Dimensions.get('window');

const UserRequestsManager = ({ userId, activeTab = 'upcoming' }) => {
    const [upcomingRequests, setUpcomingRequests] = useState([]);
    const [pastRequests, setPastRequests] = useState([]);
    const [cancelledRequests, setCancelledRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadRequests();
    }, [userId]);

    const loadRequests = async () => {
        if (!userId) return;
        
        try {
            setLoading(true);
            
            // Cargar solicitudes próximas (pendientes y aprobadas con fecha futura)
            const upcoming = await CollaborationRequestService.getUserUpcomingRequests(userId);
            setUpcomingRequests(upcoming);
            
            // Cargar solicitudes pasadas (con fecha que ya pasó)
            const past = await CollaborationRequestService.getUserPastRequests(userId);
            setPastRequests(past);
            
            // Cargar solicitudes canceladas (rechazadas)
            const cancelled = await CollaborationRequestService.getUserCancelledRequests(userId);
            setCancelledRequests(cancelled);
            
            console.log(`📋 Cargadas ${upcoming.length} solicitudes próximas, ${past.length} pasadas y ${cancelled.length} canceladas`);
        } catch (error) {
            console.error('Error cargando solicitudes del usuario:', error);
            Alert.alert('Error', 'No se pudieron cargar las solicitudes');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRequests();
        setRefreshing(false);
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return {
                    text: 'Pendiente',
                    color: '#FFA500',
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    icon: 'history'
                };
            case 'approved':
                return {
                    text: 'Confirmada',
                    color: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    icon: 'check'
                };
            case 'rejected':
                return {
                    text: 'Rechazada',
                    color: '#F44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    icon: 'close'
                };
            default:
                return {
                    text: 'Desconocido',
                    color: '#666666',
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    icon: 'help'
                };
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    const formatDateTime = (dateTimeString) => {
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateTimeString;
        }
    };

    const renderRequestCard = (request) => {
        const statusInfo = getStatusInfo(request.status);
        
        // Verificar si es una colaboración pasada
        const isPastCollaboration = activeTab === 'past';
        
        return (
            <View key={request.id} style={styles.requestCard}>
                <LinearGradient
                    colors={isPastCollaboration ? ['#0a0a0a', '#151515'] : ['#111111', '#1a1a1a']}
                    style={styles.cardGradient}
                >
                    {/* Header con estado */}
                    <View style={styles.cardHeader}>
                        <View style={styles.businessInfo}>
                            <Text style={styles.businessName}>{request.businessName}</Text>
                            <Text style={styles.collaborationTitle}>{request.collaborationTitle}</Text>
                            {isPastCollaboration && (
                                <Text style={styles.pastIndicator}>Colaboración finalizada</Text>
                            )}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
                            <MinimalistIcons 
                                name={isPastCollaboration ? "history" : statusInfo.icon} 
                                size={14} 
                                color={isPastCollaboration ? "#888888" : statusInfo.color} 
                                isActive={false} 
                            />
                            <Text style={[styles.statusText, { color: isPastCollaboration ? "#888888" : statusInfo.color }]}>
                                {isPastCollaboration ? "Finalizada" : statusInfo.text}
                            </Text>
                        </View>
                    </View>

                    {/* Información de la cita */}
                    <View style={styles.appointmentInfo}>
                        <View style={styles.infoRow}>
                            <MinimalistIcons name="events" size={16} color="#C9A961" isActive={false} />
                            <Text style={styles.infoText}>
                                {formatDate(request.selectedDate)}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MinimalistIcons name="history" size={16} color="#C9A961" isActive={false} />
                            <Text style={styles.infoText}>
                                {request.selectedTime}
                            </Text>
                        </View>
                    </View>

                    {/* Información adicional */}
                    <View style={styles.additionalInfo}>
                        <Text style={styles.submittedText}>
                            Enviada: {formatDateTime(request.submittedAt)}
                        </Text>
                        {request.reviewedAt && (
                            <Text style={styles.reviewedText}>
                                Revisada: {formatDateTime(request.reviewedAt)}
                            </Text>
                        )}
                        {request.adminNotes && (
                            <View style={styles.adminNotesContainer}>
                                <Text style={styles.adminNotesLabel}>Notas del administrador:</Text>
                                <Text style={styles.adminNotesText}>{request.adminNotes}</Text>
                            </View>
                        )}
                    </View>

                    {/* ID de solicitud */}
                    <View style={styles.requestIdContainer}>
                        <Text style={styles.requestIdText}>ID: {request.id}</Text>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    const renderEmptyState = (type) => {
        let iconName, title, subtitle;
        
        switch (type) {
            case 'upcoming':
                iconName = "events";
                title = 'No tienes solicitudes próximas';
                subtitle = 'Cuando envíes solicitudes de colaboración aparecerán aquí';
                break;
            case 'past':
                iconName = "history";
                title = 'No tienes colaboraciones pasadas';
                subtitle = 'Las colaboraciones cuya fecha ya haya pasado aparecerán aquí';
                break;
            case 'cancelled':
                iconName = "close";
                title = 'No tienes solicitudes canceladas';
                subtitle = 'Las solicitudes rechazadas por el administrador aparecerán aquí';
                break;
            default:
                iconName = "help";
                title = 'Sin datos';
                subtitle = 'No hay información disponible';
        }
        
        return (
            <View style={styles.emptyState}>
                <MinimalistIcons 
                    name={iconName} 
                    size={64} 
                    color="#666666" 
                    isActive={false} 
                />
                <Text style={styles.emptyStateTitle}>
                    {title}
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                    {subtitle}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando solicitudes...</Text>
            </View>
        );
    }

    // Determinar qué solicitudes mostrar según la pestaña activa
    let requestsToShow, headerTitle;
    
    switch (activeTab) {
        case 'upcoming':
            requestsToShow = upcomingRequests;
            headerTitle = 'Próximas Colaboraciones';
            break;
        case 'past':
            requestsToShow = pastRequests;
            headerTitle = 'Colaboraciones Pasadas';
            break;
        case 'cancelled':
            requestsToShow = cancelledRequests;
            headerTitle = 'Colaboraciones Canceladas';
            break;
        default:
            requestsToShow = [];
            headerTitle = 'Colaboraciones';
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#C9A961"
                    colors={['#C9A961']}
                />
            }
        >
            {requestsToShow.length > 0 ? (
                <>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            {headerTitle}
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {requestsToShow.length} solicitud{requestsToShow.length !== 1 ? 'es' : ''}
                        </Text>
                    </View>
                    
                    {requestsToShow.map(renderRequestCard)}
                </>
            ) : (
                renderEmptyState(activeTab)
            )}
            
            {/* Espaciado inferior */}
            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter',
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#C9A961',
        fontFamily: 'Inter',
    },
    requestCard: {
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333333',
    },
    cardGradient: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    businessInfo: {
        flex: 1,
        marginRight: 12,
    },
    businessName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 2,
        fontFamily: 'Inter',
    },
    collaborationTitle: {
        fontSize: 14,
        color: '#C9A961',
        fontFamily: 'Inter',
    },
    pastIndicator: {
        fontSize: 12,
        color: '#888888',
        fontStyle: 'italic',
        marginTop: 2,
        fontFamily: 'Inter',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    appointmentInfo: {
        marginBottom: 12,
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Inter',
        textTransform: 'capitalize',
    },
    additionalInfo: {
        borderTopWidth: 1,
        borderTopColor: '#333333',
        paddingTop: 12,
        marginBottom: 8,
        gap: 4,
    },
    submittedText: {
        fontSize: 12,
        color: '#888888',
        fontFamily: 'Inter',
    },
    reviewedText: {
        fontSize: 12,
        color: '#888888',
        fontFamily: 'Inter',
    },
    adminNotesContainer: {
        marginTop: 8,
        padding: 8,
        backgroundColor: 'rgba(201, 169, 97, 0.1)',
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: '#C9A961',
    },
    adminNotesLabel: {
        fontSize: 12,
        color: '#C9A961',
        fontWeight: '600',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    adminNotesText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'Inter',
        lineHeight: 16,
    },
    requestIdContainer: {
        alignItems: 'flex-end',
    },
    requestIdText: {
        fontSize: 10,
        color: '#666666',
        fontFamily: 'Inter',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: 'Inter',
    },
    bottomSpacer: {
        height: 100,
    },
});

export default UserRequestsManager;