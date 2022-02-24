import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import { Container, LeftContainter, StyledButton } from './styled';

import Close24Icon from '~/images/icons/Close24.svg';

type HeaderProps = { children?: string; onClose?: DialogProps['onClose'] };

export default function Header({ children, onClose }: HeaderProps) {
  return (
    <Container>
      <LeftContainter>
        <Typography variant="h4">{children}</Typography>
      </LeftContainter>
      <StyledButton onClick={() => onClose?.({}, 'backdropClick')}>
        <Close24Icon />
      </StyledButton>
    </Container>
  );
}
