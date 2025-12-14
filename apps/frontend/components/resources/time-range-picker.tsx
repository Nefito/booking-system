'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimeRangePickerProps {
  start: string; // HH:mm format
  end: string; // HH:mm format
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  label?: string;
}

export function TimeRangePicker({
  start,
  end,
  onStartChange,
  onEndChange,
  label = 'Operating Hours',
}: TimeRangePickerProps) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label className="text-xs text-zinc-600 dark:text-zinc-400">Start</Label>
          <Input
            type="time"
            value={start}
            onChange={(e) => onStartChange(e.target.value)}
          />
        </div>
        <span className="pt-6 text-zinc-600 dark:text-zinc-400">to</span>
        <div className="flex-1">
          <Label className="text-xs text-zinc-600 dark:text-zinc-400">End</Label>
          <Input
            type="time"
            value={end}
            onChange={(e) => onEndChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

