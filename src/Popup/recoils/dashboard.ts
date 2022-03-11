import { atom } from 'recoil';

// import type { Chain } from '~/types/chain';

type DashboardState = Record<string, string>;

export const dashboardState = atom<DashboardState>({
  key: 'dashboardState',
  default: {},
});
