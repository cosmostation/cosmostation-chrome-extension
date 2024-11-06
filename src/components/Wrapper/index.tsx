import BackgroundLayer from './components/BackgroundLayer';
import AppLayout from './components/AppLayout';

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
