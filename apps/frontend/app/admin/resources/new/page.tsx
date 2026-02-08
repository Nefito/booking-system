'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ResourceForm } from '@/components/resources/resource-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { convertFrontendToBackend } from '@/lib/utils/resource-converter';

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

export default function NewResourcePage() {
  const router = useRouter();

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'meeting-room',
      status: 'active',
      thumbnail: '',
      duration: 60,
      capacity: 1,
      price: 0,
      bufferTime: 15,
      location: '',
      advanceBookingLimitDays: 90,
      operatingHours: {
        start: '09:00',
        end: '18:00',
      },
      availableDays: [1, 2, 3, 4, 5],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ResourceFormData) => {
      // Convert frontend format to backend format
      const backendData = convertFrontendToBackend(data);
      return api.resources.create(backendData);
    },
    onSuccess: () => {
      router.push('/admin/resources');
    },
    onError: (error) => {
      console.error('Error creating resource:', error);
      // TODO: Show error toast
    },
  });

  const onSubmit = async (data: ResourceFormData) => {
    createMutation.mutate(data);
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
          <h1 className="text-3xl font-bold">Create Resource</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Add a new resource to your booking system
          </p>
        </div>
      </div>

      <ResourceForm
        form={form}
        onSubmit={onSubmit}
        isEdit={false}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
