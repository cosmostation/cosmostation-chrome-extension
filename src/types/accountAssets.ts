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
  AccountSolanaAsset,
  AccountSpltokenAsset,
  AccountSuiAsset,
} from './account';

export interface AccountAssets {
  cosmosAccountAssets: AccountCosmosAsset[];
  evmAccountAssets: AccountEvmAsset[];
  aptosAccountAssets: AccountAptosAsset[];
  suiAccountAssets: AccountSuiAsset[];
  bitcoinAccountAssets: AccountBitcoinAsset[];
  iotaAccountAssets: AccountIotaAsset[];
  solanaAccountAssets: AccountSolanaAsset[];
  gnoAccountAssets: AccountGnoAsset[];
  cw20AccountAssets: AccountCw20Asset[];
  erc20AccountAssets: AccountErc20Asset[];
  spltokenAccountAssets: AccountSpltokenAsset[];
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
  | AccountSolanaAsset
  | AccountSpltokenAsset
  | AccountGnoAsset
  | AccountGrc20Asset
  | AccountCustomCosmosAsset
  | AccountCustomEvmAsset;

export type AllCosmosAccountAssets = AccountCosmosAsset | AccountCustomCosmosAsset | AccountCw20Asset;

export type AllEVMAccountAssets = AccountEvmAsset | AccountCustomEvmAsset | AccountErc20Asset;

export type AllGnoAccountAssets = AccountGnoAsset | AccountGrc20Asset;

export type AllSolanaAccountAssets = AccountSolanaAsset | AccountSpltokenAsset;
export interface AccountCustomAssets {
  cosmosAccountCustomAssets: AccountCustomCosmosAsset[];
  evmAccountCustomAssets: AccountCustomEvmAsset[];
}

export type FlatAccountCustomAssets = AccountCustomCosmosAsset | AccountCustomEvmAsset;

export type SingleOrGroupAccountAssets = FlatAccountAssets & {
  totalDisplayAmount: string;
  counts: string;
};
