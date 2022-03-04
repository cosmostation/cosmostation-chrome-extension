import { Typography } from '@mui/material';

import { StyledButton } from './styled';

type IconButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  children?: string;
  Icon: SvgElement;
};

export default function IconButton({ children, Icon, type, ...remainder }: IconButtonProps) {
  return (
    <StyledButton {...remainder} type={type || 'button'}>
      <Icon />
      <Typography variant="h6">{children}</Typography>
    </StyledButton>
  );
}
