import { createContext, useContext, useRef } from 'react';

import { useScrollThreshold } from '@/hooks/useScrollThreshold';

import { PopupLayout } from './styled';

type AppLayoutProps = {
  children: JSX.Element;
};

const ScaffoldRefContext = createContext<React.RefObject<HTMLDivElement> | undefined>(undefined);

export const useScaffoldRef = () => {
  const context = useContext(ScaffoldRefContext);
  if (!context) {
    throw new Error('useScaffoldRef must be used within a ScaffoldRefProvider');
  }
  return context;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  useScrollThreshold(scaffoldRef, 100);

  return (
    <ScaffoldRefContext.Provider value={scaffoldRef}>
      <PopupLayout ref={scaffoldRef}>{children}</PopupLayout>
    </ScaffoldRefContext.Provider>
  );
}
