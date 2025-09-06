import { config, isProduction, isDevelopment } from '../config/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    const configLevel = levels[config.LOG_LEVEL];
    const messageLevel = levels[level];

    return messageLevel >= configLevel;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error,
    userId?: string
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      metadata,
      error,
      userId,
      sessionId: this.sessionId,
    };
  }

  private addToBuffer(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const session = entry.sessionId.slice(-8);
    const user = entry.userId ? ` [${entry.userId}]` : '';
    
    let message = `[${timestamp}] ${level} [${session}]${user} ${entry.message}`;
    
    if (entry.metadata) {
      message += ` | ${JSON.stringify(entry.metadata)}`;
    }
    
    if (entry.error) {
      message += ` | Error: ${entry.error.message}`;
      if (entry.error.stack && isDevelopment()) {
        message += `\nStack: ${entry.error.stack}`;
      }
    }
    
    return message;
  }

  private consoleLog(entry: LogEntry): void {
    const message = this.formatMessage(entry);
    
    switch (entry.level) {
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
        console.error(message);
        break;
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!isProduction() || !config.SENTRY_DSN) {
      return;
    }

    try {
      // In a real implementation, you would send to your logging service
      // For now, we'll just simulate the API call
      await fetch(`${config.API_BASE_URL}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Don't log errors from the logging service to avoid infinite loops
      console.error('Failed to send log to remote service:', error);
    }
  }

  debug(message: string, metadata?: Record<string, any>, userId?: string): void {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.createLogEntry('debug', message, metadata, undefined, userId);
    this.addToBuffer(entry);
    this.consoleLog(entry);
  }

  info(message: string, metadata?: Record<string, any>, userId?: string): void {
    if (!this.shouldLog('info')) return;
    
    const entry = this.createLogEntry('info', message, metadata, undefined, userId);
    this.addToBuffer(entry);
    this.consoleLog(entry);
  }

  warn(message: string, metadata?: Record<string, any>, userId?: string): void {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.createLogEntry('warn', message, metadata, undefined, userId);
    this.addToBuffer(entry);
    this.consoleLog(entry);
    
    // Send warnings to remote in production
    if (isProduction()) {
      this.sendToRemote(entry);
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>, userId?: string): void {
    if (!this.shouldLog('error')) return;
    
    const entry = this.createLogEntry('error', message, metadata, error, userId);
    this.addToBuffer(entry);
    this.consoleLog(entry);
    
    // Always send errors to remote
    this.sendToRemote(entry);
  }

  // Get recent logs for debugging
  getRecentLogs(count = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel, count = 100): LogEntry[] {
    return this.logs
      .filter(log => log.level === level)
      .slice(-count);
  }

  // Clear logs buffer
  clearLogs(): void {
    this.logs = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return this.logs
      .map(entry => this.formatMessage(entry))
      .join('\n');
  }

  // Performance logging
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    const level = duration > 1000 ? 'warn' : 'info';
    const message = `Performance: ${operation} took ${duration.toFixed(2)}ms`;
    
    if (level === 'warn') {
      this.warn(message, { ...metadata, duration, operation });
    } else {
      this.info(message, { ...metadata, duration, operation });
    }
  }

  // User action logging
  logUserAction(action: string, userId: string, metadata?: Record<string, any>): void {
    this.info(`User action: ${action}`, metadata, userId);
  }

  // API call logging
  logApiCall(
    method: string,
    url: string,
    status: number,
    duration: number,
    userId?: string
  ): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    const message = `API ${method} ${url} - ${status} (${duration}ms)`;
    
    const metadata = {
      method,
      url,
      status,
      duration,
      type: 'api_call',
    };

    switch (level) {
      case 'error':
        this.error(message, undefined, metadata, userId);
        break;
      case 'warn':
        this.warn(message, metadata, userId);
        break;
      default:
        this.info(message, metadata, userId);
    }
  }
}

export const loggingService = new LoggingService();

// Global error handler
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  originalConsoleError(...args);
  
  const message = args.map(arg => 
    typeof arg === 'string' ? arg : JSON.stringify(arg)
  ).join(' ');
  
  loggingService.error('Console error', new Error(message));
};

// Unhandled promise rejection handler
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    loggingService.error(
      'Unhandled promise rejection',
      event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    );
  });
}