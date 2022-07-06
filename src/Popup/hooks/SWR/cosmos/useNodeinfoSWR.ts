import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { NodeInfoPayload } from '~/types/cosmos/nodeInfo';

export function useNodeInfoSWR(chain: CosmosChain, suspense?: boolean) {
  const { getNodeInfo } = cosmosURL(chain);

  const requestURL = getNodeInfo();

  const fetcher = (fetchUrl: string) => get<NodeInfoPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<NodeInfoPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 0,
    errorRetryCount: 0,
    suspense,
    isPaused: () => !chain,
  });

  return { data, error, mutate };
}
