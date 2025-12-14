import { Html, Head, Body, Container, Section, Text, Heading } from '@react-email/components';
import { EmailHeader } from './shared/email-header';
import { EmailFooter } from './shared/email-footer';
import { EmailButton } from './shared/email-button';
import { BookingCard } from './shared/booking-card';
import { EmailDivider } from './shared/email-divider';

interface BookingConfirmationEmailProps {
  customerName: string;
  resourceName: string;
  resourceImage?: string;
  date: string;
  time: string;
  duration: string;
  location?: string;
  confirmationCode: string;
  bookingId: string;
  viewBookingUrl: string;
  addToCalendarUrl: string;
  cancelBookingUrl: string;
  unsubscribeUrl?: string;
}

export function BookingConfirmationEmail({
  customerName,
  resourceName,
  resourceImage,
  date,
  time,
  duration,
  location,
  confirmationCode,
  viewBookingUrl,
  addToCalendarUrl,
  cancelBookingUrl,
  unsubscribeUrl,
}: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <EmailHeader />

          <Section style={contentStyle}>
            <Heading style={headingStyle}>Booking Confirmed!</Heading>
            <Text style={greetingStyle}>Hi {customerName},</Text>
            <Text style={textStyle}>
              Your booking has been successfully confirmed. We&apos;re looking forward to seeing
              you!
            </Text>

            <BookingCard
              resourceName={resourceName}
              resourceImage={resourceImage}
              date={date}
              time={time}
              duration={duration}
              location={location}
              confirmationCode={confirmationCode}
            />

            <Section style={buttonContainerStyle}>
              <EmailButton href={viewBookingUrl}>View Booking</EmailButton>
              <EmailButton href={addToCalendarUrl}>Add to Calendar</EmailButton>
            </Section>

            <EmailDivider spacing="small" />

            <Text style={helpTextStyle}>
              Need to make changes? You can{' '}
              <a href={cancelBookingUrl} style={linkStyle}>
                cancel or reschedule
              </a>{' '}
              your booking anytime.
            </Text>
          </Section>

          <EmailFooter unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: '#f9fafb',
  fontFamily: 'Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
};

const contentStyle = {
  padding: '40px 20px',
};

const headingStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
};

const greetingStyle = {
  fontSize: '16px',
  color: '#374151',
  margin: '0 0 15px 0',
};

const textStyle = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
};

const buttonContainerStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const helpTextStyle = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.6',
  margin: '0',
  textAlign: 'center' as const,
};

const linkStyle = {
  color: '#3b82f6',
  textDecoration: 'underline',
};
