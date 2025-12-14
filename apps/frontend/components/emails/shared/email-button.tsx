import { Button } from '@react-email/components';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function EmailButton({ href, children, variant = 'primary' }: EmailButtonProps) {
  return (
    <Button href={href} style={variant === 'primary' ? primaryButtonStyle : secondaryButtonStyle}>
      {children}
    </Button>
  );
}

const primaryButtonStyle = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '8px 4px',
};

const secondaryButtonStyle = {
  backgroundColor: '#ffffff',
  border: '2px solid #3b82f6',
  borderRadius: '6px',
  color: '#3b82f6',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '8px 4px',
};
