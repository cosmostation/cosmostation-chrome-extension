import { Container } from './styled';

type BackdropProps = {
  children: React.ReactNode;
};
export default function Backdrop({ children }: BackdropProps) {
  return <Container>{children}</Container>;
}
