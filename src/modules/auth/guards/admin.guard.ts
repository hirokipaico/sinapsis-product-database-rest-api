import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enum/role.enum';

/**
 * A guard that restricts access to routes based on the user's role.
 * It checks if the user has the required 'admin' role to access the route.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Method to determine if a user is allowed to access a route.
   * @param context The execution context.
   * @returns {boolean | Promise<boolean> | Observable<boolean>}
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      // If there are no required roles specified for the route, allow access.
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRoles = request.user?.roles || [];

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
