import type { AxiosError } from 'axios';
import { JsonRpcProvider } from 'ethers';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import type { EthereumNetwork } from '~/types/chain';

type FetchParams = {
  domain?: string;
  rpcURL?: string;
};

type LookupAddressPayload = string | null;

export function useEnsSWR(network?: EthereumNetwork, domain?: string, config?: SWRConfiguration) {
  const fetcher = async (params: FetchParams) => {
    try {
      const provider = new JsonRpcProvider(network?.rpcURL);

      if (params.domain && params.domain.endsWith('.eth')) {
        const result = await provider.resolveName(params.domain);

        return result;
      }

      return null;
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<LookupAddressPayload, AxiosError>({ domain, rpcURL: network?.rpcURL }, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
    errorRetryCount: 0,
    ...config,
  });

  return { data, error, mutate };
}
