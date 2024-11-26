import type {
  Account,
  AccountAddress,
  AccountAddressBalanceAptos,
  AccountAddressBalanceCosmos,
  AccountAddressBalanceCw20,
  AccountAddressBalanceErc20,
  AccountAddressBalanceEvm,
  AccountAddressBalanceSui,
} from './account';
import type { V11Asset, V11Param } from './apiV11';
import type { AssetId, CosmosCw20Asset, EvmErc20Asset } from './asset';

export interface ExtensionStorage {
  accounts: Account[];
  paramsV11: Record<string, V11Param>;
  assetsV11: V11Asset[];
  erc20Assets: EvmErc20Asset[];
  cw20Assets: CosmosCw20Asset[];
  [key: `${string}-address`]: AccountAddress[];
  [key: `${string}-balance-cosmos`]: AccountAddressBalanceCosmos[];
  [key: `${string}-balance-evm`]: AccountAddressBalanceEvm[];
  [key: `${string}-balance-aptos`]: AccountAddressBalanceAptos[];
  [key: `${string}-balance-sui`]: AccountAddressBalanceSui[];
  [key: `${string}-balance-erc20`]: AccountAddressBalanceErc20[];
  [key: `${string}-balance-cw20`]: AccountAddressBalanceCw20[];
  [key: `${string}-hidden-assetIds`]: AssetId[];
  initAccountIds: Account['id'][];
}
