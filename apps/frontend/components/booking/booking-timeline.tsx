'use client';

import { BookingTimelineEvent } from '@/lib/mock-data';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Clock, Edit, Calendar } from 'lucide-react';

interface BookingTimelineProps {
  events: BookingTimelineEvent[];
}

export function BookingTimeline({ events }: BookingTimelineProps) {
  const getIcon = (action: BookingTimelineEvent['action']) => {
    switch (action) {
      case 'created':
        return <Calendar className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'modified':
        return <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'no_show':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getLabel = (action: BookingTimelineEvent['action']) => {
    switch (action) {
      case 'created':
        return 'Booking Created';
      case 'confirmed':
        return 'Booking Confirmed';
      case 'modified':
        return 'Booking Modified';
      case 'cancelled':
        return 'Booking Cancelled';
      case 'completed':
        return 'Booking Completed';
      case 'no_show':
        return 'No Show';
      default:
        return action;
    }
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {getIcon(event.action)}
            </div>
            {index < sortedEvents.length - 1 && (
              <div className="w-0.5 h-full bg-zinc-200 dark:bg-zinc-700 mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {getLabel(event.action)}
              </span>
              {event.actor && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  by{' '}
                  {event.actor === 'customer'
                    ? 'You'
                    : event.actor === 'admin'
                      ? 'Admin'
                      : 'System'}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
            </p>
            {event.notes && (
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1 italic">{event.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
