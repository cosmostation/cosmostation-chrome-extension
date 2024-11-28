import { Container } from './styled';

type BaseBodyProps = {
  children?: JSX.Element;
};

export default function BaseBody({ children }: BaseBodyProps) {
  return <Container>{children}</Container>;
}
