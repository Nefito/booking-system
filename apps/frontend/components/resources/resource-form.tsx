'use client';

import { UseFormReturn, useWatch } from 'react-hook-form';
import { ResourceFormData } from '@/app/admin/resources/new/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DurationPicker } from './duration-picker';
import { TimeRangePicker } from './time-range-picker';
import { DaySelector } from './day-selector';
import { ImageUploader } from './image-uploader';
import { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';

interface ResourceFormProps {
  form: UseFormReturn<ResourceFormData>;
  onSubmit: (data: ResourceFormData) => void;
  isEdit?: boolean;
  isLoading?: boolean;
}

export function ResourceForm({
  form,
  onSubmit,
  isEdit = false,
  isLoading = false,
}: ResourceFormProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Use useWatch instead of form.watch() to avoid stack overflow issues in react-hook-form 7.55.0+
  const thumbnail = useWatch({ control: form.control, name: 'thumbnail' });
  const duration = useWatch({ control: form.control, name: 'duration' });
  const operatingHours = useWatch({ control: form.control, name: 'operatingHours' });
  const availableDays = useWatch({ control: form.control, name: 'availableDays' });

  const handleSubmit = async (data: ResourceFormData) => {
    await onSubmit(data);
    setHasUnsavedChanges(false);
    form.reset(data); // Reset dirty state
  };

  const handleSaveDraft = () => {
    const data = form.getValues();
    console.log('Saving draft:', data);
    // In real app, this would save as draft
    setHasUnsavedChanges(false);
  };

  // Watch for changes - track when form is dirty
  const isDirty = form.formState.isDirty;

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Unsaved changes warning */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 animate-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            ⚠️ You have unsaved changes. Make sure to save before leaving.
          </p>
        </div>
      )}

      {/* Basic Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...form.register('name')} placeholder="e.g., Conference Room A" />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Describe the resource..."
              rows={4}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select id="category" {...form.register('category')}>
                <option value="meeting-room">Meeting Room</option>
                <option value="workspace">Workspace</option>
                <option value="equipment">Equipment</option>
                <option value="venue">Venue</option>
                <option value="vehicle">Vehicle</option>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select id="status" {...form.register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>
          </div>

          <ImageUploader value={thumbnail} onChange={(url) => form.setValue('thumbnail', url)} />
          {form.formState.errors.thumbnail && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.thumbnail.message}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...form.register('location')}
              placeholder="e.g., Building 1, Floor 2, Room 201"
            />
            {form.formState.errors.location && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.location.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scheduling Section */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DurationPicker value={duration} onChange={(value) => form.setValue('duration', value)} />
          {form.formState.errors.duration && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.duration.message}
            </p>
          )}

          <TimeRangePicker
            start={operatingHours?.start || '09:00'}
            end={operatingHours?.end || '18:00'}
            onStartChange={(value) => form.setValue('operatingHours.start', value)}
            onEndChange={(value) => form.setValue('operatingHours.end', value)}
          />
          {form.formState.errors.operatingHours && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.operatingHours.message}
            </p>
          )}

          <DaySelector
            selectedDays={availableDays || []}
            onChange={(days) => form.setValue('availableDays', days)}
          />
          {form.formState.errors.availableDays && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.availableDays.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                {...form.register('capacity', { valueAsNumber: true })}
              />
              {form.formState.errors.capacity && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.capacity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...form.register('price', { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bufferTime">Buffer Time (minutes)</Label>
              <Input
                id="bufferTime"
                type="number"
                min="0"
                max="120"
                {...form.register('bufferTime', { valueAsNumber: true })}
              />
              {form.formState.errors.bufferTime && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.bufferTime.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="advanceBookingLimitDays">Advance Booking Limit (days)</Label>
              <Input
                id="advanceBookingLimitDays"
                type="number"
                min="1"
                max="365"
                {...form.register('advanceBookingLimitDays', { valueAsNumber: true })}
              />
              {form.formState.errors.advanceBookingLimitDays && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.advanceBookingLimitDays.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <Button type="button" variant="outline" onClick={handleSaveDraft}>
          <FileText className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : isEdit ? 'Update Resource' : 'Create Resource'}
          </Button>
        </div>
      </div>
    </form>
  );
}
