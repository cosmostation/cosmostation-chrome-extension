import { useRef } from 'react';

import { useScrollThreshold } from '@/hooks/useScrollThreshold';

import { PopupLayout } from './styled';

type AppLayoutProps = {
  children: JSX.Element;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  useScrollThreshold(scaffoldRef, 100);

  return <PopupLayout ref={scaffoldRef}>{children}</PopupLayout>;
}
