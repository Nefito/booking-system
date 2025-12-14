import { Html, Head, Body, Container, Section, Text, Heading } from '@react-email/components';
import { EmailHeader } from './shared/email-header';
import { EmailFooter } from './shared/email-footer';
import { EmailButton } from './shared/email-button';
import { EmailDivider } from './shared/email-divider';

interface RescheduleConfirmationEmailProps {
  customerName: string;
  resourceName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  duration: string;
  viewBookingUrl: string;
  unsubscribeUrl?: string;
}

export function RescheduleConfirmationEmail({
  customerName,
  resourceName,
  oldDate,
  oldTime,
  newDate,
  newTime,
  duration,
  viewBookingUrl,
  unsubscribeUrl,
}: RescheduleConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <EmailHeader />

          <Section style={contentStyle}>
            <Heading style={headingStyle}>Booking Rescheduled</Heading>
            <Text style={greetingStyle}>Hi {customerName},</Text>
            <Text style={textStyle}>
              Your booking for <strong>{resourceName}</strong> has been successfully rescheduled.
              Here are the updated details:
            </Text>

            <Section style={comparisonStyle}>
              <Section style={comparisonColumnStyle}>
                <Text style={comparisonLabelStyle}>Previous</Text>
                <Text style={{ ...comparisonDateStyle, color: '#9ca3af' }}>{oldDate}</Text>
                <Text style={{ ...comparisonTimeStyle, color: '#9ca3af' }}>{oldTime}</Text>
              </Section>

              <Text style={arrowStyle}>→</Text>

              <Section style={comparisonColumnStyle}>
                <Text style={comparisonLabelStyle}>New</Text>
                <Text style={{ ...comparisonDateStyle, color: '#059669' }}>{newDate}</Text>
                <Text style={{ ...comparisonTimeStyle, color: '#059669' }}>{newTime}</Text>
              </Section>
            </Section>

            <Section style={detailsBoxStyle}>
              <Text style={detailsTitleStyle}>Updated Booking Details</Text>
              <Text style={detailsTextStyle}>
                <strong>Resource:</strong> {resourceName}
              </Text>
              <Text style={detailsTextStyle}>
                <strong>Date:</strong> {newDate}
              </Text>
              <Text style={detailsTextStyle}>
                <strong>Time:</strong> {newTime}
              </Text>
              <Text style={detailsTextStyle}>
                <strong>Duration:</strong> {duration}
              </Text>
            </Section>

            <Text style={calendarNoteStyle}>
              📅 A new calendar invitation has been sent to your email with the updated time.
            </Text>

            <EmailDivider spacing="medium" />

            <Section style={buttonContainerStyle}>
              <EmailButton href={viewBookingUrl}>View Updated Booking</EmailButton>
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
  margin: '0 0 30px 0',
};

const comparisonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '30px 20px',
  margin: '30px 0',
};

const comparisonColumnStyle = {
  flex: 1,
  textAlign: 'center' as const,
};

const comparisonLabelStyle = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 15px 0',
};

const comparisonDateStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 5px 0',
};

const comparisonTimeStyle = {
  fontSize: '16px',
  margin: '0',
};

const arrowStyle = {
  fontSize: '24px',
  color: '#3b82f6',
  margin: '0 20px',
  fontWeight: 'bold',
};

const detailsBoxStyle = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '8px',
  padding: '20px',
  margin: '30px 0',
};

const detailsTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#166534',
  margin: '0 0 15px 0',
};

const detailsTextStyle = {
  fontSize: '14px',
  color: '#166534',
  lineHeight: '1.8',
  margin: '5px 0',
};

const calendarNoteStyle = {
  fontSize: '14px',
  color: '#6b7280',
  fontStyle: 'italic' as const,
  textAlign: 'center' as const,
  margin: '20px 0',
};

const buttonContainerStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
};
