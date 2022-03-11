import { atom } from 'recoil';

export const loadingOverlayState = atom({
  key: 'loadingOverlayState',
  default: false,
});

export const disposableLoadingState = atom({
  key: 'disposableLoadingState',
  default: false,
});
