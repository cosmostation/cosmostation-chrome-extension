export interface Erc20Balance {
  contract: string;
  balance: string;
  lastUpdatedAtMs?: number | null;
}
