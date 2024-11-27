import AppLayout from './components/AppLayout';
import BackgroundLayer from './components/BackgroundLayer';

type ScaffoldProps = {
  children: JSX.Element;
};

export default function Scaffold({ children }: ScaffoldProps) {
  return (
    <BackgroundLayer>
      <AppLayout>{children}</AppLayout>
    </BackgroundLayer>
  );
}
