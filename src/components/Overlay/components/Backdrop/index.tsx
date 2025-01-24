import { Container } from './styled';

type BackdropProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  children: React.ReactNode;
};
export default function Backdrop({ children, ...remainder }: BackdropProps) {
  return <Container {...remainder}>{children}</Container>;
}
