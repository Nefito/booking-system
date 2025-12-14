import { Html, Head, Body, Container, Section, Text, Heading, Img } from '@react-email/components';
import { EmailHeader } from './shared/email-header';
import { EmailFooter } from './shared/email-footer';
import { EmailButton } from './shared/email-button';
import { EmailDivider } from './shared/email-divider';

interface WelcomeEmailProps {
  customerName: string;
  browseResourcesUrl: string;
  featuredResources?: Array<{
    name: string;
    image?: string;
    description: string;
    url: string;
  }>;
  unsubscribeUrl?: string;
}

export function WelcomeEmail({
  customerName,
  browseResourcesUrl,
  featuredResources = [],
  unsubscribeUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <EmailHeader />

          <Section style={contentStyle}>
            <Heading style={headingStyle}>Welcome to Booking System!</Heading>
            <Text style={greetingStyle}>Hi {customerName},</Text>
            <Text style={textStyle}>
              We&apos;re thrilled to have you on board! Get started by making your first booking in
              just a few simple steps.
            </Text>

            <Section style={stepsBoxStyle}>
              <Text style={stepsTitleStyle}>How to Make Your First Booking</Text>

              <Section style={stepStyle}>
                <Text style={stepNumberStyle}>1</Text>
                <Text style={stepTextStyle}>
                  <strong>Browse Resources</strong> - Explore our available meeting rooms,
                  workspaces, and equipment
                </Text>
              </Section>

              <Section style={stepStyle}>
                <Text style={stepNumberStyle}>2</Text>
                <Text style={stepTextStyle}>
                  <strong>Select Date & Time</strong> - Choose a date and time slot that works for
                  you
                </Text>
              </Section>

              <Section style={stepStyle}>
                <Text style={stepNumberStyle}>3</Text>
                <Text style={stepTextStyle}>
                  <strong>Complete Booking</strong> - Fill in your details and confirm your
                  reservation
                </Text>
              </Section>
            </Section>

            {featuredResources.length > 0 && (
              <>
                <EmailDivider spacing="medium" />
                <Text style={sectionTitleStyle}>Featured Resources</Text>
                {featuredResources.map((resource, index) => (
                  <Section key={index} style={resourceCardStyle}>
                    {resource.image && (
                      <Img
                        src={resource.image}
                        alt={resource.name}
                        width="100%"
                        height="150"
                        style={resourceImageStyle}
                      />
                    )}
                    <Section style={resourceContentStyle}>
                      <Text style={resourceNameStyle}>{resource.name}</Text>
                      <Text style={resourceDescriptionStyle}>{resource.description}</Text>
                      <EmailButton href={resource.url}>View Details</EmailButton>
                    </Section>
                  </Section>
                ))}
              </>
            )}

            <EmailDivider spacing="medium" />

            <Section style={buttonContainerStyle}>
              <EmailButton href={browseResourcesUrl}>Browse All Resources</EmailButton>
            </Section>

            <Text style={helpTextStyle}>
              Need help? Check out our{' '}
              <a href="https://bookingsystem.com/help" style={linkStyle}>
                help center
              </a>{' '}
              or{' '}
              <a href="mailto:support@bookingsystem.com" style={linkStyle}>
                contact support
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
  margin: '0 0 30px 0',
};

const stepsBoxStyle = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '25px',
  margin: '30px 0',
};

const stepsTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 20px 0',
};

const stepStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  margin: '0 0 20px 0',
};

const stepNumberStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#3b82f6',
  backgroundColor: '#ffffff',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '15px',
  flexShrink: 0,
};

const stepTextStyle = {
  fontSize: '14px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0',
  flex: 1,
};

const sectionTitleStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
};

const resourceCardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  margin: '0 0 20px 0',
  overflow: 'hidden' as const,
};

const resourceImageStyle = {
  width: '100%',
  objectFit: 'cover' as const,
  display: 'block',
};

const resourceContentStyle = {
  padding: '20px',
};

const resourceNameStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 10px 0',
};

const resourceDescriptionStyle = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.6',
  margin: '0 0 15px 0',
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
