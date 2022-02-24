import type { SVGProps, VFC } from 'react';
import { Typography } from '@mui/material';

import { ContentContainer, StyledButton } from './styled';

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  typoVarient?: 'h4' | 'h5';
  Icon?: VFC<SVGProps<SVGSVGElement>>;
};

export default function Button({ children, Icon, typoVarient = 'h4', type, ...remainder }: ButtonProps) {
  return (
    <StyledButton {...remainder} data-typo-varient={typoVarient} type={type ?? 'button'}>
      <ContentContainer data-is-icon={Icon ? 1 : 0}>
        {Icon && <Icon />}
        <Typography variant={typoVarient}>{children}</Typography>
      </ContentContainer>
    </StyledButton>
  );
}
