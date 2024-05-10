import type { EIP_6963_EVENTS } from '~/constants/ethereum';

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
  type: typeof EIP_6963_EVENTS.announce;
  detail: EIP6963ProviderDetail;
};

export type EIP6963RequestProviderEvent = Event & {
  type: typeof EIP_6963_EVENTS.request;
};
