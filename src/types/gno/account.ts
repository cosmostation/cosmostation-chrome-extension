export interface AuthAccount {
  BaseAccount: {
    address: string;
    coins: string;
    public_key: unknown;
    account_number: string;
    sequence: string;
  };
  attributes: string;
}

export interface Account {
  account_number: string;
  sequence: string;

  address?: string;
  coins?: string;
  public_key?: unknown;
}
