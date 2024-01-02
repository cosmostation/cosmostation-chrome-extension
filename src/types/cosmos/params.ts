export type ParamsResponse = {
  chain_id: string;
  block_time: number;
  gas_price?: GasPrice;
  params: Params;
};

export type GasPrice = {
  chain: string;
  base: string;
  rate: string[];
};

export type Params = {
  chainlist_params: ChainlistParams;
};

export type ChainlistParams = {
  fee: Fee;
  grpc_endpoint: GrpcEndpoint[];
  about: About;
  description: Description;
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
  base: string;
  rate: string[];
  isSimulable: boolean;
  simul_gas_multiply: number;
  fee_threshold: string;
};

export type GrpcEndpoint = {
  provider: string;
  url: string;
};
