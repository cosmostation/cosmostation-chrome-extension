import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { SuiObjectResponseQuery } from '@mysten/sui.js';

import { SUI } from '~/constants/chain/sui/sui';
import { isAxiosError, post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetObjectsOwnedByAddressResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';
import { useExtensionStorage } from '../../useExtensionStorage';
import { useAccounts } from '../cache/useAccounts';

type FetchParams = {
  url: string;
  address: string;
  query: SuiObjectResponseQuery;
  method: string;
};

type UseGetObjectsOwnedByAddressSWRProps = {
  address?: string;
  network?: SuiNetwork;
  query?: SuiObjectResponseQuery;
};
export function useGetObjectsOwnedByAddressSWR({ network, address, query }: UseGetObjectsOwnedByAddressSWRProps, config?: SWRConfiguration) {
  const chain = SUI;
  const accounts = useAccounts(config?.suspense);
  const { extensionStorage } = useExtensionStorage();
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const addr = address || accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

  const fetcher = async (params: FetchParams) => {
    try {
      return await post<GetObjectsOwnedByAddressResponse>(params.url, {
        jsonrpc: '2.0',
        method: params.method,
        params: [
          params.address,
          {
            ...params.query,
          },
        ],
        id: params.address,
      });
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, error, mutate } = useSWR<GetObjectsOwnedByAddressResponse | null, AxiosError>(
    { url: rpcURL, address: addr, query, method: 'suix_getOwnedObjects' },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      isPaused: () => !addr,
      ...config,
    },
  );

  return { data, error, mutate };
}
