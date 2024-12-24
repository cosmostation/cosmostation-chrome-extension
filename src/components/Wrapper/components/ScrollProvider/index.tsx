import { createContext, useContext, useRef } from 'react';

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

  const scrollToTop = () => {
    setTimeout(() => topRef.current?.scrollIntoView(), 0);
  };
  return (
    <ScrollContext.Provider value={{ scrollToTop }}>
      <div ref={topRef} />
      {children}
    </ScrollContext.Provider>
  );
}
