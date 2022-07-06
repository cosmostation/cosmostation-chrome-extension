export type Amount = {
  denom: string;
  amount: string;
};

export type Pagination = {
  next_key: string | null;
  total: string;
};

export type Uptime = {
  address: string;
  missed_blocks: number;
  over_blocks: number;
};
