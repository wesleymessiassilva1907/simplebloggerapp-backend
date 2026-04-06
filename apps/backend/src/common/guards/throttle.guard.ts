import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(
    private readonly limit: number = 10,
    private readonly windowMs: number = 60000,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const now = Date.now();

    const record = requestCounts.get(ip);
    if (!record || now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    record.count++;
    if (record.count > this.limit) {
      throw new HttpException('Too many requests. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
