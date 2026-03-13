export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Logger {
  private static log(level: LogLevel, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
    console.log(JSON.stringify(logEntry));
  }

  public static info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  public static warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  public static error(message: string, data?: any) {
    this.log(LogLevel.ERROR, message, data);
  }
}
