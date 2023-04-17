import { useMemo } from 'react';

import { useSquidSWR } from './useSquidSWR';

export function useSquidAssetsSWR() {
  const squidSDK = useSquidSWR({ suspense: true });

  const squidChains = useMemo(() => squidSDK.data?.chains.map((item) => ({ ...item, chainId: String(item.chainId) })), [squidSDK.data?.chains]);
  const filterSquidTokens = (chainId?: string) => squidSDK.data?.tokens.filter((item) => String(item.chainId) === chainId) || [];

  return {
    filterSquidTokens,
    squidChains,
  };
}
