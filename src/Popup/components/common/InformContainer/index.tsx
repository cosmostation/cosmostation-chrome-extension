import { Container, IconContainer, TextContainer } from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

export type InformVarient = 'info' | 'warning';

type InformContainerProps = {
  varient: InformVarient;
  children: JSX.Element;
};

export default function InformContainer({ varient, children }: InformContainerProps) {
  return (
    <Container data-varient={varient}>
      <IconContainer data-varient={varient}>
        <Info16Icon />
      </IconContainer>
      <TextContainer data-varient={varient}>{children}</TextContainer>
    </Container>
  );
}
