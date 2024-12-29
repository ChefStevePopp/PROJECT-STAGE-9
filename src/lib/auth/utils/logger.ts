// src/lib/auth/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private readonly logs: LogMessage[] = [];
  private level: LogLevel = 'info';

  setLevel(level: LogLevel) {
    this.level = level;
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  private log(level: LogLevel, message: string, data?: any) {
    const logMessage: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    this.logs.push(logMessage);

    // Only log if level is sufficient
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    if (levels.indexOf(level) >= levels.indexOf(this.level)) {
      console[level](message, data);
    }
  }
}

export const logger = new Logger();
