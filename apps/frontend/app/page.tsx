'use client';

import { useQuery } from '@tanstack/react-query';
import { healthCheck } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export default function Home() {
  const {
    data: health,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['health'],
    queryFn: healthCheck,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Booking System
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-700 dark:text-zinc-400">
            Full-stack booking system built with Next.js and NestJS
          </p>

          <div className="flex gap-4 mt-4">
            <Link href="/resources">
              <Button size="lg">
                <Calendar className="mr-2 h-4 w-4" />
                Browse Resources
              </Button>
            </Link>
            <Link href="/admin/resources">
              <Button variant="outline" size="lg">
                Admin Panel
              </Button>
            </Link>
          </div>

          <div className="mt-8 p-6 border rounded-lg bg-zinc-50 dark:bg-zinc-900">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              Backend Health Check
            </h2>
            {isLoading && <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>}
            {error && (
              <p className="text-red-600 dark:text-red-400">
                Error: {error instanceof Error ? error.message : 'Failed to connect to backend'}
              </p>
            )}
            {health && (
              <div className="space-y-2 text-sm">
                <p className="text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold">Status:</span> {health.status}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold">Environment:</span> {health.environment}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold">Uptime:</span> {Math.floor(health.uptime)}s
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold">Timestamp:</span>{' '}
                  {new Date(health.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
