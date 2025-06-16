import { Typography } from '@mui/material';

import type { NumberTypoVariants, TypoVariantKeys } from '@/styles/theme';

import { StyledButton } from './styled';

export type TextButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  typoVarient?: TypoVariantKeys | NumberTypoVariants;
  variant?: 'normal' | 'hyperlink' | 'underline' | 'redHyperlink' | 'blueHyperlink';
};

export default function TextButton({ children, typoVarient = 'b2_M', type, variant = 'normal', ...remainder }: TextButtonProps) {
  return (
    <StyledButton {...remainder} type={type ?? 'button'} variants={variant}>
      <Typography variant={typoVarient}>{children}</Typography>
    </StyledButton>
  );
}
