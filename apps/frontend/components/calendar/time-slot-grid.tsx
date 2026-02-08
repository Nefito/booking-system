'use client';

import { TimeSlot } from '@/lib/types/availability.types';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

export function TimeSlotGrid({
  slots,
  selectedSlot,
  onSlotSelect,
  isLoading = false,
}: TimeSlotGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400">No time slots available</p>
      </div>
    );
  }

  const getSlotStyles = (slot: TimeSlot) => {
    const baseStyles = 'relative p-4 rounded-lg border-2 transition-all text-left';

    switch (slot.status) {
      case 'available':
        return cn(
          baseStyles,
          'bg-green-50 border-green-300 text-green-900',
          'hover:bg-green-100 hover:border-green-400 hover:scale-105',
          'dark:bg-green-900/20 dark:border-green-700 dark:text-green-300',
          'dark:hover:bg-green-900/30 dark:hover:border-green-600',
          'cursor-pointer'
        );
      case 'booked':
        return cn(
          baseStyles,
          'bg-zinc-100 border-zinc-300 text-zinc-500',
          'line-through opacity-60 cursor-not-allowed',
          'dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-600'
        );
      case 'buffer':
        return cn(
          baseStyles,
          'bg-zinc-50 border-zinc-200 text-zinc-400',
          'cursor-not-allowed opacity-50',
          'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.05)_10px,rgba(0,0,0,0.05)_20px)]',
          'dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-600'
        );
      case 'past':
        return cn(
          baseStyles,
          'bg-zinc-100 border-zinc-300 text-zinc-400',
          'cursor-not-allowed opacity-40',
          'dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500'
        );
      case 'closed':
      default:
        return cn(
          baseStyles,
          'bg-zinc-100 border-zinc-300 text-zinc-400',
          'cursor-not-allowed opacity-50',
          'dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-600'
        );
    }
  };

  const isSelected = (slot: TimeSlot) => {
    if (!selectedSlot) return false;
    return (
      selectedSlot.start === slot.start &&
      selectedSlot.end === slot.end &&
      selectedSlot.status === slot.status
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {slots.map((slot, index) => {
        const selected = isSelected(slot);
        const canSelect = slot.status === 'available';

        return (
          <button
            key={`${slot.start}-${slot.end}-${index}`}
            type="button"
            onClick={() => canSelect && onSlotSelect(slot)}
            disabled={!canSelect}
            className={cn(
              getSlotStyles(slot),
              selected && 'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 scale-105'
            )}
          >
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-sm">
                {formatTime(slot.start)} - {formatTime(slot.end)}
              </div>
              {slot.price !== undefined && slot.price > 0 && (
                <div className="text-xs opacity-75">${slot.price}</div>
              )}
              {slot.status === 'available' && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">Available</div>
              )}
              {slot.status === 'booked' && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">Booked</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
