import useSWR from 'swr';

import { CHAINS } from '~/constants/chain';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { getAddress, getAddressKey, getKeyPair } from '~/Popup/utils/common';
import type { AccountType } from '~/types/extensionStorage';

type AccountList = {
  id: string;
  address: Record<string, string>;
  type: AccountType;
};

export function useAccounts(suspense?: boolean) {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { currentPassword } = useCurrentPassword();

  const { accounts, additionalChains, address } = extensionStorage;

  const fetcher = () =>
    new Promise<AccountList[]>((res) => {
      setTimeout(() => {
        const accountAddress: Record<string, string> = {};

        const result = accounts.map((account) => {
          const addresses: Record<string, string> = {};

          [...CHAINS, ...additionalChains].forEach((chain) => {
            // 추후 삭제 예정
            const legacyKey = `${account.id}${chain.id}`;
            const legacyStorageAddress = localStorage.getItem(legacyKey);

            const key = getAddressKey(account, chain);
            const storageAddress = address?.[key];

            if (storageAddress) {
              addresses[chain.id] = storageAddress;
              accountAddress[key] = storageAddress;
            } else if (legacyStorageAddress) {
              addresses[chain.id] = legacyStorageAddress;
              accountAddress[key] = legacyStorageAddress;
            } else {
              const keypair = getKeyPair(account, chain, currentPassword);
              const chainAddress = getAddress(chain, keypair?.publicKey);

              addresses[chain.id] = chainAddress;
              accountAddress[key] = chainAddress;
            }
          });
          return { id: account.id, address: addresses, type: account.type };
        });

        if (Object.keys(accountAddress).join('') !== (address && Object.keys(address).join(''))) {
          void setExtensionStorage('address', accountAddress);
        }

        res(result);
      }, 500);
    });

  const { data, mutate } = useSWR([accounts, additionalChains], fetcher, {
    suspense,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    isPaused: () => accounts.length < 1 || [...CHAINS, ...additionalChains].length < 1,
  });

  return { data, mutate };
}
