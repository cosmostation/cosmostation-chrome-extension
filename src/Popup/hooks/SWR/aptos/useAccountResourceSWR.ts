import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { APTOS } from '~/constants/chain/aptos/aptos';
import { get, isAxiosError } from '~/Popup/utils/axios';
import type { AccountType, ReturnType } from '~/types/aptos/accounts';
import type { AptosNetwork } from '~/types/chain';

import { useCurrentAptosNetwork } from '../../useCurrent/useCurrentAptosNetwork';
import { useExtensionStorage } from '../../useExtensionStorage';
import { useAccounts } from '../cache/useAccounts';

type FetchParams = {
  url: string;
  address: string;
  resourceType: string;
};

type UseAccountResourceSWRProps<T> = {
  address?: string;
  resourceType: T;
  resourceTarget?: string;
  network?: AptosNetwork;
};

export function useAccountResourceSWR<T extends AccountType>(
  { resourceType, resourceTarget, network, address }: UseAccountResourceSWRProps<T>,
  config?: SWRConfiguration,
) {
  const resourceQuery = resourceTarget ? `${resourceType}<${resourceTarget}>` : resourceType;

  const chain = APTOS;
  const accounts = useAccounts(config?.suspense);
  const { extensionStorage } = useExtensionStorage();
  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { restURL } = network || currentAptosNetwork;

  const addr = address || accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

  const fetcher = async (params: FetchParams) => {
    try {
      return await get<ReturnType<T>>(`${params.url}/v1/accounts/${params.address}/resource/${params.resourceType}`);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, error, mutate } = useSWR<ReturnType<T> | null, AxiosError>({ url: restURL, address: addr, resourceType: resourceQuery }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
    refreshInterval: 11000,
    errorRetryCount: 0,
    isPaused: () => !addr || !resourceQuery,
    ...config,
  });

  return { data, error, mutate };
}
