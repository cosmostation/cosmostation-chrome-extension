export type SimulateResponse = {
  gas_info?: {
    gas_wanted: string;
    gas_used: string;
  };
  result: unknown;
};
