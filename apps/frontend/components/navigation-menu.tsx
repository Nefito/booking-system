'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings, Eye, MailX, Menu, X, Package } from 'lucide-react';
import { useState } from 'react';

const hiddenRoutes = [
  { name: 'Resources', href: '/resources', icon: Package },
  { name: 'Email Preview', href: '/emails/preview', icon: Eye },
  { name: 'Email Preferences', href: '/settings/notifications', icon: Settings },
  { name: 'Unsubscribe', href: '/unsubscribe', icon: MailX },
];

export function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="flex items-center justify-between p-2 mb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-sm font-semibold">Quick Links</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {hiddenRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{route.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
