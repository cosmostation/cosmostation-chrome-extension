import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { convertToValidatorAddress, cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { CommissionPayload } from '~/types/cosmos/commission';

import { useParamsSWR } from './useParamsSWR';
import { useExtensionStorage } from '../../useExtensionStorage';
import { useAccounts } from '../cache/useAccounts';

export function useCommissionSWR(chain: CosmosChain, validatorAddress?: string, config?: SWRConfiguration) {
  const accounts = useAccounts();
  const { extensionStorage } = useExtensionStorage();

  const params = useParamsSWR(chain, config);

  const validatorAddressPrefix = useMemo(
    () => params.data?.params?.chainlist_params?.bechValidatorPrefix || '',
    [params.data?.params?.chainlist_params?.bechValidatorPrefix],
  );

  const address = useMemo(
    () => accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '',
    [accounts.data, chain.id, extensionStorage.selectedAccountId],
  );

  const { getCommission } = cosmosURL(chain);

  const currentValidatorAddress = useMemo(
    () => validatorAddress || convertToValidatorAddress(address, validatorAddressPrefix),
    [address, validatorAddress, validatorAddressPrefix],
  );

  const requestURL = useMemo(() => currentValidatorAddress && getCommission(currentValidatorAddress), [currentValidatorAddress, getCommission]);

  const fetcher = async (fetchUrl?: string) => {
    try {
      if (!fetchUrl) {
        return null;
      }

      return await get<CommissionPayload>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<CommissionPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !chain,
    ...config,
  });

  return { data, error, mutate };
}
