import type {
  AccountAptosAsset,
  AccountBitcoinAsset,
  AccountCosmosAsset,
  AccountCustomCosmosAsset,
  AccountCustomEvmAsset,
  AccountCw20Asset,
  AccountErc20Asset,
  AccountEvmAsset,
  AccountSuiAsset,
} from './account';

export interface AccountAssets {
  cosmosAccountAssets: AccountCosmosAsset[];
  evmAccountAssets: AccountEvmAsset[];
  aptosAccountAssets: AccountAptosAsset[];
  suiAccountAssets: AccountSuiAsset[];
  bitcoinAccountAssets: AccountBitcoinAsset[];
  cw20AccountAssets: AccountCw20Asset[];
  erc20AccountAssets: AccountErc20Asset[];
  customErc20AccountAssets: AccountErc20Asset[];
  customCw20AccountAssets: AccountCw20Asset[];
  cosmosAccountCustomAssets: AccountCustomCosmosAsset[];
  evmAccountCustomAssets: AccountCustomEvmAsset[];
}
export type FlatAccountAssets =
  | AccountCosmosAsset
  | AccountCw20Asset
  | AccountErc20Asset
  | AccountEvmAsset
  | AccountSuiAsset
  | AccountBitcoinAsset
  | AccountAptosAsset
  | AccountCustomCosmosAsset
  | AccountCustomEvmAsset;

export interface AccountCustomAssets {
  cosmosAccountCustomAssets: AccountCustomCosmosAsset[];
  evmAccountCustomAssets: AccountCustomEvmAsset[];
}

export type FlatAccountCustomAssets = AccountCustomCosmosAsset | AccountCustomEvmAsset;

export type SingleOrGroupAccountAssets = FlatAccountAssets & {
  totalDisplayAmount: string;
  counts: string;
};
