import type { RequestStatus } from '../account';

export interface Grc20Balance {
  contract: string;
  balance: string;
  lastUpdatedAtMs?: number | null;
  status?: RequestStatus;
}
