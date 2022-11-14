import type { ACCOUNT_TYPE } from '~/constants/aptos';

export type ResourcePayload<T = unknown> = {
  type: string;
  data: T;
};

export type ResourcesPayload = ResourcePayload[];

export type AccountType = ValueOf<typeof ACCOUNT_TYPE>;

export type Events = {
  counter: string;
  guid: {
    id: {
      addr: string;
      creation_num: string;
    };
  };
};

export type X1CoinCoinstore = {
  type: string;
  data: {
    coin: {
      value: string;
    };
    deposit_events: Events;
    withdraw_events: Events;
    frozen: boolean;
  };
};

export type Vec = {
  limit: string;
  value: string;
};

export type SupplyVec = {
  aggregator: {
    vec: Vec[];
  };
  integer: {
    vec: Vec[];
  };
};

export type X1CoinCoininfo = {
  type: string;
  data: {
    decimals: number;
    name: string;
    symbol: string;
    supply: {
      vec: SupplyVec[];
    };
  };
};

export type X1AccountAccount = {
  type: string;
  data: {
    authentication_key: string;
    coin_register_events: Events;
    guid_creation_num: string;
    key_rotation_events: Events;
    rotation_capability_offer: {
      for: {
        vec: unknown[];
      };
    };
    sequence_number: string;
    signer_capability_offer: {
      for: {
        vec: unknown[];
      };
    };
  };
};

export type ReturnType<T> = T extends typeof ACCOUNT_TYPE.X1___COIN___COIN_STORE
  ? X1CoinCoinstore
  : T extends typeof ACCOUNT_TYPE.X1___ACCOUNT___ACCOUNT
  ? X1AccountAccount
  : T extends typeof ACCOUNT_TYPE.X1___COIN___COIN_INFO
  ? X1CoinCoininfo
  : unknown;
