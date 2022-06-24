import { Typography } from '@mui/material';

import { Button, TextContainer } from './styled';

import Plus16Icon from '~/images/icons/Plus16.svg';

type AddButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & { children?: string };

export default function AddButton({ children, type = 'button', ...remainder }: AddButtonProps) {
  return (
    <Button {...remainder} type={type}>
      <Plus16Icon />
      <TextContainer>
        <Typography variant="h6">{children}</Typography>
      </TextContainer>
    </Button>
  );
}
