import { atom } from 'recoil';

export const loadingOverlayState = atom({
  key: 'loadingOverlayState',
  default: false,
});

export const disposableLoadingState = atom({
  key: 'disposableLoadingState',
  default: false,
});

export const loadingLedgerSigningState = atom({
  key: 'loadingLedgerSigningState',
  default: false,
});
