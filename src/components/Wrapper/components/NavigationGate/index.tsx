import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { Route as Initial } from '@/pages/account/initial';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

type NavigationGateProps = {
  children: JSX.Element;
};

export default function NavigationGate({ children }: NavigationGateProps) {
  const navigate = useNavigate();

  const { accounts } = useExtensionStorageStore((state) => state);

  useEffect(() => {
    void (async () => {
      if (accounts.length === 0) {
        navigate({
          to: Initial.to,
        });
        return;
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
