import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWRInfinite from 'swr/infinite';

import { get } from '~/Popup/utils/axios';
import { convertCosmosToAssetName } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { ActivitiesResponse } from '~/types/cosmos/activity';

import { useExtensionStorage } from '../../useExtensionStorage';
import { useAccounts } from '../cache/useAccounts';

export function useActivitiesSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const mappingName = convertCosmosToAssetName(chain);

  const accounts = useAccounts(config?.suspense);
  const { extensionStorage } = useExtensionStorage();

  const address = useMemo(
    () => accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '',
    [accounts.data, chain.id, extensionStorage.selectedAccountId],
  );

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<ActivitiesResponse>(fetchUrl);
    } catch {
      return null;
    }
  };

  const { data, error, mutate, size, setSize } = useSWRInfinite<ActivitiesResponse | null, AxiosError>(
    (pageIndex, previousPageData: ActivitiesResponse) => {
      if (previousPageData && previousPageData.length < 1) return null;

      if (pageIndex === 0) return `https://front.api.mintscan.io/v10/${mappingName}/account/${address}/txs?limit=10`;

      const cursor = previousPageData[previousPageData.length - 1].search_after || '';

      return `https://front.api.mintscan.io/v10/${mappingName}/account/${address}/txs?limit=10&search_after=${cursor}`;
    },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      persistSize: true,
      isPaused: () => !chain || !address,
      ...config,
    },
  );

  return { data, error, mutate, size, setSize };
}
