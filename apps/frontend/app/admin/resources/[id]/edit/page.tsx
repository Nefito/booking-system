'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResourceForm } from '@/components/resources/resource-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { convertBackendToFrontend, convertFrontendToBackend } from '@/lib/utils/resource-converter';
import { ResourceCardSkeleton } from '@/components/resources/resource-card-skeleton';

const resourceSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(250, 'Name must not exceed 250 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must not exceed 2000 characters'),
  category: z.enum(['meeting-room', 'workspace', 'equipment', 'venue', 'vehicle']),
  status: z.enum(['active', 'inactive']),
  thumbnail: z.string().url('Valid image URL is required').optional().or(z.literal('')),
  duration: z
    .number()
    .min(5, 'Duration must be at least 5 minutes')
    .max(1440, 'Duration must not exceed 1440 minutes'),
  capacity: z
    .number()
    .min(1, 'Capacity must be at least 1')
    .max(1000, 'Capacity must not exceed 1000'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  bufferTime: z
    .number()
    .min(0, 'Buffer time must be 0 or greater')
    .max(120, 'Buffer time must not exceed 120 minutes')
    .optional(),
  location: z
    .string()
    .max(200, 'Location must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
  advanceBookingLimitDays: z
    .number()
    .min(1, 'Advance booking limit must be at least 1 day')
    .max(365, 'Advance booking limit must not exceed 365 days')
    .optional(),
  operatingHours: z.object({
    start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  }),
  availableDays: z.array(z.number().min(0).max(6)).min(1, 'Select at least one day'),
});

export type ResourceFormData = z.infer<typeof resourceSchema>;

export default function EditResourcePage() {
  const router = useRouter();
  const params = useParams();
  const resourceId = params.id as string;
  const queryClient = useQueryClient();

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
    staleTime: 30 * 1000,
  });

  const resource = backendResource ? convertBackendToFrontend(backendResource) : null;
  const initializedResourceIdRef = useRef<string | null>(null);

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: undefined, // Will be set via reset in useEffect
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ResourceFormData) => {
      // Convert frontend format to backend format
      const backendData = convertFrontendToBackend(data);
      return api.resources.update(resourceId, backendData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', resourceId] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      router.push('/admin/resources');
    },
    onError: (error) => {
      console.error('Error updating resource:', error);
      // TODO: Show error toast
    },
  });

  // Update form when resource loads (only once per resourceId)
  useEffect(() => {
    if (resource && initializedResourceIdRef.current !== resourceId) {
      form.reset({
        name: resource.name || '',
        description: resource.description || '',
        category: resource.category,
        status: resource.status,
        thumbnail: resource.thumbnail || '',
        duration: resource.duration ?? 60,
        capacity: resource.capacity ?? 1,
        price: resource.price ?? 0,
        bufferTime: resource.bufferTime,
        location: resource.location || '',
        advanceBookingLimitDays: resource.advanceBookingLimitDays,
        operatingHours: resource.operatingHours || { start: '09:00', end: '18:00' },
        availableDays: resource.availableDays || [1, 2, 3, 4, 5], // Default to weekdays
      });
      initializedResourceIdRef.current = resourceId;
    }
  }, [resource, resourceId, form]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ResourceCardSkeleton />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            {error instanceof Error ? error.message : 'Resource not found'}
          </p>
          <Link href="/admin/resources">
            <Button variant="outline">Back to Resources</Button>
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResourceFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/resources">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Resource</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Update resource details</p>
        </div>
      </div>

      <ResourceForm
        form={form}
        onSubmit={onSubmit}
        isEdit={true}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
