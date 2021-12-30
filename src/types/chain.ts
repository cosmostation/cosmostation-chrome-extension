export type BIP44 = {
  purpose: string;
  coinType: string;
  account: string;
  change: string;
  addressIndex: string;
};

export type Chain = {
  chainId: string; // chainId
  chainName: string; // chainName
  rest: string;
  baseDenom: string;
  displayDenom: string;
  decimal: string;
  coinType: BIP44['coinType']; // BIP44
  addressPrefix: string;
};
