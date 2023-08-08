import { Typography } from '@mui/material';

import { ACCENT_COLORS } from '~/constants/theme';
import type { AccentColorsType } from '~/types/theme';

import { ContentContainer, StyledButton, StyledCircularProgress } from './styled';

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  typoVarient?: 'h4' | 'h5';
  Icon?: SvgElement;
  accentColor?: AccentColorsType;
  hoverAccentColor?: AccentColorsType;
  isProgress?: boolean;
};

export default function Button({
  children,
  Icon,
  accentColor = ACCENT_COLORS.PURPLE01,
  hoverAccentColor = ACCENT_COLORS.PURPLE02,
  isProgress = false,
  typoVarient = 'h4',
  type,
  ...remainder
}: ButtonProps) {
  const disabled = isProgress ? true : remainder.disabled;
  return (
    <StyledButton
      {...remainder}
      data-accent-color={accentColor}
      data-accent-hover-color={hoverAccentColor}
      data-typo-varient={typoVarient}
      type={type ?? 'button'}
      disabled={disabled}
    >
      {isProgress ? (
        <StyledCircularProgress size={14} />
      ) : (
        <ContentContainer data-is-icon={Icon ? 1 : 0}>
          {Icon && <Icon />}
          <Typography variant={typoVarient}>{children}</Typography>
        </ContentContainer>
      )}
    </StyledButton>
  );
}
