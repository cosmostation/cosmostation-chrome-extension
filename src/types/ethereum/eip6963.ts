export type EIP6963ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

export type EIP6963ProviderDetail = {
  info: EIP6963ProviderInfo;
  provider: Ethereum;
};

export type EIP6963AnnounceProviderEvent = CustomEvent & {
  type: 'eip6963:announceProvider';
  detail: EIP6963ProviderDetail;
};

export type EIP6963RequestProviderEvent = Event & {
  type: 'eip6963:requestProvider';
};
