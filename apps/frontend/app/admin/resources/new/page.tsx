'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ResourceForm } from '@/components/resources/resource-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useResources } from '@/contexts/resources-context';

const resourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['meeting-room', 'workspace', 'equipment', 'venue', 'vehicle']),
  status: z.enum(['active', 'inactive']),
  thumbnail: z.string().url('Valid image URL is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  bufferTime: z.number().min(0, 'Buffer time must be 0 or greater'),
  operatingHours: z.object({
    start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  }),
  availableDays: z.array(z.number().min(0).max(6)).min(1, 'Select at least one day'),
});

export type ResourceFormData = z.infer<typeof resourceSchema>;

export default function NewResourcePage() {
  const router = useRouter();
  const { createResource } = useResources();
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
      operatingHours: {
        start: '09:00',
        end: '18:00',
      },
      availableDays: [1, 2, 3, 4, 5],
    },
  });

  const onSubmit = async (data: ResourceFormData) => {
    try {
      createResource(data);
      router.push('/admin/resources');
    } catch (error) {
      console.error('Error creating resource:', error);
    }
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

      <ResourceForm form={form} onSubmit={onSubmit} />
    </div>
  );
}
