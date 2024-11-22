export type AptosResourceResponse = {
  type: string;
  data: {
    coin: {
      value: string;
    };
    deposit_events: {
      counter: string;
      guid: {
        id: {
          addr: string;
          creation_num: string;
        };
      };
    };
    frozen: boolean;
    withdraw_events: {
      counter: string;
      guid: {
        id: {
          addr: string;
          creation_num: string;
        };
      };
    };
  };
};
