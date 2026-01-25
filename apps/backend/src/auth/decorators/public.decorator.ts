import { SetMetadata } from '@nestjs/common';

// Key for storing metadata
// WHY: Need a unique key to identify this metadata
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public (no authentication required)
 *
 * USAGE: @Public()
 *
 * HOW IT WORKS:
 * - SetMetadata stores metadata on the route
 * - Guard reads this metadata using Reflector
 * - If IS_PUBLIC_KEY is true, skip authentication
 *
 * WHY: Some routes (login, register) shouldn't require auth
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
