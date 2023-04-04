import { useMemo } from 'react';

import { useSquidSDKSWR } from './useSquidSDKSWR';

export function useSquidAssetsSWR() {
  const squidSDK = useSquidSDKSWR({ suspense: true });

  const squidChains = useMemo(() => squidSDK.data?.chains.map((item) => ({ ...item, chainId: String(item.chainId) })), [squidSDK.data?.chains]);
  const filterSquidTokens = (chainId?: string) => squidSDK.data?.tokens.filter((item) => String(item.chainId) === chainId) || [];

  return {
    filterSquidTokens,
    squidChains,
  };
}
