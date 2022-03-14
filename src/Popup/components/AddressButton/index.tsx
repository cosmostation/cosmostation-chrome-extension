import { Typography } from '@mui/material';

import { StyledButton } from './styled';

export default function SelectButton({
  children,
  ...remainder
}: Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & { children?: string }) {
  const address = children
    ? children.length > 30
      ? `${children.substring(0, 14)}...${children.substring(children.length - 14, children.length)}`
      : children
    : '';
  return (
    <StyledButton {...remainder}>
      <Typography variant="h6">{address}</Typography>
    </StyledButton>
  );
}
