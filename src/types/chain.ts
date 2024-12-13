export interface ChainAccountType {
  hdPath: string;
  pubkeyStyle: string;
  isDefault?: boolean | null;
  pubKeyType?: string | null;
}

export interface ChainEndpoint {
  provider: string;
  url: string;
}

export interface ChainExplorer {
  name: string;
  url: string;
  account: string;
  tx: string;
  proposal: string;
}

export interface CosmosFeeInfo {
  isSimulable: boolean;
  gasRate: string[];
  defaultGasLimit: string | number;
  gasCoefficient: number;
}

export type ChainType = 'cosmos' | 'evm' | 'sui' | 'aptos' | 'bitcoin';

export interface ChainId {
  id: string;
  chainType: ChainType;
}

export interface ChainBase extends ChainId {
  name: string;
  image: string | null;
}

export interface CosmosChain extends ChainBase {
  chainType: Extract<ChainType, 'cosmos'>;
  chainId: string;
  mainAssetDenom: string;
  accountPrefix: string;
  isCosmwasm: boolean;
  isEvm: boolean;
  lcdUrls: ChainEndpoint[];
  explorer: ChainExplorer | null;
  feeInfo: CosmosFeeInfo;
  accountTypes: ChainAccountType[];
}

export interface EvmFeeInfo {
  isEip1559: boolean;
  gasCoefficient: number;
}

export interface EvmChain extends ChainBase {
  chainType: Extract<ChainType, 'evm'>;
  chainId: string;
  mainAssetDenom: string | null;
  isCosmos: boolean;
  feeInfo: EvmFeeInfo;
  rpcUrls: ChainEndpoint[];
  accountTypes: ChainAccountType[];
  explorer: ChainExplorer;
}

export interface SuiChain extends ChainBase {
  chainType: Extract<ChainType, 'sui'>;
  chainId: string | number;
  mainAssetDenom: string | null;
  rpcUrls: ChainEndpoint[];
  accountTypes: ChainAccountType[];
  explorer: ChainExplorer;
}

export interface AptosChain extends ChainBase {
  chainType: Extract<ChainType, 'aptos'>;
  chainId: string | number;
  mainAssetDenom: string;
  rpcUrls: ChainEndpoint[];
  accountTypes: ChainAccountType[];
  explorer: ChainExplorer;
}

export interface BitcoinChain extends ChainBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  chainId: string | number;
  mainAssetDenom: string;
  rpcUrls: ChainEndpoint[];
  accountTypes: ChainAccountType[];
  explorer: ChainExplorer;
}

export type Chain = CosmosChain | EvmChain | SuiChain | AptosChain | BitcoinChain;
