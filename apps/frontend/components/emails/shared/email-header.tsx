import { Container, Section, Img, Text } from '@react-email/components';

interface EmailHeaderProps {
  logoUrl?: string;
  companyName?: string;
}

export function EmailHeader({ logoUrl, companyName = 'Booking System' }: EmailHeaderProps) {
  return (
    <Section style={headerStyle}>
      <Container style={containerStyle}>
        {logoUrl ? (
          <Img src={logoUrl} alt={companyName} width="120" height="40" style={logoStyle} />
        ) : (
          <Text style={textLogoStyle}>{companyName}</Text>
        )}
      </Container>
    </Section>
  );
}

const headerStyle = {
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  padding: '20px 0',
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '0 20px',
};

const logoStyle = {
  display: 'block',
  margin: '0 auto',
};

const textLogoStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  textAlign: 'center' as const,
  margin: 0,
};
