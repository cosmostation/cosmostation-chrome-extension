import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { CosmosChain } from '~/types/chain';
import type { SupportedContract } from '~/types/cosmos/supportContracts';

export function useSupportContractsSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const requestURL = `https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/${chain.chainName.toLowerCase()}/cw721.json`;

  const fetcher = (fetchUrl: string) => get<SupportedContract[]>(fetchUrl);

  const { data, error, mutate } = useSWR<SupportedContract[], AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
