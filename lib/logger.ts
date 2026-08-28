// lib/logger.ts - Logging Utility

const logLevels = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

type LogLevel = keyof typeof logLevels;

interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

const getColorByLevel = (level: LogLevel): string => {
  const colors: Record<LogLevel, string> = {
    trace: 'gray',
    debug: 'cyan',
    info: 'green',
    warn: 'yellow',
    error: 'red',
    fatal: 'red',
  };
  return colors[level];
};

class Logger {
  private readonly level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private formatLog(data: LogData): string {
    const { level, message, timestamp, ...meta } = data;
    const color = getColorByLevel(level);

    let output = `${timestamp} [${level.toUpperCase().padEnd(7)}] ${message}`;

    if (Object.keys(meta).length > 0) {
      output += ` - ${JSON.stringify(meta)}`;
    }

    return output;
  }

  private log(level: LogLevel, message: string, ...meta: any[]): void {
    const currentLevelValue = logLevels[level];
    const minLevelValue = logLevels[this.level];

    if (currentLevelValue < minLevelValue) {
      return;
    }

    const data: LogData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta.length > 0 ? meta[0] : {},
    };

    const formatted = this.formatLog(data);

    if (level === 'error' || level === 'fatal') {
      console.error(formatted);
    } else {
      console.log(formatted);
    }
  }

  trace(message: string, ...meta: any[]): void {
    this.log('trace', message, ...meta);
  }

  debug(message: string, ...meta: any[]): void {
    this.log('debug', message, ...meta);
  }

  info(message: string, ...meta: any[]): void {
    this.log('info', message, ...meta);
  }

  warn(message: string, ...meta: any[]): void {
    this.log('warn', message, ...meta);
  }

  error(message: string, ...meta: any[]): void {
    this.log('error', message, ...meta);
  }

  fatal(message: string, ...meta: any[]): void {
    this.log('fatal', message, ...meta);
    process.exit(1);
  }
}

export const logger = new Logger((process.env.LOG_LEVEL as LogLevel) || 'info');

// Helper functions
export async function logError(error: Error, context: Record<string, any> = {}): Promise<void> {
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    name: error.name,
    ...context,
  });
}

export async function logRequest(req: any, context: Record<string, any> = {}): Promise<void> {
  logger.info(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    ...context,
  });
}

export async function logUserAction(userId: string, action: string, details: Record<string, any> = {}): Promise<void> {
  logger.info(`User action: ${action}`, {
    userId,
    action,
    ...details,
  });
}
