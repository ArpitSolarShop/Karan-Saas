import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/**
 * Decorate a controller or route handler to restrict access by role.
 * @example @Roles('ADMIN', 'MANAGER')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
