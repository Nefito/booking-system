'use client';

import { Resource, TimeSlot } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface SlotSummaryProps {
  resource: Resource;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onBook: () => void;
}

export function SlotSummary({ resource, selectedDate, selectedSlot, onBook }: SlotSummaryProps) {
  if (!selectedDate || !selectedSlot || selectedSlot.status !== 'available') {
    return null;
  }

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
    <Card className="sticky bottom-0 z-10 border-t-2 border-zinc-200 dark:border-zinc-800 shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg">{resource.name}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{calculateDuration(selectedSlot.start, selectedSlot.end)}</span>
              </div>
              {selectedSlot.price !== undefined && selectedSlot.price > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">${selectedSlot.price}</span>
                </div>
              )}
            </div>
          </div>
          <Button onClick={onBook} size="lg" className="w-full sm:w-auto">
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
