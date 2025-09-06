import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Campaign interfaces
export interface Campaign {
  id: string;
  title: string;
  description: string;
  businessName: string;
  category: 'restaurantes' | 'movilidad' | 'ropa' | 'eventos' | 'delivery' | 'salud-belleza' | 'alojamiento' | 'discotecas';
  city: string;
  address: string;
  coordinates: { lat: number; lng: number };
  images: string[];
  requirements: {
    minInstagramFollowers?: number;
    minTiktokFollowers?: number;
    maxCompanions: number;
  };
  whatIncludes: string[];
  contentRequirements: {
    instagramStories: number;
    tiktokVideos: number;
    deadline: number; // hours
  };
  companyId: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdBy: string; // admin ID
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignFormData {
  title: string;
  description: string;
  businessName: string;
  category: Campaign['category'];
  city: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  images: string[];
  requirements: {
    minInstagramFollowers?: number;
    minTiktokFollowers?: number;
    maxCompanions: number;
  };
  whatIncludes: string[];
  contentRequirements: {
    instagramStories: number;
    tiktokVideos: number;
    deadline: number;
  };
  companyId?: string;
}

export interface CampaignState {
  campaigns: Campaign[];
  draftCampaigns: Campaign[];
  activeCampaigns: Campaign[];
  completedCampaigns: Campaign[];
  currentCampaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
}

const initialState: CampaignState = {
  campaigns: [],
  draftCampaigns: [],
  activeCampaigns: [],
  completedCampaigns: [],
  currentCampaign: null,
  isLoading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
};

// Async thunks
export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock campaigns
      const mockCampaigns: Campaign[] = [
        {
          id: 'camp-001',
          title: 'Cena Premium en La Terraza',
          description: 'Experiencia gastronómica única en nuestro restaurante con vistas panorámicas de la ciudad.',
          businessName: 'Restaurante La Terraza',
          category: 'restaurantes',
          city: 'Madrid',
          address: 'Calle Gran Vía 123, Madrid',
          coordinates: { lat: 40.4168, lng: -3.7038 },
          images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
          requirements: {
            minInstagramFollowers: 5000,
            maxCompanions: 2,
          },
          whatIncludes: [
            'Cena completa para 2 personas',
            'Bebidas incluidas',
            'Postre especial de la casa'
          ],
          contentRequirements: {
            instagramStories: 2,
            tiktokVideos: 0,
            deadline: 72,
          },
          companyId: 'comp-001',
          status: 'active',
          createdBy: 'admin-001',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'camp-002',
          title: 'Sesión Spa Completa',
          description: 'Relájate con nuestro tratamiento spa premium de día completo.',
          businessName: 'Spa Wellness Center',
          category: 'salud-belleza',
          city: 'Barcelona',
          address: 'Passeig de Gràcia 456, Barcelona',
          coordinates: { lat: 41.3851, lng: 2.1734 },
          images: ['https://example.com/spa1.jpg'],
          requirements: {
            minInstagramFollowers: 10000,
            maxCompanions: 1,
          },
          whatIncludes: [
            'Masaje relajante de 90 minutos',
            'Acceso a sauna y jacuzzi',
            'Tratamiento facial premium'
          ],
          contentRequirements: {
            instagramStories: 2,
            tiktokVideos: 1,
            deadline: 48,
          },
          companyId: 'comp-002',
          status: 'active',
          createdBy: 'admin-001',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ];
      
      return mockCampaigns;
    } catch (error) {
      return rejectWithValue('Error al cargar campañas');
    }
  }
);

export const createCampaign = createAsyncThunk(
  'campaigns/createCampaign',
  async (campaignData: CampaignFormData, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newCampaign: Campaign = {
        id: `camp-${Date.now()}`,
        ...campaignData,
        companyId: campaignData.companyId || '',
        coordinates: campaignData.coordinates || { lat: 0, lng: 0 },
        status: 'draft',
        createdBy: 'admin-001', // TODO: Get from auth state
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return newCampaign;
    } catch (error) {
      return rejectWithValue('Error al crear campaña');
    }
  }
);

export const updateCampaign = createAsyncThunk(
  'campaigns/updateCampaign',
  async ({ id, updates }: { id: string; updates: Partial<CampaignFormData> }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { id, updates };
    } catch (error) {
      return rejectWithValue('Error al actualizar campaña');
    }
  }
);

export const updateCampaignStatus = createAsyncThunk(
  'campaigns/updateCampaignStatus',
  async ({ id, status }: { id: string; status: Campaign['status'] }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { id, status };
    } catch (error) {
      return rejectWithValue('Error al actualizar estado de campaña');
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  'campaigns/deleteCampaign',
  async (id: string, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return id;
    } catch (error) {
      return rejectWithValue('Error al eliminar campaña');
    }
  }
);

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCampaign: (state, action: PayloadAction<Campaign | null>) => {
      state.currentCampaign = action.payload;
    },
    clearCurrentCampaign: (state) => {
      state.currentCampaign = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch campaigns
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campaigns = action.payload;
        
        // Categorize campaigns by status
        state.draftCampaigns = action.payload.filter(c => c.status === 'draft');
        state.activeCampaigns = action.payload.filter(c => c.status === 'active');
        state.completedCampaigns = action.payload.filter(c => c.status === 'completed');
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create campaign
    builder
      .addCase(createCampaign.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.isCreating = false;
        state.campaigns.push(action.payload);
        state.draftCampaigns.push(action.payload);
        state.currentCampaign = action.payload;
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update campaign
    builder
      .addCase(updateCampaign.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { id, updates } = action.payload;
        
        // Update campaign in all arrays
        const updateCampaignInArray = (campaigns: Campaign[]) => {
          const index = campaigns.findIndex(c => c.id === id);
          if (index !== -1) {
            campaigns[index] = { ...campaigns[index], ...updates, updatedAt: new Date() };
          }
        };
        
        updateCampaignInArray(state.campaigns);
        updateCampaignInArray(state.draftCampaigns);
        updateCampaignInArray(state.activeCampaigns);
        updateCampaignInArray(state.completedCampaigns);
        
        // Update current campaign if it's the one being updated
        if (state.currentCampaign?.id === id) {
          state.currentCampaign = { ...state.currentCampaign, ...updates, updatedAt: new Date() };
        }
      })
      .addCase(updateCampaign.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Update campaign status
    builder
      .addCase(updateCampaignStatus.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateCampaignStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { id, status } = action.payload;
        
        // Find and update campaign
        const campaign = state.campaigns.find(c => c.id === id);
        if (campaign) {
          const oldStatus = campaign.status;
          campaign.status = status;
          campaign.updatedAt = new Date();
          
          // Move campaign between status arrays
          const removeFromArray = (campaigns: Campaign[]) => {
            const index = campaigns.findIndex(c => c.id === id);
            if (index !== -1) {
              campaigns.splice(index, 1);
            }
          };
          
          // Remove from old status array
          switch (oldStatus) {
            case 'draft':
              removeFromArray(state.draftCampaigns);
              break;
            case 'active':
              removeFromArray(state.activeCampaigns);
              break;
            case 'completed':
              removeFromArray(state.completedCampaigns);
              break;
          }
          
          // Add to new status array
          switch (status) {
            case 'draft':
              state.draftCampaigns.push(campaign);
              break;
            case 'active':
              state.activeCampaigns.push(campaign);
              break;
            case 'completed':
              state.completedCampaigns.push(campaign);
              break;
          }
          
          // Update current campaign if it's the one being updated
          if (state.currentCampaign?.id === id) {
            state.currentCampaign.status = status;
            state.currentCampaign.updatedAt = new Date();
          }
        }
      })
      .addCase(updateCampaignStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete campaign
    builder
      .addCase(deleteCampaign.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.isLoading = false;
        const id = action.payload;
        
        // Remove from all arrays
        state.campaigns = state.campaigns.filter(c => c.id !== id);
        state.draftCampaigns = state.draftCampaigns.filter(c => c.id !== id);
        state.activeCampaigns = state.activeCampaigns.filter(c => c.id !== id);
        state.completedCampaigns = state.completedCampaigns.filter(c => c.id !== id);
        
        // Clear current campaign if it was deleted
        if (state.currentCampaign?.id === id) {
          state.currentCampaign = null;
        }
      })
      .addCase(deleteCampaign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentCampaign, clearCurrentCampaign } = campaignSlice.actions;

export default campaignSlice.reducer;