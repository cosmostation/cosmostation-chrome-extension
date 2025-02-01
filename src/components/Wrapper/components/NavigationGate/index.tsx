import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { Route as Initial } from '@/pages/account/initial';
import { Route as RequestAccount } from '@/pages/popup/request-account';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

type NavigationGateProps = {
  children: JSX.Element;
};

export default function NavigationGate({ children }: NavigationGateProps) {
  const navigate = useNavigate();

  const { accounts, requestQueue } = useExtensionStorageStore((state) => state);

  useEffect(() => {
    void (async () => {
      if (accounts.length === 0) {
        navigate({
          to: Initial.to,
        });
        return;
      }

      if (requestQueue.length > 0) {
        navigate({
          to: RequestAccount.to,
        });
      }
    })();
  }, [accounts.length, navigate, requestQueue.length]);

  return <>{children}</>;
}
