import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { Route as Initial } from '@/pages/account/initial';
import type { ExtensionStorage } from '@/types/extension';

type NavigationGateProps = {
  children: JSX.Element;
};

export default function NavigationGate({ children }: NavigationGateProps) {
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      const { accounts } = await chrome.storage.local.get<ExtensionStorage>('accounts');

      if (!accounts) {
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
