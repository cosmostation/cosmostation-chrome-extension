import AppLayout from './components/AppLayout';
import BackgroundLayer from './components/BackgroundLayer';

type WrapperProps = {
  children: JSX.Element;
};

export default function Wrapper({ children }: WrapperProps) {
  return (
    <BackgroundLayer>
      <AppLayout>{children}</AppLayout>
    </BackgroundLayer>
  );
}
