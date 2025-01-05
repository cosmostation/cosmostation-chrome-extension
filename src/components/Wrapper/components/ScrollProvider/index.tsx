import { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from '@tanstack/react-router';

const ScrollContext = createContext<{ scrollToTop: () => void } | undefined>(undefined);

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};

type ScrollProviderProps = {
  children: JSX.Element;
};

export default function ScrollProvider({ children }: ScrollProviderProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView();
    }
  };

  useEffect(() => {
    requestAnimationFrame(scrollToTop);
  }, [pathname]);

  return (
    <ScrollContext.Provider value={{ scrollToTop }}>
      <div ref={topRef} />
      {children}
    </ScrollContext.Provider>
  );
}
