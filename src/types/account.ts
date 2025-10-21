import type { GetAccountCoinsDataResponse } from '@aptos-labs/ts-sdk';
import type { DelegatedStake as IotaDelegatedStake } from '@iota/iota-sdk/client';
import type { DelegatedStake } from '@mysten/sui/client';

import type { AptosResourceResponse } from './aptos/api';
import type {
  AptosAsset,
  AssetId,
  BitcoinAsset,
  CosmosAsset,
  CosmosCw20Asset,
  CustomCosmosAsset,
  EvmAsset,
  EvmErc20Asset,
  IotaAsset,
  SolanaAsset,
  SolanaSpltokenAsset,
  SuiAsset,
} from './asset';
import type { BitcoinBalance } from './bitcoin/balance';
import type {
  AptosChain,
  BitcoinChain,
  Chain,
  ChainAccountType,
  ChainType,
  CosmosChain,
  CustomCosmosChain,
  CustomEvmChain,
  EvmChain,
  IotaChain,
  SolanaChain,
  SuiChain,
} from './chain';
import type { AuthAccountsPayload } from './cosmos/account';
import type { CosmosBalance } from './cosmos/api';
import type { CommissionResponse, Cw20Balance } from './cosmos/balance';
import type { LcdDelegationResponse } from './cosmos/delegation';
import type { RewardDetails } from './cosmos/reward';
import type { UnbondingResponses } from './cosmos/undelegation';
import type { Erc20Balance } from './evm/balance';
import type { IotaGetBalance } from './iota/api';
import type { SplTokenBalance } from './solana/api';
import type { SuiGetBalance } from './sui/api';

export type AccountType = 'PRIVATE_KEY' | 'MNEMONIC';
export interface AccountBase {
  id: string;
  type: AccountType;
}
export interface PrivateAccount extends AccountBase {
  type: Extract<AccountType, 'PRIVATE_KEY'>;
  encryptedPrivateKey: string;
  encryptedRestoreString: string;
}

export interface MnemonicAccount extends AccountBase {
  type: Extract<AccountType, 'MNEMONIC'>;
  encryptedMnemonic: string;
  index: string;
  encryptedRestoreString: string;
}

export type Account = PrivateAccount | MnemonicAccount;

export type AccountWithName = Account & { name: string };

export interface AccountAddress {
  chainId: Chain['id'];
  chainType: ChainType;
  address: string;
  publicKey: string;
  accountType: ChainAccountType;
}

export type RequestStatus = 'error' | 'success';

export interface AccountAddressBalanceCosmos {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balances: CosmosBalance[];
  lastUpdatedAtMs?: number | null;
  status?: RequestStatus;
}

export interface AccountAddressDelegationsCosmos {
  id: Chain['id'];
  assetId: AssetId['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  delegations: LcdDelegationResponse[];
  lastUpdatedAtMs?: number | null;
}
export interface AccountAddressUnbondingsCosmos {
  id: Chain['id'];
  assetId: AssetId['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  unbondings: UnbondingResponses[];
  lastUpdatedAtMs?: number | null;
}
export interface AccountAddressRewardsCosmos {
  id: Chain['id'];
  assetId: AssetId['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  rewards: RewardDetails;
  lastUpdatedAtMs?: number | null;
}
export interface AccountAddressCommissionsCosmos {
  id: Chain['id'];
  assetId: AssetId['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  commissions?: CommissionResponse;
  lastUpdatedAtMs?: number | null;
}

export interface AccountAddressLockedBalanceCosmos {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  lockedBalances: CosmosBalance[];
  lastUpdatedAtMs?: number | null;
}
export interface AccountAddressAccountInfoCosmos {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  accountInfo: AuthAccountsPayload;
  lastUpdatedAtMs?: number | null;
}

export interface AccountAddressBalanceEvm {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balance: string;
  lastUpdatedAtMs?: number | null;
  status?: RequestStatus;
}

export interface AccountAddressBalanceAptos {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balances: AptosResourceResponse[];
  lastUpdatedAtMs?: number | null;
  status?: RequestStatus;
}

export interface AccountAddressBalanceAptosV2 {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balances: GetAccountCoinsDataResponse;
  lastUpdatedAtMs?: number | null;
  status?: RequestStatus;
}

export interface AccountAddressDelegationsSui {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  delegations: DelegatedStake[];
  lastUpdatedAtMs?: number | null;
}

export interface AccountAddressBalanceSui {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balances: SuiGetBalance[];
  lastUpdatedAtMs?: number | null;
  status?: RequestStatus;
}

export interface AccountAddressBalanceIota {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balances: IotaGetBalance[];
  lastUpdatedAtMs?: number | null;
  status?: RequestStatus;
}

export interface AccountAddressBalanceSolana {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balance: number;
  lastUpdatedAtMs?: number | null;
  status?: RequestStatus;
}

export interface AccountAddressDelegationsIota {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  delegations: IotaDelegatedStake[];
  lastUpdatedAtMs?: number | null;
}
export interface AccountAddressBalanceBitcoin {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balance: BitcoinBalance;
  lastUpdatedAtMs?: number | null;
  status?: RequestStatus;
}

export interface AccountAddressBalanceErc20 {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balances: Erc20Balance[];
}

export interface AccountAddressBalanceCw20 {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balances: Cw20Balance[];
}

export interface AccountAddressBalanceSplToken {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balances: SplTokenBalance[];
}

export interface AssetFetchStatus {
  balance?: RequestStatus;
}

export interface AccountCosmosAssetFetchStatus extends AssetFetchStatus {
  delegation?: RequestStatus;
  vesting?: RequestStatus;
  undelegation?: RequestStatus;
  reward?: RequestStatus;
  commission?: RequestStatus;
  lockedBalance?: RequestStatus;
}

export interface AccountCosmosAsset {
  chain: CosmosChain;
  asset: CosmosAsset;
  address: AccountAddress;
  balance: string;
  delegation?: string;
  vesting?: string;
  undelegation?: string;
  reward?: string;
  commission?: string;
  lockedBalance?: string;
  totalBalance?: string;
  lastUpdatedAtMs?: number | null;
  fetchStatus?: AccountCosmosAssetFetchStatus;
}

export interface AccountCustomCosmosAsset {
  chain: CustomCosmosChain;
  asset: CustomCosmosAsset;
  address: AccountAddress;
  balance: string;
  lastUpdatedAtMs?: number | null;
  fetchStatus?: AccountCosmosAssetFetchStatus;
}

export interface AccountCw20Asset {
  chain: CosmosChain;
  asset: CosmosCw20Asset;
  address: AccountAddress;
  balance: string;
  lastUpdatedAtMs?: number | null;
  fetchStatus?: AssetFetchStatus;
}

export interface AccountEVMAssetFetchStatus extends AssetFetchStatus {
  delegation?: RequestStatus;
  undelegation?: RequestStatus;
  reward?: RequestStatus;
  commission?: RequestStatus;
}

export interface AccountEvmAsset {
  chain: EvmChain;
  asset: EvmAsset;
  address: AccountAddress;
  balance: string;
  delegation?: string;
  undelegation?: string;
  reward?: string;
  commission?: string;
  totalBalance?: string;
  lastUpdatedAtMs?: number | null;
  fetchStatus?: AccountEVMAssetFetchStatus;
}

export interface AccountCustomEvmAsset {
  chain: CustomEvmChain;
  asset: EvmAsset;
  address: AccountAddress;
  balance: string;
  lastUpdatedAtMs?: number | null;
  fetchStatus?: AssetFetchStatus;
}

export interface AccountErc20Asset {
  chain: EvmChain;
  asset: EvmErc20Asset;
  address: AccountAddress;
  balance: string;
  lastUpdatedAtMs?: number | null;
  fetchStatus?: AssetFetchStatus;
}
export interface AccountAptosAsset {
  chain: AptosChain;
  asset: AptosAsset;
  address: AccountAddress;
  balance: string;
  lastUpdatedAtMs?: number | null;
  fetchStatus?: AssetFetchStatus;
}

export interface AccountSuiAssetFetchStatus extends AssetFetchStatus {
  delegation?: RequestStatus;
  reward?: RequestStatus;
}

export interface AccountSuiAsset {
  chain: SuiChain;
  asset: SuiAsset;
  address: AccountAddress;
  balance: string;
  delegation?: string;
  reward?: string;
  totalBalance?: string;
  lastUpdatedAtMs?: number | null;
  fetchStatus?: AccountSuiAssetFetchStatus;
}
export interface AccountBitcoinAsset {
  chain: BitcoinChain;
  asset: BitcoinAsset;
  address: AccountAddress;
  balance: string;
  lastUpdatedAtMs?: number | null;
  fetchStatus?: AssetFetchStatus;
}

export interface AccountIotaAssetFetchStatus extends AccountSuiAssetFetchStatus {}

export interface AccountIotaAsset {
  chain: IotaChain;
  asset: IotaAsset;
  address: AccountAddress;
  balance: string;
  delegation?: string;
  reward?: string;
  totalBalance?: string;
  lastUpdatedAtMs?: number | null;
  fetchStatus?: AccountIotaAssetFetchStatus;
}

export interface AccountSolanaAsset {
  chain: SolanaChain;
  asset: SolanaAsset;
  address: AccountAddress;
  balance: string;
  totalBalance?: string;
  lastUpdatedAtMs?: number | null;
  fetchStatus?: AssetFetchStatus;
}

export interface AccountSpltokenAsset {
  chain: SolanaChain;
  asset: SolanaSpltokenAsset;
  address: AccountAddress;
  balance: string;
  lastUpdatedAtMs?: number | null;
  fetchStatus?: AssetFetchStatus;
}

export type AccountNamesById = Record<AccountBase['id'], string>;
export type MnemonicNamesByHashedMnemonic = Record<AccountBase['id'], string>;

export type ChainToAccountTypeMap = Record<Chain['id'], ChainAccountType>;
export type PreferAccountType = Record<AccountBase['id'], ChainToAccountTypeMap | undefined>;
