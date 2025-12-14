'use client';

import { Resource, TimeSlot } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { TimeSlotGrid } from '@/components/calendar/time-slot-grid';

interface BookingConflictModalProps {
  isOpen: boolean;
  resource: Resource;
  selectedDate: Date;
  selectedSlot: TimeSlot | null;
  alternativeSlots: TimeSlot[];
  onSelectAlternative: (slot: TimeSlot) => void;
  onTryAgain: () => void;
  onClose: () => void;
}

export function BookingConflictModal({
  isOpen,
  resource,
  selectedDate,
  selectedSlot,
  alternativeSlots,
  onSelectAlternative,
  onTryAgain,
  onClose,
}: BookingConflictModalProps) {
  if (!isOpen) return null;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-2">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <CardTitle>Time Slot No Longer Available</CardTitle>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                This slot was just booked by someone else
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              The time slot you selected ({format(selectedDate, 'MMMM d, yyyy')}
              {selectedSlot && ` at ${formatTime(selectedSlot.start)}`}) is no longer available.
              Don&apos;t worry, we have alternative options for you!
            </p>
          </div>

          {alternativeSlots.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available Alternative Times
              </h3>
              <TimeSlotGrid
                slots={alternativeSlots}
                selectedSlot={null}
                onSlotSelect={onSelectAlternative}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                No alternative slots available for this date
              </p>
              <Button variant="outline" onClick={onClose}>
                Select a Different Date
              </Button>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            {alternativeSlots.length > 0 && (
              <Button onClick={onTryAgain} className="flex-1">
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
