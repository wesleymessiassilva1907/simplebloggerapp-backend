import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap(async () => {
          try {
            const user = request.user;
            if (user?.tenantId) {
              await this.prisma.auditLog.create({
                data: {
                  tenantId: user.tenantId,
                  userId: user.sub,
                  action: method,
                  entity: context.getClass().name,
                  entityId: request.params?.id || null,
                  metadata: {
                    path: request.path,
                    body: request.body,
                  },
                },
              });
            }
          } catch (error) {
            console.error('Audit log failed:', error);
          }
        }),
      );
    }

    return next.handle();
  }
}
