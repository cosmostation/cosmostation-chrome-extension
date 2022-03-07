import { atom } from 'recoil';

type NewMnemonicAccountState = {
  accountName: string;
  mnemonic: string;
  addressIndex: string;
};

export const newMnemonicAccountState = atom<NewMnemonicAccountState>({
  key: 'newMnemonicAccountState',
  default: {
    accountName: '',
    mnemonic: '',
    addressIndex: '0',
  },
});

type NewPrivateKeyAccountState = {
  accountName: string;
  privateKey: string;
};

export const newPrivateKeyAccountState = atom<NewPrivateKeyAccountState>({
  key: 'newPrivateKeyAccountState',
  default: {
    accountName: '',
    privateKey: '',
  },
});
