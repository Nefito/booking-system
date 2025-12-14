import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { BookingConfirmationEmail } from '@/components/emails/booking-confirmation';
import { BookingReminderEmail } from '@/components/emails/booking-reminder';
import { CancellationConfirmationEmail } from '@/components/emails/cancellation-confirmation';
import { RescheduleConfirmationEmail } from '@/components/emails/reschedule-confirmation';
import { WelcomeEmail } from '@/components/emails/welcome-email';
import { PasswordResetEmail } from '@/components/emails/password-reset';
import React from 'react';

type EmailTemplate =
  | 'booking-confirmation'
  | 'booking-reminder'
  | 'cancellation'
  | 'reschedule'
  | 'welcome'
  | 'password-reset';

function getEmailComponent(template: EmailTemplate, baseUrl: string): React.ReactElement | null {
  switch (template) {
    case 'booking-confirmation':
      return (
        <BookingConfirmationEmail
          customerName="John Doe"
          resourceName="Conference Room A"
          resourceImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
          date="Monday, December 15, 2025"
          time="9:00 AM - 10:00 AM"
          duration="1 hour"
          location="123 Main St, City, State"
          confirmationCode="ABC12345"
          bookingId="booking-123"
          viewBookingUrl={`${baseUrl}/booking/booking-123/success`}
          addToCalendarUrl="#"
          cancelBookingUrl={`${baseUrl}/booking/booking-123/cancel`}
          unsubscribeUrl={`${baseUrl}/unsubscribe?token=xyz&email=john@example.com`}
        />
      );
    case 'booking-reminder':
      return (
        <BookingReminderEmail
          customerName="John Doe"
          resourceName="Conference Room A"
          resourceImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
          date="Monday, December 15, 2025"
          time="9:00 AM - 10:00 AM"
          duration="1 hour"
          location="123 Main St, City, State"
          directionsUrl="https://maps.google.com"
          viewBookingUrl={`${baseUrl}/booking/booking-123/success`}
          cancelBookingUrl={`${baseUrl}/booking/booking-123/cancel`}
          rescheduleBookingUrl={`${baseUrl}/booking/booking-123/reschedule`}
          unsubscribeUrl={`${baseUrl}/unsubscribe?token=xyz&email=john@example.com`}
        />
      );
    case 'cancellation':
      return (
        <CancellationConfirmationEmail
          customerName="John Doe"
          resourceName="Conference Room A"
          resourceImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
          date="Monday, December 15, 2025"
          time="9:00 AM - 10:00 AM"
          duration="1 hour"
          refundAmount={50}
          refundProcessingTime="5-7 business days"
          bookAgainUrl={`${baseUrl}/resources/1`}
          unsubscribeUrl={`${baseUrl}/unsubscribe?token=xyz&email=john@example.com`}
        />
      );
    case 'reschedule':
      return (
        <RescheduleConfirmationEmail
          customerName="John Doe"
          resourceName="Conference Room A"
          oldDate="Monday, December 15, 2025"
          oldTime="9:00 AM"
          newDate="Tuesday, December 16, 2025"
          newTime="2:00 PM"
          duration="1 hour"
          viewBookingUrl={`${baseUrl}/booking/booking-123/success`}
          unsubscribeUrl={`${baseUrl}/unsubscribe?token=xyz&email=john@example.com`}
        />
      );
    case 'welcome':
      return (
        <WelcomeEmail
          customerName="John Doe"
          browseResourcesUrl={`${baseUrl}/resources`}
          featuredResources={[
            {
              name: 'Conference Room A',
              image:
                'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
              description: 'Spacious meeting room with video conferencing',
              url: `${baseUrl}/resources/1`,
            },
            {
              name: 'Workspace Pod',
              image:
                'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
              description: 'Private workspace for focused work',
              url: `${baseUrl}/resources/2`,
            },
          ]}
          unsubscribeUrl={`${baseUrl}/unsubscribe?token=xyz&email=john@example.com`}
        />
      );
    case 'password-reset':
      return (
        <PasswordResetEmail
          customerName="John Doe"
          resetUrl={`${baseUrl}/reset-password?token=reset-token-123`}
          expiryHours={24}
          unsubscribeUrl={`${baseUrl}/unsubscribe?token=xyz&email=john@example.com`}
        />
      );
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, baseUrl = 'https://bookingsystem.com' } = body;

    const emailComponent = getEmailComponent(template as EmailTemplate, baseUrl);

    if (!emailComponent) {
      return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
    }

    const html = await render(emailComponent);

    return NextResponse.json({ html });
  } catch (error) {
    console.error('Error rendering email:', error);
    return NextResponse.json({ error: 'Failed to render email' }, { status: 500 });
  }
}
