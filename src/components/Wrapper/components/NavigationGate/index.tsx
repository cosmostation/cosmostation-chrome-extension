import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { Route as Initial } from '@/pages/account/initial';
import { Route as CosmosAddToken } from '@/pages/popup/cosmos/add-token';
import { Route as CosmosAddChain } from '@/pages/popup/cosmos/addChain';
import { Route as CosmosSignAmino } from '@/pages/popup/cosmos/sign/amino';
import { Route as CosmosSignDirect } from '@/pages/popup/cosmos/sign/direct';
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
    case 'cos_signAmino':
      return CosmosSignAmino.to;
    case 'cos_signDirect':
      return CosmosSignDirect.to;
    case 'cos_addTokensCW20Internal':
      return CosmosAddToken.to;

    default:
      return '';
  }
};
