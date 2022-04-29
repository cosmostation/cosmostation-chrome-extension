import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { tendermintURL } from '~/Popup/utils/tendermint';
import type { TendermintChain } from '~/types/chain';
import type { NodeInfoPayload } from '~/types/tendermint/nodeInfo';

export function useNodeInfoSWR(chain: TendermintChain, suspense?: boolean) {
  const { getNodeInfo } = tendermintURL(chain);

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
