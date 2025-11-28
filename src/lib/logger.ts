
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class LoggerService {
  private isDev = (import.meta as any).env?.DEV ?? false;

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (error instanceof Error) {
      entry.error = error;
      // Em produção, aqui enviaríamos para Sentry/Datadog
    }

    if (this.isDev) {
      const style = level === 'error' ? 'color: red' : level === 'warn' ? 'color: orange' : 'color: blue';
      console.groupCollapsed(`%c[${level.toUpperCase()}] ${message}`, style);
      if (context) console.log('Context:', context);
      if (error) console.error(error);
      console.groupEnd();
    } else {
      // Structured logging for production stdout
      console.log(JSON.stringify(entry));
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: unknown, context?: Record<string, any>) {
    this.log('error', message, context, error);
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDev) {
      this.log('debug', message, context);
    }
  }
}

export const logger = new LoggerService();