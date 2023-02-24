import { useMemo } from 'react';

import { useSquidSDKSWR } from './useSquidSDKSWR';

export function useSquidAssetsSWR() {
  const squidSDK = useSquidSDKSWR();

  const squidChainList = useMemo(() => squidSDK.data?.chains, [squidSDK.data?.chains]);
  const filteredSquidTokenList = (chainId: string) => squidSDK.data?.tokens.filter((item) => String(item.chainId) === chainId);

  return {
    filteredSquidTokenList,
    squidChainList,
  };
}
