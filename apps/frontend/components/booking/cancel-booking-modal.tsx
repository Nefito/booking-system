'use client';

import { useState } from 'react';
import { Booking } from '@/lib/mock-data';
import { RefundSummary } from './refund-summary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, AlertTriangle, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface CancelBookingModalProps {
  booking: Booking;
  onClose: () => void;
  onCancel: (reason?: string, notes?: string) => void;
}

type CancelStep = 1 | 2 | 3;

export function CancelBookingModal({ booking, onClose, onCancel }: CancelBookingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<CancelStep>(1);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const startDate = new Date(booking.startTime);
  const deadline = booking.cancellationDeadline ? new Date(booking.cancellationDeadline) : null;
  const now = new Date();
  const isBeforeDeadline = deadline ? now < deadline : false;
  const timeUntilBooking = formatDistanceToNow(startDate, { addSuffix: true });

  // Calculate refund
  const refundPercentage = isBeforeDeadline ? 100 : 50;
  const refundAmount = (booking.amount * refundPercentage) / 100;

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onCancel(reason || undefined, notes || undefined);
    setIsProcessing(false);
    router.push(`/bookings/${booking.id}/cancelled`);
  };

  const cancellationReasons = [
    'Change of plans',
    'Found alternative',
    'Double booking',
    'Emergency',
    'Other',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Cancel Booking</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2
                    ${
                      step >= s
                        ? 'bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50'
                        : 'bg-white text-zinc-400 border-zinc-300 dark:bg-zinc-950 dark:border-zinc-700'
                    }
                  `}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-2
                      ${step > s ? 'bg-zinc-900 dark:bg-zinc-50' : 'bg-zinc-300 dark:bg-zinc-700'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Cancellation Policy */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                  Cancellation Policy
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Time Until Booking
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{timeUntilBooking}</p>
                    </div>
                  </div>

                  {deadline && (
                    <div
                      className={`flex items-start gap-3 p-4 rounded-lg ${
                        isBeforeDeadline
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-yellow-50 dark:bg-yellow-900/20'
                      }`}
                    >
                      <AlertTriangle
                        className={`h-5 w-5 mt-0.5 shrink-0 ${
                          isBeforeDeadline
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}
                      />
                      <div>
                        <p
                          className={`font-medium mb-1 ${
                            isBeforeDeadline
                              ? 'text-green-900 dark:text-green-100'
                              : 'text-yellow-900 dark:text-yellow-100'
                          }`}
                        >
                          {isBeforeDeadline ? 'Full Refund Available' : 'Partial Refund Available'}
                        </p>
                        <p
                          className={`text-sm ${
                            isBeforeDeadline
                              ? 'text-green-800 dark:text-green-200'
                              : 'text-yellow-800 dark:text-yellow-200'
                          }`}
                        >
                          {isBeforeDeadline
                            ? `Cancel before ${format(deadline, 'MMM d, yyyy h:mm a')} for a full refund.`
                            : `Cancellation deadline passed. You'll receive a ${refundPercentage}% refund.`}
                        </p>
                      </div>
                    </div>
                  )}

                  <RefundSummary
                    originalAmount={booking.amount}
                    refundAmount={refundAmount}
                    refundPercentage={refundPercentage}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Reason Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                  Cancellation Reason (Optional)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                      Reason for cancellation
                    </label>
                    <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                      <option value="">Select a reason (optional)</option>
                      {cancellationReasons.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                      Additional notes (optional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tell us more about why you're cancelling..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                  Confirm Cancellation
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-red-900 dark:text-red-100 font-medium mb-2">
                      Are you sure you want to cancel this booking?
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      This action cannot be undone. Your booking will be cancelled and{' '}
                      {refundPercentage === 100 ? 'a full' : 'a partial'} refund will be processed.
                    </p>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                    <p className="text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-50">
                      Booking Details
                    </p>
                    <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                      <p>
                        <span className="font-medium">Resource:</span> {booking.resourceName}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span>{' '}
                        {format(startDate, 'EEEE, MMM d, yyyy')}
                      </p>
                      <p>
                        <span className="font-medium">Time:</span> {format(startDate, 'h:mm a')} -{' '}
                        {format(new Date(booking.endTime), 'h:mm a')}
                      </p>
                    </div>
                  </div>

                  <RefundSummary
                    originalAmount={booking.amount}
                    refundAmount={refundAmount}
                    refundPercentage={refundPercentage}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex gap-3">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} disabled={isProcessing}>
                  Back
                </Button>
              )}
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Close
              </Button>
            </div>
            <div className="flex gap-3">
              {step < 3 ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button variant="destructive" onClick={handleConfirm} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Cancel Booking'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
