import { useMemo } from 'react';

import { useSquidSDkSWR } from './useSquidSDKSWR';

export function useSquidAssetsSWR() {
  const squidSDK = useSquidSDkSWR();

  const squidChainList = useMemo(() => squidSDK.data?.chains, [squidSDK.data?.chains]);
  const filteredSquidTokenList = (chainId: string) => squidSDK.data?.tokens.filter((item) => String(item.chainId) === chainId);

  return {
    filteredSquidTokenList,
    squidChainList,
  };
}
