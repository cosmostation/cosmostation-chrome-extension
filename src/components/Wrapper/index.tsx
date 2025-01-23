import Init from './components/Init';
import Lock from './components/Lock';
import NavigationGate from './components/NavigationGate';
import RefetchController from './components/RefetchController';
import Scaffold from './components/Scaffold';
import ScrollProvider from './components/ScrollProvider';
import LoadingOverlay from '../Overlay/Loading';

type WrapperProps = {
  children: JSX.Element;
};

export default function Wrapper({ children }: WrapperProps) {
  return (
    <Scaffold>
      <Init>
        <Lock>
          <RefetchController>
            <NavigationGate>
              <>
                <ScrollProvider>{children}</ScrollProvider>
                <LoadingOverlay />
              </>
            </NavigationGate>
          </RefetchController>
        </Lock>
      </Init>
    </Scaffold>
  );
}
