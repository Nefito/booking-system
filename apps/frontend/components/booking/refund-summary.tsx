'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface RefundSummaryProps {
  originalAmount: number;
  refundAmount?: number;
  refundPercentage?: number;
  processingTime?: string;
}

export function RefundSummary({
  originalAmount,
  refundAmount = 0,
  refundPercentage = 0,
  processingTime = '5-7 business days',
}: RefundSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Refund Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-zinc-600 dark:text-zinc-400">Original Amount</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(originalAmount)}
          </span>
        </div>
        {refundPercentage > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-zinc-600 dark:text-zinc-400">Refund Percentage</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {refundPercentage}%
              </span>
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Refund Amount
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(refundAmount)}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your refund will be processed within {processingTime}. You&apos;ll receive an email
                confirmation once it&apos;s been processed.
              </p>
            </div>
          </>
        )}
        {refundPercentage === 0 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This booking is not eligible for a refund based on our cancellation policy.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
