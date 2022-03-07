import { atom } from 'recoil';

import type { Chain } from '~/types/chain';

type DashboardState = {
  chain: Chain;
  amount: string;
  price: string;
  cap: string;
};

export const dashboardState = atom<DashboardState[]>({
  key: 'dashboardState',
  default: [],
});
