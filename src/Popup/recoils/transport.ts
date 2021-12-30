import { atom } from 'recoil';
import type Transport from '@ledgerhq/hw-transport';

export const transportState = atom<Transport | null>({
  key: 'transportState',
  default: null,
});
