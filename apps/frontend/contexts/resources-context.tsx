'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Resource, mockResources as initialResources } from '@/lib/mock-data';

interface ResourcesContextValue {
  resources: Resource[];
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
}

const ResourcesContext = createContext<ResourcesContextValue | undefined>(undefined);

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<Resource[]>(initialResources);

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

  return (
    <ResourcesContext.Provider
      value={{
        resources,
        createResource,
        updateResource,
        deleteResource,
        toggleResourceStatus,
        getResource,
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
