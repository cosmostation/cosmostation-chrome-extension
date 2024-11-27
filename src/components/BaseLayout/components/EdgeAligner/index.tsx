import { Container } from './styled';

type EdgeAlignerProps = {
  children?: JSX.Element;
};

export default function EdgeAligner({ children }: EdgeAlignerProps) {
  return <Container>{children}</Container>;
}
