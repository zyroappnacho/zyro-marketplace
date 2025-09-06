import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Campaign, CollaborationRequest, Company } from '../../types';
import { CampaignRepository } from '../../database/repositories/CampaignRepository';
import { CollaborationRequestRepository } from '../../database/repositories/CollaborationRequestRepository';
import { CompanyRepository } from '../../database/repositories/CompanyRepository';

interface CompanyDashboardState {
  company: Company | null;
  campaigns: Campaign[];
  collaborationRequests: CollaborationRequest[];
  metrics: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    completedRequests: number;
  };
  loading: {
    company: boolean;
    campaigns: boolean;
    requests: boolean;
    metrics: boolean;
  };
  error: string | null;
}

const initialState: CompanyDashboardState = {
  company: null,
  campaigns: [],
  collaborationRequests: [],
  metrics: {
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    completedRequests: 0,
  },
  loading: {
    company: false,
    campaigns: false,
    requests: false,
    metrics: false,
  },
  error: null,
};

// Async thunks
export const fetchCompanyProfile = createAsyncThunk(
  'companyDashboard/fetchCompanyProfile',
  async (userId: string) => {
    const companyRepository = new CompanyRepository();
    const company = await companyRepository.getByUserId(userId);
    if (!company) {
      throw new Error('Company profile not found');
    }
    return company;
  }
);

export const fetchCompanyCampaigns = createAsyncThunk(
  'companyDashboard/fetchCompanyCampaigns',
  async (companyId: string) => {
    const campaignRepository = new CampaignRepository();
    return await campaignRepository.getCampaignsByCompany(companyId);
  }
);

export const fetchCompanyCollaborationRequests = createAsyncThunk(
  'companyDashboard/fetchCompanyCollaborationRequests',
  async (companyId: string) => {
    const campaignRepository = new CampaignRepository();
    const collaborationRepository = new CollaborationRequestRepository();
    
    // Get all campaigns for this company
    const campaigns = await campaignRepository.getCampaignsByCompany(companyId);
    
    // Get all collaboration requests for these campaigns
    const allRequests: CollaborationRequest[] = [];
    for (const campaign of campaigns) {
      const requests = await collaborationRepository.getRequestsByCampaign(campaign.id);
      allRequests.push(...requests);
    }
    
    return allRequests;
  }
);

export const fetchCompanyMetrics = createAsyncThunk(
  'companyDashboard/fetchCompanyMetrics',
  async (companyId: string) => {
    const campaignRepository = new CampaignRepository();
    const collaborationRepository = new CollaborationRequestRepository();
    
    // Get campaign metrics
    const allCampaigns = await campaignRepository.getCampaignsByCompany(companyId);
    const activeCampaigns = allCampaigns.filter(c => c.status === 'active');
    
    // Get collaboration request metrics
    const allRequests: CollaborationRequest[] = [];
    for (const campaign of allCampaigns) {
      const requests = await collaborationRepository.getRequestsByCampaign(campaign.id);
      allRequests.push(...requests);
    }
    
    const pendingRequests = allRequests.filter(r => r.status === 'pending');
    const approvedRequests = allRequests.filter(r => r.status === 'approved');
    const completedRequests = allRequests.filter(r => r.status === 'completed');
    
    return {
      totalCampaigns: allCampaigns.length,
      activeCampaigns: activeCampaigns.length,
      totalRequests: allRequests.length,
      pendingRequests: pendingRequests.length,
      approvedRequests: approvedRequests.length,
      completedRequests: completedRequests.length,
    };
  }
);

const companyDashboardSlice = createSlice({
  name: 'companyDashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetDashboard: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch company profile
    builder
      .addCase(fetchCompanyProfile.pending, (state) => {
        state.loading.company = true;
        state.error = null;
      })
      .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
        state.loading.company = false;
        state.company = action.payload;
      })
      .addCase(fetchCompanyProfile.rejected, (state, action) => {
        state.loading.company = false;
        state.error = action.error.message || 'Failed to fetch company profile';
      });

    // Fetch company campaigns
    builder
      .addCase(fetchCompanyCampaigns.pending, (state) => {
        state.loading.campaigns = true;
        state.error = null;
      })
      .addCase(fetchCompanyCampaigns.fulfilled, (state, action) => {
        state.loading.campaigns = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCompanyCampaigns.rejected, (state, action) => {
        state.loading.campaigns = false;
        state.error = action.error.message || 'Failed to fetch campaigns';
      });

    // Fetch collaboration requests
    builder
      .addCase(fetchCompanyCollaborationRequests.pending, (state) => {
        state.loading.requests = true;
        state.error = null;
      })
      .addCase(fetchCompanyCollaborationRequests.fulfilled, (state, action) => {
        state.loading.requests = false;
        state.collaborationRequests = action.payload;
      })
      .addCase(fetchCompanyCollaborationRequests.rejected, (state, action) => {
        state.loading.requests = false;
        state.error = action.error.message || 'Failed to fetch collaboration requests';
      });

    // Fetch metrics
    builder
      .addCase(fetchCompanyMetrics.pending, (state) => {
        state.loading.metrics = true;
        state.error = null;
      })
      .addCase(fetchCompanyMetrics.fulfilled, (state, action) => {
        state.loading.metrics = false;
        state.metrics = action.payload;
      })
      .addCase(fetchCompanyMetrics.rejected, (state, action) => {
        state.loading.metrics = false;
        state.error = action.error.message || 'Failed to fetch metrics';
      });
  },
});

export const { clearError, resetDashboard } = companyDashboardSlice.actions;
export default companyDashboardSlice.reducer;