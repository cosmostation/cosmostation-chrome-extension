import { Typography } from '@mui/material';

import { shorterAddress } from '~/Popup/utils/common';

import { StyledButton } from './styled';

export default function SelectButton({
  children,
  ...remainder
}: Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & { children?: string }) {
  const address = shorterAddress(children, 30);

  return (
    <StyledButton {...remainder}>
      <Typography variant="h6">{address}</Typography>
    </StyledButton>
  );
}
