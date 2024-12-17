import { Container } from './styled';

type BaseBodyProps = {
  children?: React.ReactNode;
};

export default function BaseBody({ children }: BaseBodyProps) {
  return <Container>{children}</Container>;
}
