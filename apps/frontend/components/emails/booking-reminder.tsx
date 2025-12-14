import { Html, Head, Body, Container, Section, Text, Heading } from '@react-email/components';
import { EmailHeader } from './shared/email-header';
import { EmailFooter } from './shared/email-footer';
import { EmailButton } from './shared/email-button';
import { BookingCard } from './shared/booking-card';
import { EmailDivider } from './shared/email-divider';

interface BookingReminderEmailProps {
  customerName: string;
  resourceName: string;
  resourceImage?: string;
  date: string;
  time: string;
  duration: string;
  location?: string;
  directionsUrl?: string;
  viewBookingUrl: string;
  cancelBookingUrl: string;
  rescheduleBookingUrl: string;
  unsubscribeUrl?: string;
}

export function BookingReminderEmail({
  customerName,
  resourceName,
  resourceImage,
  date,
  time,
  duration,
  location,
  directionsUrl,
  viewBookingUrl,
  cancelBookingUrl,
  rescheduleBookingUrl,
  unsubscribeUrl,
}: BookingReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <EmailHeader />

          <Section style={contentStyle}>
            <Heading style={headingStyle}>Reminder: Your booking is tomorrow</Heading>
            <Text style={greetingStyle}>Hi {customerName},</Text>
            <Text style={textStyle}>
              This is a friendly reminder that you have a booking scheduled for tomorrow. We&apos;re
              looking forward to seeing you!
            </Text>

            <BookingCard
              resourceName={resourceName}
              resourceImage={resourceImage}
              date={date}
              time={time}
              duration={duration}
              location={location}
            />

            {location && directionsUrl && (
              <>
                <EmailDivider spacing="small" />
                <Section style={infoBoxStyle}>
                  <Text style={infoTitleStyle}>📍 Location & Directions</Text>
                  <Text style={infoTextStyle}>{location}</Text>
                  <EmailButton href={directionsUrl}>Get Directions</EmailButton>
                </Section>
              </>
            )}

            <EmailDivider spacing="medium" />

            <Section style={buttonContainerStyle}>
              <EmailButton href={viewBookingUrl}>View Booking</EmailButton>
              <EmailButton href={rescheduleBookingUrl} variant="secondary">
                Reschedule
              </EmailButton>
              <EmailButton href={cancelBookingUrl} variant="secondary">
                Cancel
              </EmailButton>
            </Section>
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
  fontSize: '24px',
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

const infoBoxStyle = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const infoTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 10px 0',
};

const infoTextStyle = {
  fontSize: '14px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0 0 15px 0',
};

const buttonContainerStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
};
