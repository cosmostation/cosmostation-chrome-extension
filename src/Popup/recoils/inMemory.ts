import { atom } from 'recoil';

import type { InMemoryData } from '~/types/inMemory';

export const inMemoryState = atom<InMemoryData>({
  key: 'inMemoryState',
  default: { password: null },
});
