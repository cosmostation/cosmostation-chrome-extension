import { atom } from 'recoil';

type DashboardState = Record<string, Record<string, string>>;

export const dashboardState = atom<DashboardState>({
  key: 'dashboardState',
  default: {},
});
