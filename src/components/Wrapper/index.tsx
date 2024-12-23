import Init from './components/Init';
import Lock from './components/Lock';
import NavigationGate from './components/NavigationGate';
import RefetchController from './components/RefetchController';
import Scaffold from './components/Scaffold';

type WrapperProps = {
  children: JSX.Element;
};

export default function Wrapper({ children }: WrapperProps) {
  return (
    <Scaffold>
      <Init>
        <Lock>
          <RefetchController>
            <NavigationGate>{children}</NavigationGate>
          </RefetchController>
        </Lock>
      </Init>
    </Scaffold>
  );
}
