import { Html, Head, Body, Container, Section, Text, Heading } from '@react-email/components';
import { EmailHeader } from './shared/email-header';
import { EmailFooter } from './shared/email-footer';
import { EmailButton } from './shared/email-button';
import { BookingCard } from './shared/booking-card';
import { EmailDivider } from './shared/email-divider';

interface CancellationConfirmationEmailProps {
  customerName: string;
  resourceName: string;
  resourceImage?: string;
  date: string;
  time: string;
  duration: string;
  refundAmount?: number;
  refundProcessingTime?: string;
  bookAgainUrl: string;
  unsubscribeUrl?: string;
}

export function CancellationConfirmationEmail({
  customerName,
  resourceName,
  resourceImage,
  date,
  time,
  duration,
  refundAmount,
  refundProcessingTime = '5-7 business days',
  bookAgainUrl,
  unsubscribeUrl,
}: CancellationConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <EmailHeader />

          <Section style={contentStyle}>
            <Heading style={headingStyle}>Booking Cancelled</Heading>
            <Text style={greetingStyle}>Hi {customerName},</Text>
            <Text style={textStyle}>
              Your booking has been successfully cancelled. We&apos;re sorry to see you go, but
              we&apos;re here whenever you&apos;re ready to book again.
            </Text>

            <Section style={cancelledCardStyle}>
              <BookingCard
                resourceName={resourceName}
                resourceImage={resourceImage}
                date={date}
                time={time}
                duration={duration}
              />
            </Section>

            {refundAmount !== undefined && (
              <>
                <EmailDivider spacing="small" />
                <Section style={refundBoxStyle}>
                  <Text style={refundTitleStyle}>💰 Refund Information</Text>
                  <Text style={refundAmountStyle}>${refundAmount.toFixed(2)}</Text>
                  <Text style={refundTextStyle}>
                    A refund of ${refundAmount.toFixed(2)} will be processed to your original
                    payment method. Please allow {refundProcessingTime} for the refund to appear in
                    your account.
                  </Text>
                </Section>
              </>
            )}

            <EmailDivider spacing="medium" />

            <Section style={buttonContainerStyle}>
              <EmailButton href={bookAgainUrl}>Book Again</EmailButton>
            </Section>

            <Text style={helpTextStyle}>
              If you have any questions about this cancellation, please{' '}
              <a href="mailto:support@bookingsystem.com" style={linkStyle}>
                contact our support team
              </a>
              .
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

const cancelledCardStyle = {
  opacity: 0.6,
  filter: 'grayscale(50%)',
};

const refundBoxStyle = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const refundTitleStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#166534',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 10px 0',
};

const refundAmountStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#166534',
  margin: '10px 0',
};

const refundTextStyle = {
  fontSize: '14px',
  color: '#166534',
  lineHeight: '1.6',
  margin: '10px 0 0 0',
};

const buttonContainerStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const helpTextStyle = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.6',
  margin: '20px 0 0 0',
  textAlign: 'center' as const,
};

const linkStyle = {
  color: '#3b82f6',
  textDecoration: 'underline',
};
