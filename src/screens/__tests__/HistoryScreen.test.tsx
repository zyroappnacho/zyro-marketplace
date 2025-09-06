import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { HistoryScreen } from '../HistoryScreen';
import authSlice from '../../store/slices/authSlice';
import collaborationSlice from '../../store/slices/collaborationSlice';

// Mock the hooks and dependencies
jest.mock('../../hooks/useCurrentInfluencer', () => ({
  useCurrentInfluencer: () => ({
    id: 'test-influencer-id',
    email: 'test@example.com',
    role: 'influencer',
    status: 'approved',
    fullName: 'Test Influencer',
    city: 'Madrid',
    instagramFollowers: 10000,
    tiktokFollowers: 5000,
  }),
}));

jest.mock('../../database/repositories/CampaignRepository', () => ({
  CampaignRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn().mockResolvedValue({
      id: 'test-campaign',
      title: 'Test Campaign',
      business_name: 'Test Business',
      city: 'Madrid',
      category: 'restaurantes',
      images: '["test-image.jpg"]',
    }),
  })),
}));

jest.mock('../../database/mappers', () => ({
  DatabaseMappers: {
    mapCampaignEntityToCampaign: jest.fn().mockReturnValue({
      id: 'test-campaign',
      title: 'Test Campaign',
      businessName: 'Test Business',
      city: 'Madrid',
      category: 'restaurantes',
      images: ['test-image.jpg'],
    }),
  },
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      collaboration: collaborationSlice,
    },
    preloadedState: {
      auth: {
        user: {
          id: 'test-user',
          email: 'test@example.com',
          role: 'influencer',
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      collaboration: {
        requests: [],
        currentRequest: null,
        pendingRequests: [],
        loading: false,
        error: null,
        submittingRequest: false,
        updatingStatus: false,
      },
    },
  });
};

describe('HistoryScreen', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <Provider store={store}>
        <HistoryScreen />
      </Provider>
    );

    // Check that the main title is rendered
    expect(getByText('Historial')).toBeTruthy();
  });

  it('renders all three tabs', () => {
    const { getByText } = render(
      <Provider store={store}>
        <HistoryScreen />
      </Provider>
    );

    // Check that all three tabs are rendered
    expect(getByText('PRÓXIMOS')).toBeTruthy();
    expect(getByText('PASADOS')).toBeTruthy();
    expect(getByText('CANCELADOS')).toBeTruthy();
  });

  it('shows empty state when no collaborations', () => {
    const { getByText } = render(
      <Provider store={store}>
        <HistoryScreen />
      </Provider>
    );

    // Should show empty state message for upcoming collaborations (default tab)
    expect(getByText('No tienes colaboraciones próximas')).toBeTruthy();
    expect(getByText('Cuando tengas colaboraciones aprobadas aparecerán aquí')).toBeTruthy();
  });

  it('renders with collaboration data', () => {
    // Update store with test collaboration data
    const storeWithData = configureStore({
      reducer: {
        auth: authSlice,
        collaboration: collaborationSlice,
      },
      preloadedState: {
        auth: {
          user: {
            id: 'test-user',
            email: 'test@example.com',
            role: 'influencer',
            status: 'approved',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          isAuthenticated: true,
          loading: false,
          error: null,
        },
        collaboration: {
          requests: [
            {
              id: 'test-request',
              campaignId: 'test-campaign',
              influencerId: 'test-influencer',
              status: 'approved',
              requestDate: new Date(),
              proposedContent: 'Test content',
              reservationDetails: {
                date: new Date(Date.now() + 86400000), // Tomorrow
                time: '20:00',
                companions: 1,
              },
            },
          ],
          currentRequest: null,
          pendingRequests: [],
          loading: false,
          error: null,
          submittingRequest: false,
          updatingStatus: false,
        },
      },
    });

    const { queryByText } = render(
      <Provider store={storeWithData}>
        <HistoryScreen />
      </Provider>
    );

    // Should not show empty state when there are collaborations
    expect(queryByText('No tienes colaboraciones próximas')).toBeFalsy();
  });
});