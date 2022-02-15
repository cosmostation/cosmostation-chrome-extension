import { Typography } from '@mui/material';

import { StyledButton } from './styled';

export default function SelectButton({
  children,
  ...remainder
}: Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & { children?: string }) {
  const address = children
    ? children.length > 20
      ? `${children.substring(0, 8)}...${children.substring(children.length - 8, children.length)}`
      : children
    : '';
  return (
    <StyledButton {...remainder}>
      <Typography variant="h6">{address}</Typography>
    </StyledButton>
  );
}
