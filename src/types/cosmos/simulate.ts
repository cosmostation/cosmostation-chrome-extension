export type SimulatePayload = {
  gas_info?: {
    gas_wanted: string;
    gas_used: string;
  };
  result: unknown;
};
