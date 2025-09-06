import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { theme } from '../../styles/theme';
import { RecentActivity } from '../../store/slices/dashboardSlice';

interface RecentActivityCardProps {
  activities: RecentActivity[];
  isLoading?: boolean;
}

interface ActivityItemProps {
  activity: RecentActivity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityIcon = (type: RecentActivity['type']): string => {
    switch (type) {
      case 'user_registration':
        return '👤';
      case 'campaign_created':
        return '📢';
      case 'collaboration_completed':
        return '✅';
      case 'payment_received':
        return '💰';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: RecentActivity['type']): string => {
    switch (type) {
      case 'user_registration':
        return theme.colors.info;
      case 'campaign_created':
        return theme.colors.primary;
      case 'collaboration_completed':
        return theme.colors.success;
      case 'payment_received':
        return theme.colors.accent;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'hace un momento';
    } else if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} min`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `hace ${diffInHours}h`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `hace ${diffInDays}d`;
      }
    }
  };

  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
        <Text style={styles.activityEmoji}>{getActivityIcon(activity.type)}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        <Text style={styles.activityTime}>{getTimeAgo(activity.timestamp)}</Text>
      </View>
    </View>
  );
};

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  activities,
  isLoading = false,
}) => {
  const renderActivity = ({ item }: { item: RecentActivity }) => (
    <ActivityItem activity={item} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actividad Reciente</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando actividad...</Text>
        </View>
      ) : activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay actividad reciente</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.activityList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  activityList: {
    maxHeight: 300,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 14,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'Inter',
    marginBottom: 4,
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
  },
});