import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class AppLogger implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        process.env.NODE_ENV === 'production'
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                return `${timestamp} [${level}] ${message}${metaStr}`;
              }),
            ),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: string, ...meta: any[]) { this.logger.info(message, ...meta); }
  error(message: string, ...meta: any[]) { this.logger.error(message, ...meta); }
  warn(message: string, ...meta: any[]) { this.logger.warn(message, ...meta); }
  debug(message: string, ...meta: any[]) { this.logger.debug(message, ...meta); }
  verbose(message: string, ...meta: any[]) { this.logger.verbose(message, ...meta); }
}
