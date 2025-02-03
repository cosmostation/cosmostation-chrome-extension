import { Container } from './styled';

type SectionStickyContainerProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  children: React.ReactNode;
};
export default function SectionStickyContainer({ children, ...remainder }: SectionStickyContainerProps) {
  return <Container {...remainder}>{children}</Container>;
}
