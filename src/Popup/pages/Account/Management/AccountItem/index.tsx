import { Typography } from '@mui/material';

import { Container, LeftContainer, RightContainer, StyledButton } from './styled';

import Add24Icon from '~/images/icons/Add24.svg';

type AccountItemProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  children?: string;
  isActive?: boolean;
};

export default function AccountItem({ children, isActive, ...remainder }: AccountItemProps) {
  return (
    <Container>
      <LeftContainer>
        <Typography variant="h5">{children}</Typography>
      </LeftContainer>
      <RightContainer>
        <StyledButton data-is-active={isActive ? 1 : 0} {...remainder}>
          <Add24Icon />
        </StyledButton>
      </RightContainer>
    </Container>
  );
}
