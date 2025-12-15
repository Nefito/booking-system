'use client';

import { useState, useMemo } from 'react';
import { useResources } from '@/contexts/resources-context';
import { BookingCard } from '@/components/booking/booking-card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavigationMenu } from '@/components/navigation-menu';

type BookingTab = 'upcoming' | 'past' | 'cancelled';

export default function MyBookingsPage() {
  const router = useRouter();
  const { bookings, getResource } = useResources();
  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'resource' | 'amount'>(
    'date-asc'
  );

  // Filter bookings by tab
  const filteredByTab = useMemo(() => {
    const now = new Date();
    return bookings.filter((booking) => {
      const startDate = new Date(booking.startTime);
      const isPast = startDate < now;

      switch (activeTab) {
        case 'upcoming':
          return !isPast && booking.status !== 'cancelled';
        case 'past':
          return isPast && booking.status !== 'cancelled';
        case 'cancelled':
          return booking.status === 'cancelled';
        default:
          return true;
      }
    });
  }, [bookings, activeTab]);

  // Apply search and filters
  const filteredBookings = useMemo(() => {
    let filtered = filteredByTab;

    // Search by confirmation code or resource name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.confirmationCode?.toLowerCase().includes(query) ||
          booking.resourceName.toLowerCase().includes(query)
      );
    }

    // Filter by resource
    if (resourceFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.resourceId === resourceFilter);
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter((booking) => {
        const bookingDate = format(new Date(booking.startTime), 'yyyy-MM-dd');
        return bookingDate === dateFilter;
      });
    }

    // Sort based on selected sort option
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        case 'date-desc':
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        case 'resource':
          return a.resourceName.localeCompare(b.resourceName);
        case 'amount':
          return b.amount - a.amount;
        default:
          return activeTab === 'upcoming'
            ? new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            : new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      }
    });

    return filtered;
  }, [filteredByTab, searchQuery, resourceFilter, dateFilter, activeTab, sortBy]);

  // Get unique resources for filter
  const uniqueResources = useMemo(() => {
    const resourceIds = new Set(bookings.map((b) => b.resourceId));
    return Array.from(resourceIds)
      .map((id) => {
        const resource = getResource(id);
        return resource ? { id, name: resource.name } : null;
      })
      .filter((r): r is { id: string; name: string } => r !== null);
  }, [bookings, getResource]);

  const handleView = (id: string) => {
    router.push(`/bookings/${id}`);
  };

  const handleCancel = (id: string) => {
    router.push(`/bookings/${id}?action=cancel`);
  };

  const handleReschedule = (id: string) => {
    router.push(`/bookings/${id}?action=reschedule`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">
                My Bookings
              </h1>
              <p className="text-lg text-zinc-700 dark:text-zinc-400">
                View and manage your bookings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NavigationMenu />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800">
          {(['upcoming', 'past', 'cancelled'] as BookingTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                ${
                  activeTab === tab
                    ? 'border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <Input
              placeholder="Search by confirmation code or resource name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="all">All Resources</option>
              {uniqueResources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-48"
              placeholder="Filter by date"
            />
            <Select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'date-asc' | 'date-desc' | 'resource' | 'amount')
              }
              className="w-full sm:w-48"
            >
              <option value="date-asc">Sort: Date (Earliest)</option>
              <option value="date-desc">Sort: Date (Latest)</option>
              <option value="resource">Sort: Resource Name</option>
              <option value="amount">Sort: Amount</option>
            </Select>
            {(searchQuery || resourceFilter !== 'all' || dateFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setResourceFilter('all');
                  setDateFilter('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        {filteredBookings.length === 0 ? (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-6 mb-4">
                <Calendar className="h-12 w-12 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
                No {activeTab} bookings found
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-400 max-w-md mb-6">
                {activeTab === 'upcoming'
                  ? "You don't have any upcoming bookings. Start by booking a resource!"
                  : activeTab === 'past'
                    ? "You don't have any past bookings yet."
                    : "You haven't cancelled any bookings."}
              </p>
              {activeTab === 'upcoming' && (
                <Button onClick={() => router.push('/resources')}>Browse Resources</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onView={handleView}
                onCancel={handleCancel}
                onReschedule={handleReschedule}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
