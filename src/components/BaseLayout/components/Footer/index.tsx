import { Container } from './styled';

type FooterProps = {
  children?: JSX.Element;
};

export default function Footer({ children }: FooterProps) {
  return <Container>{children}</Container>;
}
