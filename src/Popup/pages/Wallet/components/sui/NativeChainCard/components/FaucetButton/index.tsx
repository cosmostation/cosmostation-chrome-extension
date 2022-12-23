import { Typography } from '@mui/material';

import { ContentContainer, StyledButton } from './styled';

type FaucetButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  typoVarient?: 'h4' | 'h5';
  Icon?: SvgElement;
};

export default function FaucetButton({ children, Icon, typoVarient = 'h5', type, ...remainder }: FaucetButtonProps) {
  return (
    <StyledButton {...remainder} data-typo-varient={typoVarient} type={type ?? 'button'}>
      <ContentContainer data-is-icon={Icon ? 1 : 0}>
        {Icon && <Icon />}
        <Typography variant={typoVarient}>{children}</Typography>
      </ContentContainer>
    </StyledButton>
  );
}
