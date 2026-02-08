'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { api } from '@/lib/api';
import { convertBackendToFrontend } from '@/lib/utils/resource-converter';
import { getMonthAvailability, getDayAvailability } from '@/lib/utils/availability-utils';
import { TimeSlot } from '@/lib/types/availability.types';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import { TimeSlotGrid } from '@/components/calendar/time-slot-grid';
import { SlotSummary } from '@/components/calendar/slot-summary';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryBadge } from '@/components/resources/category-badge';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavigationMenu } from '@/components/navigation-menu';
import { useResources } from '@/contexts/resources-context';
import { ResourceCardSkeleton } from '@/components/resources/resource-card-skeleton';

export default function ResourceBookingPage() {
  const params = useParams();
  const router = useRouter();
  const resourceSlug = params.id as string; // This is actually a slug now
  const { getBookings } = useResources();

  // Fetch resource from API by slug
  const {
    data: backendResource,
    isLoading: resourceLoading,
    error: resourceError,
  } = useQuery({
    queryKey: ['resource', resourceSlug],
    queryFn: async () => {
      return api.resources.getBySlug(resourceSlug);
    },
    enabled: !!resourceSlug,
    staleTime: 30 * 1000, // 30 seconds
  });

  const resource = backendResource ? convertBackendToFrontend(backendResource) : null;

  // Memoize bookings to prevent unnecessary recalculations
  const bookings = useMemo(() => {
    return resource ? getBookings(resource.id) : []; // Use ID for bookings lookup
  }, [resource, getBookings]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const isLoading = resourceLoading;

  // Get month availability
  const monthAvailability = useMemo(() => {
    if (!resource) return [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return getMonthAvailability(year, month, resource, bookings);
  }, [resource, currentMonth, bookings]);

  // Create maps for calendar
  const dayAvailabilities = useMemo(() => {
    const map = new Map<string, 'available' | 'limited' | 'full' | 'closed'>();
    monthAvailability.forEach((day) => {
      map.set(day.date, day.status);
    });
    return map;
  }, [monthAvailability]);

  const availableSlotsCount = useMemo(() => {
    const map = new Map<string, number>();
    monthAvailability.forEach((day) => {
      map.set(day.date, day.availableSlots);
    });
    return map;
  }, [monthAvailability]);

  // Get slots for selected date
  const daySlots = useMemo(() => {
    if (!selectedDate || !resource) return [];
    // Format date as YYYY-MM-DD in local timezone
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const availability = getDayAvailability(dateStr, resource, bookings);
    return availability.slots;
  }, [selectedDate, resource, bookings]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset selected slot when date changes
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
    }
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  const handleBook = () => {
    if (!selectedDate || !selectedSlot || !resource) return;

    // Format date as YYYY-MM-DD
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Navigate to booking form with query params (using slug)
    router.push(
      `/book/${resource.slug}?date=${dateStr}&start=${selectedSlot.start}&end=${selectedSlot.end}`
    );
  };

  if (resourceLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <ResourceCardSkeleton />
        </div>
      </div>
    );
  }

  if (resourceError || !resource) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {resourceError instanceof Error ? resourceError.message : 'Resource not found'}
            </p>
            <Link href="/resources">
              <Button variant="outline">Back to Resources</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/resources">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NavigationMenu />
          </div>
        </div>

        {/* Resource Header */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-64 h-48 md:h-64 bg-zinc-200 dark:bg-zinc-800">
                {resource.thumbnail ? (
                  <Image
                    src={resource.thumbnail}
                    alt={resource.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 256px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryBadge category={resource.category} />
                      <Badge variant={resource.status === 'active' ? 'success' : 'secondary'}>
                        {resource.status}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{resource.name}</h1>
                    <p className="text-zinc-600 dark:text-zinc-400">{resource.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400">Duration</p>
                    <p className="font-medium">{resource.duration} min</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400">Capacity</p>
                    <p className="font-medium">{resource.capacity} people</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400">Price</p>
                    <p className="font-medium">${resource.price}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400">Operating Hours</p>
                    <p className="font-medium">
                      {resource.operatingHours.start} - {resource.operatingHours.end}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar and Time Slots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Calendar Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Select a Date</h2>
              <MonthCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                dayAvailabilities={dayAvailabilities}
                availableSlotsCount={availableSlotsCount}
                isLoading={isLoading}
                onMonthChange={handleMonthChange}
              />
            </CardContent>
          </Card>

          {/* Time Slots Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedDate
                  ? `Available Time Slots - ${selectedDate.toLocaleDateString()}`
                  : 'Select a Date'}
              </h2>
              {!selectedDate ? (
                <div className="text-center py-12">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Please select a date from the calendar to view available time slots
                  </p>
                </div>
              ) : (
                <TimeSlotGrid
                  slots={daySlots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                  isLoading={isLoading}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Slot Summary - Sticky at bottom */}
        <SlotSummary
          resource={resource}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onBook={handleBook}
        />
      </div>
    </div>
  );
}
