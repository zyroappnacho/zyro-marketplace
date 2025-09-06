import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../styles/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  size?: 'small' | 'medium' | 'large';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  size = 'medium',
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getCardStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallCard;
      case 'large':
        return styles.largeCard;
      default:
        return styles.mediumCard;
    }
  };

  return (
    <View style={[styles.container, getCardStyle()]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {trend && (
          <View style={[
            styles.trendContainer,
            { backgroundColor: trend.isPositive ? theme.colors.success : theme.colors.error }
          ]}>
            <Text style={styles.trendText}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.value}>{formatValue(value)}</Text>
      
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');
const cardMargin = 12;
const containerPadding = 24;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  smallCard: {
    width: (width - containerPadding * 2 - cardMargin * 2) / 3,
    padding: 16,
  },
  mediumCard: {
    width: (width - containerPadding * 2 - cardMargin) / 2,
  },
  largeCard: {
    width: width - containerPadding * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
    fontWeight: '500',
    flex: 1,
  },
  trendContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  trendText: {
    fontSize: 10,
    color: 'white',
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
  },
});