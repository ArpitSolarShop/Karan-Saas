import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * Decorate a controller or route handler with @Public() to skip JWT auth.
 * Example: @Public() on the login route.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
