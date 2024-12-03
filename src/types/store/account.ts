import type { AccountWithName } from '../account';

export interface CurrentAccountState {
  account: AccountWithName;
}

export type CurrentAccountStateActions = {
  updateCurrentAccount: (id: CurrentAccountState['account']['id']) => void;
  removeAccount: (id: CurrentAccountState['account']['id']) => void;
};

export type CurrentAccountStore = CurrentAccountState & CurrentAccountStateActions;
