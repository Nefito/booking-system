'use client';

import { useState, useMemo } from 'react';
import { ResourceStatus, ResourceCategory } from '@/lib/mock-data';
import { ResourceCard } from '@/components/resources/resource-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Grid, List, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useResources } from '@/contexts/resources-context';

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'date' | 'popularity';

export default function ResourcesPage() {
  const router = useRouter();
  const { resources, deleteResource, toggleResourceStatus } = useResources();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ResourceCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    let filtered = [...resources];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (resource) =>
          resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((resource) => resource.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((resource) => resource.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popularity':
          return b.bookingCount - a.bookingCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [resources, searchQuery, categoryFilter, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const paginatedResources = filteredResources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (id: string) => {
    router.push(`/admin/resources/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      deleteResource(id);
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleResourceStatus(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your booking resources</p>
        </div>
        <Link href="/admin/resources/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ResourceStatus | 'all');
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full sm:w-48"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="popularity">Sort by Popularity</option>
          </Select>
          <div className="flex gap-2 ml-auto">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="transition-all"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="transition-all"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          Showing {paginatedResources.length} of {filteredResources.length} resources
        </span>
      </div>

      {/* Resources Grid/List */}
      {paginatedResources.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-6 mb-4">
              <Filter className="h-12 w-12 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No resources found</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mb-6">
              {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                ? "Try adjusting your search or filters to find what you're looking for."
                : 'Get started by creating your first resource.'}
            </p>
            {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
            {!searchQuery && categoryFilter === 'all' && statusFilter === 'all' && (
              <Link href="/admin/resources/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Resource
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300'
                : 'space-y-4 animate-in fade-in duration-300'
            }
          >
            {paginatedResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
