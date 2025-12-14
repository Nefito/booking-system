import { Section, Container, Text, Img, Hr } from '@react-email/components';

interface BookingCardProps {
  resourceName: string;
  resourceImage?: string;
  date: string;
  time: string;
  duration: string;
  location?: string;
  confirmationCode?: string;
}

export function BookingCard({
  resourceName,
  resourceImage,
  date,
  time,
  duration,
  location,
  confirmationCode,
}: BookingCardProps) {
  return (
    <Section style={cardStyle}>
      <Container style={containerStyle}>
        {resourceImage && (
          <Img
            src={resourceImage}
            alt={resourceName}
            width="100%"
            height="200"
            style={imageStyle}
          />
        )}
        <Section style={contentStyle}>
          <Text style={titleStyle}>{resourceName}</Text>
          <Hr style={dividerStyle} />
          <Text style={detailStyle}>
            <strong>Date:</strong> {date}
          </Text>
          <Text style={detailStyle}>
            <strong>Time:</strong> {time}
          </Text>
          <Text style={detailStyle}>
            <strong>Duration:</strong> {duration}
          </Text>
          {location && (
            <Text style={detailStyle}>
              <strong>Location:</strong> {location}
            </Text>
          )}
          {confirmationCode && (
            <>
              <Hr style={dividerStyle} />
              <Text style={codeLabelStyle}>Confirmation Code</Text>
              <Text style={codeStyle}>{confirmationCode}</Text>
            </>
          )}
        </Section>
      </Container>
    </Section>
  );
}

const cardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  margin: '20px 0',
  overflow: 'hidden' as const,
};

const containerStyle = {
  padding: 0,
};

const imageStyle = {
  width: '100%',
  objectFit: 'cover' as const,
  display: 'block',
};

const contentStyle = {
  padding: '20px',
};

const titleStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 15px 0',
};

const dividerStyle = {
  borderColor: '#e5e7eb',
  margin: '15px 0',
};

const detailStyle = {
  fontSize: '14px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '8px 0',
};

const codeLabelStyle = {
  fontSize: '12px',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '15px 0 5px 0',
};

const codeStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  fontFamily: 'monospace',
  letterSpacing: '2px',
  margin: '0 0 15px 0',
  backgroundColor: '#f3f4f6',
  padding: '10px',
  borderRadius: '4px',
  textAlign: 'center' as const,
};
