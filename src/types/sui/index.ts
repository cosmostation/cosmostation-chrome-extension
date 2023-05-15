import type { PERMISSION } from '~/constants/sui';

export type Permission = ValueOf<typeof PERMISSION>;

export type SuiStandardEvent = {
  network?: { env: string; customRpcUrl?: string };
  accounts?: string[];
  type: string;
};
