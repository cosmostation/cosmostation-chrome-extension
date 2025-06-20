import type { COSMOS_TYPE } from '@/constants/cosmos';

export interface ChainAccountType {
  hdPath: string;
  pubkeyStyle: string;
  isDefault?: boolean | null;
  pubkeyType?: string | null;
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
  isFeemarketEnabled: boolean;
  gasRate: string[];
  defaultFeeRateKey?: string;
  defaultGasLimit: string | number;
  gasCoefficient: number;
}

export type ChainType = 'cosmos' | 'evm' | 'sui' | 'aptos' | 'bitcoin' | 'iota';

export type CommonChainType = 'common';

export interface ChainId {
  id: string;
  chainType: ChainType;
}

export type UniqueChainId = `${ChainId['id']}__${ChainId['chainType']}`;

export interface ChainBase extends ChainId {
  name: string;
  image: string | null;
}

export type CosmosType = ValueOf<typeof COSMOS_TYPE>;

export interface CosmosChain extends ChainBase {
  chainType: Extract<ChainType, 'cosmos'>;
  chainId: string;
  mainAssetDenom: string;
  chainDefaultCoinDenoms?: string[] | null;
  accountPrefix: string;
  validatorAccountPrefix?: string;
  isCosmwasm: boolean;
  isEvm: boolean;
  lcdUrls: ChainEndpoint[];
  explorer: ChainExplorer | null;
  feeInfo: CosmosFeeInfo;
  accountTypes: ChainAccountType[];
  isSupportStaking?: boolean;
  isSupportHistory?: boolean;
  isSupportCW721?: boolean;
  isDiableSend?: boolean;
  isTestnet?: boolean;
  apr?: string;
  stakingParams?: {
    unbonding_time?: string;
    max_validators?: number;
    max_entries?: number;
    historical_entries?: number;
    bond_denom?: string;
    min_commission_rate?: string;
  };
  reportedValidators?: string[];
  maxApproveValidator?: string;
}

export interface CustomCosmosChain extends ChainBase {
  chainType: Extract<ChainType, 'cosmos'>;
  chainId: string;
  mainAssetDenom: string;
  chainDefaultCoinDenoms?: string[] | null;
  accountPrefix: string;
  validatorAccountPrefix?: string;
  isCosmwasm: boolean;
  isEvm: boolean;
  lcdUrls: ChainEndpoint[];
  explorer: ChainExplorer | null;
  feeInfo: CosmosFeeInfo;
  accountTypes: ChainAccountType[];
  isSupportStaking?: boolean;
  isSupportHistory?: boolean;
  isSupportCW721?: boolean;
  isDiableSend?: boolean;
  isTestnet?: boolean;
  apr?: string;
  stakingParams?: {
    unbonding_time?: string;
    max_validators?: number;
    max_entries?: number;
    historical_entries?: number;
    bond_denom?: string;
    min_commission_rate?: string;
  };
  reportedValidators?: string[];
  maxApproveValidator?: string;
}

export interface EvmFeeInfo {
  isEip1559: boolean;
  gasCoefficient: number;
}

export interface EvmChain extends ChainBase {
  chainType: Extract<ChainType, 'evm'>;
  chainId: string;
  mainAssetDenom: string | null;
  chainDefaultCoinDenoms?: string[] | null;
  isCosmos: boolean;
  feeInfo: EvmFeeInfo;
  rpcUrls: ChainEndpoint[];
  accountTypes: ChainAccountType[];
  isDiableSend?: boolean;
  isTestnet?: boolean;
  explorer: ChainExplorer;
}

export interface CustomEvmChain extends ChainBase {
  chainType: Extract<ChainType, 'evm'>;
  chainId: string;
  mainAssetDenom: string | null;
  chainDefaultCoinDenoms?: string[] | null;
  isCosmos: boolean;
  feeInfo: EvmFeeInfo;
  rpcUrls: ChainEndpoint[];
  accountTypes: ChainAccountType[];
  isDiableSend?: boolean;
  explorer: ChainExplorer;
}

export interface SuiChain extends ChainBase {
  chainType: Extract<ChainType, 'sui'>;
  chainId: string | number;
  mainAssetDenom: string | null;
  chainDefaultCoinDenoms?: string[] | null;
  rpcUrls: ChainEndpoint[];
  accountTypes: ChainAccountType[];
  explorer: ChainExplorer;
  isTestnet?: boolean;
  isDevnet?: boolean;
}

export interface AptosChain extends ChainBase {
  chainType: Extract<ChainType, 'aptos'>;
  chainId: string | number;
  mainAssetDenom: string;
  chainDefaultCoinDenoms?: string[] | null;
  rpcUrls: ChainEndpoint[];
  accountTypes: ChainAccountType[];
  explorer: ChainExplorer;
  isTestnet?: boolean;
  isDevnet?: boolean;
}

export interface BitcoinChain extends ChainBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  chainId: string | number;
  mainAssetDenom: string;
  chainDefaultCoinDenoms?: string[] | null;
  rpcUrls: ChainEndpoint[];
  mempoolURL: string;
  accountTypes: ChainAccountType[];
  explorer: ChainExplorer;
  isTestnet: boolean;
}

export interface IotaChain extends ChainBase {
  chainType: Extract<ChainType, 'iota'>;
  chainId: string | number;
  mainAssetDenom: string | null;
  chainDefaultCoinDenoms?: string[] | null;
  rpcUrls: ChainEndpoint[];
  accountTypes: ChainAccountType[];
  explorer: ChainExplorer;
  isTestnet?: boolean;
  isDevnet?: boolean;
}

export type CustomChain = CustomCosmosChain | CustomEvmChain;

export type Chain = CosmosChain | EvmChain | SuiChain | AptosChain | BitcoinChain | IotaChain;
