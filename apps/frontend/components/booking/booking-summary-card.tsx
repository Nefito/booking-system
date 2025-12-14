'use client';

import { Resource, TimeSlot } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { CategoryBadge } from '@/components/resources/category-badge';

interface BookingSummaryCardProps {
  resource: Resource;
  selectedDate: Date;
  selectedSlot: TimeSlot;
  onChange?: () => void;
}

export function BookingSummaryCard({
  resource,
  selectedDate,
  selectedSlot,
  onChange,
}: BookingSummaryCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = endMinutes - startMinutes;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-48 h-48 bg-zinc-200 dark:bg-zinc-800">
            <Image
              src={resource.thumbnail}
              alt={resource.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 192px"
            />
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <CategoryBadge category={resource.category} className="mb-2" />
                <h3 className="text-xl font-semibold mb-1">{resource.name}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {resource.description}
                </p>
              </div>
              {onChange && (
                <button
                  onClick={onChange}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Change
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-600 dark:text-zinc-400">Date:</span>
                <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-600 dark:text-zinc-400">Time:</span>
                <span className="font-medium">
                  {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-600 dark:text-zinc-400">Duration:</span>
                <span className="font-medium">
                  {calculateDuration(selectedSlot.start, selectedSlot.end)}
                </span>
              </div>
              {selectedSlot.price !== undefined && selectedSlot.price > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">Price:</span>
                  <span className="font-semibold text-lg">${selectedSlot.price}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
