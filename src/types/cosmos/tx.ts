export type TxInfoPayload = {
  data: string;
  events: null;
  gas_wanted: string;
  gas_used: string;
  height: string;
  logs: null;
  tx: {
    type: string;
    value: {
      fee: {
        amount: {
          amount: string;
          denom: string;
        }[];
        gas: string;
      };
    };
  };
  txhash: string;
  timestamp: string;
  raw_log: string;
};
