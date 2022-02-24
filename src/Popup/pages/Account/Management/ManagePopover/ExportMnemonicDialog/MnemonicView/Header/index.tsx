import { Typography } from '@mui/material';

import { Container, LeftContainter, StyledButton } from './styled';

import Copy16Icon from '~/images/icons/Copy16.svg';

type HeaderProps = { children?: string; onClick?: () => void };

export default function Header({ children, onClick }: HeaderProps) {
  return (
    <Container>
      <LeftContainter>
        <Typography variant="h4">{children}</Typography>
      </LeftContainter>
      <StyledButton onClick={onClick}>
        <Copy16Icon />
        <Typography variant="h6">Copy</Typography>
      </StyledButton>
    </Container>
  );
}
