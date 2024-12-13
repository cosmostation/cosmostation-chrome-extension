import type {
  AccountAddressBalanceAptos,
  AccountAddressBalanceCosmos,
  AccountAddressBalanceCw20,
  AccountAddressBalanceErc20,
  AccountAddressBalanceEvm,
  AccountAddressBalanceSui,
  AccountAptosAsset,
  AccountCosmosAsset,
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
  cw20AccountAssets: AccountCw20Asset[];
  erc20AccountAssets: AccountErc20Asset[];
}

export interface AccountAllAssets {
  // FIXME AccountAssets와 리턴타입 동일하게 수정필요.
  cosmosBalances: AccountAddressBalanceCosmos[];
  evmBalances: AccountAddressBalanceEvm[];
  aptosBalances: AccountAddressBalanceAptos[];
  suiBalances: AccountAddressBalanceSui[];
  erc20Balances: AccountAddressBalanceErc20[];
  cw20Balances: AccountAddressBalanceCw20[];
}
