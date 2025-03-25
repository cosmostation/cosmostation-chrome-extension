type NewSortedMnemonicAccount = string[];
type NewSortedPrivatedAccount = string[];

export interface NewSortedAccountState {
  menmonicRestoreStrings: NewSortedMnemonicAccount;
  privateKeyAccountIds: NewSortedPrivatedAccount;
}

export type NewSortedAccountActions = {
  updatedNewSortedMnemonicAccounts: (newSorted: NewSortedAccountState['menmonicRestoreStrings']) => void;
  updatedNewSortedPrivateAccounts: (newSorted: NewSortedAccountState['privateKeyAccountIds']) => void;
  resetNewSortedAccount: () => void;
};

export type NewSortedAccountStore = NewSortedAccountState & NewSortedAccountActions;
