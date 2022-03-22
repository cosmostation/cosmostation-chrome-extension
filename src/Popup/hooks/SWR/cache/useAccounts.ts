import useSWR from 'swr';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { getAddress, getKeyPair } from '~/Popup/utils/common';

type AccountList = {
  id: string;
  address: Record<string, string>;
};

export function useAccounts(suspense?: boolean) {
  const { chromeStorage } = useChromeStorage();
  const { currentAllowedChains } = useCurrentAllowedChains();
  const { currentPassword } = useCurrentPassword();

  const { accounts, additionalChains } = chromeStorage;

  const fetcher = () =>
    new Promise<AccountList[]>((res) => {
      setTimeout(() => {
        res(
          accounts.map((account) => {
            const addresses: Record<string, string> = {};

            [...currentAllowedChains, ...additionalChains].forEach((chain) => {
              const keypair = getKeyPair(account, chain, currentPassword);
              const address = getAddress(chain, keypair?.publicKey);
              addresses[chain.id] = address;
            });
            return { id: account.id, address: addresses };
          }),
        );
      }, 500);
    });

  const { data, mutate } = useSWR([accounts, currentAllowedChains, additionalChains], fetcher, {
    suspense,
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    isPaused: () => accounts.length < 1 || [...currentAllowedChains, ...additionalChains].length < 1,
  });

  return { data, mutate };
}
