'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Booking } from '@/lib/types/booking.types';
import { Card, CardContent } from '@/components/ui/card';
import { BookingStatusBadge } from './booking-status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Calendar, Clock, Eye, X, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
  onView?: (id: string) => void;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

export function BookingCard({
  booking,
  showActions = true,
  onCancel,
  onReschedule,
}: BookingCardProps) {
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // minutes

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="overflow-visible transition-all duration-200 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        {booking.resourceThumbnail && (
          <div className="relative h-32 sm:h-auto sm:w-32 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
            <Image
              src={booking.resourceThumbnail}
              alt={booking.resourceName}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        )}

        {/* Content */}
        <CardContent className="flex-1 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
                  {booking.resourceName}
                </h3>
                <BookingStatusBadge status={booking.status} />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                Confirmation:{' '}
                <span className="font-mono font-semibold">{booking.confirmationCode}</span>
              </p>
            </div>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/bookings/${booking.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  {booking.status === 'confirmed' && (
                    <>
                      <DropdownMenuItem
                        onClick={() => onReschedule?.(booking.id)}
                        disabled={!onReschedule}
                      >
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onCancel?.(booking.id)}
                        disabled={!onCancel}
                        className="text-red-600 dark:text-red-400"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span>{format(startDate, 'EEEE, MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Clock className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span>
                {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')} ({Math.round(duration)}{' '}
                min)
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <span className="h-4 w-4 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                $
              </span>
              <span className="font-semibold">{formatCurrency(booking.amount)}</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
