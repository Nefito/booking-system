'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const guestBookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type GuestBookingFormData = z.infer<typeof guestBookingSchema>;

interface GuestBookingFormProps {
  onSubmit: (data: GuestBookingFormData) => void;
  isLoading?: boolean;
}

export function GuestBookingForm({ onSubmit, isLoading = false }: GuestBookingFormProps) {
  const form = useForm<GuestBookingFormData>({
    resolver: zodResolver(guestBookingSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Full Name <span className="text-red-500">*</span>
        </Label>
        <Input id="name" {...form.register('name')} placeholder="John Doe" disabled={isLoading} />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...form.register('email')}
          placeholder="john@example.com"
          disabled={isLoading}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          {...form.register('phone')}
          placeholder="+1 (555) 123-4567"
          disabled={isLoading}
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Special Requests or Notes (Optional)</Label>
        <Textarea
          id="notes"
          {...form.register('notes')}
          placeholder="Any special requirements or notes..."
          rows={4}
          disabled={isLoading}
        />
        {form.formState.errors.notes && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.notes.message}
          </p>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
        <p className="font-medium mb-1">💡 Create an account?</p>
        <p>
          Sign up to manage your bookings, get reminders, and access exclusive features. It only
          takes a minute!
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Continue to Confirmation'}
      </Button>
    </form>
  );
}
