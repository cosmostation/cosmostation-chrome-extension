import NavigationGate from './components/NavigationGate';
import Scaffold from './components/Scaffold';
import Init from '../Init';

type WrapperProps = {
  children: JSX.Element;
};

export default function Wrapper({ children }: WrapperProps) {
  return (
    <Scaffold>
      <Init>
        <NavigationGate>{children}</NavigationGate>
      </Init>
    </Scaffold>
  );
}
