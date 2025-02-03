import { Container } from './styled';

type SectionContainerProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  children: React.ReactNode;
};
export default function SectionContainer({ children, ...remainder }: SectionContainerProps) {
  return <Container {...remainder}>{children}</Container>;
}
