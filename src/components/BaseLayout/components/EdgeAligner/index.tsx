import { Container } from './styled';

type EdgeAlignerProps = {
  children?: React.ReactNode;
};

export default function EdgeAligner({ children }: EdgeAlignerProps) {
  return <Container>{children}</Container>;
}
