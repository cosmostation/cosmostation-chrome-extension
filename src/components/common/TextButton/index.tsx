import { Typography } from '@mui/material';

import type { TypoVariantKeys } from '@/styles/theme';

import { StyledButton } from './styled';

type TextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  typoVarient?: TypoVariantKeys;
  variant?: 'normal' | 'hyperlink';
};

export default function TextButton({ children, typoVarient = 'b2_M', type, variant = 'normal', ...remainder }: TextButtonProps) {
  return (
    <StyledButton {...remainder} type={type ?? 'button'} variants={variant}>
      <Typography variant={typoVarient}>{children}</Typography>
    </StyledButton>
  );
}
