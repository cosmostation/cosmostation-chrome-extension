type CounterParty = {
  chain_id: string;
  channel_id: string;
  port_id: string;
};

export type IbcToken = {
  hash: string;
  base_denom: string;
  display_denom?: string;
  decimal?: number;
  channel_id: string;
  port_id: string;
  counter_party: CounterParty;
  moniker?: string;
  auth?: boolean;
};

export type IbcTokenPayload = {
  ibc_tokens: IbcToken[];
};
