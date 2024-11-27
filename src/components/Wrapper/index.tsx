import NavigationGate from './components/NavigationGate';
import Scaffold from './components/Scaffold';

type WrapperProps = {
  children: JSX.Element;
};

export default function Wrapper({ children }: WrapperProps) {
  return (
    <Scaffold>
      <NavigationGate>{children}</NavigationGate>
    </Scaffold>
  );
}
