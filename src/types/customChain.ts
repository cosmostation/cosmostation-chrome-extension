import type { ChainAccountType, ChainBase, ChainEndpoint, ChainExplorer, ChainType, CosmosFeeInfo, EvmFeeInfo } from './chain';

export interface CustomChainParam {
  id: string;
  chain_id?: string;
  chain_id_cosmos?: string;
  chain_id_evm?: string;
  chain_name: string;
  chain_image: string;
  staking_asset_denom?: string;
  staking_asset_symbol?: string;
  staking_asset_image?: string | null;
  staking_asset_decimals?: number;
  staking_asset_coingecko_id?: string;
  main_asset_denom?: string;
  main_asset_symbol?: string;
  main_asset_image?: string | null;
  main_asset_decimals?: number;
  main_asset_coin_gecko_id?: string;
  gas_asset_denom?: string;
  gas_asset_symbol?: string;
  gas_asset_image: string | null;
  gas_asset_decimals?: number;
  gas_asset_coin_gecko_id?: string;
  bech_account_prefix?: string;
  bech_validator_prefix?: string;
  origin_genesis_time?: string;
  api_name?: string;
  is_stake_enabled?: boolean;
  is_support_mintscan?: boolean;
  is_support_cw20?: boolean;
  is_support_cw721?: boolean;
  is_support_mobile_wallet?: boolean;
  is_support_extension_wallet?: boolean;
  is_support_erc20?: boolean;
  chain_type: string[];
  account_type: {
    hd_path: string;
    pubkey_style: string;
    pubkey_type: string;
    is_default?: boolean;
  }[];
  cosmos_fee_info?: {
    base: string;
    rate: string[];
    is_simulable: boolean;
    is_feemarket?: boolean;
    simulated_gas_multiply: number;
    init_gas_limit: number;
    fee_threshold: string;
  };
  evm_fee_info?: {
    is_eip1559: boolean;
    simulated_gas_multiply: number;
  };
  grpc_endpoint?: {
    provider: string;
    url: string;
  }[];
  lcd_endpoint?: {
    provider: string;
    url: string;
  }[];
  rpc_endpoint?: {
    provider: string;
    url: string;
  }[];
  evm_rpc_endpoint?: {
    provider: string;
    url: string;
  }[];
  explorer: {
    name: string;
    url: string;
    account: string;
    tx: string;
    proposal: string;
  };
}

export type CustomChainParamResponse = CustomChainParam[];

export interface CustomEvmChainAsset extends ChainBase {
  chainType: Extract<ChainType, 'evm'>;
  chainId: string;
  mainAssetDenom: string;
  mainAssetSymbol: string;
  mainAssetDecimals: number;
  mainAssetImage: string | null;
  mainAssetCoinGeckoId: string | null;
  chainDefaultCoinDenoms?: string[] | null;
  isCosmos: boolean;
  feeInfo: EvmFeeInfo;
  rpcUrls: ChainEndpoint[];
  accountTypes: ChainAccountType[];
  explorer: ChainExplorer;
}

export interface CustomCosmosChainAsset extends ChainBase {
  chainType: Extract<ChainType, 'cosmos'>;
  chainId: string;
  mainAssetDenom: string;
  mainAssetSymbol: string;
  mainAssetDecimals: number;
  mainAssetImage: string | null;
  mainAssetCoinGeckoId: string | null;
  chainDefaultCoinDenoms?: string[] | null;
  accountPrefix: string;
  isCosmwasm: boolean;
  isEvm: boolean;
  lcdUrls: ChainEndpoint[];
  explorer: ChainExplorer;
  feeInfo: CosmosFeeInfo;
  accountTypes: ChainAccountType[];
}

export type CustomChainAsset = CustomCosmosChainAsset | CustomEvmChainAsset;
