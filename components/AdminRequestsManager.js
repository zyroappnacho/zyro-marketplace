import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Modal,
    TextInput,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MinimalistIcons from './MinimalistIcons';
import CollaborationRequestService from '../services/CollaborationRequestService';

const { width } = Dimensions.get('window');

const AdminRequestsManager = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [reviewAction, setReviewAction] = useState(''); // 'approve' or 'reject'
    const [currentSection, setCurrentSection] = useState('pending'); // 'pending' or 'confirmed'

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const allRequests = await CollaborationRequestService.getAllRequests();
            
            // Ordenar por fecha de envío (más recientes primero)
            const sortedRequests = allRequests.sort((a, b) => 
                new Date(b.submittedAt) - new Date(a.submittedAt)
            );
            
            setRequests(sortedRequests);
            console.log(`📋 Admin: Cargadas ${sortedRequests.length} solicitudes`);
        } catch (error) {
            console.error('Error cargando solicitudes para admin:', error);
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

    const handleReviewRequest = (request, action) => {
        setSelectedRequest(request);
        setReviewAction(action);
        setAdminNotes('');
        setShowReviewModal(true);
    };

    const confirmReviewAction = async () => {
        if (!selectedRequest || !reviewAction) return;

        try {
            const newStatus = reviewAction === 'approve' ? 'approved' : 'rejected';
            
            const result = await CollaborationRequestService.updateRequestStatus(
                selectedRequest.id,
                newStatus,
                adminNotes,
                'admin'
            );

            if (result.success) {
                Alert.alert(
                    'Éxito',
                    `Solicitud ${newStatus === 'approved' ? 'aprobada' : 'rechazada'} correctamente`,
                    [{ text: 'OK' }]
                );
                
                // Recargar solicitudes
                await loadRequests();
                
                // Cerrar modal
                setShowReviewModal(false);
                setSelectedRequest(null);
                setAdminNotes('');
                setReviewAction('');
            } else {
                Alert.alert('Error', result.error || 'No se pudo actualizar la solicitud');
            }
        } catch (error) {
            console.error('Error actualizando solicitud:', error);
            Alert.alert('Error', 'Ocurrió un error inesperado');
        }
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
                    text: 'Aprobada',
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

    const formatFollowers = (followers) => {
        if (!followers) return '0';
        
        // Si ya viene formateado (con K, M, etc.), devolverlo tal como está
        if (typeof followers === 'string' && (followers.includes('K') || followers.includes('M') || followers.includes('k') || followers.includes('m'))) {
            return followers;
        }
        
        // Si es un número, formatearlo
        const num = parseInt(followers.toString().replace(/[^\d]/g, ''));
        if (isNaN(num)) return followers;
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const renderRequestCard = (request) => {
        const statusInfo = getStatusInfo(request.status);
        const isPending = request.status === 'pending';
        
        return (
            <View key={request.id} style={styles.requestCard}>
                <LinearGradient
                    colors={['#111111', '#1a1a1a']}
                    style={styles.cardGradient}
                >
                    {/* Header con estado */}
                    <View style={styles.cardHeader}>
                        <View style={styles.requestInfo}>
                            <Text style={styles.requestId}>Solicitud #{request.id}</Text>
                            <Text style={styles.collaborationTitle}>{request.collaborationTitle}</Text>
                            <Text style={styles.businessName}>{request.businessName}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
                            <MinimalistIcons 
                                name={statusInfo.icon} 
                                size={14} 
                                color={statusInfo.color} 
                                isActive={false} 
                            />
                            <Text style={[styles.statusText, { color: statusInfo.color }]}>
                                {statusInfo.text}
                            </Text>
                        </View>
                    </View>

                    {/* Información del influencer */}
                    <View style={styles.influencerInfo}>
                        <View style={styles.influencerHeader}>
                            <Text style={styles.influencerName}>{request.userName}</Text>
                            <View style={styles.verifiedBadge}>
                                <MinimalistIcons name="check" size={12} color="#4CAF50" isActive={false} />
                                <Text style={styles.verifiedText}>Verificado</Text>
                            </View>
                        </View>
                        <Text style={styles.influencerDetails}>
                            {request.userInstagram.startsWith('@') ? request.userInstagram : `@${request.userInstagram}`} • {formatFollowers(request.userFollowers)} seguidores
                        </Text>
                        <Text style={styles.influencerEmail}>{request.userEmail}</Text>
                        {request.userCity && (
                            <Text style={styles.influencerLocation}>📍 {request.userCity}</Text>
                        )}
                        {request.userPhone && (
                            <Text style={styles.influencerPhone}>📞 {request.userPhone}</Text>
                        )}
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

                    {/* Botones de acción (solo para solicitudes pendientes) */}
                    {isPending && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.approveButton]}
                                onPress={() => handleReviewRequest(request, 'approve')}
                            >
                                <MinimalistIcons name="check" size={16} color="#FFFFFF" isActive={false} />
                                <Text style={styles.actionButtonText}>Aprobar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.actionButton, styles.rejectButton]}
                                onPress={() => handleReviewRequest(request, 'reject')}
                            >
                                <MinimalistIcons name="close" size={16} color="#FFFFFF" isActive={false} />
                                <Text style={styles.actionButtonText}>Rechazar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </LinearGradient>
            </View>
        );
    };

    const renderConfirmedRequestCard = (request) => {
        const statusInfo = getStatusInfo(request.status);
        const collaborationDate = new Date(request.selectedDate);
        const today = new Date();
        const isPastCollaboration = collaborationDate < today;
        
        return (
            <View key={request.id} style={styles.requestCard}>
                <LinearGradient
                    colors={['#0a2e0a', '#1a3d1a']} // Verde oscuro para confirmadas
                    style={styles.cardGradient}
                >
                    {/* Header con estado confirmado */}
                    <View style={styles.cardHeader}>
                        <View style={styles.requestInfo}>
                            <Text style={styles.requestId}>Solicitud #{request.id}</Text>
                            <Text style={styles.collaborationTitle}>{request.collaborationTitle}</Text>
                            <Text style={styles.businessName}>{request.businessName}</Text>
                        </View>
                        <View style={styles.confirmedBadgeContainer}>
                            <View style={[styles.statusBadge, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                                <MinimalistIcons 
                                    name="check" 
                                    size={14} 
                                    color="#4CAF50" 
                                    isActive={false} 
                                />
                                <Text style={[styles.statusText, { color: '#4CAF50' }]}>
                                    Confirmada
                                </Text>
                            </View>
                            {isPastCollaboration && (
                                <View style={[styles.statusBadge, { backgroundColor: 'rgba(156, 39, 176, 0.2)', marginTop: 4 }]}>
                                    <MinimalistIcons 
                                        name="history" 
                                        size={12} 
                                        color="#9C27B0" 
                                        isActive={false} 
                                    />
                                    <Text style={[styles.statusText, { color: '#9C27B0', fontSize: 10 }]}>
                                        Completada
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Información del influencer */}
                    <View style={[styles.influencerInfo, styles.confirmedInfluencerInfo]}>
                        <View style={styles.influencerHeader}>
                            <Text style={styles.influencerName}>{request.userName}</Text>
                            <View style={styles.verifiedBadge}>
                                <MinimalistIcons name="check" size={12} color="#4CAF50" isActive={false} />
                                <Text style={styles.verifiedText}>Verificado</Text>
                            </View>
                        </View>
                        <Text style={styles.influencerDetails}>
                            {request.userInstagram.startsWith('@') ? request.userInstagram : `@${request.userInstagram}`} • {formatFollowers(request.userFollowers)} seguidores
                        </Text>
                        <Text style={styles.influencerEmail}>{request.userEmail}</Text>
                        {request.userCity && (
                            <Text style={styles.influencerLocation}>📍 {request.userCity}</Text>
                        )}
                        {request.userPhone && (
                            <Text style={styles.influencerPhone}>📞 {request.userPhone}</Text>
                        )}
                    </View>

                    {/* Información de la colaboración confirmada */}
                    <View style={styles.confirmedCollaborationInfo}>
                        <View style={styles.infoRow}>
                            <MinimalistIcons name="events" size={16} color="#4CAF50" isActive={false} />
                            <Text style={[styles.infoText, { color: '#4CAF50', fontWeight: '600' }]}>
                                {formatDate(request.selectedDate)}
                            </Text>
                            {isPastCollaboration && (
                                <Text style={styles.pastCollaborationLabel}>• Realizada</Text>
                            )}
                        </View>
                        <View style={styles.infoRow}>
                            <MinimalistIcons name="history" size={16} color="#4CAF50" isActive={false} />
                            <Text style={[styles.infoText, { color: '#4CAF50', fontWeight: '600' }]}>
                                {request.selectedTime}
                            </Text>
                        </View>
                    </View>

                    {/* Información de confirmación */}
                    <View style={styles.confirmationInfo}>
                        <Text style={styles.confirmedText}>
                            ✅ Confirmada: {formatDateTime(request.reviewedAt)}
                        </Text>
                        <Text style={styles.submittedText}>
                            Solicitada: {formatDateTime(request.submittedAt)}
                        </Text>
                        {request.adminNotes && (
                            <View style={[styles.adminNotesContainer, styles.confirmedNotesContainer]}>
                                <Text style={[styles.adminNotesLabel, { color: '#4CAF50' }]}>Notas de aprobación:</Text>
                                <Text style={styles.adminNotesText}>{request.adminNotes}</Text>
                            </View>
                        )}
                    </View>

                    {/* Información de control administrativo */}
                    <View style={styles.adminControlInfo}>
                        <Text style={styles.controlLabel}>Control Administrativo</Text>
                        <View style={styles.controlRow}>
                            <Text style={styles.controlText}>ID: #{request.id}</Text>
                            <Text style={styles.controlText}>Estado: Aprobada</Text>
                        </View>
                        <View style={styles.controlRow}>
                            <Text style={styles.controlText}>Revisada por: {request.reviewedBy || 'Admin'}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    const renderReviewModal = () => (
        <Modal
            visible={showReviewModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowReviewModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {reviewAction === 'approve' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
                        </Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowReviewModal(false)}
                        >
                            <MinimalistIcons name="close" size={24} color="#888888" isActive={false} />
                        </TouchableOpacity>
                    </View>

                    {selectedRequest && (
                        <View style={styles.modalBody}>
                            <Text style={styles.modalRequestInfo}>
                                Solicitud #{selectedRequest.id}
                            </Text>
                            <Text style={styles.modalCollaborationInfo}>
                                {selectedRequest.collaborationTitle} - {selectedRequest.businessName}
                            </Text>
                            <Text style={styles.modalInfluencerInfo}>
                                {selectedRequest.userName} ({selectedRequest.userInstagram.startsWith('@') ? selectedRequest.userInstagram : `@${selectedRequest.userInstagram}`})
                            </Text>
                            <Text style={styles.modalDateInfo}>
                                {formatDate(selectedRequest.selectedDate)} a las {selectedRequest.selectedTime}
                            </Text>

                            <Text style={styles.notesLabel}>
                                Notas {reviewAction === 'approve' ? '(opcional)' : '(requerido)'}:
                            </Text>
                            <TextInput
                                style={styles.notesInput}
                                placeholder={
                                    reviewAction === 'approve' 
                                        ? 'Instrucciones adicionales para el influencer...'
                                        : 'Motivo del rechazo...'
                                }
                                placeholderTextColor="#666666"
                                value={adminNotes}
                                onChangeText={setAdminNotes}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    )}

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowReviewModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                reviewAction === 'approve' ? styles.approveButton : styles.rejectButton,
                                (reviewAction === 'reject' && !adminNotes.trim()) && styles.disabledButton
                            ]}
                            onPress={confirmReviewAction}
                            disabled={reviewAction === 'reject' && !adminNotes.trim()}
                        >
                            <Text style={styles.confirmButtonText}>
                                {reviewAction === 'approve' ? 'Aprobar' : 'Rechazar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando solicitudes...</Text>
            </View>
        );
    }

    // Filtrar solicitudes según la sección actual
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const confirmedRequests = requests.filter(r => r.status === 'approved');

    const renderSectionSelector = () => (
        <View style={styles.sectionSelector}>
            <TouchableOpacity
                style={[
                    styles.sectionButton,
                    currentSection === 'pending' && styles.sectionButtonActive
                ]}
                onPress={() => setCurrentSection('pending')}
            >
                <MinimalistIcons 
                    name="history" 
                    size={16} 
                    color={currentSection === 'pending' ? '#000000' : '#C9A961'} 
                    isActive={false} 
                />
                <Text style={[
                    styles.sectionButtonText,
                    currentSection === 'pending' && styles.sectionButtonTextActive
                ]}>
                    Pendientes ({pendingRequests.length})
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                style={[
                    styles.sectionButton,
                    currentSection === 'confirmed' && styles.sectionButtonActive
                ]}
                onPress={() => setCurrentSection('confirmed')}
            >
                <MinimalistIcons 
                    name="check" 
                    size={16} 
                    color={currentSection === 'confirmed' ? '#000000' : '#C9A961'} 
                    isActive={false} 
                />
                <Text style={[
                    styles.sectionButtonText,
                    currentSection === 'confirmed' && styles.sectionButtonTextActive
                ]}>
                    Confirmadas ({confirmedRequests.length})
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderPendingSection = () => (
        <>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Solicitudes Pendientes</Text>
                <Text style={styles.headerSubtitle}>
                    {pendingRequests.length} solicitudes esperando revisión
                </Text>
            </View>

            {/* Solo solicitudes pendientes */}
            {pendingRequests.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Pendientes de Aprobación</Text>
                    </View>
                    {pendingRequests.map(renderRequestCard)}
                </>
            )}

            {/* Estado vacío para pendientes */}
            {pendingRequests.length === 0 && (
                <View style={styles.emptyState}>
                    <MinimalistIcons name="history" size={64} color="#666666" isActive={false} />
                    <Text style={styles.emptyStateTitle}>No hay solicitudes pendientes</Text>
                    <Text style={styles.emptyStateSubtitle}>
                        Las nuevas solicitudes de colaboración aparecerán aquí para su revisión
                    </Text>
                </View>
            )}
        </>
    );

    const renderConfirmedSection = () => (
        <>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Todas las Solicitudes Confirmadas</Text>
                <Text style={styles.headerSubtitle}>
                    {confirmedRequests.length} colaboraciones aprobadas y confirmadas
                </Text>
            </View>

            {/* Todas las solicitudes confirmadas */}
            {confirmedRequests.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Historial de Colaboraciones Aprobadas</Text>
                        <Text style={styles.sectionSubtitle}>
                            Control completo de todas las solicitudes que han sido confirmadas
                        </Text>
                    </View>
                    {confirmedRequests.map(renderConfirmedRequestCard)}
                </>
            )}

            {/* Estado vacío para confirmadas */}
            {confirmedRequests.length === 0 && (
                <View style={styles.emptyState}>
                    <MinimalistIcons name="check" size={64} color="#666666" isActive={false} />
                    <Text style={styles.emptyStateTitle}>No hay solicitudes confirmadas</Text>
                    <Text style={styles.emptyStateSubtitle}>
                        Las solicitudes aprobadas aparecerán aquí para llevar un control completo
                    </Text>
                </View>
            )}
        </>
    );

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
            {/* Selector de sección */}
            {renderSectionSelector()}

            {/* Contenido según la sección seleccionada */}
            {currentSection === 'pending' ? renderPendingSection() : renderConfirmedSection()}
            
            {/* Espaciado inferior */}
            <View style={styles.bottomSpacer} />

            {renderReviewModal()}
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
    sectionHeader: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
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
    requestInfo: {
        flex: 1,
        marginRight: 12,
    },
    requestId: {
        fontSize: 12,
        color: '#C9A961',
        fontWeight: '600',
        marginBottom: 2,
        fontFamily: 'Inter',
    },
    collaborationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 2,
        fontFamily: 'Inter',
    },
    businessName: {
        fontSize: 14,
        color: '#CCCCCC',
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
    influencerInfo: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: 'rgba(201, 169, 97, 0.05)',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#C9A961',
    },
    influencerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    influencerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Inter',
        flex: 1,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 3,
    },
    verifiedText: {
        fontSize: 10,
        color: '#4CAF50',
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    influencerDetails: {
        fontSize: 14,
        color: '#C9A961',
        marginBottom: 4,
        fontFamily: 'Inter',
        fontWeight: '600',
    },
    influencerEmail: {
        fontSize: 12,
        color: '#CCCCCC',
        fontFamily: 'Inter',
        marginBottom: 2,
    },
    influencerLocation: {
        fontSize: 12,
        color: '#CCCCCC',
        fontFamily: 'Inter',
        marginBottom: 2,
    },
    influencerPhone: {
        fontSize: 12,
        color: '#CCCCCC',
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
        marginBottom: 12,
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
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
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

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#111111',
        borderRadius: 16,
        width: width * 0.9,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: '#333333',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        fontFamily: 'Inter',
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        padding: 20,
    },
    modalRequestInfo: {
        fontSize: 14,
        color: '#C9A961',
        fontWeight: '600',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    modalCollaborationInfo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    modalInfluencerInfo: {
        fontSize: 14,
        color: '#CCCCCC',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    modalDateInfo: {
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 16,
        fontFamily: 'Inter',
        textTransform: 'capitalize',
    },
    notesLabel: {
        fontSize: 14,
        color: '#C9A961',
        fontWeight: '600',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    notesInput: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 8,
        padding: 12,
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Inter',
        minHeight: 80,
    },
    modalActions: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#666666',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    disabledButton: {
        opacity: 0.5,
    },

    // Estilos para el selector de sección
    sectionSelector: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#333333',
    },
    sectionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    sectionButtonActive: {
        backgroundColor: '#C9A961',
    },
    sectionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#C9A961',
        fontFamily: 'Inter',
    },
    sectionButtonTextActive: {
        color: '#000000',
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#888888',
        fontFamily: 'Inter',
        marginTop: 4,
    },

    // Estilos para solicitudes confirmadas
    confirmedBadgeContainer: {
        alignItems: 'flex-end',
    },
    confirmedInfluencerInfo: {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        borderLeftColor: '#4CAF50',
    },
    confirmedCollaborationInfo: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#4CAF50',
        gap: 8,
    },
    pastCollaborationLabel: {
        fontSize: 12,
        color: '#9C27B0',
        fontWeight: '600',
        fontFamily: 'Inter',
        marginLeft: 8,
    },
    confirmationInfo: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(76, 175, 80, 0.3)',
        paddingTop: 12,
        marginBottom: 12,
        gap: 4,
    },
    confirmedText: {
        fontSize: 12,
        color: '#4CAF50',
        fontFamily: 'Inter',
        fontWeight: '600',
    },
    confirmedNotesContainer: {
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        borderLeftColor: '#4CAF50',
    },
    adminControlInfo: {
        backgroundColor: 'rgba(201, 169, 97, 0.1)',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#C9A961',
    },
    controlLabel: {
        fontSize: 12,
        color: '#C9A961',
        fontWeight: 'bold',
        marginBottom: 6,
        fontFamily: 'Inter',
    },
    controlRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    controlText: {
        fontSize: 11,
        color: '#CCCCCC',
        fontFamily: 'Inter',
    },
});

export default AdminRequestsManager;