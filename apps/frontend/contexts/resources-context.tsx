'use client';

import { createContext, useContext, useCallback, useMemo, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Resource,
  Booking,
  BookingStatus,
  normalizedBookings as initialBookings,
} from '@/lib/mock-data';
import { api } from '@/lib/api';
import { convertBackendToFrontend, convertFrontendToBackend } from '@/lib/utils/resource-converter';
import { FrontendResource } from '@/lib/types/resource.types';

interface ResourcesContextValue {
  resources: Resource[];
  bookings: Booking[];
  isLoading: boolean;
  createResource: (
    data: Omit<
      Resource,
      'id' | 'createdAt' | 'updatedAt' | 'bookingCount' | 'revenue' | 'utilization'
    >
  ) => Resource;
  updateResource: (id: string, data: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  toggleResourceStatus: (id: string) => void;
  getResource: (id: string) => Resource | undefined;
  createBooking: (
    resourceId: string,
    startTime: string,
    endTime: string,
    customerName: string,
    customerEmail: string,
    customerPhone?: string,
    notes?: string
  ) => Booking;
  cancelBooking: (bookingId: string, reason?: string, notes?: string) => void;
  rescheduleBooking: (bookingId: string, newStartTime: string, newEndTime: string) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  getBooking: (bookingId: string) => Booking | undefined;
  getBookings: (resourceId?: string) => Booking[];
}

const ResourcesContext = createContext<ResourcesContextValue | undefined>(undefined);

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch resources from API
  const { data: resourcesData, isLoading: resourcesLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const response = await api.resources.getAll({ limit: 100 }); // Fetch all for now
      return response.data.map(convertBackendToFrontend);
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const resources: Resource[] = useMemo(() => resourcesData || [], [resourcesData]);
  const bookings: Booking[] = initialBookings; // Keep mock bookings for now

  // Create resource mutation
  const createResourceMutation = useMutation({
    mutationFn: async (
      data: Omit<
        Resource,
        'id' | 'createdAt' | 'updatedAt' | 'bookingCount' | 'revenue' | 'utilization'
      >
    ) => {
      const backendData = convertFrontendToBackend(data as Partial<FrontendResource>);
      const backendResource = await api.resources.create(backendData);
      return convertBackendToFrontend(backendResource);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  // Update resource mutation
  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Resource> }) => {
      const backendData = convertFrontendToBackend(data as Partial<FrontendResource>);
      const backendResource = await api.resources.update(id, backendData);
      return convertBackendToFrontend(backendResource);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.resources.delete(id, false); // Soft delete by default
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  // Toggle resource status mutation
  const toggleResourceStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      // Send only the status field for partial update
      const backendResource = await api.resources.update(id, { status });
      return convertBackendToFrontend(backendResource);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource'] });
    },
  });

  const createResource = useCallback(
    (
      data: Omit<
        Resource,
        'id' | 'createdAt' | 'updatedAt' | 'bookingCount' | 'revenue' | 'utilization'
      >
    ): Resource => {
      // This is a synchronous wrapper - the actual mutation is async
      // For backward compatibility, we'll return a placeholder and let the mutation handle it
      const placeholder: Resource = {
        ...data,
        id: `temp-${Date.now()}`,
        bookingCount: 0,
        revenue: 0,
        utilization: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Trigger the mutation
      createResourceMutation.mutate(data);

      return placeholder;
    },
    [createResourceMutation]
  );

  const updateResource = useCallback(
    (id: string, data: Partial<Resource>) => {
      updateResourceMutation.mutate({ id, data });
    },
    [updateResourceMutation]
  );

  const deleteResource = useCallback(
    (id: string) => {
      deleteResourceMutation.mutate(id);
    },
    [deleteResourceMutation]
  );

  const toggleResourceStatus = useCallback(
    (id: string) => {
      const resource = resources.find((r) => r.id === id);
      if (resource) {
        const newStatus = resource.status === 'active' ? 'inactive' : 'active';
        toggleResourceStatusMutation.mutate({ id, status: newStatus });
      }
    },
    [resources, toggleResourceStatusMutation]
  );

  const getResource = useCallback(
    (id: string) => {
      return resources.find((r) => r.id === id);
    },
    [resources]
  );

  // Keep booking methods as-is for now (will be separate feature)
  const createBooking = useCallback(
    (
      resourceId: string,
      startTime: string,
      endTime: string,
      customerName: string,
      customerEmail: string,
      customerPhone?: string,
      notes?: string
    ): Booking => {
      const resource = resources.find((r) => r.id === resourceId);
      const now = new Date().toISOString();

      // Calculate duration in hours
      const start = new Date(startTime);
      const end = new Date(endTime);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const amount = resource ? resource.price * durationHours : 0;

      // Generate confirmation code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let confirmationCode = '';
      for (let i = 0; i < 8; i++) {
        confirmationCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Calculate cancellation deadline (24 hours before)
      const cancellationDeadline = new Date(start.getTime() - 24 * 60 * 60 * 1000).toISOString();

      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        resourceId,
        resourceName: resource?.name || 'Unknown Resource',
        resourceThumbnail: resource?.thumbnail,
        startTime,
        endTime,
        status: 'confirmed',
        customerName,
        customerEmail,
        customerPhone,
        confirmationCode,
        amount,
        cancellationDeadline,
        notes,
        createdAt: now,
        updatedAt: now,
        timeline: [
          { timestamp: now, action: 'created', actor: 'customer' },
          { timestamp: now, action: 'confirmed', actor: 'system' },
        ],
      };

      // Note: This is still using local state for bookings
      // Will be replaced when booking API is implemented
      return newBooking;
    },
    [resources]
  );

  const cancelBooking = useCallback((bookingId: string, reason?: string, notes?: string) => {
    // Keep mock implementation for now
  }, []);

  const rescheduleBooking = useCallback(
    (bookingId: string, newStartTime: string, newEndTime: string) => {
      // Keep mock implementation for now
    },
    [resources]
  );

  const updateBookingStatus = useCallback((bookingId: string, status: BookingStatus) => {
    // Keep mock implementation for now
  }, []);

  const getBooking = useCallback(
    (bookingId: string) => {
      return bookings.find((b) => b.id === bookingId);
    },
    [bookings]
  );

  const getBookings = useCallback(
    (resourceId?: string) => {
      if (resourceId) {
        return bookings.filter((b) => b.resourceId === resourceId);
      }
      return bookings;
    },
    [bookings]
  );

  return (
    <ResourcesContext.Provider
      value={{
        resources,
        bookings,
        isLoading: resourcesLoading,
        createResource,
        updateResource,
        deleteResource,
        toggleResourceStatus,
        getResource,
        createBooking,
        getBookings,
        cancelBooking,
        rescheduleBooking,
        updateBookingStatus,
        getBooking,
      }}
    >
      {children}
    </ResourcesContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error('useResources must be used within ResourcesProvider');
  }
  return context;
}
