import { Typography } from '@mui/material';

import { ContentContainer, StyledButton, StyledCircularProgress } from './styled';

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  typoVarient?: 'h4' | 'h5';
  Icon?: SvgElement;
  isGreen?: boolean;
  isProgress?: boolean;
};

export default function Button({ children, Icon, isGreen = false, isProgress = false, typoVarient = 'h4', type, ...remainder }: ButtonProps) {
  const disabled = isProgress ? true : remainder.disabled;
  return (
    <StyledButton {...remainder} data-is-green={isGreen} data-typo-varient={typoVarient} type={type ?? 'button'} disabled={disabled}>
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
