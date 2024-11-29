import { Container } from './styled';

type BaseFooterProps = {
  children?: JSX.Element;
};

export default function BaseFooter({ children }: BaseFooterProps) {
  return <Container>{children}</Container>;
}
