import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ZyroLogo } from '../components/ZyroLogo';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../styles/theme';
import { HomeStackParamList } from '../types';
import { useCurrentInfluencer } from '../hooks/useCurrentInfluencer';
import { FollowerValidationService } from '../services/followerValidationService';
import { CitySelector } from '../components/CitySelector';
import { CategoryFilter } from '../components/CategoryFilter';
import { LocationService } from '../services/locationService';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeMain'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

// Get enabled cities and categories from mock data
const getEnabledCities = () => mockCities;
const getEnabledCategories = () => ['TODAS LAS CATEGORÍAS', ...mockCategories.map(cat => cat.name)];

import { mockCampaigns, mockCities, mockCategories } from '../data/mockData';

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  // Initialize with Madrid as default
  const [selectedCity, setSelectedCity] = useState('Madrid');
  const [selectedCategory, setSelectedCategory] = useState('TODAS LAS CATEGORÍAS');
  
  const currentInfluencer = useCurrentInfluencer();

  const filteredCollaborations = mockCampaigns.filter(campaign => {
    // Check if city matches selection
    const cityMatch = campaign.city.toUpperCase() === selectedCity.toUpperCase();
    
    // Check if category matches selection
    const categoryDisplayName = mockCategories.find(cat => cat.id === campaign.category)?.name || campaign.category.toUpperCase();
    const categoryMatch = selectedCategory === 'TODAS LAS CATEGORÍAS' || 
                         categoryDisplayName === selectedCategory;
    
    return cityMatch && categoryMatch;
  });

  const renderCollaborationCard = (campaign: typeof mockCampaigns[0]) => {
    // Check if user meets requirements
    const isEligible = currentInfluencer ? 
      FollowerValidationService.validateFollowerRequirements(campaign, currentInfluencer).isEligible : 
      false;

    const categoryName = mockCategories.find(cat => cat.id === campaign.category)?.name || campaign.category.toUpperCase();
    
    return (
      <TouchableOpacity key={campaign.id} style={styles.collaborationCard}>
        <View style={styles.cardImagePlaceholder}>
          <View style={styles.cardImageOverlay}>
            <Text style={styles.cardImageText}>{campaign.title}</Text>
            <Text style={styles.cardBusinessName}>{campaign.businessName}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {categoryName}
            </Text>
          </View>
          {/* Eligibility indicator */}
          {currentInfluencer && (
            <View style={[
              styles.eligibilityBadge,
              isEligible ? styles.eligibleBadge : styles.ineligibleBadge
            ]}>
              <Icon 
                name={isEligible ? "check-circle" : "block"} 
                size={16} 
                color={isEligible ? colors.success : colors.error} 
              />
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{campaign.title}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {campaign.description}
          </Text>
          <View style={styles.cardInfo}>
            <View style={styles.infoItem}>
              <Icon name="people" size={18} color={colors.goldElegant} />
              <Text style={[
                styles.infoText,
                !isEligible && currentInfluencer && styles.requirementNotMet
              ]}>
                Min. {(campaign.requirements.minInstagramFollowers || 0).toLocaleString()} seguidores
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="group-add" size={18} color={colors.goldElegant} />
              <Text style={styles.infoText}>+{campaign.requirements.maxCompanions} acompañantes</Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.locationInfo}>
              <Icon name="location-on" size={16} color={colors.goldElegant} />
              <Text style={styles.locationText}>{campaign.city}</Text>
            </View>
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => navigation.navigate('CollaborationDetail', { campaignId: campaign.id })}
            >
              <Text style={styles.viewDetailsText}>Ver Detalles</Text>
              <Icon name="arrow-forward" size={16} color={colors.black} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Logo and City Selector */}
      <View style={styles.header}>
        <ZyroLogo size="small" />
        <CitySelector
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
        />
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="search" size={24} color={colors.goldElegant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="settings" size={24} color={colors.goldElegant} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filtersContainer}>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          showAsChips={false}
        />
      </View>

      {/* Collaborations List */}
      <ScrollView style={styles.collaborationsList} showsVerticalScrollIndicator={false}>
        {filteredCollaborations.length > 0 ? (
          filteredCollaborations.map(renderCollaborationCard)
        ) : (
          <View style={styles.emptyState}>
            <Icon name="search-off" size={48} color={colors.mediumGray} />
            <Text style={styles.emptyStateText}>
              No hay colaboraciones disponibles en {selectedCity}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedCategory !== 'TODAS LAS CATEGORÍAS' && `para la categoría ${selectedCategory}`}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.goldElegant,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },

  
  // Filters Styles
  filtersContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  // Collaborations List Styles
  collaborationsList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  collaborationCard: {
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.goldElegant,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.goldElegant,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cardImagePlaceholder: {
    height: 180,
    backgroundColor: colors.goldElegant,
    position: 'relative',
  },
  cardImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: spacing.md,
  },
  cardImageText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.goldElegant,
    marginBottom: spacing.xs,
  },
  cardBusinessName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.white,
  },
  categoryBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.black,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.goldElegant,
  },
  categoryText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
  },
  eligibilityBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  eligibleBadge: {
    backgroundColor: `${colors.success}20`,
    borderColor: colors.success,
  },
  ineligibleBadge: {
    backgroundColor: `${colors.error}20`,
    borderColor: colors.error,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    marginLeft: spacing.xs,
    fontWeight: fontWeights.medium,
    flex: 1,
  },
  requirementNotMet: {
    color: colors.error,
    fontWeight: fontWeights.semibold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
    marginLeft: spacing.xs,
    fontWeight: fontWeights.medium,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldElegant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  viewDetailsText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    marginRight: spacing.xs,
  },
  
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: fontSizes.lg,
    color: colors.mediumGray,
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: fontWeights.medium,
  },
  emptyStateSubtext: {
    fontSize: fontSizes.sm,
    color: colors.mediumGray,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});