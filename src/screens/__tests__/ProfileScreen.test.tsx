import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import { ProfileScreen } from '../ProfileScreen';
import authSlice from '../../store/slices/authSlice';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
}));

// Mock the useCurrentInfluencer hook
jest.mock('../../hooks/useCurrentInfluencer', () => ({
  useCurrentInfluencer: jest.fn(() => ({
    id: 'test-id',
    email: 'test@example.com',
    role: 'influencer',
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date(),
    fullName: 'Test User',
    instagramUsername: 'testuser',
    tiktokUsername: 'testuser_tiktok',
    instagramFollowers: 10000,
    tiktokFollowers: 5000,
    profileImage: 'https://example.com/image.jpg',
    phone: '+34 600 123 456',
    address: 'Test Address',
    city: 'Madrid',
    audienceStats: {
      countries: [],
      cities: [],
      ageRanges: [],
      monthlyStats: {
        views: 100000,
        engagement: 5.5,
        reach: 80000,
      },
    },
  })),
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        user: {
          id: 'test-id',
          email: 'test@example.com',
          role: 'influencer',
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        loginAttempts: 0,
        lastLoginAttempt: null,
      },
    },
  });
};

describe('ProfileScreen', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    mockNavigate.mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ProfileScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('test@example.com')).toBeTruthy();
  });

  it('displays social media information', () => {
    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ProfileScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('Instagram')).toBeTruthy();
    expect(getByText('@testuser')).toBeTruthy();
    expect(getByText('10,000 seguidores')).toBeTruthy();
    
    expect(getByText('TikTok')).toBeTruthy();
    expect(getByText('@testuser_tiktok')).toBeTruthy();
    expect(getByText('5,000 seguidores')).toBeTruthy();
  });

  it('displays configuration options', () => {
    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ProfileScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('DATOS PERSONALES')).toBeTruthy();
    expect(getByText('Normas de uso')).toBeTruthy();
    expect(getByText('Política de privacidad')).toBeTruthy();
    expect(getByText('Contraseña y seguridad')).toBeTruthy();
    expect(getByText('Cerrar sesión')).toBeTruthy();
    expect(getByText('Borrar cuenta')).toBeTruthy();
  });
});