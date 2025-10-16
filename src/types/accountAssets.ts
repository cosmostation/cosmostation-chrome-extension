import type {
  AccountAptosAsset,
  AccountBitcoinAsset,
  AccountCosmosAsset,
  AccountCustomCosmosAsset,
  AccountCustomEvmAsset,
  AccountCw20Asset,
  AccountErc20Asset,
  AccountEvmAsset,
  AccountGnoAsset,
  AccountGrc20Asset,
  AccountIotaAsset,
  AccountSuiAsset,
} from './account';

export interface AccountAssets {
  cosmosAccountAssets: AccountCosmosAsset[];
  evmAccountAssets: AccountEvmAsset[];
  aptosAccountAssets: AccountAptosAsset[];
  suiAccountAssets: AccountSuiAsset[];
  bitcoinAccountAssets: AccountBitcoinAsset[];
  iotaAccountAssets: AccountIotaAsset[];
  gnoAccountAssets: AccountGnoAsset[];
  cw20AccountAssets: AccountCw20Asset[];
  erc20AccountAssets: AccountErc20Asset[];
  grc20AccountAssets: AccountGrc20Asset[];
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
  | AccountIotaAsset
  | AccountAptosAsset
  | AccountGnoAsset
  | AccountGrc20Asset
  | AccountCustomCosmosAsset
  | AccountCustomEvmAsset;

export type AllCosmosAccountAssets = AccountCosmosAsset | AccountCustomCosmosAsset | AccountCw20Asset;

export type AllEVMAccountAssets = AccountEvmAsset | AccountCustomEvmAsset | AccountErc20Asset;

export type AllGnoAccountAssets = AccountGnoAsset | AccountGrc20Asset;

export interface AccountCustomAssets {
  cosmosAccountCustomAssets: AccountCustomCosmosAsset[];
  evmAccountCustomAssets: AccountCustomEvmAsset[];
}

export type FlatAccountCustomAssets = AccountCustomCosmosAsset | AccountCustomEvmAsset;

export type SingleOrGroupAccountAssets = FlatAccountAssets & {
  totalDisplayAmount: string;
  counts: string;
};
