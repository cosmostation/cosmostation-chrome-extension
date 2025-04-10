import Init from './components/Init';
import Lock from './components/Lock';
import MigrationChecker from './components/MigrationChecker';
import NavigationGate from './components/NavigationGate';
import RefetchController from './components/RefetchController';
import Scaffold from './components/Scaffold';
import ScrollProvider from './components/ScrollProvider';
import SidePanelStateObserver from './components/SidePanelNavigation';
import AdPopoverIndex from '../Overlay/AdPopoverIndex';
import LoadingOverlay from '../Overlay/Loading';

type WrapperProps = {
  children: JSX.Element;
};

export default function Wrapper({ children }: WrapperProps) {
  return (
    <Scaffold>
      <MigrationChecker>
        <SidePanelStateObserver>
          <Init>
            <Lock>
              <RefetchController>
                <NavigationGate>
                  <>
                    <ScrollProvider>{children}</ScrollProvider>
                    <LoadingOverlay />
                    <AdPopoverIndex />
                  </>
                </NavigationGate>
              </RefetchController>
            </Lock>
          </Init>
        </SidePanelStateObserver>
      </MigrationChecker>
    </Scaffold>
  );
}
