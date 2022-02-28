import { Typography } from '@mui/material';

import IconButton from '~/Popup/components/IconButton';

import { Container, LeftContainter } from './styled';

import Copy16Icon from '~/images/icons/Copy16.svg';

type HeaderProps = { children?: string; onClick?: () => void };

export default function Header({ children, onClick }: HeaderProps) {
  return (
    <Container>
      <LeftContainter>
        <Typography variant="h4">{children}</Typography>
      </LeftContainter>
      <IconButton onClick={onClick} Icon={Copy16Icon}>
        Copy
      </IconButton>
    </Container>
  );
}
