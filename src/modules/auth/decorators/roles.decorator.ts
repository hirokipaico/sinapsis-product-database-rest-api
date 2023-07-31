import { SetMetadata } from '@nestjs/common';
import { Role } from '../enum/role.enum';

/**
 * Custom decorator to assign roles to a route handler.
 * @param {...Role[]} roles - Array of roles allowed to access the route.
 */
export const ROLES_KEY = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
