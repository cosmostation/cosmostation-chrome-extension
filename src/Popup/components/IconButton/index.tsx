import type { SVGProps, VFC } from 'react';
import { Typography } from '@mui/material';

import { StyledButton } from './styled';

type IconButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  children?: string;
  Icon: VFC<SVGProps<SVGSVGElement>>;
};

export default function IconButton({ children, Icon, type, ...remainder }: IconButtonProps) {
  return (
    <StyledButton {...remainder} type={type || 'button'}>
      <Icon />
      <Typography variant="h6">{children}</Typography>
    </StyledButton>
  );
}
