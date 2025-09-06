import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import MapView, { Marker } from 'react-native-maps'; // Not compatible with web
import { HomeStackParamList, Campaign } from '../types';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../styles/theme';
import { CollaborationRequestButton } from '../components/CollaborationRequestButton';

const { width: screenWidth } = Dimensions.get('window');

type CollaborationDetailScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'CollaborationDetail'
>;

type CollaborationDetailScreenRouteProp = RouteProp<
  HomeStackParamList,
  'CollaborationDetail'
>;

interface Props {
  navigation: CollaborationDetailScreenNavigationProp;
  route: CollaborationDetailScreenRouteProp;
}

import { mockCampaigns } from '../data/mockData';

export const CollaborationDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Get campaign data from mock data using route params
  const { campaignId } = route.params;
  const campaign = mockCampaigns.find(c => c.id === campaignId) || mockCampaigns[0];

  const handleImageScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / screenWidth);
    setCurrentImageIndex(imageIndex);
  };

  const handleRequestCollaboration = () => {
    navigation.navigate('CollaborationRequest', { campaignId: campaign.id });
  };

  const renderImageGallery = () => (
    <View style={styles.imageGalleryContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleImageScroll}
        scrollEventThrottle={16}
      >
        {campaign.images.map((imageUrl, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{campaign.category.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Image indicators */}
      <View style={styles.imageIndicators}>
        {campaign.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentImageIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderBusinessInfo = () => (
    <View style={styles.businessInfoSection}>
      <Text style={styles.businessName}>{campaign.businessName}</Text>
      <Text style={styles.collaborationTitle}>{campaign.title}</Text>
      
      <View style={styles.requirementsContainer}>
        <View style={styles.requirementItem}>
          <Icon name="people" size={20} color={colors.goldElegant} />
          <Text style={styles.requirementText}>
            Min. {campaign.requirements.minInstagramFollowers?.toLocaleString()} seguidores
          </Text>
        </View>
        <View style={styles.requirementItem}>
          <Icon name="group-add" size={20} color={colors.goldElegant} />
          <Text style={styles.requirementText}>
            +{campaign.requirements.maxCompanions} acompañantes
          </Text>
        </View>
      </View>
    </View>
  );

  const renderDescription = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Descripción del Negocio</Text>
      <Text style={styles.descriptionText}>{campaign.description}</Text>
    </View>
  );

  const renderWhatIncludes = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>QUÉ INCLUYE</Text>
      {campaign.whatIncludes.map((item, index) => (
        <View key={index} style={styles.includeItem}>
          <Icon name="check-circle" size={18} color={colors.goldElegant} />
          <Text style={styles.includeText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  const renderContentRequirements = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>CONTENIDO A PUBLICAR</Text>
      <View style={styles.contentRequirementContainer}>
        {campaign.contentRequirements.instagramStories > 0 && (
          <View style={styles.contentRequirement}>
            <Icon name="camera-alt" size={20} color={colors.goldElegant} />
            <Text style={styles.contentRequirementText}>
              {campaign.contentRequirements.instagramStories} historias de Instagram
              {campaign.contentRequirements.instagramStories > 1 ? ' (1 en video)' : ''}
            </Text>
          </View>
        )}
        {campaign.contentRequirements.tiktokVideos > 0 && (
          <View style={styles.contentRequirement}>
            <Icon name="videocam" size={20} color={colors.goldElegant} />
            <Text style={styles.contentRequirementText}>
              {campaign.contentRequirements.tiktokVideos} video de TikTok
            </Text>
          </View>
        )}
        <View style={styles.deadlineInfo}>
          <Icon name="schedule" size={18} color={colors.goldDark} />
          <Text style={styles.deadlineText}>
            Plazo: {campaign.contentRequirements.deadline} horas después de la visita
          </Text>
        </View>
      </View>
    </View>
  );

  const renderMap = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>UBICACIÓN</Text>
      <View style={styles.mapContainer}>
        <View style={styles.map}>
          <View style={styles.mapPlaceholder}>
            <Icon name="location-on" size={48} color={colors.goldElegant} />
            <Text style={styles.mapPlaceholderText}>Mapa Interactivo</Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Lat: {campaign.coordinates.lat.toFixed(4)}, Lng: {campaign.coordinates.lng.toFixed(4)}
            </Text>
          </View>
        </View>
        <View style={styles.addressOverlay}>
          <Icon name="location-on" size={16} color={colors.goldElegant} />
          <Text style={styles.addressText}>{campaign.address}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.goldElegant} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {campaign.businessName}
        </Text>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share" size={24} color={colors.goldElegant} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderBusinessInfo()}
        {renderDescription()}
        {renderWhatIncludes()}
        {renderContentRequirements()}
        {renderMap()}
        
        {/* Bottom spacing for fixed button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed bottom button */}
      <View style={styles.fixedBottomContainer}>
        <CollaborationRequestButton
          campaign={campaign}
          onPress={handleRequestCollaboration}
          style={styles.requestButton}
        />
      </View>
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
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  shareButton: {
    padding: spacing.xs,
  },
  
  // Content Styles
  content: {
    flex: 1,
  },
  
  // Image Gallery Styles
  imageGalleryContainer: {
    position: 'relative',
  },
  imageContainer: {
    width: screenWidth,
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: spacing.md,
  },
  categoryBadge: {
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
  imageIndicators: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: colors.goldElegant,
    width: 12,
    height: 8,
    borderRadius: 4,
  },
  
  // Business Info Styles
  businessInfoSection: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  businessName: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.goldElegant,
    marginBottom: spacing.xs,
  },
  collaborationTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  requirementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requirementText: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
    marginLeft: spacing.xs,
    fontWeight: fontWeights.medium,
  },
  
  // Section Styles
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.goldElegant,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  descriptionText: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
    lineHeight: 22,
    fontWeight: fontWeights.normal,
  },
  
  // What Includes Styles
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  includeText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    marginLeft: spacing.sm,
    fontWeight: fontWeights.medium,
    flex: 1,
  },
  
  // Content Requirements Styles
  contentRequirementContainer: {
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.goldElegant,
  },
  contentRequirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contentRequirementText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    marginLeft: spacing.sm,
    fontWeight: fontWeights.medium,
    flex: 1,
  },
  deadlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  deadlineText: {
    fontSize: fontSizes.sm,
    color: colors.goldDark,
    marginLeft: spacing.xs,
    fontWeight: fontWeights.medium,
    fontStyle: 'italic',
  },
  
  // Map Styles
  mapContainer: {
    height: 150,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.goldElegant,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
  },
  mapPlaceholderText: {
    fontSize: fontSizes.md,
    color: colors.goldElegant,
    fontWeight: fontWeights.semibold,
    marginTop: spacing.sm,
  },
  mapPlaceholderSubtext: {
    fontSize: fontSizes.sm,
    color: colors.lightGray,
    marginTop: spacing.xs,
  },
  addressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  addressText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    marginLeft: spacing.xs,
    fontWeight: fontWeights.medium,
    flex: 1,
  },
  
  // Fixed Bottom Button Styles
  fixedBottomContainer: {
    backgroundColor: colors.black,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.goldElegant,
  },
  requestButton: {
    width: '100%',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});