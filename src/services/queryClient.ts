import { QueryClient } from '@tanstack/react-query';
import { cacheService } from './cacheService';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      // Enable background refetch for better UX
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Use network-first strategy for critical data
      networkMode: 'online',
    },
    mutations: {
      retry: false,
      // Optimistic updates for better perceived performance
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries();
      },
    },
  },
});

// Enhanced query functions with caching
export const createOptimizedQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    gcTime?: number;
    cacheTime?: number;
  }
) => ({
  queryKey,
  queryFn: async () => {
    const cacheKey = queryKey.join('_');
    
    // Try cache first for non-critical data
    const cached = await cacheService.get<T>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Fetch fresh data
    const data = await queryFn();
    
    // Cache the result
    await cacheService.set(cacheKey, data, {
      ttl: options?.cacheTime || 1000 * 60 * 5, // 5 minutes default
    });
    
    return data;
  },
  staleTime: options?.staleTime || 1000 * 60 * 2, // 2 minutes
  gcTime: options?.gcTime || 1000 * 60 * 10, // 10 minutes
});

// Prefetch utility for critical data
export const prefetchCriticalData = async (userId: string, userType: string) => {
  const prefetchPromises = [];

  if (userType === 'influencer') {
    // Prefetch campaigns for influencers
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: ['campaigns', 'active'],
        queryFn: () => fetch('/api/campaigns/active').then(res => res.json()),
        staleTime: 1000 * 60 * 2,
      })
    );
  } else if (userType === 'company') {
    // Prefetch company dashboard data
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: ['company', userId, 'dashboard'],
        queryFn: () => fetch(`/api/companies/${userId}/dashboard`).then(res => res.json()),
        staleTime: 1000 * 60 * 1,
      })
    );
  }

  await Promise.all(prefetchPromises);
};