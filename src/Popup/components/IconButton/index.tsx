import type { SVGProps, VFC } from 'react';
import { Typography } from '@mui/material';

import { StyledButton } from './styled';

type IconButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  children?: string;
  Icon: VFC<SVGProps<SVGSVGElement>>;
};

export default function IconButton({ children, Icon, ...remainder }: IconButtonProps) {
  return (
    <StyledButton {...remainder}>
      <Icon />
      <Typography variant="h6">{children}</Typography>
    </StyledButton>
  );
}
