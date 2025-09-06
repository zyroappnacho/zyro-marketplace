import { InteractionManager } from 'react-native';

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceService {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: Array<(metric: PerformanceMetric) => void> = [];

  // Start measuring a performance metric
  startMeasure(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };
    
    this.metrics.set(name, metric);
  }

  // End measuring and calculate duration
  endMeasure(name: string): PerformanceMetric | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Notify observers
    this.observers.forEach(observer => observer(metric));

    // Log slow operations
    if (metric.duration > 1000) { // > 1 second
      console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
    }

    return metric;
  }

  // Measure a function execution
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startMeasure(name, metadata);
    
    try {
      const result = await fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  // Measure synchronous function execution
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startMeasure(name, metadata);
    
    try {
      const result = fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  // Get all metrics
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  // Get metrics by name pattern
  getMetricsByPattern(pattern: string): PerformanceMetric[] {
    return this.getMetrics().filter(m => m.name.includes(pattern));
  }

  // Get average duration for a metric name
  getAverageDuration(name: string): number {
    const metrics = this.getMetrics().filter(m => m.name === name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / metrics.length;
  }

  // Clear old metrics to prevent memory leaks
  clearOldMetrics(maxAge: number = 300000): void { // 5 minutes default
    const cutoff = performance.now() - maxAge;
    
    for (const [key, metric] of this.metrics.entries()) {
      if (metric.startTime < cutoff) {
        this.metrics.delete(key);
      }
    }
  }

  // Subscribe to performance metrics
  subscribe(observer: (metric: PerformanceMetric) => void): () => void {
    this.observers.push(observer);
    
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  // Defer execution until after interactions
  runAfterInteractions<T>(fn: () => T): Promise<T> {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        resolve(fn());
      });
    });
  }

  // Batch operations for better performance
  batchOperations<T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 5
  ): Promise<T[]> {
    return new Promise(async (resolve, reject) => {
      const results: T[] = [];
      
      try {
        for (let i = 0; i < operations.length; i += batchSize) {
          const batch = operations.slice(i, i + batchSize);
          const batchResults = await Promise.all(batch.map(op => op()));
          results.push(...batchResults);
          
          // Allow other operations to run between batches
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        resolve(results);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Memory usage monitoring
  getMemoryUsage(): any {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  // Generate performance report
  generateReport(): {
    totalMetrics: number;
    slowOperations: PerformanceMetric[];
    averageDurations: Record<string, number>;
    memoryUsage: any;
  } {
    const metrics = this.getMetrics();
    const slowOperations = metrics.filter(m => (m.duration || 0) > 1000);
    
    const metricNames = [...new Set(metrics.map(m => m.name))];
    const averageDurations = metricNames.reduce((acc, name) => {
      acc[name] = this.getAverageDuration(name);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMetrics: metrics.length,
      slowOperations,
      averageDurations,
      memoryUsage: this.getMemoryUsage(),
    };
  }
}

export const performanceService = new PerformanceService();

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const measureRender = (renderName: string) => {
    performanceService.startMeasure(`${componentName}_${renderName}`);
    
    return () => {
      performanceService.endMeasure(`${componentName}_${renderName}`);
    };
  };

  return { measureRender };
};