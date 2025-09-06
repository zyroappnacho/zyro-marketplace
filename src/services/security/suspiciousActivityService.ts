import { encryptionService } from './encryptionService';
import { notificationService } from '../notificationService';

export interface SuspiciousActivity {
  id: string;
  userId: string;
  activityType: 'multiple_login_attempts' | 'unusual_device' | 'rapid_requests' | 'data_access_pattern' | 'location_anomaly';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  metadata: {
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    requestCount?: number;
    timeWindow?: number;
  };
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
  actions: string[];
}

export interface ActivityPattern {
  userId: string;
  normalLoginTimes: number[]; // Hours of day (0-23)
  normalDevices: string[];
  normalLocations: string[];
  averageSessionDuration: number;
  typicalRequestFrequency: number;
}

export class SuspiciousActivityService {
  private static instance: SuspiciousActivityService;
  private activityBuffer: Map<string, any[]> = new Map();

  private constructor() {}

  public static getInstance(): SuspiciousActivityService {
    if (!SuspiciousActivityService.instance) {
      SuspiciousActivityService.instance = new SuspiciousActivityService();
    }
    return SuspiciousActivityService.instance;
  }

  /**
   * Monitor and detect suspicious login patterns
   */
  public async monitorLoginActivity(
    userId: string,
    deviceId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const activities = await this.getRecentActivities(userId, 'login', 24 * 60 * 60 * 1000); // Last 24 hours
      
      // Check for multiple failed attempts
      const failedAttempts = activities.filter(activity => 
        activity.type === 'login_failed' && 
        (Date.now() - activity.timestamp) < (60 * 60 * 1000) // Last hour
      );

      if (failedAttempts.length >= 10) {
        await this.reportSuspiciousActivity({
          userId,
          activityType: 'multiple_login_attempts',
          description: `${failedAttempts.length} failed login attempts in the last hour`,
          severity: 'high',
          metadata: {
            deviceId,
            ipAddress,
            userAgent,
            requestCount: failedAttempts.length,
            timeWindow: 60
          }
        });
      }

      // Check for unusual device
      const userPattern = await this.getUserPattern(userId);
      if (userPattern && !userPattern.normalDevices.includes(deviceId)) {
        await this.reportSuspiciousActivity({
          userId,
          activityType: 'unusual_device',
          description: 'Login attempt from unrecognized device',
          severity: 'medium',
          metadata: {
            deviceId,
            ipAddress,
            userAgent
          }
        });
      }

      // Check for unusual time
      const currentHour = new Date().getHours();
      if (userPattern && userPattern.normalLoginTimes.length > 0) {
        const isNormalTime = userPattern.normalLoginTimes.some(hour => 
          Math.abs(hour - currentHour) <= 2
        );
        
        if (!isNormalTime) {
          await this.reportSuspiciousActivity({
            userId,
            activityType: 'location_anomaly',
            description: `Login attempt at unusual time: ${currentHour}:00`,
            severity: 'low',
            metadata: {
              deviceId,
              ipAddress,
              userAgent
            }
          });
        }
      }

    } catch (error) {
      console.error('Error monitoring login activity:', error);
    }
  }

  /**
   * Monitor API request patterns
   */
  public async monitorRequestActivity(
    userId: string,
    endpoint: string,
    deviceId: string
  ): Promise<void> {
    try {
      const key = `${userId}_${endpoint}`;
      const now = Date.now();
      
      // Get current request buffer
      let requests = this.activityBuffer.get(key) || [];
      requests.push({ timestamp: now, deviceId });
      
      // Keep only requests from last 5 minutes
      requests = requests.filter(req => (now - req.timestamp) < (5 * 60 * 1000));
      this.activityBuffer.set(key, requests);

      // Check for rapid requests
      if (requests.length > 100) { // More than 100 requests in 5 minutes
        await this.reportSuspiciousActivity({
          userId,
          activityType: 'rapid_requests',
          description: `${requests.length} requests to ${endpoint} in 5 minutes`,
          severity: 'high',
          metadata: {
            deviceId,
            requestCount: requests.length,
            timeWindow: 5
          }
        });

        // Clear buffer to prevent spam
        this.activityBuffer.delete(key);
      }

    } catch (error) {
      console.error('Error monitoring request activity:', error);
    }
  }

  /**
   * Monitor data access patterns
   */
  public async monitorDataAccess(
    userId: string,
    dataType: 'personal_data' | 'payment_info' | 'sensitive_settings',
    deviceId: string
  ): Promise<void> {
    try {
      const activities = await this.getRecentActivities(userId, 'data_access', 60 * 60 * 1000); // Last hour
      
      const sensitiveAccess = activities.filter(activity => 
        activity.metadata?.dataType === dataType
      );

      if (sensitiveAccess.length > 10) {
        await this.reportSuspiciousActivity({
          userId,
          activityType: 'data_access_pattern',
          description: `Unusual access pattern to ${dataType}: ${sensitiveAccess.length} times in last hour`,
          severity: 'medium',
          metadata: {
            deviceId,
            requestCount: sensitiveAccess.length,
            timeWindow: 60
          }
        });
      }

    } catch (error) {
      console.error('Error monitoring data access:', error);
    }
  }

  /**
   * Report suspicious activity
   */
  private async reportSuspiciousActivity(
    activityData: Omit<SuspiciousActivity, 'id' | 'timestamp' | 'resolved' | 'actions'>
  ): Promise<void> {
    try {
      const activity: SuspiciousActivity = {
        id: `suspicious_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        resolved: false,
        actions: [],
        ...activityData
      };

      // Store the suspicious activity
      await this.storeSuspiciousActivity(activity);

      // Take automatic actions based on severity
      await this.takeAutomaticActions(activity);

      // Notify administrators
      await this.notifyAdministrators(activity);

    } catch (error) {
      console.error('Error reporting suspicious activity:', error);
    }
  }

  /**
   * Take automatic actions based on activity severity
   */
  private async takeAutomaticActions(activity: SuspiciousActivity): Promise<void> {
    const actions: string[] = [];

    switch (activity.severity) {
      case 'critical':
        // Immediately suspend account
        actions.push('account_suspended');
        // TODO: Implement account suspension
        break;

      case 'high':
        // Require additional authentication
        actions.push('require_2fa');
        // Lock sensitive actions
        actions.push('lock_sensitive_actions');
        break;

      case 'medium':
        // Require password re-authentication for sensitive actions
        actions.push('require_password_reauth');
        break;

      case 'low':
        // Just log and monitor
        actions.push('monitor_increased');
        break;
    }

    // Update activity with actions taken
    activity.actions = actions;
    await this.storeSuspiciousActivity(activity);
  }

  /**
   * Notify administrators of suspicious activity
   */
  private async notifyAdministrators(activity: SuspiciousActivity): Promise<void> {
    try {
      if (activity.severity === 'high' || activity.severity === 'critical') {
        await notificationService.sendNotification({
          title: 'Actividad Sospechosa Detectada',
          body: `${activity.description} - Usuario: ${activity.userId}`,
          data: {
            type: 'suspicious_activity',
            activityId: activity.id,
            severity: activity.severity
          }
        });
      }
    } catch (error) {
      console.error('Error notifying administrators:', error);
    }
  }

  /**
   * Store suspicious activity
   */
  private async storeSuspiciousActivity(activity: SuspiciousActivity): Promise<void> {
    try {
      const activities = await this.getAllSuspiciousActivities();
      activities.push(activity);

      // Keep only last 1000 activities to prevent storage bloat
      const recentActivities = activities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 1000);

      await encryptionService.storeEncryptedData('suspicious_activities', recentActivities);
    } catch (error) {
      console.error('Error storing suspicious activity:', error);
    }
  }

  /**
   * Get all suspicious activities
   */
  public async getAllSuspiciousActivities(): Promise<SuspiciousActivity[]> {
    try {
      const activities = await encryptionService.getEncryptedData<SuspiciousActivity[]>('suspicious_activities');
      return activities || [];
    } catch (error) {
      console.error('Error getting suspicious activities:', error);
      return [];
    }
  }

  /**
   * Get suspicious activities for a specific user
   */
  public async getUserSuspiciousActivities(userId: string): Promise<SuspiciousActivity[]> {
    try {
      const allActivities = await this.getAllSuspiciousActivities();
      return allActivities.filter(activity => activity.userId === userId);
    } catch (error) {
      console.error('Error getting user suspicious activities:', error);
      return [];
    }
  }

  /**
   * Resolve suspicious activity
   */
  public async resolveSuspiciousActivity(
    activityId: string, 
    resolvedBy: string
  ): Promise<void> {
    try {
      const activities = await this.getAllSuspiciousActivities();
      const activityIndex = activities.findIndex(activity => activity.id === activityId);
      
      if (activityIndex !== -1) {
        activities[activityIndex].resolved = true;
        activities[activityIndex].resolvedAt = Date.now();
        activities[activityIndex].resolvedBy = resolvedBy;
        
        await encryptionService.storeEncryptedData('suspicious_activities', activities);
      }
    } catch (error) {
      console.error('Error resolving suspicious activity:', error);
    }
  }

  /**
   * Get recent activities for pattern analysis
   */
  private async getRecentActivities(
    userId: string, 
    type: string, 
    timeWindow: number
  ): Promise<any[]> {
    try {
      const activities = await encryptionService.getEncryptedData<any[]>(`user_activities_${userId}`);
      if (!activities) return [];

      const cutoff = Date.now() - timeWindow;
      return activities.filter(activity => 
        activity.type === type && activity.timestamp > cutoff
      );
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  /**
   * Get user behavior pattern
   */
  private async getUserPattern(userId: string): Promise<ActivityPattern | null> {
    try {
      return await encryptionService.getEncryptedData<ActivityPattern>(`user_pattern_${userId}`);
    } catch (error) {
      console.error('Error getting user pattern:', error);
      return null;
    }
  }

  /**
   * Update user behavior pattern
   */
  public async updateUserPattern(
    userId: string,
    loginTime: number,
    deviceId: string,
    sessionDuration: number
  ): Promise<void> {
    try {
      let pattern = await this.getUserPattern(userId);
      
      if (!pattern) {
        pattern = {
          userId,
          normalLoginTimes: [],
          normalDevices: [],
          normalLocations: [],
          averageSessionDuration: 0,
          typicalRequestFrequency: 0
        };
      }

      // Update login times (keep last 30 login hours)
      pattern.normalLoginTimes.push(new Date(loginTime).getHours());
      pattern.normalLoginTimes = pattern.normalLoginTimes.slice(-30);

      // Update devices (keep last 5 devices)
      if (!pattern.normalDevices.includes(deviceId)) {
        pattern.normalDevices.push(deviceId);
        pattern.normalDevices = pattern.normalDevices.slice(-5);
      }

      // Update average session duration
      pattern.averageSessionDuration = (pattern.averageSessionDuration + sessionDuration) / 2;

      await encryptionService.storeEncryptedData(`user_pattern_${userId}`, pattern);
    } catch (error) {
      console.error('Error updating user pattern:', error);
    }
  }

  /**
   * Clear all suspicious activities (admin function)
   */
  public async clearAllSuspiciousActivities(): Promise<void> {
    try {
      await encryptionService.removeEncryptedData('suspicious_activities');
    } catch (error) {
      console.error('Error clearing suspicious activities:', error);
    }
  }
}

export const suspiciousActivityService = SuspiciousActivityService.getInstance();