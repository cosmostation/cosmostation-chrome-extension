import { Typography } from '@mui/material';

import type { TypoVariantKeys } from '@/styles/theme';

import { ContentContainer, StyledButton, StyledCircularProgress } from './styled';

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  typoVarient?: TypoVariantKeys;
  isProgress?: boolean;
  variant?: 'light' | 'dark' | 'red';
  Icon?: JSX.Element;
};

export default function Button({ children, isProgress = false, typoVarient = 'h3_B', variant = 'light', type, Icon, ...remainder }: ButtonProps) {
  const disabled = isProgress ? true : remainder.disabled;

  return (
    <StyledButton {...remainder} data-typo-varient={typoVarient} type={type ?? 'button'} variants={variant} disabled={disabled}>
      {isProgress ? (
        <StyledCircularProgress size={14} />
      ) : (
        <ContentContainer data-is-icon={!!Icon}>
          {Icon}
          <Typography variant={typoVarient}>{children}</Typography>
        </ContentContainer>
      )}
    </StyledButton>
  );
}
