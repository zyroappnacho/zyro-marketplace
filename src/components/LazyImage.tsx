import React, { useState, useCallback } from 'react';
import { Image, ImageProps, ActivityIndicator, View } from 'react-native';
import styled from 'styled-components/native';

interface LazyImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  loadingIndicator?: boolean;
}

const Container = styled(View)`
  position: relative;
  justify-content: center;
  align-items: center;
`;

const LoadingContainer = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

export const LazyImage: React.FC<LazyImageProps> = ({
  source,
  placeholder,
  fallback,
  loadingIndicator = true,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return (
    <Container style={style}>
      <StyledImage
        source={source}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
      {loading && (
        <LoadingContainer>
          {placeholder || (
            loadingIndicator && (
              <ActivityIndicator 
                size="small" 
                color="#C9A961" 
              />
            )
          )}
        </LoadingContainer>
      )}
    </Container>
  );
};