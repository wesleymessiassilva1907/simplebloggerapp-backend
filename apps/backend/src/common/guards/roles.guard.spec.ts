import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext => ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as any);

  it('should allow if no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ roles: ['tenant_admin'] });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow if user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['tenant_admin']);
    const context = createMockContext({ roles: ['tenant_admin'] });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny if user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['super_admin']);
    const context = createMockContext({ roles: ['tenant_admin'] });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should deny if user has no roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['tenant_admin']);
    const context = createMockContext({});

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
