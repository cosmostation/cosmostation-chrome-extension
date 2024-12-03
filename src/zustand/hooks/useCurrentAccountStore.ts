import { produce } from 'immer';
import { create } from 'zustand';

import type { AccountWithName } from '@/types/account';
import type { CurrentAccountState, CurrentAccountStore } from '@/types/store/account';
import { getAllExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';
import { toastError } from '@/utils/toast';

// TODO 이렇게 하나하나 찢는게 나은건지 아니면 익스텐션 스토리지를 통채로 저장하는게 나은건지 고민해보기
const initialState: CurrentAccountState = {
  account: {} as AccountWithName,
};

export const useCurrentAccountStore = create<CurrentAccountStore>()((set) => {
  return {
    ...initialState,
    updateCurrentAccount: async (id) => {
      const { accounts, accountNamesById } = await getAllExtensionLocalStorage();
      const selectedAccount = accounts.find((account) => account.id === id);
      const accountName = accountNamesById[id];

      if (selectedAccount) {
        await setExtensionLocalStorage('selectedAccountId', id);

        set((state) =>
          produce(state, (draft) => {
            draft.account = {
              ...selectedAccount,
              name: accountName,
            };
          }),
        );
      } else {
        toastError('Failed to update current account');
      }
    },
    removeAccount: async (id) => {
      const { accounts, accountNamesById, selectedAccountId } = await getAllExtensionLocalStorage();

      const newAccounts = accounts.filter((acc) => acc.id !== id);

      if (id === selectedAccountId) {
        await setExtensionLocalStorage('selectedAccountId', newAccounts?.[0]?.id ?? '');
      }

      await setExtensionLocalStorage('accounts', newAccounts);

      const deepCopiedAccountName = { ...accountNamesById };

      delete deepCopiedAccountName[id];

      await setExtensionLocalStorage('accountNamesById', deepCopiedAccountName);

      set((state) =>
        produce(state, (draft) => {
          draft.account = {} as AccountWithName;
        }),
      );
    },
  };
});

export const loadCurrentAccountStoreFromStorage = async () => {
  const { accounts, accountNamesById, selectedAccountId } = await getAllExtensionLocalStorage();

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);
  const accountName = accountNamesById[selectedAccountId];

  if (selectedAccount) {
    useCurrentAccountStore.setState({
      account: {
        ...selectedAccount,
        name: accountName,
      },
    });
  }
};
