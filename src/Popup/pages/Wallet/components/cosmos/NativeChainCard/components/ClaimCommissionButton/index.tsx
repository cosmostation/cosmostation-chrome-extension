import { Typography } from '@mui/material';

import { ContentContainer, StyledButton } from './styled';

type ClaimCommissionButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  typoVarient?: 'h4' | 'h5';
  Icon?: SvgElement;
  isAvailable?: boolean;
};

export default function ClaimCommissionButton({ children, Icon, isAvailable = false, typoVarient = 'h5', type, ...remainder }: ClaimCommissionButtonProps) {
  return (
    <StyledButton {...remainder} data-typo-varient={typoVarient} data-is-available={isAvailable} type={type ?? 'button'}>
      <ContentContainer data-is-icon={Icon ? 1 : 0}>
        {Icon && <Icon />}
        <Typography variant={typoVarient}>{children}</Typography>
      </ContentContainer>
    </StyledButton>
  );
}
