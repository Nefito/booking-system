'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, Calendar, Settings } from 'lucide-react';
import { ResourcesProvider } from '@/contexts/resources-context';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Resources', href: '/admin/resources', icon: Package },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ResourcesProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 min-h-screen bg-white dark:bg-zinc-950 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800">
            <div className="p-4 lg:p-6">
              <h1 className="text-xl font-bold">Booking System</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Admin Panel</p>
            </div>
            <nav className="px-2 lg:px-4 space-y-1 pb-4 lg:pb-0 flex lg:flex-col overflow-x-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                      isActive
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ResourcesProvider>
  );
}
