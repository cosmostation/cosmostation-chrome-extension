import { Container } from './styled';

type EdgeAlignerProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  children?: React.ReactNode;
};

export default function EdgeAligner({ children, ...remainder }: EdgeAlignerProps) {
  return <Container {...remainder}>{children}</Container>;
}
