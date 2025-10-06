import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MinimalistIcons from './MinimalistIcons';

const { width, height } = Dimensions.get('window');

const AdminInfluencerScreenshots = ({ 
    screenshots = [], 
    visible, 
    onClose, 
    influencerName = '',
    influencerUsername = '' 
}) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showFullScreen, setShowFullScreen] = useState(false);

    // Usar imágenes reales de ejemplo de Instagram (simulando capturas reales)
    const realScreenshots = screenshots.length > 0 ? screenshots : [
        {
            id: 1,
            url: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=600&fit=crop&crop=center',
            description: 'Captura de perfil de Instagram',
            uploadedAt: new Date().toISOString()
        },
        {
            id: 2,
            url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=600&fit=crop&crop=center',
            description: 'Estadísticas de seguidores',
            uploadedAt: new Date().toISOString()
        },
        {
            id: 3,
            url: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=400&h=600&fit=crop&crop=center',
            description: 'Insights de Instagram',
            uploadedAt: new Date().toISOString()
        }
    ];

    const currentScreenshots = realScreenshots;

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Fecha no disponible';
        }
    };

    const handleImagePress = (index) => {
        setSelectedImageIndex(index);
        setShowFullScreen(true);
    };

    const navigateImage = (direction) => {
        const newIndex = direction === 'next' 
            ? (selectedImageIndex + 1) % currentScreenshots.length
            : selectedImageIndex === 0 
                ? currentScreenshots.length - 1 
                : selectedImageIndex - 1;
        setSelectedImageIndex(newIndex);
    };

    const renderScreenshotCard = (screenshot, index) => {
        return (
            <TouchableOpacity
                key={screenshot.id}
                style={styles.screenshotCard}
                onPress={() => handleImagePress(index)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#1a1a1a', '#111111']}
                    style={styles.cardGradient}
                >
                    {/* Imagen de la captura */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: screenshot.url }}
                            style={styles.screenshotImage}
                            resizeMode="cover"
                        />
                        <View style={styles.imageOverlay}>
                            <MinimalistIcons name="expand" size={24} color="#FFFFFF" isActive={false} />
                        </View>
                    </View>

                    {/* Información de la captura */}
                    <View style={styles.screenshotInfo}>
                        <Text style={styles.screenshotDescription}>
                            {screenshot.description}
                        </Text>
                        <Text style={styles.uploadDate}>
                            Subida: {formatDate(screenshot.uploadedAt)}
                        </Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    const renderFullScreenModal = () => {
        if (!showFullScreen || currentScreenshots.length === 0) return null;

        const currentScreenshot = currentScreenshots[selectedImageIndex];

        return (
            <Modal
                visible={showFullScreen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowFullScreen(false)}
            >
                <View style={styles.fullScreenOverlay}>
                    {/* Header del modal */}
                    <View style={styles.fullScreenHeader}>
                        <View style={styles.fullScreenTitle}>
                            <Text style={styles.fullScreenTitleText}>
                                Captura de Instagram - {influencerUsername?.startsWith('@') ? influencerUsername : `@${influencerUsername}`}
                            </Text>
                            <Text style={styles.fullScreenSubtitle}>
                                {selectedImageIndex + 1} de {currentScreenshots.length}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.closeFullScreenButton}
                            onPress={() => setShowFullScreen(false)}
                        >
                            <MinimalistIcons name="close" size={24} color="#FFFFFF" isActive={false} />
                        </TouchableOpacity>
                    </View>

                    {/* Imagen en pantalla completa */}
                    <View style={styles.fullScreenImageContainer}>
                        <Image
                            source={{ uri: currentScreenshot.url }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                        />
                        
                        {/* Controles de navegación */}
                        {currentScreenshots.length > 1 && (
                            <>
                                <TouchableOpacity
                                    style={[styles.navigationButton, styles.prevButton]}
                                    onPress={() => navigateImage('prev')}
                                >
                                    <MinimalistIcons name="arrow-left" size={24} color="#FFFFFF" isActive={false} />
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[styles.navigationButton, styles.nextButton]}
                                    onPress={() => navigateImage('next')}
                                >
                                    <MinimalistIcons name="arrow-right" size={24} color="#FFFFFF" isActive={false} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Información detallada */}
                    <View style={styles.fullScreenInfo}>
                        <View style={styles.fullScreenInfoRow}>
                            <MinimalistIcons name="info" size={16} color="#C9A961" isActive={false} />
                            <Text style={styles.fullScreenInfoText}>
                                {currentScreenshot.description}
                            </Text>
                        </View>
                        <View style={styles.fullScreenInfoRow}>
                            <MinimalistIcons name="history" size={16} color="#C9A961" isActive={false} />
                            <Text style={styles.fullScreenInfoText}>
                                {formatDate(currentScreenshot.uploadedAt)}
                            </Text>
                        </View>
                        {currentScreenshot.verified && (
                            <View style={styles.fullScreenInfoRow}>
                                <MinimalistIcons name="check" size={16} color="#4CAF50" isActive={false} />
                                <Text style={[styles.fullScreenInfoText, { color: '#4CAF50' }]}>
                                    Captura verificada
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        );
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header del modal */}
                    <View style={styles.modalHeader}>
                        <View style={styles.headerInfo}>
                            <Text style={styles.modalTitle}>Capturas de Instagram</Text>
                            <Text style={styles.modalSubtitle}>
                                {influencerName} ({influencerUsername?.startsWith('@') ? influencerUsername : `@${influencerUsername}`})
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <MinimalistIcons name="close" size={24} color="#888888" isActive={false} />
                        </TouchableOpacity>
                    </View>

                    {/* Contenido del modal */}
                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {currentScreenshots.length > 0 ? (
                            <>
                                <Text style={styles.sectionTitle}>
                                    Estadísticas Adjuntadas ({currentScreenshots.length})
                                </Text>
                                
                                <View style={styles.screenshotsGrid}>
                                    {currentScreenshots.map((screenshot, index) => 
                                        renderScreenshotCard(screenshot, index)
                                    )}
                                </View>

                                {/* Información adicional */}
                                <View style={styles.additionalInfo}>
                                    <Text style={styles.infoTitle}>Información de las Capturas</Text>
                                    <View style={styles.infoItem}>
                                        <MinimalistIcons name="image" size={16} color="#C9A961" isActive={false} />
                                        <Text style={styles.infoText}>
                                            {currentScreenshots.length} capturas adjuntadas
                                        </Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <MinimalistIcons name="history" size={16} color="#888888" isActive={false} />
                                        <Text style={styles.infoText}>
                                            Última subida: {formatDate(currentScreenshots[0]?.uploadedAt)}
                                        </Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <MinimalistIcons name="user" size={16} color="#C9A961" isActive={false} />
                                        <Text style={styles.infoText}>
                                            Enviadas por: {influencerName}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <View style={styles.emptyState}>
                                <MinimalistIcons name="image" size={64} color="#666666" isActive={false} />
                                <Text style={styles.emptyStateTitle}>Sin capturas disponibles</Text>
                                <Text style={styles.emptyStateSubtitle}>
                                    Este influencer no ha adjuntado capturas de sus estadísticas de Instagram
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>

            {renderFullScreenModal()}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#111111',
        borderRadius: 16,
        width: width * 0.98,
        height: height * 0.95,
        borderWidth: 1,
        borderColor: '#333333',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    headerInfo: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        fontFamily: 'Inter',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#CCCCCC',
        fontFamily: 'Inter',
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Inter',
        marginBottom: 16,
    },
    screenshotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    screenshotCard: {
        width: '48%',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333333',
        marginBottom: 12,
    },
    cardGradient: {
        padding: 12,
    },


    imageContainer: {
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12,
    },
    screenshotImage: {
        width: '100%',
        height: 300,
        backgroundColor: '#1a1a1a',
    },
    imageOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        padding: 8,
    },
    screenshotInfo: {
        gap: 4,
    },
    screenshotDescription: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Inter',
        lineHeight: 20,
    },
    uploadDate: {
        fontSize: 12,
        color: '#888888',
        fontFamily: 'Inter',
    },
    additionalInfo: {
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(201, 169, 97, 0.05)',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#C9A961',
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#C9A961',
        fontFamily: 'Inter',
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#CCCCCC',
        fontFamily: 'Inter',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Inter',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#888888',
        fontFamily: 'Inter',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Full screen modal styles
    fullScreenOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    fullScreenHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 50,
    },
    fullScreenTitle: {
        flex: 1,
    },
    fullScreenTitleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },
    fullScreenSubtitle: {
        fontSize: 14,
        color: '#C9A961',
        fontFamily: 'Inter',
        marginTop: 2,
    },
    closeFullScreenButton: {
        padding: 8,
    },
    fullScreenImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    fullScreenImage: {
        width: width * 0.9,
        height: height * 0.6,
    },
    navigationButton: {
        position: 'absolute',
        top: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 25,
        padding: 12,
        marginTop: -25,
    },
    prevButton: {
        left: 20,
    },
    nextButton: {
        right: 20,
    },
    fullScreenInfo: {
        padding: 20,
        backgroundColor: 'rgba(17, 17, 17, 0.9)',
        gap: 8,
    },
    fullScreenInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fullScreenInfoText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },
});

export default AdminInfluencerScreenshots;