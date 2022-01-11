import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { BalancePayload } from '~/types/cosmos/balance';

type UseCosmosBalanceProps = {
  chain: CosmosChain;
  address: string;
  suspense?: boolean;
};

export function useCosmosBalance({ chain, address, suspense }: UseCosmosBalanceProps) {
  const { getBalance } = cosmosURL(chain);

  const requestURL = getBalance(address);

  const fetcher = (fetchUrl: string) => get<BalancePayload>(fetchUrl);

  const { data, error, mutate } = useSWR<BalancePayload, AxiosError>(requestURL, fetcher, {
    refreshInterval: 0,
    errorRetryCount: 5,
    errorRetryInterval: 3000,
    revalidateOnFocus: false,
    suspense,
  });

  return { data, error, mutate };
}
