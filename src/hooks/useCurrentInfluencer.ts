import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Influencer } from '../types';

// Mock influencer data - in a real app this would come from the database
const MOCK_INFLUENCER_DATA: Influencer = {
  id: 'user-001',
  email: 'influencer@example.com',
  role: 'influencer',
  status: 'approved',
  createdAt: new Date(),
  updatedAt: new Date(),
  fullName: 'María González',
  instagramUsername: 'maria_gonzalez',
  tiktokUsername: 'mariagonzalez_',
  instagramFollowers: 12500,
  tiktokFollowers: 8200,
  profileImage: 'https://via.placeholder.com/150',
  phone: '+34 600 123 456',
  address: 'Calle Mayor 123, Madrid',
  city: 'Madrid',
  audienceStats: {
    countries: [
      { country: 'España', percentage: 75 },
      { country: 'México', percentage: 15 },
      { country: 'Argentina', percentage: 10 },
    ],
    cities: [
      { city: 'Madrid', percentage: 40 },
      { city: 'Barcelona', percentage: 25 },
      { city: 'Valencia', percentage: 15 },
      { city: 'Sevilla', percentage: 20 },
    ],
    ageRanges: [
      { range: '18-24', percentage: 35 },
      { range: '25-34', percentage: 45 },
      { range: '35-44', percentage: 20 },
    ],
    monthlyStats: {
      views: 150000,
      engagement: 8.5,
      reach: 95000,
    },
  },
};

/**
 * Hook to get the current influencer's data
 * Returns null if user is not an influencer or not logged in
 */
export const useCurrentInfluencer = (): Influencer | null => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user || user.role !== 'influencer') {
    return null;
  }

  // In a real app, this would fetch the full influencer data from the database
  // For now, return mock data if the user is an influencer
  return {
    ...MOCK_INFLUENCER_DATA,
    id: user.id,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Hook to check if current user is an approved influencer
 */
export const useIsApprovedInfluencer = (): boolean => {
  const influencer = useCurrentInfluencer();
  return influencer?.status === 'approved';
};