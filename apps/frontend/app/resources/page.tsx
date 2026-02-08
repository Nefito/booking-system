'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResourceCategory } from '@/lib/types/resource.types';
import { PublicResourceCard } from '@/components/resources/public-resource-card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavigationMenu } from '@/components/navigation-menu';
import { api } from '@/lib/api';
import { convertBackendToFrontend } from '@/lib/utils/resource-converter';
import { ResourceCardSkeleton } from '@/components/resources/resource-card-skeleton';

type SortOption = 'name' | 'popularity' | 'price';

export default function PublicResourcesPage() {
  const [searchInput, setSearchInput] = useState(''); // Local input state
  const [searchQuery, setSearchQuery] = useState(''); // Debounced search query
  const [categoryFilter, setCategoryFilter] = useState<ResourceCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1); // Reset to first page on search
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch resources from API
  const {
    data: resourcesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['resources', 'public', searchQuery, categoryFilter, sortBy, currentPage],
    queryFn: async () => {
      // For now, fetch all and filter client-side to maintain existing UI
      // TODO: Update to use server-side filtering when category mapping is resolved
      const response = await api.resources.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        status: 'active', // Only show active resources
        sortBy: sortBy === 'name' ? 'name' : sortBy === 'price' ? 'price' : 'createdAt',
        sortOrder: sortBy === 'popularity' ? 'desc' : 'asc',
      });
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Convert backend resources to frontend format
  const backendResources = resourcesResponse?.data || [];
  const allResources = backendResources.map(convertBackendToFrontend);

  // Filter and sort resources (only show active resources)
  const filteredResources = useMemo(() => {
    let filtered = allResources.filter((resource) => resource.status === 'active');

    // Category filter (client-side for now)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((resource) => resource.category === categoryFilter);
    }

    // Additional client-side search if needed
    if (searchQuery) {
      filtered = filtered.filter(
        (resource) =>
          resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return b.bookingCount - a.bookingCount;
        case 'price':
          return a.price - b.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allResources, searchQuery, categoryFilter, sortBy]);

  // Pagination
  const totalPages = resourcesResponse?.meta.totalPages || 1;
  const paginatedResources = filteredResources.slice(0, itemsPerPage);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
                Error loading resources
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-400">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">
                Book a Resource
              </h1>
              <p className="text-lg text-zinc-700 dark:text-zinc-400">
                Browse and book from our available resources
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NavigationMenu />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <Input
              placeholder="Search resources..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
              }}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as ResourceCategory | 'all');
                setCurrentPage(1);
              }}
              className="w-full sm:w-48"
            >
              <option value="all">All Categories</option>
              <option value="meeting-room">Meeting Room</option>
              <option value="workspace">Workspace</option>
              <option value="equipment">Equipment</option>
              <option value="venue">Venue</option>
              <option value="vehicle">Vehicle</option>
            </Select>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full sm:w-48"
            >
              <option value="name">Sort by Name</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="price">Sort by Price</option>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-400 mb-6">
          <span>
            Showing {paginatedResources.length} of {filteredResources.length} resources
          </span>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        ) : paginatedResources.length === 0 ? (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-6 mb-4">
                <Filter className="h-12 w-12 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
                No resources found
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-400 max-w-md mb-6">
                {searchQuery || categoryFilter !== 'all'
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : 'No resources available at the moment.'}
              </p>
              {(searchQuery || categoryFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                  className="px-4 py-2 text-sm text-zinc-900 dark:text-zinc-50 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
              {paginatedResources.map((resource) => (
                <PublicResourceCard key={resource.id} resource={resource} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm text-zinc-900 dark:text-zinc-50 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-zinc-700 dark:text-zinc-400 px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm text-zinc-900 dark:text-zinc-50 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
