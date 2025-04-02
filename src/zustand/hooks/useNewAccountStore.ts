import { produce } from 'immer';
import { create } from 'zustand';

import type { Account } from '@/types/account';
import type { NewAccountState, NewAccountStore } from '@/types/store/newAccount';

const initialState: NewAccountState = {
  account: {} as Account,
};

export const useNewAccountStore = create<NewAccountStore>()((set) => ({
  ...initialState,
  updateNewAccount: async (account) => {
    set((state) =>
      produce(state, (draft) => {
        draft.account = account;
      }),
    );
  },
}));
