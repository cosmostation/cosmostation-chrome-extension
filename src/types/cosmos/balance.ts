export interface Cw20Balance {
  contract: string;
  balance: string;
  lastUpdatedAtMs?: number | null;
}

export type CommissionResponse = {
  commission: {
    commission: {
      denom: string;
      amount: string;
    }[];
  };
};
