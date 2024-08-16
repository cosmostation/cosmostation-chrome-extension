export type ParamsResponse = Record<string, ChainParams>;

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
