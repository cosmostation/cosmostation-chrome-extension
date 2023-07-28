import { useMemo } from 'react';

import { useSquidSWR } from './useSquidSWR';

export function useSquidAssetsSWR() {
  const squid = useSquidSWR({ suspense: true });

  const squidChains = useMemo(() => squid.data?.chains.map((item) => ({ ...item, chainId: String(item.chainId) })), [squid.data?.chains]);
  const filterSquidTokens = (chainId?: string) => squid.data?.tokens.filter((item) => String(item.chainId) === chainId) || [];

  return {
    filterSquidTokens,
    squidChains,
  };
}
