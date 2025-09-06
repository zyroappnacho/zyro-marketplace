import React, { Suspense, ComponentType } from 'react';
import { ActivityIndicator, View } from 'react-native';
import styled from 'styled-components/native';

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

interface LazyComponentProps {
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <LoadingContainer>
    <ActivityIndicator size="large" color="#C9A961" />
  </LoadingContainer>
);

export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return React.forwardRef<any, P & LazyComponentProps>((props, ref) => (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <Component {...props} ref={ref} />
    </Suspense>
  ));
}

// Utility function to create lazy components
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = React.lazy(importFn);
  return withLazyLoading(LazyComponent, fallback);
};