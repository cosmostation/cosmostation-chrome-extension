import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { APTOS } from '~/constants/chain/aptos/aptos';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { get, isAxiosError } from '~/Popup/utils/axios';
import type { ResourcesPayload } from '~/types/aptos/accounts';
import type { AptosNetwork } from '~/types/chain';

import { useCurrentAptosNetwork } from '../../useCurrent/useCurrentAptosNetwork';

type FetchParams = {
  url: string;
  address: string;
};

type useAccountResourcesSWRProps = {
  network?: AptosNetwork;
  address?: string;
};

export function useAccountResourcesSWR({ address, network }: useAccountResourcesSWRProps, config?: SWRConfiguration) {
  const chain = APTOS;
  const accounts = useAccounts(config?.suspense);
  const { extensionStorage } = useExtensionStorage();
  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { restURL } = network || currentAptosNetwork;

  const addr = address || accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

  const fetcher = async (params: FetchParams) => {
    try {
      return await get<ResourcesPayload>(`${params.url}/v1/accounts/${params.address}/resources`);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return [];
        }
      }
      throw e;
    }
  };

  const { data, error, mutate } = useSWR<ResourcesPayload, AxiosError>({ url: restURL, address: addr }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
    refreshInterval: 11000,
    errorRetryCount: 0,
    isPaused: () => !addr,
    ...config,
  });

  return { data, error, mutate };
}
