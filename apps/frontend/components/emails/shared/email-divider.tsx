import { Hr } from '@react-email/components';

interface EmailDividerProps {
  spacing?: 'small' | 'medium' | 'large';
}

export function EmailDivider({ spacing = 'medium' }: EmailDividerProps) {
  const spacingMap = {
    small: '20px',
    medium: '30px',
    large: '40px',
  };

  return <Hr style={{ ...dividerStyle, margin: `${spacingMap[spacing]} 0` }} />;
}

const dividerStyle = {
  borderColor: '#e5e7eb',
  borderWidth: '1px',
  borderStyle: 'solid',
};
