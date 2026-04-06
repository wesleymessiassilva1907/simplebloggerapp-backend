import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const user = request.user;

    if (!user?.tenantId || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.sub,
              action: actionMap[method] || method,
              entity: context.getClass().name.replace('Controller', ''),
              entityId: request.params?.id || responseData?.id || responseData?.data?.id || null,
              metadata: {
                path: request.path,
                method,
                params: request.params,
                query: request.query,
                ip: request.ip,
              },
            },
          });
        } catch (error) {
          console.error('Audit log failed:', error.message);
        }
      }),
    );
  }
}
