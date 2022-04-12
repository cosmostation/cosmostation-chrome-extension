import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { useNodeInfoSWR } from '~/Popup/hooks/SWR/tendermint/useNodeinfoSWR';
import { get } from '~/Popup/utils/axios';
import type { TendermintChain } from '~/types/chain';
import type { IbcCoinPayload } from '~/types/tendermint/ibcCoin';

export function useIbcCoinSWR(chain: TendermintChain, suspense?: boolean) {
  const nodeInfo = useNodeInfoSWR(chain, suspense);

  const chainId = nodeInfo?.data?.node_info.network;

  const fetcher = (fetchUrl: string) => get<IbcCoinPayload>(fetchUrl);

  const requestURL = `https://api-utility.cosmostation.io/v1/ibc/tokens/${chainId || ''}`;

  const { data, error, mutate } = useSWR<IbcCoinPayload, AxiosError>(requestURL, fetcher, {
    refreshInterval: 0,
    errorRetryCount: 5,
    errorRetryInterval: 3000,
    suspense,
    isPaused: () => !chainId,
  });

  return { data, error, mutate };
}
