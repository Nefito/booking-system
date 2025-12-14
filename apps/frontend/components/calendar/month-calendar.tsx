'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DayAvailabilityStatus } from '@/lib/mock-data';

interface MonthCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  dayAvailabilities: Map<string, DayAvailabilityStatus>;
  availableSlotsCount?: Map<string, number>;
  isLoading?: boolean;
  onMonthChange?: (date: Date) => void;
}

export function MonthCalendar({
  selectedDate,
  onDateSelect,
  dayAvailabilities,
  availableSlotsCount,
  isLoading = false,
  onMonthChange,
}: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Get previous month days to fill the grid
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    const days: Array<{ day: number; isCurrentMonth: boolean; year: number; month: number }> = [];

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, year, month });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true, year, month });
    }

    // Next month days to fill the grid (42 cells total for 6 weeks)
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({ day, isCurrentMonth: false, year, month });
    }

    return days;
  }, [currentMonth]);

  const today = new Date();
  const isToday = (day: number, month: number, year: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (day: number, month: number, year: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const isPast = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getDateString = (day: number, month: number, year: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getAvailabilityStatus = (
    day: number,
    month: number,
    year: number
  ): DayAvailabilityStatus => {
    const dateStr = getDateString(day, month, year);
    return dayAvailabilities.get(dateStr) || 'closed';
  };

  const getAvailabilityColor = (status: DayAvailabilityStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-900 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300';
      case 'limited':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300';
      case 'full':
        return 'bg-red-100 border-red-300 text-red-900 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300';
      case 'closed':
      default:
        return 'bg-zinc-100 border-zinc-300 text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-600';
    }
  };

  const handlePrevMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const newMonth = new Date(year, month - 1, 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleNextMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const newMonth = new Date(year, month + 1, 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleDateClick = (day: number, month: number, year: number) => {
    if (isPast(day, month, year)) return;
    const date = new Date(year, month, day);
    onDateSelect(date);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-7 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-zinc-600 dark:text-zinc-400 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map(({ day, isCurrentMonth, year, month }, index) => {
          const past = isCurrentMonth && isPast(day, month, year);
          const selected = isCurrentMonth && isSelected(day, month, year);
          const today = isCurrentMonth && isToday(day, month, year);
          const availabilityStatus = isCurrentMonth
            ? getAvailabilityStatus(day, month, year)
            : 'closed';
          const slotsCount = isCurrentMonth
            ? availableSlotsCount?.get(getDateString(day, month, year))
            : undefined;

          return (
            <button
              key={index}
              type="button"
              onClick={() => isCurrentMonth && handleDateClick(day, month, year)}
              disabled={past || !isCurrentMonth || availabilityStatus === 'closed'}
              className={cn(
                'relative aspect-square p-2 rounded-lg border-2 transition-all',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600',
                !isCurrentMonth && 'opacity-30 cursor-not-allowed',
                isCurrentMonth && !past && availabilityStatus !== 'closed' && 'cursor-pointer',
                past && 'cursor-not-allowed opacity-50',
                selected && 'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2',
                today && !selected && 'ring-2 ring-blue-500',
                getAvailabilityColor(availabilityStatus)
              )}
            >
              <div className="text-center">
                <div
                  className={cn(
                    'text-sm font-medium',
                    selected && 'font-bold',
                    today && !selected && 'text-blue-600 dark:text-blue-400'
                  )}
                >
                  {day}
                </div>
                {isCurrentMonth && slotsCount !== undefined && slotsCount > 0 && (
                  <div className="text-xs mt-1 opacity-75">
                    {slotsCount} slot{slotsCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700" />
          <span>Limited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-700" />
          <span>Full</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700" />
          <span>Closed</span>
        </div>
      </div>
    </div>
  );
}
