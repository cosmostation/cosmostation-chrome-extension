export interface Cw20Balance {
  contract: string;
  balance: string;
}

export type CommissionResponse = {
  commission: {
    commission: {
      denom: string;
      amount: string;
    }[];
  };
};
