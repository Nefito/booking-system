'use client';

import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DurationPickerProps {
  value: number; // in minutes
  onChange: (value: number) => void;
  label?: string;
}

const durationOptions = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' },
  { value: 1440, label: '1 day' },
];

export function DurationPicker({ value, onChange, label = 'Duration' }: DurationPickerProps) {
  const safeValue = value ?? 60; // Default to 60 minutes if undefined
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={safeValue.toString()} onChange={(e) => onChange(Number(e.target.value))}>
        {durationOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
