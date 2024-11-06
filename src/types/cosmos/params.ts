export type ParamsV11Response = Record<string, ChainParamsV11>;

export type ChainParams = {
  chain_id?: string;
  block_time?: number;
  gas_price?: GasPrice;
  params?: Params;
};

export type GasPrice = {
  chain: string;
  base: string;
  rate: string[];
};

export type Params = {
  chainlist_params?: ChainlistParams;
};

export type ChainlistParams = {
  chain_id_cosmos?: string;
  chain_id_evm?: string;
  chain_name?: string;
  chain_image?: string;
  symbol?: string;
  symbol_image?: string;
  bechAccountPrefix?: string;
  bechValidatorPrefix?: string;
  api_name?: string;
  accountType?: {
    hd_path?: string;
    pubkey_style?: string;
    pubkey_type?: string;
  };
  fee?: Fee;
  grpc_endpoint?: GrpcEndpoint[];
  explorer?: {
    name?: string;
    url?: string;
    account?: string;
    tx?: string;
    proposal?: string;
  };
  evm_explorer?: {
    name: string;
    url: string;
    account?: string;
    tx?: string;
  };
  about?: About;
  description?: Description;
  isBankLocked?: boolean;
};

export type About = {
  website: string;
  blog: string;
  github: string;
  twitter: string;
  coingecko: string;
};

export type Description = {
  ko: string;
  en: string;
  ja: string;
};

export type Fee = {
  base?: string;
  rate?: string[];
  isSimulable: boolean;
  simul_gas_multiply: number;
  fee_threshold: string;
  feemarket?: boolean;
};

export type GrpcEndpoint = {
  provider: string;
  url: string;
};

export type ChainParamsV11 = {
  chain_id?: string;
  block_time?: number;
  is_support?: GasPrice;
  params?: ParamsV11;
};

export type ParamsV11 = {
  chainlist_params?: ChainlistParamsV11;
};

export type ChainlistParamsV11 = {
  chain_id_cosmos?: string;
  chain_id_evm?: string;
  chain_name?: string;
  chain_image?: string;
  main_asset_denom?: string;
  main_asset_symbol?: string;
  main_asset_image?: string;
  gas_asset_denom?: string;
  gas_asset_symbol?: string;
  gas_asset_image?: string;
  bech_account_prefix?: string;
  bech_validator_prefix?: string;
  origin_genesis_time?: string;
  api_name?: string;
  is_support_cw20?: boolean;
  is_support_cw721?: boolean;
  is_send_enabled?: boolean;
  is_support_moblie_dapp?: boolean;
  is_support_erc20?: boolean;
  account_type?: AccountTypeV11[];
  cosmos_fee_info?: CosmosFeeInfoV11;
  evm_fee_info?: EVMFeeInfoV11;
  grpc_endpoint?: EndpointV11[];
  lcd_endpoint?: EndpointV11[];
  evm_rpc_endpoint?: EndpointV11[];
  explorer?: ExplorerV11;
  evm_explorer?: ExplorerV11;
};

export type AccountTypeV11 = {
  hd_path?: string;
  pubkey_style?: string;
  pubkey_type?: string;
};

export type CosmosFeeInfoV11 = {
  base?: string;
  rate?: string[];
  is_feemarket?: boolean;
  is_simulable?: boolean;
  simulated_gas_multiply?: number;
  init_gas_limit?: number;
  fee_threshold?: string;
};

export type EVMFeeInfoV11 = {
  is_eip1559?: boolean;
  simulated_gas_multiply?: number;
};

export type EndpointV11 = {
  provider?: string;
  url?: string;
};

export type ExplorerV11 = {
  name?: string;
  url?: string;
  account?: string;
  tx?: string;
  proposal?: string;
};
