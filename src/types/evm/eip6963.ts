import type { EIP_6963_EVENTS } from '@/constants/evm/eip6963';

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EthereumProvider;
}

export interface EIP6963AnnounceProviderEvent extends CustomEvent {
  type: typeof EIP_6963_EVENTS.announce;
  detail: EIP6963ProviderDetail;
}

export interface EIP6963RequestProviderEvent extends Event {
  type: typeof EIP_6963_EVENTS.request;
}
