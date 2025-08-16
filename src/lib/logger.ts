type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  showTimestamp: boolean
  showLevel: boolean
}

class Logger {
  private config: LoggerConfig

  constructor() {
    this.config = {
      enabled: process.env.ENABLE_CONSOLE_LOG === 'true',
      level: (process.env.LOG_LEVEL as LogLevel) || 'info',
      showTimestamp: process.env.LOG_SHOW_TIMESTAMP !== 'false',
      showLevel: process.env.LOG_SHOW_LEVEL !== 'false'
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }
    
    return levels[level] >= levels[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): [string, ...unknown[]] {
    let prefix = ''
    
    if (this.config.showTimestamp) {
      prefix += `[${new Date().toISOString()}]`
    }
    
    if (this.config.showLevel) {
      prefix += `[${level.toUpperCase()}]`
    }
    
    const formattedMessage = prefix ? `${prefix} ${message}` : message
    return [formattedMessage, ...args]
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(...this.formatMessage('debug', message, ...args))
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(...this.formatMessage('info', message, ...args))
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage('warn', message, ...args))
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(...this.formatMessage('error', message, ...args))
    }
  }

  log(message: string, ...args: unknown[]): void {
    this.info(message, ...args)
  }

  group(label: string): void {
    if (this.config.enabled) {
      console.group(label)
    }
  }

  groupEnd(): void {
    if (this.config.enabled) {
      console.groupEnd()
    }
  }

  table(data: unknown): void {
    if (this.config.enabled && this.shouldLog('info')) {
      console.table(data)
    }
  }

  time(label: string): void {
    if (this.config.enabled && this.shouldLog('debug')) {
      console.time(label)
    }
  }

  timeEnd(label: string): void {
    if (this.config.enabled && this.shouldLog('debug')) {
      console.timeEnd(label)
    }
  }
}

export const logger = new Logger()

export const { debug, info, warn, error, log, group, groupEnd, table, time, timeEnd } = logger

export default logger