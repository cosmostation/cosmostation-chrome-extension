import { Container } from './styled';

// TODO React.node로 변경
type BaseBodyProps = {
  children?: JSX.Element;
};

export default function BaseBody({ children }: BaseBodyProps) {
  return <Container>{children}</Container>;
}
