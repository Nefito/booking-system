import { User, Role } from '@prisma/client';

/**
 * User type with role relation included
 *
 * WHY THIS TYPE:
 * - Prisma's User type doesn't include relations by default
 * - When we query with include: { role: true }, we get User + Role
 * - This type represents that structure
 *
 * HOW IT WORKS:
 * - User is the base Prisma type (from @prisma/client)
 * - We extend it to include the role relation
 * - This matches what getUserById() returns in AuthService
 */
export type UserWithRole = User & {
  role: Role | null;
};

/**
 * Alternative: If you want to exclude sensitive fields
 *
 * WHY: Sometimes you want a "safe" user type without password
 *
 * USAGE: For API responses, never include password
 */
export type UserSafe = Omit<UserWithRole, 'password'>;

/**
 * User profile response type
 *
 * Matches what getProfile() returns
 */
export type UserProfileResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    name: string;
  } | null;
};
