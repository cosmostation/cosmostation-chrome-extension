import type { Account } from '../account';

type NewAccount = Account;

export interface NewAccountState {
  account: NewAccount;
}

export type NewAccountStateActions = {
  updateNewAccount: (account: NewAccountState['account']) => void;
};

export type NewAccountStore = NewAccountState & NewAccountStateActions;
