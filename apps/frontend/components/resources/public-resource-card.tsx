'use client';

import Image from 'next/image';
import { Resource } from '@/lib/mock-data';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CategoryBadge } from './category-badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PublicResourceCardProps {
  resource: Resource;
}

export function PublicResourceCard({ resource }: PublicResourceCardProps) {
  // Only show active resources in public view
  if (resource.status !== 'active') {
    return null;
  }

  return (
    <Card className="overflow-visible transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group h-full flex flex-col">
      <Link href={`/resources/${resource.id}`} className="block flex-1 flex flex-col">
        <div className="relative h-48 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 cursor-pointer">
          <Image
            src={resource.thumbnail}
            alt={resource.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2">
            <CategoryBadge category={resource.category} />
          </div>
        </div>
        <CardContent className="p-4 flex-1">
          <h3 className="font-semibold text-lg mb-1 transition-colors group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
            {resource.name}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
            {resource.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            <span>📅 {resource.bookingCount} bookings</span>
            <span>💰 ${resource.price}/booking</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
            <Calendar className="h-3 w-3" />
            <span>
              {resource.duration} min • {resource.capacity} people
            </span>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <Link href={`/resources/${resource.id}`} className="w-full">
          <Button className="w-full" variant="default">
            Book Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
