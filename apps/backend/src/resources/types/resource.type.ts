import { Prisma } from '@prisma/client';

/**
 * Resource with category relation
 */
export type ResourceWithCategory = Prisma.ResourceGetPayload<{
  include: { category: true };
}>;

/**
 * Resource with category and booking count
 */
export type ResourceWithDetails = Prisma.ResourceGetPayload<{
  include: {
    category: true;
    _count: {
      select: {
        bookings: true;
      };
    };
  };
}>;
