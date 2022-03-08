import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { get } from '~/Popup/utils/axios';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { BalancePayload } from '~/types/cosmos/balance';

export function useBalanceSWR(chain: CosmosChain, suspense?: boolean) {
  const { currentAccount } = useCurrentAccount();
  const { inMemory } = useInMemory();

  const keyPair = getKeyPair(currentAccount, chain, inMemory.password);
  const address = getAddress(chain, keyPair?.publicKey);
  const { getBalance } = cosmosURL(chain);

  const requestURL = getBalance(address);

  const fetcher = (fetchUrl: string) => get<BalancePayload>(fetchUrl);

  const { data, error, mutate } = useSWR<BalancePayload, AxiosError>(requestURL, fetcher, {
    refreshInterval: 0,
    errorRetryCount: 5,
    errorRetryInterval: 3000,
    revalidateOnFocus: false,
    suspense,
    isPaused: () => !address,
  });

  return { data, error, mutate };
}
