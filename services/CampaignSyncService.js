import StorageService from './StorageService';

class CampaignSyncService {
    // Sync campaigns from admin to influencer app
    static async syncCampaignsToInfluencers() {
        try {
            console.log('🔄 CampaignSyncService: Starting sync...');
            
            // Get campaigns from admin storage
            const adminCampaigns = await StorageService.getData('admin_campaigns') || [];
            console.log(`📊 CampaignSyncService: Found ${adminCampaigns.length} admin campaigns`);
            
            if (adminCampaigns.length > 0) {
                adminCampaigns.forEach(campaign => {
                    console.log(`📋 Admin campaign found: ${campaign.title} - ${campaign.business}`);
                });
            }
            
            // Transform admin campaigns to influencer format
            const influencerCampaigns = adminCampaigns.map(campaign => ({
                id: campaign.id,
                title: campaign.title,
                business: campaign.business,
                category: campaign.category,
                city: campaign.city,
                description: campaign.description,
                requirements: campaign.requirements,
                companions: campaign.companions,
                whatIncludes: campaign.whatIncludes,
                contentRequired: campaign.contentRequired,
                deadline: campaign.deadline,
                address: campaign.address,
                phone: campaign.phone,
                email: campaign.email,
                images: campaign.images || [],
                status: campaign.status,
                minFollowers: campaign.minFollowers,
                estimatedReach: campaign.estimatedReach,
                engagement: campaign.engagement,
                createdAt: campaign.createdAt,
                expiresAt: campaign.expiresAt || this.calculateExpirationDate(campaign.availableDates),
                coordinates: campaign.coordinates || { latitude: 40.4168, longitude: -3.7038 },
                geocodingInfo: campaign.geocodingInfo || null,
                // Add scheduling information
                availableDates: campaign.availableDates || [],
                availableTimes: campaign.availableTimes || [],
                // Additional fields for influencer app
                isAdminCreated: true,
                lastUpdated: new Date().toISOString()
            }));
            
            // Save to influencer campaigns storage
            await StorageService.saveData('influencer_campaigns', influencerCampaigns);
            console.log(`✅ CampaignSyncService: Saved ${influencerCampaigns.length} campaigns to influencer storage`);
            
            console.log(`✅ CampaignSyncService: Synced ${influencerCampaigns.length} campaigns to influencer app`);
            return true;
        } catch (error) {
            console.error('Error syncing campaigns to influencers:', error);
            return false;
        }
    }
    
    // Get campaigns for influencer app (includes both admin and regular campaigns)
    static async getCampaignsForInfluencers() {
        try {
            console.log('🔄 CampaignSyncService: Getting campaigns for influencers...');
            
            // Get admin-created campaigns
            const adminCampaigns = await StorageService.getData('influencer_campaigns') || [];
            console.log(`📊 CampaignSyncService: Found ${adminCampaigns.length} synced admin campaigns`);
            
            // Get regular mock campaigns (existing ones)
            const mockCampaigns = [
                {
                    id: 'mock_1',
                    title: 'Degustación Premium Original',
                    business: 'Restaurante Elegance',
                    category: 'restaurantes',
                    city: 'Madrid',
                    description: 'Experiencia gastronómica exclusiva con menú degustación de 7 platos. Ambiente elegante perfecto para contenido de alta calidad.',
                    requirements: 'Min. 10K seguidores IG',
                    companions: '+2 acompañantes',
                    whatIncludes: 'Menú degustación completo para 3 personas, bebidas incluidas, postre especial',
                    contentRequired: '2 historias Instagram (1 en video) + 1 post en feed',
                    deadline: '72 horas después de la visita',
                    address: 'Calle Serrano 45, Madrid',
                    phone: '+34 91 123 4567',
                    email: 'reservas@elegance.com',
                    images: ['https://via.placeholder.com/400x300/C9A961/000000?text=Restaurante+Elegance'],
                    status: 'active',
                    minFollowers: 10000,
                    estimatedReach: '15K-25K',
                    engagement: '4.2%',
                    createdAt: '2025-01-15T10:00:00Z',
                    expiresAt: '2025-02-15T23:59:59Z',
                    coordinates: { latitude: 40.4168, longitude: -3.7038 },
                    isAdminCreated: false
                }
            ];
            
            // Combine admin campaigns with mock campaigns
            const allCampaigns = [...adminCampaigns, ...mockCampaigns];
            console.log(`📊 CampaignSyncService: Total campaigns (admin + mock): ${allCampaigns.length}`);
            
            // Filter only active campaigns
            const activeCampaigns = allCampaigns.filter(campaign => campaign.status === 'active');
            console.log(`✅ CampaignSyncService: Returning ${activeCampaigns.length} active campaigns`);
            
            return activeCampaigns;
        } catch (error) {
            console.error('Error getting campaigns for influencers:', error);
            return [];
        }
    }
    
    // Calculate expiration date based on available dates
    static calculateExpirationDate(availableDates) {
        if (!availableDates || availableDates.length === 0) {
            // Default to 30 days from now
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            return futureDate.toISOString();
        }
        
        // Use the last available date as expiration
        const lastDate = availableDates.sort().pop();
        const expirationDate = new Date(lastDate);
        expirationDate.setHours(23, 59, 59, 999); // End of day
        return expirationDate.toISOString();
    }
    
    // Update a specific campaign (called when admin edits)
    static async updateCampaignForInfluencers(campaignId, updatedCampaign) {
        try {
            const campaigns = await StorageService.getData('influencer_campaigns') || [];
            const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
            
            if (campaignIndex !== -1) {
                // Update existing campaign
                campaigns[campaignIndex] = {
                    ...updatedCampaign,
                    isAdminCreated: true,
                    lastUpdated: new Date().toISOString(),
                    expiresAt: this.calculateExpirationDate(updatedCampaign.availableDates),
                    coordinates: updatedCampaign.coordinates || { latitude: 40.4168, longitude: -3.7038 },
                    geocodingInfo: updatedCampaign.geocodingInfo || null
                };
            } else {
                // Add new campaign
                campaigns.push({
                    ...updatedCampaign,
                    isAdminCreated: true,
                    lastUpdated: new Date().toISOString(),
                    expiresAt: this.calculateExpirationDate(updatedCampaign.availableDates),
                    coordinates: updatedCampaign.coordinates || { latitude: 40.4168, longitude: -3.7038 },
                    geocodingInfo: updatedCampaign.geocodingInfo || null
                });
            }
            
            await StorageService.saveData('influencer_campaigns', campaigns);
            console.log(`Updated campaign ${campaignId} for influencers`);
            return true;
        } catch (error) {
            console.error('Error updating campaign for influencers:', error);
            return false;
        }
    }
    
    // Delete a campaign from influencer app
    static async deleteCampaignFromInfluencers(campaignId) {
        try {
            const campaigns = await StorageService.getData('influencer_campaigns') || [];
            const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
            
            await StorageService.saveData('influencer_campaigns', updatedCampaigns);
            console.log(`Deleted campaign ${campaignId} from influencers`);
            return true;
        } catch (error) {
            console.error('Error deleting campaign from influencers:', error);
            return false;
        }
    }
    
    // Get campaign details for booking (includes scheduling info)
    static async getCampaignBookingDetails(campaignId) {
        try {
            const campaigns = await this.getCampaignsForInfluencers();
            const campaign = campaigns.find(c => c.id === campaignId);
            
            if (!campaign) {
                return null;
            }
            
            return {
                ...campaign,
                bookingInfo: {
                    availableDates: campaign.availableDates || [],
                    availableTimes: campaign.availableTimes || [],
                    canSelectDateTime: campaign.availableDates && campaign.availableDates.length > 0
                }
            };
        } catch (error) {
            console.error('Error getting campaign booking details:', error);
            return null;
        }
    }
    
    // Save booking request (when influencer requests collaboration)
    static async saveBookingRequest(campaignId, influencerId, bookingDetails) {
        try {
            const bookingRequests = await StorageService.getData('booking_requests') || [];
            
            const newRequest = {
                id: `booking_${Date.now()}`,
                campaignId,
                influencerId,
                selectedDate: bookingDetails.selectedDate,
                selectedTime: bookingDetails.selectedTime,
                message: bookingDetails.message || '',
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            bookingRequests.push(newRequest);
            await StorageService.saveData('booking_requests', bookingRequests);
            
            console.log(`Saved booking request for campaign ${campaignId}`);
            return newRequest;
        } catch (error) {
            console.error('Error saving booking request:', error);
            return null;
        }
    }
    
    // Get booking requests for admin review
    static async getBookingRequests() {
        try {
            return await StorageService.getData('booking_requests') || [];
        } catch (error) {
            console.error('Error getting booking requests:', error);
            return [];
        }
    }
    
    // Auto-sync campaigns when admin makes changes
    static async autoSync() {
        try {
            console.log('🔄 CampaignSyncService: Auto-sync triggered');
            const result = await this.syncCampaignsToInfluencers();
            console.log('✅ CampaignSyncService: Auto-sync completed successfully');
            return result;
        } catch (error) {
            console.error('❌ CampaignSyncService: Error in auto-sync:', error);
            return false;
        }
    }
}

export default CampaignSyncService;