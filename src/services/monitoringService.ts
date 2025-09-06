import { AppState, AppStateStatus, NetInfo } from 'react-native';
import { loggingService } from './loggingService';
import { performanceService } from './performanceService';
import { config, isProduction } from '../config/environment';

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  timestamp: Date;
}

export interface SystemMetrics {
  memoryUsage?: any;
  networkStatus: {
    isConnected: boolean;
    type?: string;
    isInternetReachable?: boolean;
  };
  appState: AppStateStatus;
  performanceMetrics: {
    averageResponseTime: number;
    slowOperations: number;
    errorRate: number;
  };
  timestamp: Date;
}

class MonitoringService {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private systemMetrics: SystemMetrics[] = [];
  private maxMetricsHistory = 100;
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  constructor() {
    this.setupAppStateMonitoring();
    this.setupNetworkMonitoring();
  }

  private setupAppStateMonitoring(): void {
    AppState.addEventListener('change', (nextAppState) => {
      loggingService.info(`App state changed to: ${nextAppState}`);
      
      if (nextAppState === 'active') {
        this.startMonitoring();
      } else if (nextAppState === 'background') {
        this.pauseMonitoring();
      }
    });
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      loggingService.info('Network state changed', {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
      });

      if (!state.isConnected) {
        loggingService.warn('Network connection lost');
      } else if (state.isConnected && state.isInternetReachable) {
        loggingService.info('Network connection restored');
        this.runHealthChecks();
      }
    });
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    loggingService.info('Starting system monitoring');

    // Run initial health checks
    this.runHealthChecks();

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.runHealthChecks();
    }, 60000); // Every minute
  }

  pauseMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    loggingService.info('Pausing system monitoring');

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  stopMonitoring(): void {
    this.pauseMonitoring();
    this.healthChecks.clear();
    this.systemMetrics = [];
  }

  async runHealthChecks(): Promise<void> {
    const checks = [
      this.checkApiHealth(),
      this.checkDatabaseHealth(),
      this.checkFirebaseHealth(),
    ];

    const results = await Promise.allSettled(checks);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        loggingService.error(`Health check ${index} failed`, result.reason);
      }
    });
  }

  private async checkApiHealth(): Promise<void> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(`${config.API_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000,
      });

      const responseTime = performance.now() - startTime;
      const status = response.ok ? 'healthy' : 'degraded';

      this.updateHealthCheck('api', {
        service: 'api',
        status,
        responseTime,
        timestamp: new Date(),
      });

      if (!response.ok) {
        loggingService.warn(`API health check returned ${response.status}`);
      }
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      this.updateHealthCheck('api', {
        service: 'api',
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });

      loggingService.error('API health check failed', error as Error);
    }
  }

  private async checkDatabaseHealth(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Simple database connectivity check
      // In a real implementation, you would check database connectivity
      const responseTime = performance.now() - startTime;
      
      this.updateHealthCheck('database', {
        service: 'database',
        status: 'healthy',
        responseTime,
        timestamp: new Date(),
      });
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      this.updateHealthCheck('database', {
        service: 'database',
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });

      loggingService.error('Database health check failed', error as Error);
    }
  }

  private async checkFirebaseHealth(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Check Firebase connectivity
      // In a real implementation, you would check Firebase services
      const responseTime = performance.now() - startTime;
      
      this.updateHealthCheck('firebase', {
        service: 'firebase',
        status: 'healthy',
        responseTime,
        timestamp: new Date(),
      });
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      this.updateHealthCheck('firebase', {
        service: 'firebase',
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });

      loggingService.error('Firebase health check failed', error as Error);
    }
  }

  private updateHealthCheck(service: string, check: HealthCheck): void {
    this.healthChecks.set(service, check);
    
    if (check.status === 'unhealthy') {
      loggingService.error(`Service ${service} is unhealthy`, undefined, {
        service,
        responseTime: check.responseTime,
        error: check.error,
      });
    } else if (check.status === 'degraded') {
      loggingService.warn(`Service ${service} is degraded`, {
        service,
        responseTime: check.responseTime,
      });
    }
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      const networkState = await NetInfo.fetch();
      const performanceReport = performanceService.generateReport();
      
      const metrics: SystemMetrics = {
        memoryUsage: performanceService.getMemoryUsage(),
        networkStatus: {
          isConnected: networkState.isConnected || false,
          type: networkState.type,
          isInternetReachable: networkState.isInternetReachable || false,
        },
        appState: AppState.currentState,
        performanceMetrics: {
          averageResponseTime: Object.values(performanceReport.averageDurations)
            .reduce((sum, duration) => sum + duration, 0) / 
            Object.keys(performanceReport.averageDurations).length || 0,
          slowOperations: performanceReport.slowOperations.length,
          errorRate: 0, // Would be calculated from error logs
        },
        timestamp: new Date(),
      };

      this.systemMetrics.push(metrics);
      
      // Keep only recent metrics
      if (this.systemMetrics.length > this.maxMetricsHistory) {
        this.systemMetrics = this.systemMetrics.slice(-this.maxMetricsHistory);
      }

      // Log concerning metrics
      if (metrics.performanceMetrics.slowOperations > 5) {
        loggingService.warn('High number of slow operations detected', {
          slowOperations: metrics.performanceMetrics.slowOperations,
        });
      }

      if (metrics.memoryUsage && metrics.memoryUsage.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
        loggingService.warn('High memory usage detected', {
          memoryUsage: metrics.memoryUsage,
        });
      }
    } catch (error) {
      loggingService.error('Failed to collect system metrics', error as Error);
    }
  }

  getHealthStatus(): Record<string, HealthCheck> {
    const status: Record<string, HealthCheck> = {};
    
    for (const [service, check] of this.healthChecks.entries()) {
      status[service] = check;
    }
    
    return status;
  }

  getSystemMetrics(count = 10): SystemMetrics[] {
    return this.systemMetrics.slice(-count);
  }

  getOverallHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    const checks = Array.from(this.healthChecks.values());
    
    if (checks.length === 0) return 'unhealthy';
    
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;
    
    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0) return 'degraded';
    
    return 'healthy';
  }

  generateHealthReport(): {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, HealthCheck>;
    recentMetrics: SystemMetrics[];
    recommendations: string[];
  } {
    const overall = this.getOverallHealth();
    const services = this.getHealthStatus();
    const recentMetrics = this.getSystemMetrics(5);
    const recommendations: string[] = [];

    // Generate recommendations based on health status
    for (const [service, check] of Object.entries(services)) {
      if (check.status === 'unhealthy') {
        recommendations.push(`Service ${service} requires immediate attention`);
      } else if (check.status === 'degraded') {
        recommendations.push(`Service ${service} performance should be investigated`);
      }
      
      if (check.responseTime && check.responseTime > 2000) {
        recommendations.push(`Service ${service} response time is slow (${check.responseTime}ms)`);
      }
    }

    const latestMetrics = recentMetrics[recentMetrics.length - 1];
    if (latestMetrics) {
      if (!latestMetrics.networkStatus.isConnected) {
        recommendations.push('Network connectivity issues detected');
      }
      
      if (latestMetrics.performanceMetrics.slowOperations > 3) {
        recommendations.push('Multiple slow operations detected - consider performance optimization');
      }
    }

    return {
      overall,
      services,
      recentMetrics,
      recommendations,
    };
  }

  // Send monitoring data to remote service
  async sendMonitoringData(): Promise<void> {
    if (!isProduction()) return;

    try {
      const report = this.generateHealthReport();
      
      await fetch(`${config.API_BASE_URL}/api/monitoring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...report,
          appVersion: config.APP_VERSION,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      loggingService.error('Failed to send monitoring data', error as Error);
    }
  }
}

export const monitoringService = new MonitoringService();