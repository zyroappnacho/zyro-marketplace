import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Dashboard data
  dashboard: {
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    totalInfluencers: 0,
    pendingInfluencers: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    revenueHistory: [],
    topCompanies: [],
    recentTransactions: []
  },
  
  // Companies management
  companies: {
    list: [],
    selectedCompany: null,
    filters: {
      status: 'all',
      plan: 'all',
      searchTerm: ''
    }
  },
  
  // Influencers management
  influencers: {
    list: [],
    pendingRequests: [],
    approvedInfluencers: [],
    selectedInfluencer: null,
    filters: {
      status: 'all',
      followers: 'all',
      searchTerm: ''
    }
  },
  
  // Campaigns management
  campaigns: {
    list: [],
    selectedCampaign: null,
    filters: {
      status: 'all',
      category: 'all',
      company: 'all',
      searchTerm: ''
    }
  },
  
  // Financial data
  financial: {
    transactions: [],
    invoices: [],
    paymentMethods: [],
    monthlyReports: [],
    yearlyReports: []
  },
  
  // Admin settings
  settings: {
    adminPassword: 'xarrec-2paqra-guftoN',
    securitySettings: {
      sessionTimeout: 30,
      requireTwoFactor: false,
      allowMultipleSessions: false
    },
    systemSettings: {
      maintenanceMode: false,
      registrationEnabled: true,
      notificationsEnabled: true
    }
  },
  
  // UI state
  ui: {
    currentSection: 'dashboard',
    loading: {
      dashboard: false,
      companies: false,
      influencers: false,
      campaigns: false,
      financial: false
    },
    modals: {
      companyDetail: false,
      influencerDetail: false,
      campaignDetail: false,

      confirmAction: false
    }
  }
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Dashboard actions
    setDashboardData: (state, action) => {
      state.dashboard = { ...state.dashboard, ...action.payload };
    },
    
    updateRevenue: (state, action) => {
      const { amount, type } = action.payload;
      if (type === 'monthly') {
        state.dashboard.monthlyRevenue += amount;
      }
      state.dashboard.totalRevenue += amount;
    },
    
    // Companies actions
    setCompanies: (state, action) => {
      state.companies.list = action.payload;
      state.dashboard.totalCompanies = action.payload.length;
      state.dashboard.activeCompanies = action.payload.filter(c => c.status === 'active').length;
    },
    
    addCompany: (state, action) => {
      state.companies.list.push(action.payload);
      state.dashboard.totalCompanies += 1;
      if (action.payload.status === 'active') {
        state.dashboard.activeCompanies += 1;
      }
    },
    
    updateCompany: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.companies.list.findIndex(c => c.id === id);
      if (index !== -1) {
        state.companies.list[index] = { ...state.companies.list[index], ...updates };
      }
    },
    
    setSelectedCompany: (state, action) => {
      state.companies.selectedCompany = action.payload;
    },
    
    setCompanyFilters: (state, action) => {
      state.companies.filters = { ...state.companies.filters, ...action.payload };
    },
    
    // Influencers actions
    setInfluencers: (state, action) => {
      state.influencers.list = action.payload;
      state.dashboard.totalInfluencers = action.payload.length;
    },
    
    setPendingInfluencers: (state, action) => {
      state.influencers.pendingRequests = action.payload;
      state.dashboard.pendingInfluencers = action.payload.length;
    },
    
    approveInfluencer: (state, action) => {
      const influencerId = action.payload;
      const pendingIndex = state.influencers.pendingRequests.findIndex(i => i.id === influencerId);
      
      if (pendingIndex !== -1) {
        const approvedInfluencer = { 
          ...state.influencers.pendingRequests[pendingIndex], 
          status: 'approved',
          approvedAt: new Date().toISOString()
        };
        
        state.influencers.list.push(approvedInfluencer);
        state.influencers.pendingRequests.splice(pendingIndex, 1);
        state.dashboard.totalInfluencers += 1;
        state.dashboard.pendingInfluencers -= 1;
      }
    },
    
    rejectInfluencer: (state, action) => {
      const { influencerId, reason } = action.payload;
      const pendingIndex = state.influencers.pendingRequests.findIndex(i => i.id === influencerId);
      
      if (pendingIndex !== -1) {
        state.influencers.pendingRequests[pendingIndex].status = 'rejected';
        state.influencers.pendingRequests[pendingIndex].rejectionReason = reason;
        state.influencers.pendingRequests[pendingIndex].rejectedAt = new Date().toISOString();
        state.dashboard.pendingInfluencers -= 1;
      }
    },
    
    setSelectedInfluencer: (state, action) => {
      state.influencers.selectedInfluencer = action.payload;
    },
    
    setInfluencerFilters: (state, action) => {
      state.influencers.filters = { ...state.influencers.filters, ...action.payload };
    },

    setApprovedInfluencers: (state, action) => {
      state.influencers.approvedInfluencers = action.payload;
    },

    deleteInfluencerAccount: (state, action) => {
      const influencerId = action.payload;
      
      // Remove from approved influencers list
      const approvedIndex = state.influencers.approvedInfluencers.findIndex(i => i.id === influencerId);
      if (approvedIndex !== -1) {
        state.influencers.approvedInfluencers.splice(approvedIndex, 1);
      }
      
      // Update in main influencers list
      const mainIndex = state.influencers.list.findIndex(i => i.id === influencerId);
      if (mainIndex !== -1) {
        state.influencers.list[mainIndex].status = 'deleted';
        state.influencers.list[mainIndex].deletedAt = new Date().toISOString();
        state.dashboard.totalInfluencers -= 1;
      }
    },

    deleteCompanyAccount: (state, action) => {
      const companyId = action.payload;
      
      // Remove from companies list
      const companyIndex = state.companies.list.findIndex(c => c.id === companyId);
      if (companyIndex !== -1) {
        const deletedCompany = state.companies.list[companyIndex];
        state.companies.list.splice(companyIndex, 1);
        
        // Update dashboard counters
        state.dashboard.totalCompanies -= 1;
        if (deletedCompany.status === 'payment_completed') {
          state.dashboard.activeCompanies -= 1;
        }
        
        // Update revenue (subtract the deleted company's contribution)
        if (deletedCompany.totalAmount) {
          state.dashboard.totalRevenue -= deletedCompany.totalAmount;
        }
        if (deletedCompany.monthlyAmount) {
          const currentMonth = new Date().getMonth();
          const nextPaymentDate = new Date(deletedCompany.nextPaymentDate || Date.now());
          if (nextPaymentDate.getMonth() === currentMonth) {
            state.dashboard.monthlyRevenue -= deletedCompany.monthlyAmount;
          }
        }
      }
    },
    
    // Campaigns actions
    setCampaigns: (state, action) => {
      state.campaigns.list = action.payload;
      state.dashboard.totalCampaigns = action.payload.length;
      state.dashboard.activeCampaigns = action.payload.filter(c => c.status === 'active').length;
    },
    
    addCampaign: (state, action) => {
      state.campaigns.list.push(action.payload);
      state.dashboard.totalCampaigns += 1;
      if (action.payload.status === 'active') {
        state.dashboard.activeCampaigns += 1;
      }
    },
    
    updateCampaign: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.campaigns.list.findIndex(c => c.id === id);
      if (index !== -1) {
        state.campaigns.list[index] = { ...state.campaigns.list[index], ...updates };
      }
    },
    
    deleteCampaign: (state, action) => {
      const campaignId = action.payload;
      const index = state.campaigns.list.findIndex(c => c.id === campaignId);
      if (index !== -1) {
        const campaign = state.campaigns.list[index];
        state.campaigns.list.splice(index, 1);
        state.dashboard.totalCampaigns -= 1;
        if (campaign.status === 'active') {
          state.dashboard.activeCampaigns -= 1;
        }
      }
    },
    
    setSelectedCampaign: (state, action) => {
      state.campaigns.selectedCampaign = action.payload;
    },
    
    setCampaignFilters: (state, action) => {
      state.campaigns.filters = { ...state.campaigns.filters, ...action.payload };
    },
    
    // Financial actions
    addTransaction: (state, action) => {
      state.financial.transactions.unshift(action.payload);
      
      // Update dashboard revenue
      if (action.payload.type === 'income') {
        state.dashboard.totalRevenue += action.payload.amount;
        
        const currentMonth = new Date().getMonth();
        const transactionMonth = new Date(action.payload.date).getMonth();
        if (currentMonth === transactionMonth) {
          state.dashboard.monthlyRevenue += action.payload.amount;
        }
      }
    },
    
    setFinancialData: (state, action) => {
      state.financial = { ...state.financial, ...action.payload };
    },
    

    
    updateSecuritySettings: (state, action) => {
      state.settings.securitySettings = { ...state.settings.securitySettings, ...action.payload };
    },
    

    
    updateSystemSettings: (state, action) => {
      state.settings.systemSettings = { ...state.settings.systemSettings, ...action.payload };
    },
    
    // UI actions
    setCurrentSection: (state, action) => {
      state.ui.currentSection = action.payload;
    },
    
    setLoading: (state, action) => {
      const { section, isLoading } = action.payload;
      state.ui.loading[section] = isLoading;
    },
    
    toggleModal: (state, action) => {
      const { modalName, isOpen } = action.payload;
      state.ui.modals[modalName] = isOpen !== undefined ? isOpen : !state.ui.modals[modalName];
    },
    
    // Reset admin state
    resetAdminState: (state) => {
      return {
        ...initialState,
        settings: state.settings // Preserve settings
      };
    }
  }
});

export const {
  setDashboardData,
  updateRevenue,
  setCompanies,
  addCompany,
  updateCompany,
  setSelectedCompany,
  setCompanyFilters,
  setInfluencers,
  setPendingInfluencers,
  approveInfluencer,
  rejectInfluencer,
  setSelectedInfluencer,
  setInfluencerFilters,
  setApprovedInfluencers,
  deleteInfluencerAccount,
  deleteCompanyAccount,
  setCampaigns,
  addCampaign,
  updateCampaign,
  deleteCampaign,
  setSelectedCampaign,
  setCampaignFilters,
  addTransaction,
  setFinancialData,

  updateSecuritySettings,

  updateSystemSettings,
  setCurrentSection,
  setLoading,
  toggleModal,
  resetAdminState
} = adminSlice.actions;

export default adminSlice.reducer;