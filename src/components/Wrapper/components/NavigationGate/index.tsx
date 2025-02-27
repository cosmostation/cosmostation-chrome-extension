import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { Route as Initial } from '@/pages/account/initial';
import { Route as CosmosAddChain } from '@/pages/popup/cosmos/addChain';
import { Route as RequestAccount } from '@/pages/popup/request-account';
import type { CosmosRequest } from '@/types/message/inject/cosmos';
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
        if (requestQueue[0].chainType === 'cosmos')
          navigate({
            to: getNavigationPathForCosmosRequest(requestQueue[0]),
          });
      }
    })();
  }, [accounts.length, navigate, requestQueue]);

  return <>{children}</>;
}

const getNavigationPathForCosmosRequest = (requestQueue: CosmosRequest) => {
  switch (requestQueue.method) {
    case 'cos_requestAccount':
      return RequestAccount.to;
    case 'cos_addChain':
      return CosmosAddChain.to;
    default:
      return '';
  }
};
