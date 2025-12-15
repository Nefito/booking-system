'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Resource,
  Booking,
  BookingStatus,
  BookingTimelineEvent,
  mockResources as initialResources,
  normalizedBookings as initialBookings,
} from '@/lib/mock-data';

interface ResourcesContextValue {
  resources: Resource[];
  bookings: Booking[];
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
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const createResource = useCallback(
    (
      data: Omit<
        Resource,
        'id' | 'createdAt' | 'updatedAt' | 'bookingCount' | 'revenue' | 'utilization'
      >
    ): Resource => {
      const newResource: Resource = {
        ...data,
        id: Date.now().toString(), // Simple ID generation
        bookingCount: 0,
        revenue: 0,
        utilization: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setResources((prev) => [...prev, newResource]);
      return newResource;
    },
    []
  );

  const updateResource = useCallback((id: string, data: Partial<Resource>) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === id
          ? { ...resource, ...data, updatedAt: new Date().toISOString() }
          : resource
      )
    );
  }, []);

  const deleteResource = useCallback((id: string) => {
    setResources((prev) => prev.filter((resource) => resource.id !== id));
  }, []);

  const toggleResourceStatus = useCallback((id: string) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === id
          ? {
              ...resource,
              status: resource.status === 'active' ? 'inactive' : 'active',
              updatedAt: new Date().toISOString(),
            }
          : resource
      )
    );
  }, []);

  const getResource = useCallback(
    (id: string) => {
      return resources.find((r) => r.id === id);
    },
    [resources]
  );

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

      setBookings((prev) => [...prev, newBooking]);
      return newBooking;
    },
    [resources]
  );

  const cancelBooking = useCallback((bookingId: string, reason?: string, notes?: string) => {
    setBookings((prev) =>
      prev.map((booking) => {
        if (booking.id === bookingId) {
          const now = new Date().toISOString();
          const deadline = booking.cancellationDeadline
            ? new Date(booking.cancellationDeadline)
            : null;
          const isBeforeDeadline = deadline ? new Date() < deadline : false;

          // Calculate refund (100% if before deadline, 50% if after)
          const refundPercentage = isBeforeDeadline ? 100 : 50;
          const refundAmount = (booking.amount * refundPercentage) / 100;

          return {
            ...booking,
            status: 'cancelled' as BookingStatus,
            cancellationReason: reason,
            cancellationNotes: notes,
            refundAmount,
            refundPercentage,
            updatedAt: now,
            timeline: [
              ...(booking.timeline || []),
              { timestamp: now, action: 'cancelled', actor: 'customer', notes: reason },
            ],
          };
        }
        return booking;
      })
    );
  }, []);

  const rescheduleBooking = useCallback(
    (bookingId: string, newStartTime: string, newEndTime: string) => {
      setBookings((prev) =>
        prev.map((booking) => {
          if (booking.id === bookingId) {
            const now = new Date().toISOString();
            const resource = resources.find((r) => r.id === booking.resourceId);
            const start = new Date(newStartTime);
            const end = new Date(newEndTime);
            const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            const newAmount = resource ? resource.price * durationHours : booking.amount;

            return {
              ...booking,
              startTime: newStartTime,
              endTime: newEndTime,
              amount: newAmount,
              cancellationDeadline: new Date(start.getTime() - 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: now,
              timeline: [
                ...(booking.timeline || []),
                {
                  timestamp: now,
                  action: 'modified',
                  actor: 'customer',
                  notes: 'Booking rescheduled',
                },
              ],
            };
          }
          return booking;
        })
      );
    },
    [resources]
  );

  const updateBookingStatus = useCallback((bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((booking) => {
        if (booking.id === bookingId) {
          const now = new Date().toISOString();

          // Map BookingStatus to BookingTimelineEvent action
          // 'pending' maps to 'modified' since it's not a valid timeline action
          const statusToActionMap: Record<BookingStatus, BookingTimelineEvent['action']> = {
            confirmed: 'confirmed',
            cancelled: 'cancelled',
            completed: 'completed',
            no_show: 'no_show',
            pending: 'modified',
          };
          const timelineAction = statusToActionMap[status];

          return {
            ...booking,
            status,
            updatedAt: now,
            timeline: [
              ...(booking.timeline || []),
              { timestamp: now, action: timelineAction, actor: 'system' },
            ],
          };
        }
        return booking;
      })
    );
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
