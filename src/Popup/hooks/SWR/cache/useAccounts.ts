import useSWR from 'swr';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { getAddress, getKeyPair } from '~/Popup/utils/common';

type AccountList = {
  id: string;
  address: Record<string, string>;
};

export function useAccounts(suspense?: boolean) {
  const { chromeStorage } = useChromeStorage();
  const { currentAllowedChains } = useCurrentAllowedChains();

  const { inMemory } = useInMemory();

  const { accounts } = chromeStorage;

  const fetcher = () =>
    new Promise<AccountList[]>((res) => {
      setTimeout(() => {
        res(
          accounts.map((account) => {
            const addresses: Record<string, string> = {};

            currentAllowedChains.forEach((chain) => {
              const keypair = getKeyPair(account, chain, inMemory.password);
              const address = getAddress(chain, keypair?.publicKey);
              addresses[chain.id] = address;
            });
            return { id: account.id, address: addresses };
          }),
        );
      }, 500);
    });

  const { data, mutate } = useSWR([accounts, currentAllowedChains], fetcher, {
    suspense,
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    isPaused: () => accounts.length < 1 || currentAllowedChains.length < 1,
  });

  return { data, mutate };
}
