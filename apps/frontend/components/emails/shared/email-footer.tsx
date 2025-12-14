import { Section, Container, Text, Link, Hr } from '@react-email/components';

interface EmailFooterProps {
  unsubscribeUrl?: string;
  supportEmail?: string;
  companyAddress?: string;
}

export function EmailFooter({
  unsubscribeUrl,
  supportEmail = 'support@bookingsystem.com',
  companyAddress = '123 Booking St, City, State 12345',
}: EmailFooterProps) {
  return (
    <>
      <Hr style={dividerStyle} />
      <Section style={footerStyle}>
        <Container style={containerStyle}>
          <Text style={footerTextStyle}>
            <strong>Booking System</strong>
            <br />
            {companyAddress}
          </Text>
          <Text style={linkContainerStyle}>
            {unsubscribeUrl && (
              <>
                <Link href={unsubscribeUrl} style={linkStyle}>
                  Unsubscribe
                </Link>
                {' • '}
              </>
            )}
            <Link href={`mailto:${supportEmail}`} style={linkStyle}>
              Contact Support
            </Link>
            {' • '}
            <Link href="https://bookingsystem.com/help" style={linkStyle}>
              Help Center
            </Link>
          </Text>
          <Text style={copyrightStyle}>
            © {new Date().getFullYear()} Booking System. All rights reserved.
          </Text>
        </Container>
      </Section>
    </>
  );
}

const dividerStyle = {
  borderColor: '#e5e7eb',
  margin: '40px 0',
};

const footerStyle = {
  backgroundColor: '#f9fafb',
  padding: '30px 0',
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '0 20px',
};

const footerTextStyle = {
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: '1.6',
  margin: '0 0 15px 0',
  textAlign: 'center' as const,
};

const linkContainerStyle = {
  fontSize: '12px',
  color: '#6b7280',
  textAlign: 'center' as const,
  margin: '0 0 15px 0',
};

const linkStyle = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

const copyrightStyle = {
  fontSize: '11px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: 0,
};
