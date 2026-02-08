'use client';

import Image from 'next/image';
import { FrontendResource as Resource } from '@/lib/types/resource.types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryBadge } from './category-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Power } from 'lucide-react';
import Link from 'next/link';

interface ResourceCardProps {
  resource: Resource;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

export function ResourceCard({ resource, onEdit, onDelete, onToggleStatus }: ResourceCardProps) {
  return (
    <Card className="overflow-visible transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
      <Link href={`/admin/resources/${resource.id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 cursor-pointer">
          {resource.thumbnail ? (
            <Image
              src={resource.thumbnail}
              alt={resource.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
              <span>No Image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <CategoryBadge category={resource.category} />
          </div>
          <div className="absolute top-2 left-2">
            <Badge variant={resource.status === 'active' ? 'success' : 'secondary'}>
              {resource.status}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 transition-colors group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
            {resource.name}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
            {resource.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <span>📅 {resource.bookingCount} bookings</span>
            <span>💰 ${resource.revenue}</span>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex justify-between items-center relative">
        <Link href={`/admin/resources/${resource.id}`} className="text-sm cursor-pointer">
          <span className="font-medium">{resource.utilization}%</span>
          <span className="text-zinc-600 dark:text-zinc-400 ml-1">utilization</span>
        </Link>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(resource.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus?.(resource.id)}>
                <Power className="mr-2 h-4 w-4" />
                {resource.status === 'active' ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(resource.id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}
