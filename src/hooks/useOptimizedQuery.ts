import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { cacheService } from '../services/cacheService';
import { performanceService } from '../services/performanceService';

export interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  cacheTime?: number;
  enableOfflineCache?: boolean;
  performanceTracking?: boolean;
}

export function useOptimizedQuery<T>(
  queryKey: (string | number | object)[],
  queryFn: () => Promise<T>,
  options?: OptimizedQueryOptions<T>
): UseQueryResult<T> {
  const {
    cacheTime = 300000, // 5 minutes default
    enableOfflineCache = true,
    performanceTracking = true,
    ...queryOptions
  } = options || {};

  // Memoize the query key to prevent unnecessary re-renders
  const memoizedQueryKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);

  // Enhanced query function with caching and performance tracking
  const enhancedQueryFn = useCallback(async (): Promise<T> => {
    const cacheKey = memoizedQueryKey.join('_');
    const trackingName = `query_${cacheKey}`;

    if (performanceTracking) {
      performanceService.startMeasure(trackingName);
    }

    try {
      // Try offline cache first if enabled
      if (enableOfflineCache) {
        const cached = await cacheService.get<T>(cacheKey);
        if (cached) {
          if (performanceTracking) {
            performanceService.endMeasure(trackingName);
          }
          return cached;
        }
      }

      // Fetch fresh data
      const data = await queryFn();

      // Cache the result if offline cache is enabled
      if (enableOfflineCache) {
        await cacheService.set(cacheKey, data, { ttl: cacheTime });
      }

      if (performanceTracking) {
        performanceService.endMeasure(trackingName);
      }

      return data;
    } catch (error) {
      if (performanceTracking) {
        performanceService.endMeasure(trackingName);
      }
      throw error;
    }
  }, [memoizedQueryKey, queryFn, enableOfflineCache, cacheTime, performanceTracking]);

  return useQuery({
    queryKey: memoizedQueryKey,
    queryFn: enhancedQueryFn,
    staleTime: 120000, // 2 minutes
    gcTime: cacheTime,
    ...queryOptions,
  });
}

// Hook for paginated queries with optimizations
export function useOptimizedInfiniteQuery<T>(
  queryKey: (string | number | object)[],
  queryFn: ({ pageParam }: { pageParam: number }) => Promise<T>,
  options?: OptimizedQueryOptions<T> & {
    getNextPageParam?: (lastPage: T, pages: T[]) => number | undefined;
    initialPageParam?: number;
  }
) {
  const {
    cacheTime = 300000,
    enableOfflineCache = true,
    performanceTracking = true,
    getNextPageParam,
    initialPageParam = 0,
    ...queryOptions
  } = options || {};

  const memoizedQueryKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);

  const enhancedQueryFn = useCallback(async ({ pageParam }: { pageParam: number }): Promise<T> => {
    const cacheKey = `${memoizedQueryKey.join('_')}_page_${pageParam}`;
    const trackingName = `infinite_query_${cacheKey}`;

    if (performanceTracking) {
      performanceService.startMeasure(trackingName);
    }

    try {
      if (enableOfflineCache) {
        const cached = await cacheService.get<T>(cacheKey);
        if (cached) {
          if (performanceTracking) {
            performanceService.endMeasure(trackingName);
          }
          return cached;
        }
      }

      const data = await queryFn({ pageParam });

      if (enableOfflineCache) {
        await cacheService.set(cacheKey, data, { ttl: cacheTime });
      }

      if (performanceTracking) {
        performanceService.endMeasure(trackingName);
      }

      return data;
    } catch (error) {
      if (performanceTracking) {
        performanceService.endMeasure(trackingName);
      }
      throw error;
    }
  }, [memoizedQueryKey, queryFn, enableOfflineCache, cacheTime, performanceTracking]);

  return useQuery({
    queryKey: memoizedQueryKey,
    queryFn: () => enhancedQueryFn({ pageParam: initialPageParam }),
    staleTime: 120000,
    gcTime: cacheTime,
    ...queryOptions,
  });
}

// Hook for dependent queries with optimizations
export function useOptimizedDependentQuery<T, TDep>(
  queryKey: (string | number | object)[],
  queryFn: (dependency: TDep) => Promise<T>,
  dependency: TDep | undefined,
  options?: OptimizedQueryOptions<T>
): UseQueryResult<T> {
  return useOptimizedQuery(
    [...queryKey, dependency],
    () => {
      if (!dependency) {
        throw new Error('Dependency not available');
      }
      return queryFn(dependency);
    },
    {
      ...options,
      enabled: !!dependency && options?.enabled !== false,
    }
  );
}