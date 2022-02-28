import { Typography } from '@mui/material';

import { StyledButton } from './styled';

type ButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  children?: string;
  isActvie?: boolean;
};

export default function Button({ children, isActvie, type, ...remainder }: ButtonProps) {
  return (
    <StyledButton {...remainder} data-is-active={isActvie ? 1 : 0} type={type || 'button'}>
      <Typography variant="h6">{children}</Typography>
    </StyledButton>
  );
}
