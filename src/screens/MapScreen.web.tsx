import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { colors, spacing, fontSizes, fontWeights } from '../styles/theme';
import { Campaign } from '../types';
import { CampaignRepository } from '../database/repositories/CampaignRepository';
import { LocationService } from '../services/locationService';
import { MapService } from '../services/mapService';
import { ZyroLogo } from '../components/ZyroLogo';
import { CategoryFilter } from '../components/CategoryFilter';
import { CitySelector } from '../components/CitySelector';
import { WebIcon } from '../components/WebIcon';
import { InteractiveMap } from '../components/InteractiveMap';

interface MapScreenProps {
    navigation?: any;
}

const { width: screenWidth } = Dimensions.get('window');
const isLargeScreen = screenWidth > 768;

export default function MapScreen({ navigation }: MapScreenProps) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState('MADRID');
    const [selectedCategory, setSelectedCategory] = useState('TODAS LAS CATEGORÍAS');
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const campaignRepository = new CampaignRepository();

    useEffect(() => {
        loadCampaigns();
    }, []);

    useEffect(() => {
        filterCampaigns();
    }, [campaigns, selectedCity, selectedCategory]);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            // In a real implementation, this would fetch from the database
            const campaignData = await campaignRepository.getCampaignsByLocation(
                {
                    northEast: { lat: 43.7, lng: 4.3 },
                    southWest: { lat: 36.0, lng: -9.3 },
                },
                'active'
            );
            setCampaigns(campaignData);
        } catch (error) {
            console.error('Error loading campaigns:', error);
            Alert.alert('Error', 'No se pudieron cargar las colaboraciones');
        } finally {
            setLoading(false);
        }
    };

    const filterCampaigns = () => {
        let filtered = campaigns;

        // Filter by city
        if (selectedCity !== 'TODAS LAS CIUDADES') {
            filtered = filtered.filter(campaign => campaign.city === selectedCity);
        }

        // Filter by category
        if (selectedCategory !== 'TODAS LAS CATEGORÍAS') {
            const categoryKey = LocationService.getAllCategories()
                .find(cat => cat.displayName === selectedCategory)?.id;
            if (categoryKey) {
                filtered = filtered.filter(campaign => campaign.category === categoryKey);
            }
        }

        setFilteredCampaigns(filtered);
    };

    const handleCampaignSelect = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
    };

    const getCategoryColor = (category: string): string => {
        const colorMap: { [key: string]: string } = {
            'restaurantes': '#FF6B6B',
            'movilidad': '#4ECDC4',
            'ropa': '#45B7D1',
            'eventos': '#96CEB4',
            'delivery': '#FFEAA7',
            'salud-belleza': '#DDA0DD',
            'alojamiento': '#98D8C8',
            'discotecas': '#F7DC6F',
        };
        return colorMap[category] || colors.goldElegant;
    };

    const renderCampaignCard = (campaign: Campaign) => (
        <TouchableOpacity
            key={campaign.id}
            style={[
                styles.campaignCard,
                selectedCampaign?.id === campaign.id && styles.selectedCampaignCard
            ]}
            onPress={() => handleCampaignSelect(campaign)}
        >
            <View style={[
                styles.categoryIndicator,
                { backgroundColor: getCategoryColor(campaign.category) }
            ]} />

            <View style={styles.campaignContent}>
                <Text style={styles.campaignTitle}>{campaign.businessName}</Text>
                <Text style={styles.campaignSubtitle}>{campaign.title}</Text>

                <View style={styles.campaignDetails}>
                    <View style={styles.detailRow}>
                        <WebIcon name="location-on" size={14} color={colors.goldElegant} />
                        <Text style={styles.detailText}>{campaign.city}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <WebIcon name="restaurant" size={14} color={colors.goldElegant} />
                        <Text style={styles.detailText}>
                            {LocationService.getCategoryDisplayName(campaign.category)}
                        </Text>
                    </View>

                    {campaign.requirements.minInstagramFollowers && (
                        <View style={styles.detailRow}>
                            <Text style={styles.followersText}>
                                Min. {campaign.requirements.minInstagramFollowers.toLocaleString()} seguidores
                            </Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                        if (navigation) {
                            navigation.navigate('CollaborationDetail', {
                                campaignId: campaign.id
                            });
                        } else {
                            Alert.alert('Próximamente', 'Navegación a detalles de colaboración');
                        }
                    }}
                >
                    <Text style={styles.viewButtonText}>Ver Detalles</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderInteractiveMap = () => (
        <InteractiveMap
            campaigns={filteredCampaigns}
            selectedCampaign={selectedCampaign}
            onCampaignSelect={handleCampaignSelect}
            selectedCity={selectedCity}
            selectedCategory={selectedCategory}
            style={styles.interactiveMap}
        />
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ZyroLogo />
                <ActivityIndicator
                    size="large"
                    color={colors.goldElegant}
                    style={styles.loadingIndicator}
                />
                <Text style={styles.loadingText}>Cargando colaboraciones...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <ZyroLogo size="small" />
                <View style={styles.headerControls}>
                    <TouchableOpacity
                        style={styles.filterToggle}
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <WebIcon name="filter-list" size={20} color={colors.goldElegant} />
                        <Text style={styles.filterToggleText}>Filtros</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={loadCampaigns}
                    >
                        <WebIcon name="refresh" size={20} color={colors.goldElegant} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filters */}
            {showFilters && (
                <View style={styles.filtersContainer}>
                    <View style={styles.filterRow}>
                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>Ciudad:</Text>
                            <CitySelector
                                selectedCity={selectedCity}
                                onCityChange={setSelectedCity}
                                style={styles.citySelector}
                            />
                        </View>

                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>Categoría:</Text>
                            <CategoryFilter
                                selectedCategory={selectedCategory}
                                onCategoryChange={setSelectedCategory}
                                style={styles.categoryFilter}
                            />
                        </View>
                    </View>
                </View>
            )}

            {/* Main Content */}
            <View style={styles.mainContent}>
                {isLargeScreen ? (
                    // Desktop/Tablet Layout
                    <View style={styles.desktopLayout}>
                        <View style={styles.mapSection}>
                            {renderInteractiveMap()}
                        </View>

                        <View style={styles.listSection}>
                            <Text style={styles.sectionTitle}>
                                Colaboraciones ({filteredCampaigns.length})
                            </Text>
                            <ScrollView style={styles.campaignsList}>
                                {filteredCampaigns.map(renderCampaignCard)}
                            </ScrollView>
                        </View>
                    </View>
                ) : (
                    // Mobile Layout
                    <ScrollView style={styles.mobileLayout}>
                        <View style={styles.mapSection}>
                            {renderInteractiveMap()}
                        </View>

                        <View style={styles.listSection}>
                            <Text style={styles.sectionTitle}>
                                Colaboraciones ({filteredCampaigns.length})
                            </Text>
                            {filteredCampaigns.map(renderCampaignCard)}
                        </View>
                    </ScrollView>
                )}
            </View>

            {/* Results Counter */}
            <View style={styles.resultsCounter}>
                <WebIcon name="place" size={16} color={colors.goldElegant} />
                <Text style={styles.resultsText}>
                    {filteredCampaigns.length} de {campaigns.length} colaboraciones
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },

    // Loading States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.black,
        paddingHorizontal: spacing.lg,
    },
    loadingIndicator: {
        marginVertical: spacing.lg,
    },
    loadingText: {
        color: colors.goldElegant,
        fontSize: fontSizes.md,
        fontWeight: fontWeights.medium,
        textAlign: 'center',
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.darkGray,
        borderBottomWidth: 1,
        borderBottomColor: colors.goldElegant,
    },
    headerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    filterToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.black,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.goldElegant,
        gap: spacing.xs,
    },
    filterToggleText: {
        color: colors.goldElegant,
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.medium,
    },
    refreshButton: {
        padding: spacing.sm,
        backgroundColor: colors.black,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.goldElegant,
    },

    // Filters
    filtersContainer: {
        backgroundColor: colors.darkGray,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.mediumGray,
    },
    filterRow: {
        flexDirection: isLargeScreen ? 'row' : 'column',
        gap: spacing.md,
    },
    filterItem: {
        flex: isLargeScreen ? 1 : undefined,
    },
    filterLabel: {
        color: colors.goldElegant,
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.medium,
        marginBottom: spacing.xs,
    },
    citySelector: {
        minWidth: isLargeScreen ? 200 : undefined,
    },
    categoryFilter: {
        minWidth: isLargeScreen ? 250 : undefined,
    },

    // Main Content
    mainContent: {
        flex: 1,
    },

    // Desktop Layout
    desktopLayout: {
        flex: 1,
        flexDirection: 'row',
    },
    mapSection: {
        flex: 1,
        backgroundColor: colors.darkGray,
        borderRightWidth: 1,
        borderRightColor: colors.mediumGray,
    },
    listSection: {
        width: 400,
        backgroundColor: colors.black,
    },

    // Mobile Layout
    mobileLayout: {
        flex: 1,
    },

    // Interactive Map
    interactiveMap: {
        flex: 1,
        minHeight: isLargeScreen ? undefined : 400,
    },

    // Campaign List
    sectionTitle: {
        color: colors.goldElegant,
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.bold,
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.mediumGray,
    },
    campaignsList: {
        flex: 1,
    },

    // Campaign Cards
    campaignCard: {
        backgroundColor: colors.darkGray,
        marginHorizontal: spacing.md,
        marginVertical: spacing.xs,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.mediumGray,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    selectedCampaignCard: {
        borderColor: colors.goldElegant,
        backgroundColor: `${colors.goldElegant}10`,
    },
    categoryIndicator: {
        width: 4,
        backgroundColor: colors.goldElegant,
    },
    campaignContent: {
        flex: 1,
        padding: spacing.md,
    },
    campaignTitle: {
        color: colors.goldElegant,
        fontSize: fontSizes.md,
        fontWeight: fontWeights.bold,
        marginBottom: spacing.xs,
    },
    campaignSubtitle: {
        color: colors.white,
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.medium,
        marginBottom: spacing.sm,
    },
    campaignDetails: {
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    detailText: {
        color: colors.lightGray,
        fontSize: fontSizes.xs,
        fontWeight: fontWeights.normal,
    },
    followersText: {
        color: colors.mediumGray,
        fontSize: fontSizes.xs,
        fontStyle: 'italic',
    },
    viewButton: {
        backgroundColor: colors.goldElegant,
        borderRadius: 6,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        alignSelf: 'flex-start',
    },
    viewButtonText: {
        color: colors.black,
        fontSize: fontSizes.xs,
        fontWeight: fontWeights.semibold,
    },

    // Results Counter
    resultsCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        backgroundColor: colors.darkGray,
        borderTopWidth: 1,
        borderTopColor: colors.mediumGray,
        gap: spacing.xs,
    },
    resultsText: {
        color: colors.goldElegant,
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.medium,
    },
});