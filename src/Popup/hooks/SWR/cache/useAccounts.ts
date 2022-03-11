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
    });

  const { data, mutate } = useSWR([accounts, currentAllowedChains], fetcher, {
    suspense,
    revalidateOnFocus: false,
  });

  return { data, mutate };
}
