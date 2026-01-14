import winston from 'winston'
import LokiTransport from 'winston-loki'

interface LoggerConfig {
  appName: string
  lokiHost?: string
  enableConsole?: boolean
}

class LoggerClass {
  private logger: winston.Logger | null = null
  private appName: string = 'unknown'

  init(config: LoggerConfig) {
    this.appName = config.appName

    const transports: winston.transport[] = []

    // Add Loki transport
    transports.push(
      new LokiTransport({
        host: config.lokiHost || 'http://localhost:3100',
        json: true,
        labels: { app: config.appName },
        format: winston.format.json(),
        onConnectionError: (err) => console.error(`[${config.appName}] Loki connection error:`, err),
      }),
    )

    // Optionally add console transport for development
    if (config.enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(
              ({ timestamp, level, message, ...meta }) =>
                `[${timestamp}] [${config.appName}] ${level}: ${typeof message === 'object' ? JSON.stringify(message) : message} ${
                  Object.keys(meta).length > 0 ? JSON.stringify(meta) : ''
                }`,
            ),
          ),
        }),
      )
    }

    this.logger = winston.createLogger({
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports,
    })
  }

  private getLogger(): winston.Logger {
    if (!this.logger) {
      throw new Error('Logger is not initialized. Call Logger.init() first.')
    }
    return this.logger
  }

  info(message: string | object, meta?: object) {
    if (typeof message === 'string') {
      this.getLogger().info(message, meta)
    } else {
      const { message: msg, ...data } = message as any
      this.getLogger().info({ message: msg || 'info', data, ...meta })
    }
  }

  error(message: string | object, meta?: object) {
    if (typeof message === 'string') {
      this.getLogger().error(message, meta)
    } else {
      const { message: msg, ...data } = message as any
      this.getLogger().error({ message: msg || 'error', data, ...meta })
    }
  }

  warn(message: string | object, meta?: object) {
    if (typeof message === 'string') {
      this.getLogger().warn(message, meta)
    } else {
      const { message: msg, ...data } = message as any
      this.getLogger().warn({ message: msg || 'warning', data, ...meta })
    }
  }

  debug(message: string | object, meta?: object) {
    if (typeof message === 'string') {
      this.getLogger().debug(message, meta)
    } else {
      const { message: msg, ...data } = message as any
      this.getLogger().debug({ message: msg || 'debug', data, ...meta })
    }
  }
}

// Export singleton instance
export const Logger = new LoggerClass()

// Export Log as alias for convenience
export const Log = Logger

export type { LoggerConfig }
