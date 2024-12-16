import type { AccountAptosAsset, AccountCosmosAsset, AccountCw20Asset, AccountErc20Asset, AccountEvmAsset, AccountSuiAsset } from './account';

export interface AccountAssets {
  cosmosAccountAssets: AccountCosmosAsset[];
  evmAccountAssets: AccountEvmAsset[];
  aptosAccountAssets: AccountAptosAsset[];
  suiAccountAssets: AccountSuiAsset[];
  cw20AccountAssets: AccountCw20Asset[];
  erc20AccountAssets: AccountErc20Asset[];
}
export type FlatAccountAssets = AccountCosmosAsset | AccountCw20Asset | AccountErc20Asset | AccountEvmAsset | AccountSuiAsset | AccountAptosAsset;
