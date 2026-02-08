'use client';

import { BookingStatus } from '@/lib/types/booking.types';
import { cn } from '@/lib/utils';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const statusConfig = {
    confirmed: {
      label: 'CONFIRMED',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    },
    pending: {
      label: 'PENDING',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    },
    cancelled: {
      label: 'CANCELLED',
      className: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400',
    },
    completed: {
      label: 'COMPLETED',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    },
    no_show: {
      label: 'NO SHOW',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
