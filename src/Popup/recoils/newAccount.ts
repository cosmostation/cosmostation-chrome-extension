import { atom } from 'recoil';

type NewAccountState = {
  accountName: string;
  mnemonic: string;
  addressIndex: string;
};

export const newAccountState = atom<NewAccountState>({
  key: 'newAccountState',
  default: {
    accountName: '',
    mnemonic: '',
    addressIndex: '0',
  },
});
