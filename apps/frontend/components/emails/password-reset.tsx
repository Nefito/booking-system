import { Html, Head, Body, Container, Section, Text, Heading } from '@react-email/components';
import { EmailHeader } from './shared/email-header';
import { EmailFooter } from './shared/email-footer';
import { EmailButton } from './shared/email-button';
import { EmailDivider } from './shared/email-divider';

interface PasswordResetEmailProps {
  customerName: string;
  resetUrl: string;
  expiryHours?: number;
  unsubscribeUrl?: string;
}

export function PasswordResetEmail({
  customerName,
  resetUrl,
  expiryHours = 24,
  unsubscribeUrl,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <EmailHeader />

          <Section style={contentStyle}>
            <Heading style={headingStyle}>Reset Your Password</Heading>
            <Text style={greetingStyle}>Hi {customerName},</Text>
            <Text style={textStyle}>
              We received a request to reset your password. Click the button below to create a new
              password:
            </Text>

            <Section style={buttonContainerStyle}>
              <EmailButton href={resetUrl}>Reset Password</EmailButton>
            </Section>

            <Section style={securityBoxStyle}>
              <Text style={securityTitleStyle}>🔒 Security Information</Text>
              <Text style={securityTextStyle}>• This link will expire in {expiryHours} hours</Text>
              <Text style={securityTextStyle}>
                • For security reasons, this link can only be used once
              </Text>
              <Text style={securityTextStyle}>
                • If you didn&apos;t request this, you can safely ignore this email
              </Text>
            </Section>

            <EmailDivider spacing="small" />

            <Text style={alternativeTextStyle}>
              If the button doesn&apos;t work, copy and paste this link into your browser:
            </Text>
            <Text style={linkTextStyle}>{resetUrl}</Text>

            <EmailDivider spacing="medium" />

            <Section style={warningBoxStyle}>
              <Text style={warningTitleStyle}>⚠️ Didn&apos;t request this?</Text>
              <Text style={warningTextStyle}>
                If you didn&apos;t request a password reset, please ignore this email or{' '}
                <a href="mailto:support@bookingsystem.com" style={linkStyle}>
                  contact our support team
                </a>{' '}
                if you have concerns about your account security.
              </Text>
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

const buttonContainerStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const securityBoxStyle = {
  backgroundColor: '#eff6ff',
  border: '1px solid #93c5fd',
  borderRadius: '8px',
  padding: '20px',
  margin: '30px 0',
};

const securityTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 15px 0',
};

const securityTextStyle = {
  fontSize: '14px',
  color: '#1e40af',
  lineHeight: '1.8',
  margin: '5px 0',
};

const alternativeTextStyle = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '20px 0 10px 0',
  textAlign: 'center' as const,
};

const linkTextStyle = {
  fontSize: '12px',
  color: '#3b82f6',
  wordBreak: 'break-all' as const,
  textAlign: 'center' as const,
  margin: '0 0 20px 0',
  fontFamily: 'monospace',
};

const warningBoxStyle = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const warningTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 10px 0',
};

const warningTextStyle = {
  fontSize: '14px',
  color: '#92400e',
  lineHeight: '1.6',
  margin: '0',
};

const linkStyle = {
  color: '#3b82f6',
  textDecoration: 'underline',
};
