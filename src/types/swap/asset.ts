import type { SKIP_SUPPORTED_CHAIN_TYPE } from '~/constants/skip';

import type { CosmosChain, EthereumNetwork, EthereumToken } from '../chain';
import type { AssetV3 } from '../cosmos/asset';

export type IntegratedSwapEVMChain = EthereumNetwork & { line: 'ETHEREUM'; baseChainUUID: string };

export type IntegratedSwapCosmosChain = CosmosChain & { baseChainUUID: string; networkName: string };

export type IntegratedSwapChain = (IntegratedSwapEVMChain | IntegratedSwapCosmosChain) & { isUnavailable?: boolean };

export type IntegratedSwapCosmosToken = Omit<AssetV3, 'symbol'> & {
  tokenAddressOrDenom: string;
  balance?: string;
  displayDenom: string;
  imageURL?: string;
  name: string;
};

export type IntegratedSwapEVMToken = Omit<EthereumToken, 'id' | 'ethereumNetworkId' | 'tokenType'> & {
  tokenAddressOrDenom: string;
  balance?: string;
  name: string;
};

export type IntegratedSwapToken = IntegratedSwapEVMToken | IntegratedSwapCosmosToken;

export type IntegratedSwapFeeToken = {
  tokenAddressOrDenom: string;
  decimals: number;
  displayDenom: string;
  coinGeckoId?: string;
  imageURL?: string;
};

export type SupportNetwork = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  contracts: Contract[];
};

export type Contract = {
  chain: string;
  address: string;
  symbol: string;
  decimals: number;
  transfer_fee: number;
};

export type SupportSwapChainPayload = {
  oneInch: SupportedChain;
  squid: SupportedChain;
};

export type SupportedChain = {
  evm: ChainData;
  cosmos: ChainData;
};

export type SkipSupportedChainType = ValueOf<typeof SKIP_SUPPORTED_CHAIN_TYPE>;

type CosmosModuleSupport = {
  authz: boolean;
  feegrant: boolean;
};

type SkipFeeAsset = {
  denom?: string;
  gas_price_info?: {
    average: string;
    high: string;
    low: string;
  };
};

type IbcCapabilities = {
  cosmos_pfm: boolean;
  cosmos_ibc_hooks: boolean;
  cosmos_memo: boolean;
  cosmos_autopilot: boolean;
};

export type SupportedSkipChain = {
  chains: {
    chain_name: string;
    chain_id: string;
    pfm_enabled?: boolean;
    cosmos_module_support: CosmosModuleSupport;
    supports_memo: boolean;
    logo_uri?: string;
    bech32_prefix: string;
    fee_assets: SkipFeeAsset[];
    chain_type: SkipSupportedChainType;
    ibc_capabilities: IbcCapabilities;
  }[];
};

export type SupportedSkipAsset = {
  denom: string;
  chain_id: string;
  origin_denom: string;
  origin_chain_id: string;
  trace: string;
  is_cw20: boolean;
  is_evm: boolean;
  is_svm: boolean;
  symbol?: string;
  name?: string;
  logo_uri?: string;
  decimals?: number;
  coingecko_id?: string;
};

export type SupportedSkipToken = {
  chain_to_assets_map: {
    [key: string]: {
      assets: SupportedSkipAsset[];
    };
  };
};

export type ChainData = {
  send: ChainIdData[];
  receive: ChainIdData[];
};

export type ChainIdData = {
  chainId: string;
};
