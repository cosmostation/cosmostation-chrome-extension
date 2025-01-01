import type { AptosResourceResponse } from './aptos/api';
import type { AptosAsset, CosmosAsset, CosmosCw20Asset, CustomCosmosAsset, EvmAsset, EvmErc20Asset, SuiAsset } from './asset';
import type { AptosChain, Chain, ChainAccountType, ChainType, CosmosChain, CustomCosmosChain, EvmChain, SuiChain } from './chain';
import type { CosmosBalance } from './cosmos/api';
import type { Cw20Balance } from './cosmos/balance';
import type { Erc20Balance } from './evm/balance';
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
  // NOTE encryptedMnemonic로 이름 변경 필요
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

export interface AccountAddressBalanceCosmos {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balances: CosmosBalance[];
}

export interface AccountAddressBalanceEvm {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balance: string;
}

export interface AccountAddressBalanceAptos {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balances: AptosResourceResponse[];
}

export interface AccountAddressBalanceSui {
  id: Chain['id'];
  chainId: Chain['chainId'];
  chainType: ChainType;
  address: string;
  balances: SuiGetBalance[];
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

export interface AccountCosmosAsset {
  chain: CosmosChain;
  asset: CosmosAsset;
  address: AccountAddress;
  balance: string;
}

export interface AccountCustomCosmosAsset {
  chain: CustomCosmosChain;
  asset: CustomCosmosAsset;
  address: AccountAddress;
  balance: string;
}

export interface AccountCw20Asset {
  chain: CosmosChain;
  asset: CosmosCw20Asset;
  address: AccountAddress;
  balance: string;
}

export interface AccountEvmAsset {
  chain: EvmChain;
  asset: EvmAsset;
  address: AccountAddress;
  balance: string;
}

export interface AccountCustomEvmAsset {
  chain: EvmChain;
  asset: EvmAsset;
  address: AccountAddress;
  balance: string;
}

export interface AccountErc20Asset {
  chain: EvmChain;
  asset: EvmErc20Asset;
  address: AccountAddress;
  balance: string;
}
export interface AccountAptosAsset {
  chain: AptosChain;
  asset: AptosAsset;
  address: AccountAddress;
  balance: string;
}

export interface AccountSuiAsset {
  chain: SuiChain;
  asset: SuiAsset;
  address: AccountAddress;
  balance: string;
}

export type AccountNamesById = Record<AccountBase['id'], string>;
export type MnemonicNamesByHashedMnemonic = Record<AccountBase['id'], string>;

export type ChainToAccountTypeMap = Record<Chain['id'], ChainAccountType>;
export type PreferAccountType = Record<AccountBase['id'], ChainToAccountTypeMap>;
