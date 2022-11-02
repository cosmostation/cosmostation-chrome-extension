export type CounterParty = {
  chain_id: string;
  channel_id: string;
  port_id: string;
};

export type IbcCoin = {
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

export type IbcCoinPayload = {
  ibc_tokens: IbcCoin[];
};
// NOTE 기준:내가 보낼 / counter_party:받을
// Ex osmo체인(counter)에서 chihuahua(main)로
export type IbcSend = {
  chain_name: string;
  denom: string;
  base_denom: string;
  display_denom: string;
  channel_id: string;
  port_id: string;
  counter_party: CounterParty;
  img_Url: string;
};
