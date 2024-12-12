import { Typography } from '@mui/material';

import type { TypoVariantKeys } from '@/styles/theme';

import { ContentContainer, StyledButton, StyledCircularProgress } from './styled';

type OutlinedButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  typoVarient?: TypoVariantKeys;
  isProgress?: boolean;
  isSelected?: boolean;
  variant?: 'light' | 'dark' | 'red' | 'primaryHoverGray';
  leadingIcon?: JSX.Element;
  trailingIcon?: JSX.Element;
};

export default function OutlinedButton({
  children,
  isProgress = false,
  isSelected = false,
  typoVarient = 'h3_B',
  variant = 'light',
  type,
  leadingIcon,
  trailingIcon,
  ...remainder
}: OutlinedButtonProps) {
  const disabled = isProgress ? true : remainder.disabled;

  return (
    <StyledButton {...remainder} data-typo-varient={typoVarient} type={type ?? 'button'} variants={variant} disabled={disabled} isSelected={isSelected}>
      {isProgress ? (
        <StyledCircularProgress size={14} />
      ) : (
        <ContentContainer data-is-leadingIcon={!!leadingIcon} data-is-trailingIcon={!!trailingIcon}>
          {leadingIcon}
          <Typography variant={typoVarient}>{children}</Typography>
          {trailingIcon}
        </ContentContainer>
      )}
    </StyledButton>
  );
}
