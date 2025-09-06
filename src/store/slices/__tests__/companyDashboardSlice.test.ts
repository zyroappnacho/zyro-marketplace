import { configureStore } from '@reduxjs/toolkit';
import companyDashboardReducer, {
  fetchCompanyProfile,
  fetchCompanyCampaigns,
  fetchCompanyCollaborationRequests,
  fetchCompanyMetrics,
  clearError,
  resetDashboard,
} from '../companyDashboardSlice';
import { Company, Campaign, CollaborationRequest } from '../../../types';

// Mock the repositories
jest.mock('../../../database/repositories/CompanyRepository');
jest.mock('../../../database/repositories/CampaignRepository');
jest.mock('../../../database/repositories/CollaborationRequestRepository');

describe('companyDashboardSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        companyDashboard: companyDashboardReducer,
      },
    });
  });

  it('should return the initial state', () => {
    const state = store.getState().companyDashboard;
    expect(state.company).toBeNull();
    expect(state.campaigns).toEqual([]);
    expect(state.collaborationRequests).toEqual([]);
    expect(state.metrics.totalCampaigns).toBe(0);
    expect(state.loading.company).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle clearError', () => {
    // First set an error
    store.dispatch({ type: 'companyDashboard/fetchCompanyProfile/rejected', error: { message: 'Test error' } });
    expect(store.getState().companyDashboard.error).toBe('Test error');

    // Then clear it
    store.dispatch(clearError());
    expect(store.getState().companyDashboard.error).toBeNull();
  });

  it('should handle resetDashboard', () => {
    // First modify the state
    store.dispatch({ type: 'companyDashboard/fetchCompanyProfile/pending' });
    expect(store.getState().companyDashboard.loading.company).toBe(true);

    // Then reset
    store.dispatch(resetDashboard());
    const state = store.getState().companyDashboard;
    expect(state.company).toBeNull();
    expect(state.campaigns).toEqual([]);
    expect(state.loading.company).toBe(false);
  });

  it('should handle fetchCompanyProfile pending', () => {
    store.dispatch({ type: 'companyDashboard/fetchCompanyProfile/pending' });
    const state = store.getState().companyDashboard;
    expect(state.loading.company).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchCompanyProfile fulfilled', () => {
    const mockCompany: Company = {
      id: '1',
      email: 'test@company.com',
      role: 'company',
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
      companyName: 'Test Company',
      cif: '12345678A',
      address: 'Test Address',
      phone: '123456789',
      contactPerson: 'John Doe',
      subscription: {
        plan: '3months',
        price: 499,
        startDate: new Date(),
        endDate: new Date(),
        status: 'active',
      },
      paymentMethod: 'card',
    };

    store.dispatch({
      type: 'companyDashboard/fetchCompanyProfile/fulfilled',
      payload: mockCompany,
    });

    const state = store.getState().companyDashboard;
    expect(state.loading.company).toBe(false);
    expect(state.company).toEqual(mockCompany);
  });

  it('should handle fetchCompanyProfile rejected', () => {
    store.dispatch({
      type: 'companyDashboard/fetchCompanyProfile/rejected',
      error: { message: 'Company not found' },
    });

    const state = store.getState().companyDashboard;
    expect(state.loading.company).toBe(false);
    expect(state.error).toBe('Company not found');
  });

  it('should handle fetchCompanyCampaigns fulfilled', () => {
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        title: 'Test Campaign',
        description: 'Test Description',
        businessName: 'Test Business',
        category: 'restaurantes',
        city: 'Madrid',
        address: 'Test Address',
        coordinates: { lat: 40.4168, lng: -3.7038 },
        images: [],
        requirements: {
          minInstagramFollowers: 1000,
          maxCompanions: 2,
        },
        whatIncludes: ['Test item'],
        contentRequirements: {
          instagramStories: 2,
          tiktokVideos: 0,
          deadline: 72,
        },
        companyId: '1',
        status: 'active',
        createdBy: 'admin1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    store.dispatch({
      type: 'companyDashboard/fetchCompanyCampaigns/fulfilled',
      payload: mockCampaigns,
    });

    const state = store.getState().companyDashboard;
    expect(state.loading.campaigns).toBe(false);
    expect(state.campaigns).toEqual(mockCampaigns);
  });

  it('should handle fetchCompanyMetrics fulfilled', () => {
    const mockMetrics = {
      totalCampaigns: 5,
      activeCampaigns: 3,
      totalRequests: 10,
      pendingRequests: 2,
      approvedRequests: 6,
      completedRequests: 2,
    };

    store.dispatch({
      type: 'companyDashboard/fetchCompanyMetrics/fulfilled',
      payload: mockMetrics,
    });

    const state = store.getState().companyDashboard;
    expect(state.loading.metrics).toBe(false);
    expect(state.metrics).toEqual(mockMetrics);
  });
});