import { KAVA_CHAINLIST_ID, PERSISTENCE_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { IOTA_COIN_TYPE } from '@/constants/iota';
import { SUI_COIN_TYPE } from '@/constants/sui';
import type {
  AccountAddress,
  AccountAptosAsset,
  AccountBitcoinAsset,
  AccountCosmosAsset,
  AccountCosmosAssetFetchStatus,
  AccountCw20Asset,
  AccountErc20Asset,
  AccountEvmAsset,
  AccountEVMAssetFetchStatus,
  AccountIotaAsset,
  AccountIotaAssetFetchStatus,
  AccountSuiAsset,
  AccountSuiAssetFetchStatus,
  AssetFetchStatus,
} from '@/types/account';
import type { AptosAsset, Asset, BitcoinAsset, CosmosAsset, CosmosCw20Asset, EvmAsset, EvmErc20Asset, IotaAsset, SuiAsset } from '@/types/asset';
import type { AptosChain, BitcoinChain, CosmosChain, EvmChain, IotaChain, SuiChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import { createHiddenAssetIdSet } from '@/utils/cache/hiddenAssetIdMap';
import { formattingAccount } from '@/utils/cosmos/account';
import { getDelegatedVestingTotal, getPersistenceVestingRelatedBalances, getVestingRelatedBalances, getVestingRemained } from '@/utils/cosmos/vesting';
import { gt, minus, plus, sum, toBaseDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';

import { getAssetsDetailed } from './getAssets';

const vestingChainIds = new Set([KAVA_CHAINLIST_ID]);

const getAssetKey = (chainId: string, chainType: string, address: string) => {
  return `${chainId}--${chainType}--${address}`;
};

const getAssetKeyWithId = (assetId: string, chainId: string, chainType: string, address: string) => {
  return `${assetId}--${chainId}--${chainType}--${address}`;
};

type GetAccountAssetsOption = {
  disableFilterHidden?: boolean;
  disableBalanceFilter?: boolean;
};

export async function getAccountAssets(id: string, option?: GetAccountAssetsOption) {
  console.time('getAccountAssets');
  const { aptosAssets, cosmosAssets, cw20Assets, customCw20Assets, erc20Assets, customErc20Assets, evmAssets, suiAssets, bitcoinAssets, iotaAssets } =
    await getAssetsDetailed(id);

  const [
    baseCosmosAccountAssets,
    baseEvmAccountAssets,
    baseAptosAccountAssets,
    baseSuiAccountAssets,
    baseCw20AccountAssets,
    baseErc20AccountAssets,
    baseCustomErc20AccountAssets,
    baseCustomCw20AccountAssets,
    baseBitcoinAccountAssets,
    baseIotaAccountAssets,
  ] = await Promise.all([
    getCosmosAccountAssets(id, cosmosAssets),
    getEVMAccountAssets(id, evmAssets, cosmosAssets),
    getAptosAccountAssets(id, aptosAssets),
    getSuiAccountAssets(id, suiAssets),
    getCW20AccountAssets(id, cw20Assets),
    getERC20AccountAssets(id, erc20Assets),
    getCustomERC20AccountAssets(id, customErc20Assets),
    getCustomCW20AccountAssets(id, customCw20Assets),
    getBitcoinAccountAssets(id, bitcoinAssets),
    getIotaAccountAssets(id, iotaAssets),
  ]);

  const isFilterHidden = !option?.disableFilterHidden;
  const isFilterByBalance = !option?.disableBalanceFilter;

  const hiddenAssetIdSet = isFilterHidden ? await createHiddenAssetIdSet(id) : null;

  const filterAssets = <T extends { asset: Asset; balance?: string; totalBalance?: string }>(assets: T[]): T[] => {
    return assets.filter((asset) => {
      if (hiddenAssetIdSet && hiddenAssetIdSet.has(getCoinId(asset.asset))) {
        return false;
      }

      if (isFilterByBalance) {
        const balanceToCheck = asset.totalBalance || asset.balance;
        if (!gt(balanceToCheck || '0', '0')) {
          return false;
        }
      }

      return true;
    });
  };

  console.timeEnd('getAccountAssets');

  return {
    cosmosAccountAssets: filterAssets(baseCosmosAccountAssets),
    evmAccountAssets: filterAssets(baseEvmAccountAssets),
    aptosAccountAssets: filterAssets(baseAptosAccountAssets),
    suiAccountAssets: filterAssets(baseSuiAccountAssets),
    cw20AccountAssets: filterAssets(baseCw20AccountAssets),
    erc20AccountAssets: filterAssets(baseErc20AccountAssets),
    customErc20AccountAssets: filterAssets(baseCustomErc20AccountAssets),
    customCw20AccountAssets: filterAssets(baseCustomCw20AccountAssets),
    bitcoinAccountAssets: filterAssets(baseBitcoinAccountAssets),
    iotaAccountAssets: filterAssets(baseIotaAccountAssets),
  };
}

async function getCosmosAccountAssets(id: string, assets: { asset: CosmosAsset; chain: CosmosChain; addresses: AccountAddress[] }[]) {
  const storage = await chrome.storage.local.get<ExtensionStorage>([
    `${id}-balance-cosmos`,
    `${id}-account-info-cosmos`,
    `${id}-locked-cosmos`,
    `${id}-delegation-cosmos`,
    `${id}-undelegation-cosmos`,
    `${id}-reward-cosmos`,
    `${id}-commission-cosmos`,
  ]);

  const cosmosBalancesMap = new Map(
    (storage[`${id}-balance-cosmos`] || []).map((item) => [getAssetKey(String(item.chainId), item.chainType, item.address), item]),
  );
  const cosmosAccountInfoMap = new Map(
    (storage[`${id}-account-info-cosmos`] || []).map((item) => [getAssetKey(String(item.chainId), item.chainType, item.address), item]),
  );
  const cosmosLockedBalancesMap = new Map(
    (storage[`${id}-locked-cosmos`] || []).map((item) => [getAssetKey(String(item.chainId), item.chainType, item.address), item]),
  );

  const cosmosDelegationsMap = new Map(
    (storage[`${id}-delegation-cosmos`] || []).map((item) => [getAssetKeyWithId(item.assetId, String(item.chainId), item.chainType, item.address), item]),
  );
  const cosmosUndelegationsMap = new Map(
    (storage[`${id}-undelegation-cosmos`] || []).map((item) => [getAssetKeyWithId(item.assetId, String(item.chainId), item.chainType, item.address), item]),
  );
  const cosmosRewardsMap = new Map(
    (storage[`${id}-reward-cosmos`] || []).map((item) => [getAssetKeyWithId(item.assetId, String(item.chainId), item.chainType, item.address), item]),
  );
  const cosmosCommissionsMap = new Map(
    (storage[`${id}-commission-cosmos`] || []).map((item) => [getAssetKeyWithId(item.assetId, String(item.chainId), item.chainType, item.address), item]),
  );

  return assets.flatMap(({ asset, chain, addresses }) => {
    return addresses.map((address) => {
      const type = asset.id;
      const assetKey = getAssetKey(address.chainId, address.chainType, address.address);
      const assetKeyWithId = getAssetKeyWithId(type, address.chainId, address.chainType, address.address);

      const isVestingChainMainAsset = vestingChainIds.has(chain.id) && chain.mainAssetDenom === asset.id;

      const accountInfo = isVestingChainMainAsset ? formattingAccount(cosmosAccountInfoMap.get(assetKey)?.accountInfo) : undefined;

      const balanceInfo = cosmosBalancesMap.get(assetKey);

      const balance = balanceInfo?.balances?.find((balance) => balance.denom === type)?.amount || '0';

      const lastUpdatedAtMs = balanceInfo?.lastUpdatedAtMs;

      const delegationInfo = cosmosDelegationsMap.get(assetKeyWithId);

      const delegation =
        delegationInfo?.delegations
          ?.filter((item) => item.balance.denom === type)
          ?.reduce((ac, cu) => plus(ac, cu.balance.amount), '0')
          .toString() || '0';

      const undelegationInfo = cosmosUndelegationsMap.get(assetKeyWithId);

      const undelegation =
        undelegationInfo?.unbondings
          .map((item) =>
            item.entries.map((entry) => ({ delegator_address: item.delegator_address, validator_address: item.validator_address, entries: entry })),
          )
          .flat()
          .reduce((ac, cu) => plus(ac, cu.entries.balance), '0') || '0';

      const rewardInfo = cosmosRewardsMap.get(assetKeyWithId);

      const reward =
        rewardInfo?.rewards.total
          ?.filter((item) => item.denom === type)
          ?.reduce((ac, cu) => plus(ac, cu.amount), '0')
          .toString() || '0';

      const commissioInfo = cosmosCommissionsMap.get(assetKeyWithId);

      const commission =
        commissioInfo?.commissions?.commission.commission
          ?.filter((item) => item.denom === type)
          ?.reduce((ac, cu) => plus(ac, cu.amount), '0')
          .toString() || '0';

      const lockedInfo = cosmosLockedBalancesMap.get(assetKey);

      const locked = lockedInfo?.lockedBalances?.find((balance) => balance.denom === type)?.amount || '0';

      const resolvedBalance = (() => {
        if (isVestingChainMainAsset && accountInfo) {
          const vestingRemained = getVestingRemained(accountInfo, type);
          const delegatedVestingTotal = chain.id === KAVA_CHAINLIST_ID ? getDelegatedVestingTotal(accountInfo, type) : delegation;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [vestingRelatedAvailable, _] = (() => {
            if (gt(vestingRemained, '0')) {
              if (chain.id === PERSISTENCE_CHAINLIST_ID) {
                return getPersistenceVestingRelatedBalances(balance, vestingRemained);
              }

              return getVestingRelatedBalances(balance, vestingRemained, delegatedVestingTotal, undelegation);
            }

            return [balance, '0'];
          })();

          return vestingRelatedAvailable;
        }
        return balance;
      })();

      const totalBalance = sum([resolvedBalance, delegation, undelegation, reward, commission, locked]);

      const fetchStatus: AccountCosmosAssetFetchStatus = {
        balance: balanceInfo?.status,
      };

      const result: AccountCosmosAsset = {
        chain,
        asset,
        address,
        balance: resolvedBalance,
        delegation,
        undelegation,
        reward,
        commission,
        lockedBalance: locked,
        totalBalance,
        lastUpdatedAtMs,
        fetchStatus,
      };

      return result;
    });
  });
}

async function getCW20AccountAssets(id: string, assets: { asset: CosmosCw20Asset; chain: CosmosChain; addresses: AccountAddress[] }[]) {
  const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-balance-cw20`]);

  const cw20BalancesMap = new Map((storage[`${id}-balance-cw20`] || []).map((item) => [getAssetKey(String(item.chainId), item.chainType, item.address), item]));

  return assets
    .map(({ asset, chain, addresses }) => {
      return addresses.map((address) => {
        const type = asset.id;
        const assetKey = getAssetKey(address.chainId, address.chainType, address.address);

        const balanceInfo = cw20BalancesMap.get(assetKey);
        const targetCW20BalanceInfo = balanceInfo?.balances?.find((balance) => balance.contract === type);

        const balance = targetCW20BalanceInfo?.balance || '0';
        const lastUpdatedAtMs = targetCW20BalanceInfo?.lastUpdatedAtMs;

        const fetchStatus: AssetFetchStatus = {
          balance: targetCW20BalanceInfo?.status,
        };

        const result: AccountCw20Asset = {
          chain,
          asset,
          address,
          balance: balance,
          lastUpdatedAtMs,
          fetchStatus,
        };

        return result;
      });
    })
    .flat();
}

async function getEVMAccountAssets(
  id: string,
  assets: { asset: EvmAsset; chain: EvmChain; addresses: AccountAddress[] }[],
  cosmosAssets: { asset: CosmosAsset; chain: CosmosChain; addresses: AccountAddress[] }[],
) {
  const storage = await chrome.storage.local.get<ExtensionStorage>([
    `${id}-balance-evm`,
    `${id}-delegation-cosmos`,
    `${id}-undelegation-cosmos`,
    `${id}-reward-cosmos`,
    `${id}-commission-cosmos`,
  ]);

  const evmBalances = storage[`${id}-balance-evm`] || [];

  const cosmosDelegations = storage[`${id}-delegation-cosmos`] || [];
  const cosmosUndelegations = storage[`${id}-undelegation-cosmos`] || [];
  const cosmosRewards = storage[`${id}-reward-cosmos`] || [];
  const cosmosCommissions = storage[`${id}-commission-cosmos`] || [];

  return assets
    .map(({ asset, chain, addresses }) => {
      return addresses.map((address) => {
        const balanceInfo = evmBalances?.find(
          (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
        );

        const balance = balanceInfo?.balance ? BigInt(balanceInfo?.balance).toString() : '0';
        const lastUpdatedAtMs = balanceInfo?.lastUpdatedAtMs;

        const fetchStatus: AccountEVMAssetFetchStatus = {
          balance: balanceInfo?.status,
        };

        if (chain.isCosmos) {
          const mainAssetDenom = chain.mainAssetDenom;
          const cosmosStyleCoinAsset = cosmosAssets.find(
            (cosmosCoin) => cosmosCoin.asset.id === mainAssetDenom && cosmosCoin.asset.chainId === chain.id && cosmosCoin.asset.chainType === 'cosmos',
          );

          const { asset: cosmosStyleCoin, addresses } = cosmosStyleCoinAsset || {};

          const cosmosStyleAddress = addresses?.find((accountAddressItem) => accountAddressItem.accountType.hdPath === address.accountType.hdPath);

          const delegationInfo = cosmosDelegations?.find(
            (balance) => balance.assetId === mainAssetDenom && balance.chainId === address.chainId && balance.address === cosmosStyleAddress?.address,
          );

          const delegation =
            delegationInfo?.delegations
              ?.filter((item) => item.balance.denom === mainAssetDenom)
              ?.reduce((ac, cu) => plus(ac, cu.balance.amount), '0')
              .toString() || '0';

          const decimalsAdjustment = cosmosStyleCoin?.decimals ? asset.decimals - cosmosStyleCoin.decimals : 0;
          const resolvedDelegation = gt(decimalsAdjustment, '0') ? toBaseDenomAmount(delegation, decimalsAdjustment) : delegation;

          const undelegationInfo = cosmosUndelegations?.find(
            (balance) => balance.assetId === mainAssetDenom && balance.chainId === address.chainId && balance.address === cosmosStyleAddress?.address,
          );

          const undelegation =
            undelegationInfo?.unbondings
              .map((item) =>
                item.entries.map((entry) => ({ delegator_address: item.delegator_address, validator_address: item.validator_address, entries: entry })),
              )
              .flat()
              .reduce((ac, cu) => plus(ac, cu.entries.balance), '0') || '0';

          const resolvedUndelegation = gt(decimalsAdjustment, '0') ? toBaseDenomAmount(undelegation, decimalsAdjustment) : undelegation;

          const rewardInfo = cosmosRewards?.find(
            (balance) => balance.assetId === mainAssetDenom && balance.chainId === address.chainId && balance.address === cosmosStyleAddress?.address,
          );

          const reward =
            rewardInfo?.rewards.total
              ?.filter((item) => item.denom === mainAssetDenom)
              ?.reduce((ac, cu) => plus(ac, cu.amount), '0')
              .toString() || '0';

          const resolvedReward = gt(decimalsAdjustment, '0') ? toBaseDenomAmount(reward, decimalsAdjustment) : reward;

          const commissioInfo = cosmosCommissions?.find(
            (balance) => balance.assetId === mainAssetDenom && balance.chainId === address.chainId && balance.address === cosmosStyleAddress?.address,
          );

          const commission =
            commissioInfo?.commissions?.commission.commission
              ?.filter((item) => item.denom === mainAssetDenom)
              ?.reduce((ac, cu) => plus(ac, cu.amount), '0')
              .toString() || '0';

          const resolvedCommission = gt(decimalsAdjustment, '0') ? toBaseDenomAmount(commission, decimalsAdjustment) : commission;

          const totalBalance = sum([balance, resolvedDelegation, resolvedUndelegation, resolvedReward, resolvedCommission]);

          const fetchStatus: AccountEVMAssetFetchStatus = {
            balance: balanceInfo?.status,
          };

          const result: AccountEvmAsset = {
            chain,
            asset,
            address,
            balance: balance,
            delegation: resolvedDelegation,
            undelegation: resolvedUndelegation,
            reward: resolvedReward,
            commission: resolvedCommission,
            totalBalance,
            lastUpdatedAtMs,
            fetchStatus,
          };

          return result;
        }

        const result: AccountEvmAsset = {
          chain,
          asset,
          address,
          balance: balance,
          lastUpdatedAtMs,
          fetchStatus,
        };

        return result;
      });
    })
    .flat();
}

async function getERC20AccountAssets(id: string, assets: { asset: EvmErc20Asset; chain: EvmChain; addresses: AccountAddress[] }[]) {
  const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-balance-erc20`]);

  const erc20BalancesMap = new Map(
    (storage[`${id}-balance-erc20`] || []).map((item) => [getAssetKey(String(item.chainId), item.chainType, item.address), item]),
  );

  return assets
    .map(({ asset, chain, addresses }) => {
      return addresses.map((address) => {
        const type = asset.id;
        const assetKey = getAssetKey(address.chainId, address.chainType, address.address);

        const balanceInfo = erc20BalancesMap.get(assetKey);

        const targetERC20BalanceInfo = balanceInfo?.balances?.find((balance) => balance.contract === type);

        const balance = targetERC20BalanceInfo?.balance || '0';
        const lastUpdatedAtMs = targetERC20BalanceInfo?.lastUpdatedAtMs;

        const fetchStatus: AssetFetchStatus = {
          balance: targetERC20BalanceInfo?.status,
        };

        const result: AccountErc20Asset = {
          chain,
          asset,
          address,
          balance: balance,
          lastUpdatedAtMs,
          fetchStatus,
        };

        return result;
      });
    })
    .flat();
}

async function getCustomERC20AccountAssets(id: string, assets: { asset: EvmErc20Asset; chain: EvmChain; addresses: AccountAddress[] }[]) {
  const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-custom-balance-erc20`]);

  const customErc20BalancesMap = new Map(
    (storage[`${id}-custom-balance-erc20`] || []).map((item) => [getAssetKey(String(item.chainId), item.chainType, item.address), item]),
  );

  return assets
    .map(({ asset, chain, addresses }) => {
      return addresses.map((address) => {
        const type = asset.id;
        const assetKey = getAssetKey(address.chainId, address.chainType, address.address);

        const balanceInfo = customErc20BalancesMap.get(assetKey);

        const targetERC20BalanceInfo = balanceInfo?.balances?.find((balance) => balance.contract === type);

        const balance = targetERC20BalanceInfo?.balance || '0';
        const lastUpdatedAtMs = targetERC20BalanceInfo?.lastUpdatedAtMs;

        const fetchStatus: AssetFetchStatus = {
          balance: targetERC20BalanceInfo?.status,
        };

        const result: AccountErc20Asset = {
          chain,
          asset,
          address,
          balance: balance,
          lastUpdatedAtMs,
          fetchStatus,
        };

        return result;
      });
    })
    .flat();
}

async function getCustomCW20AccountAssets(id: string, assets: { asset: CosmosCw20Asset; chain: CosmosChain; addresses: AccountAddress[] }[]) {
  const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-custom-balance-cw20`]);

  const customCw20BalancesMap = new Map(
    (storage[`${id}-custom-balance-cw20`] || []).map((item) => [getAssetKey(String(item.chainId), item.chainType, item.address), item]),
  );

  return assets
    .map(({ asset, chain, addresses }) => {
      return addresses.map((address) => {
        const type = asset.id;
        const assetKey = getAssetKey(address.chainId, address.chainType, address.address);

        const balanceInfo = customCw20BalancesMap.get(assetKey);

        const targetCW20BalanceInfo = balanceInfo?.balances?.find((balance) => balance.contract === type);

        const balance = targetCW20BalanceInfo?.balance || '0';
        const lastUpdatedAtMs = targetCW20BalanceInfo?.lastUpdatedAtMs;

        const fetchStatus: AssetFetchStatus = {
          balance: targetCW20BalanceInfo?.status,
        };
        const result: AccountCw20Asset = {
          chain,
          asset,
          address,
          balance: balance,
          lastUpdatedAtMs,
          fetchStatus,
        };

        return result;
      });
    })
    .flat();
}

async function getAptosAccountAssets(id: string, assets: { asset: AptosAsset; chain: AptosChain; addresses: AccountAddress[] }[]) {
  const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-balance-aptos-v2`]);

  const aptosBalances = storage[`${id}-balance-aptos-v2`] || [];

  return assets
    .map(({ asset, chain, addresses }) => {
      return addresses.map((address) => {
        const type = asset.id;
        const balanceInfo = aptosBalances?.find(
          (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
        );
        const balance = balanceInfo?.balances?.find((balance) => balance?.asset_type === type)?.amount || '0';
        const lastUpdatedAtMs = balanceInfo?.lastUpdatedAtMs;

        const fetchStatus: AssetFetchStatus = {
          balance: balanceInfo?.status,
        };

        const result: AccountAptosAsset = {
          chain,
          asset,
          address,
          balance: balance,
          lastUpdatedAtMs,
          fetchStatus,
        };

        return result;
      });
    })
    .flat();
}
async function getSuiAccountAssets(id: string, assets: { asset: SuiAsset; chain: SuiChain; addresses: AccountAddress[] }[]) {
  const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-balance-sui`, `${id}-delegation-sui`]);

  const suiBalances = storage[`${id}-balance-sui`] || [];
  const suiDelegations = storage[`${id}-delegation-sui`] || [];

  return assets
    .map(({ asset, chain, addresses }) => {
      return addresses.map((address) => {
        const type = asset.id;
        const balanceInfo = suiBalances?.find(
          (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
        );
        const balance = balanceInfo?.balances?.find((balance) => balance.coinType === type)?.totalBalance || '0';
        const lastUpdatedAtMs = balanceInfo?.lastUpdatedAtMs;

        const fetchStatus: AccountSuiAssetFetchStatus = {
          balance: balanceInfo?.status,
        };

        if (type === SUI_COIN_TYPE) {
          const delegationInfo = suiDelegations?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );

          const delegation =
            delegationInfo?.delegations.reduce(
              (allValidatorStakedSum, item) =>
                plus(
                  allValidatorStakedSum,
                  item.stakes.reduce((eachValidatorStakedSum, stakeItem) => plus(eachValidatorStakedSum, stakeItem.principal), '0'),
                ),
              '0',
            ) || '0';
          const reward =
            delegationInfo?.delegations?.reduce(
              (allValidatorRewardsSum, item) =>
                plus(
                  allValidatorRewardsSum,
                  item.stakes.reduce(
                    (eachValidatorRewardSum, stakeItem) => plus(eachValidatorRewardSum, 'estimatedReward' in stakeItem ? stakeItem.estimatedReward : '0'),
                    '0',
                  ),
                ),
              '0',
            ) || '0';
          const totalBalance = sum([balance, delegation, reward]);

          const result: AccountSuiAsset = {
            chain,
            asset,
            address,
            balance: balance,
            delegation,
            reward,
            totalBalance,
            lastUpdatedAtMs,
            fetchStatus,
          };

          return result;
        }

        const result: AccountSuiAsset = {
          chain,
          asset,
          address,
          balance: balance,
          lastUpdatedAtMs,
          fetchStatus,
        };

        return result;
      });
    })
    .flat();
}
async function getBitcoinAccountAssets(id: string, assets: { asset: BitcoinAsset; chain: BitcoinChain; addresses: AccountAddress[] }[]) {
  const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-balance-bitcoin`]);

  const bitcoinBalances = storage[`${id}-balance-bitcoin`] || [];

  return assets
    .map(({ asset, chain, addresses }) => {
      return addresses.map((address) => {
        const balanceInfo = bitcoinBalances?.find(
          (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
        );
        const lastUpdatedAtMs = balanceInfo?.lastUpdatedAtMs;

        const fetchStatus: AssetFetchStatus = {
          balance: balanceInfo?.status,
        };

        const specificAccountTypeChain: BitcoinChain = {
          ...chain,
          accountTypes: chain.accountTypes.filter((accountType) => accountType.hdPath === address.accountType.hdPath),
        };

        const balance =
          balanceInfo?.balance.chainStats && balanceInfo?.balance.mempoolStats
            ? minus(
                minus(balanceInfo?.balance.chainStats?.funded_txo_sum, balanceInfo?.balance.chainStats?.spent_txo_sum),
                balanceInfo?.balance.mempoolStats?.spent_txo_sum,
              )
            : '0';

        const result: AccountBitcoinAsset = {
          chain: specificAccountTypeChain,
          asset,
          address,
          balance: balance,
          lastUpdatedAtMs,
          fetchStatus,
        };

        return result;
      });
    })
    .flat();
}
async function getIotaAccountAssets(id: string, assets: { asset: IotaAsset; chain: IotaChain; addresses: AccountAddress[] }[]) {
  const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-balance-iota`, `${id}-delegation-iota`]);

  const iotaBalances = storage[`${id}-balance-iota`] || [];
  const iotaDelegations = storage[`${id}-delegation-iota`] || [];

  return assets
    .map(({ asset, chain, addresses }) => {
      return addresses.map((address) => {
        const type = asset.id;
        const balanceInfo = iotaBalances?.find(
          (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
        );
        const balance = balanceInfo?.balances?.find((balance) => balance.coinType === type)?.totalBalance || '0';
        const lastUpdatedAtMs = balanceInfo?.lastUpdatedAtMs;

        const fetchStatus: AccountIotaAssetFetchStatus = {
          balance: balanceInfo?.status,
        };

        if (type === IOTA_COIN_TYPE) {
          const delegationInfo = iotaDelegations?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );

          const delegation =
            delegationInfo?.delegations.reduce(
              (allValidatorStakedSum, item) =>
                plus(
                  allValidatorStakedSum,
                  item.stakes.reduce((eachValidatorStakedSum, stakeItem) => plus(eachValidatorStakedSum, stakeItem.principal), '0'),
                ),
              '0',
            ) || '0';
          const reward =
            delegationInfo?.delegations?.reduce(
              (allValidatorRewardsSum, item) =>
                plus(
                  allValidatorRewardsSum,
                  item.stakes.reduce(
                    (eachValidatorRewardSum, stakeItem) => plus(eachValidatorRewardSum, 'estimatedReward' in stakeItem ? stakeItem.estimatedReward : '0'),
                    '0',
                  ),
                ),
              '0',
            ) || '0';
          const totalBalance = sum([balance, delegation, reward]);

          const result: AccountIotaAsset = {
            chain,
            asset,
            address,
            balance: balance,
            delegation,
            reward,
            totalBalance,
            lastUpdatedAtMs,
            fetchStatus,
          };

          return result;
        }

        const result: AccountIotaAsset = {
          chain,
          asset,
          address,
          balance: balance,
          lastUpdatedAtMs,
          fetchStatus,
        };

        return result;
      });
    })
    .flat();
}
