'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryBadge } from '@/components/resources/category-badge';
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { convertBackendToFrontend } from '@/lib/utils/resource-converter';
import { useResources } from '@/contexts/resources-context';
import { ResourceCardSkeleton } from '@/components/resources/resource-card-skeleton';

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;
  const { deleteResource, getBookings } = useResources();

  // Fetch resource from API
  const {
    data: backendResource,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['resource', resourceId],
    queryFn: async () => {
      return api.resources.getById(resourceId);
    },
    enabled: !!resourceId,
    staleTime: 30 * 1000, // 30 seconds
  });

  const resource = backendResource ? convertBackendToFrontend(backendResource) : null;
  const resourceBookings = resource ? getBookings(resourceId) : [];

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this resource?')) {
      deleteResource(resourceId);
      router.push('/admin/resources');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ResourceCardSkeleton />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          {error instanceof Error ? error.message : 'Resource not found'}
        </p>
        <Link href="/admin/resources">
          <Button variant="outline" className="mt-4">
            Back to Resources
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/admin/resources">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resources
        </Button>
      </Link>

      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="relative h-64 md:h-96 w-full bg-zinc-200 dark:bg-zinc-800">
          {resource.thumbnail ? (
            <Image
              src={resource.thumbnail}
              alt={resource.name}
              fill
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
              <span>No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CategoryBadge category={resource.category} />
                  <Badge variant={resource.status === 'active' ? 'success' : 'secondary'}>
                    {resource.status}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{resource.name}</h1>
                <p className="text-zinc-200 max-w-2xl">{resource.description}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/resources/${resourceId}/edit`}>
                  <Button variant="secondary">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resource.bookingCount}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${resource.revenue.toLocaleString()}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resource.utilization}%</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Capacity usage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resource.capacity}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Max occupancy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Details */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Duration</p>
                <p className="font-medium">{resource.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Price</p>
                <p className="font-medium">${resource.price}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Buffer Time</p>
                <p className="font-medium">{resource.bufferTime} minutes</p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Operating Hours</p>
                <p className="font-medium">
                  {resource.operatingHours.start} - {resource.operatingHours.end}
                </p>
              </div>
              {resource.location && (
                <div className="col-span-2">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Location</p>
                  <p className="font-medium">{resource.location}</p>
                </div>
              )}
              {resource.advanceBookingLimitDays && (
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Advance Booking Limit</p>
                  <p className="font-medium">{resource.advanceBookingLimitDays} days</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Available Days</p>
              <div className="flex gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <Badge
                    key={day}
                    variant={resource.availableDays.includes(index) ? 'default' : 'outline'}
                  >
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {resourceBookings.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center py-8">
                No upcoming bookings
              </p>
            ) : (
              <div className="space-y-4">
                {resourceBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {format(new Date(booking.startTime), 'MMM d, yyyy h:mm a')} -{' '}
                        {format(new Date(booking.endTime), 'h:mm a')}
                      </p>
                    </div>
                    <Badge
                      variant={
                        booking.status === 'confirmed'
                          ? 'success'
                          : booking.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Availability Calendar Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Availability Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Calendar view coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
