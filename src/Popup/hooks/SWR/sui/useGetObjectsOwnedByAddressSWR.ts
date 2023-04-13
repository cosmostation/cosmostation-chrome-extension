import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { SuiObjectResponseQuery } from '@mysten/sui.js/dist/types';

import { SUI } from '~/constants/chain/sui/sui';
import { isAxiosError, post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetObjectsOwnedByAddressResponse } from '~/types/sui/rpc';

import { useChromeStorage } from '../../useChromeStorage';
import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';
import { useAccounts } from '../cache/useAccounts';

type FetchParams = {
  url: string;
  address: string;
  query?: SuiObjectResponseQuery;
};

type UseGetObjectsOwnedByAddressSWRProps = {
  address?: string;
  network?: SuiNetwork;
  query?: SuiObjectResponseQuery;
};
export function useGetObjectsOwnedByAddressSWR({ network, address, query }: UseGetObjectsOwnedByAddressSWRProps, config?: SWRConfiguration) {
  const chain = SUI;
  const accounts = useAccounts(config?.suspense);
  const { chromeStorage } = useChromeStorage();
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const addr = address || accounts.data?.find((account) => account.id === chromeStorage.selectedAccountId)?.address[chain.id] || '';

  const fetcher = async (params: FetchParams) => {
    try {
      return await post<GetObjectsOwnedByAddressResponse>(params.url, {
        jsonrpc: '2.0',
        method: 'suix_getOwnedObjects',
        params: [
          params.address,
          {
            ...query,
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

  const { data, error, mutate } = useSWR<GetObjectsOwnedByAddressResponse | null, AxiosError>({ url: rpcURL, address: addr }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !addr,
    ...config,
  });

  return { data, error, mutate };
}
