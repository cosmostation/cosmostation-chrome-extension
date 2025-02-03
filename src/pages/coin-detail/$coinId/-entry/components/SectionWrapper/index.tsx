import { Container } from './styled';

type SectionWrapperProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  children: React.ReactNode;
};
export default function SectionWrapper({ children, ...remainder }: SectionWrapperProps) {
  return <Container {...remainder}>{children}</Container>;
}
