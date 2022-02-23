import useSWR from 'swr';

import { CHAINS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { getAddress } from '~/Popup/utils/common';
import { getKeyPair } from '~/Popup/utils/crypto';

type AccountList = {
  id: string;
  address: string;
  isActive: boolean;
};

export function useAccounts() {
  const { chromeStorage } = useChromeStorage();

  const { inMemory } = useInMemory();

  const { accounts, selectedAccountId } = chromeStorage;

  const fetcher = () =>
    new Promise<AccountList[]>((res) => {
      res(
        accounts.map((account) => {
          const accountChainId = chromeStorage.selectedChainId[account.id];
          const accountChain = CHAINS.find((chain) => chain.id === accountChainId)!;
          const keypair = getKeyPair(account, accountChain, inMemory.password);
          const address = getAddress(accountChain, keypair?.publicKey);
          return { id: account.id, address, isActive: account.id === selectedAccountId };
        }),
      );
    });

  const { data, mutate } = useSWR('accountList', fetcher, {
    refreshInterval: 0,
    errorRetryCount: 5,
    errorRetryInterval: 3000,
    revalidateOnFocus: false,
    suspense: true,
  });

  return { data, mutate };
}
