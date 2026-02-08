'use client';

import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ImagePlaceholder({ className, size = 'md' }: ImagePlaceholderProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col items-center justify-center',
        'bg-zinc-100 dark:bg-zinc-900',
        'text-zinc-400 dark:text-zinc-600',
        className
      )}
    >
      <ImageIcon className={cn(sizeClasses[size], 'mb-2 opacity-50')} />
      <span className="text-xs font-medium opacity-75">No Image</span>
    </div>
  );
}
