import { Body as BaseBody, Container } from './styled';

type LayoutProps = {
  children: JSX.Element;
};

export default function Body({ children }: LayoutProps) {
  return (
    <BaseBody>
      <Container>{children}</Container>
    </BaseBody>
  );
}
