'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationCodeProps {
  code: string;
  className?: string;
}

export function ConfirmationCode({ code, className }: ConfirmationCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className={cn('border-2 border-zinc-200 dark:border-zinc-800', className)}>
      <CardContent className="p-6">
        <div className="text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Confirmation Code</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <code className="text-3xl md:text-4xl font-mono font-bold tracking-wider bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-lg">
              {code}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Save this code to manage or cancel your booking
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
