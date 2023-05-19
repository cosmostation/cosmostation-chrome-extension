import { Container, IconContainer, TextContainer } from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

type WarningContainerProps = {
  children: JSX.Element;
};

export default function WarningContainer({ children }: WarningContainerProps) {
  return (
    <Container>
      <IconContainer>
        <Info16Icon />
      </IconContainer>
      <TextContainer>{children}</TextContainer>
    </Container>
  );
}
