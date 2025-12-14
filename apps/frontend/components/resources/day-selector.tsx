'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DaySelectorProps {
  selectedDays: number[]; // 0-6, Sunday-Saturday
  onChange: (days: number[]) => void;
  label?: string;
}

const days = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function DaySelector({
  selectedDays,
  onChange,
  label = 'Available Days',
}: DaySelectorProps) {
  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day].sort());
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        {days.map((day) => (
          <Button
            key={day.value}
            type="button"
            variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleDay(day.value)}
            className={cn(
              'flex-1 transition-all duration-200',
              selectedDays.includes(day.value)
                ? 'bg-zinc-900 dark:bg-zinc-50 shadow-sm'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            {day.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
