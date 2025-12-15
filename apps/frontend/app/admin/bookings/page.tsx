'use client';

import { useState, useMemo } from 'react';
import { useResources } from '@/contexts/resources-context';
import { BookingStatus } from '@/lib/mock-data';
import { BookingStatusBadge } from '@/components/booking/booking-status-badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  X,
  CalendarClock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { RescheduleModal } from '@/components/booking/reschedule-modal';

type StatusFilter = BookingStatus | 'all';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { bookings, getResource, updateBookingStatus, rescheduleBooking } = useResources();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.confirmationCode?.toLowerCase().includes(query) ||
          booking.customerName.toLowerCase().includes(query) ||
          booking.customerEmail.toLowerCase().includes(query) ||
          booking.resourceName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Resource filter
    if (resourceFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.resourceId === resourceFilter);
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((booking) => new Date(booking.startTime) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((booking) => new Date(booking.startTime) <= toDate);
    }

    // Sort based on selected column and direction
    if (sortColumn) {
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortColumn) {
          case 'confirmation':
            comparison = (a.confirmationCode || '').localeCompare(b.confirmationCode || '');
            break;
          case 'resource':
            comparison = a.resourceName.localeCompare(b.resourceName);
            break;
          case 'customer':
            comparison = a.customerName.localeCompare(b.customerName);
            break;
          case 'date':
            comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          case 'amount':
            comparison = a.amount - b.amount;
            break;
          default:
            // Default to date descending (newest first)
            comparison = new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    } else {
      // Default sort by start time descending (newest first)
      filtered.sort((a, b) => {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      });
    }

    return filtered;
  }, [
    bookings,
    searchQuery,
    statusFilter,
    resourceFilter,
    dateFrom,
    dateTo,
    sortColumn,
    sortDirection,
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSelectAll = () => {
    if (selectedBookings.size === filteredBookings.length) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(filteredBookings.map((b) => b.id)));
    }
  };

  const handleSelectBooking = (bookingId: string) => {
    const newSelected = new Set(selectedBookings);
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId);
    } else {
      newSelected.add(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const handleBulkStatusUpdate = (status: BookingStatus) => {
    selectedBookings.forEach((id) => {
      updateBookingStatus(id, status);
    });
    setSelectedBookings(new Set());
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Confirmation Code',
      'Resource',
      'Customer Name',
      'Customer Email',
      'Start Time',
      'End Time',
      'Status',
      'Amount',
    ];
    const rows = filteredBookings.map((booking) => [
      booking.id,
      booking.confirmationCode,
      booking.resourceName,
      booking.customerName,
      booking.customerEmail,
      booking.startTime,
      booking.endTime,
      booking.status,
      booking.amount.toString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleView = (id: string) => {
    router.push(`/bookings/${id}?from=admin`);
  };

  const handleReschedule = (id: string) => {
    setRescheduleBookingId(id);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with default descending
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return null;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 ml-1 inline" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 inline" />
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">
                Booking Management
              </h1>
              <p className="text-zinc-700 dark:text-zinc-400">
                Manage all bookings and reservations
              </p>
            </div>
            <Button onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <Input
                  placeholder="Search by confirmation code, customer name, email, or resource..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                  <option value="no_show">No Show</option>
                </Select>

                <Select value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}>
                  <option value="all">All Resources</option>
                  {uniqueResources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                    </option>
                  ))}
                </Select>

                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From Date"
                />

                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To Date"
                />
              </div>

              {/* Clear Filters */}
              {(searchQuery ||
                statusFilter !== 'all' ||
                resourceFilter !== 'all' ||
                dateFrom ||
                dateTo) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setResourceFilter('all');
                    setDateFrom('');
                    setDateTo('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedBookings.size > 0 && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {selectedBookings.size} booking{selectedBookings.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Update Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('confirmed')}>
                        Mark as Confirmed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('completed')}>
                        Mark as Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('cancelled')}>
                        Mark as Cancelled
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('no_show')}>
                        Mark as No Show
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBookings(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-zinc-700 dark:text-zinc-400">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedBookings.size === filteredBookings.length &&
                          filteredBookings.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-zinc-300 dark:border-zinc-700"
                      />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => handleSort('confirmation')}
                    >
                      <span className="flex items-center">
                        Confirmation
                        {getSortIcon('confirmation')}
                      </span>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => handleSort('resource')}
                    >
                      <span className="flex items-center">
                        Resource
                        {getSortIcon('resource')}
                      </span>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => handleSort('customer')}
                    >
                      <span className="flex items-center">
                        Customer
                        {getSortIcon('customer')}
                      </span>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      <span className="flex items-center">
                        Date & Time
                        {getSortIcon('date')}
                      </span>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <span className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </span>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => handleSort('amount')}
                    >
                      <span className="flex items-center">
                        Amount
                        {getSortIcon('amount')}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-700 dark:text-zinc-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Filter className="h-12 w-12 text-zinc-400 mb-4" />
                          <p className="text-zinc-600 dark:text-zinc-400">No bookings found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => {
                      const startDate = new Date(booking.startTime);
                      const endDate = new Date(booking.endTime);
                      const isSelected = selectedBookings.has(booking.id);

                      return (
                        <tr
                          key={booking.id}
                          className={`hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectBooking(booking.id)}
                              className="rounded border-zinc-300 dark:border-zinc-700"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                              {booking.confirmationCode}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-zinc-900 dark:text-zinc-50">
                              {booking.resourceName}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                                {booking.customerName}
                              </p>
                              <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                                {booking.customerEmail}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <p className="text-zinc-900 dark:text-zinc-50">
                                {format(startDate, 'MMM d, yyyy')}
                              </p>
                              <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                                {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <BookingStatusBadge status={booking.status} />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                              {formatCurrency(booking.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(booking.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {booking.status === 'confirmed' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleReschedule(booking.id)}>
                                      <CalendarClock className="mr-2 h-4 w-4" />
                                      Reschedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                      className="text-red-600 dark:text-red-400"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Cancel
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Reschedule Modal */}
        {rescheduleBookingId &&
          (() => {
            const booking = bookings.find((b) => b.id === rescheduleBookingId);
            const resource = booking ? getResource(booking.resourceId) : undefined;
            if (!booking || !resource) return null;

            return (
              <RescheduleModal
                booking={booking}
                resource={resource}
                bookings={bookings.filter((b) => b.id !== booking.id)}
                onClose={() => setRescheduleBookingId(null)}
                onReschedule={(newStartTime, newEndTime) => {
                  rescheduleBooking(booking.id, newStartTime, newEndTime);
                  setRescheduleBookingId(null);
                }}
              />
            );
          })()}
      </div>
    </div>
  );
}
