import type { DynamicFieldInfo as IotaDynamicFieldInfo, IotaObjectDataOptions, IotaObjectResponse, IotaObjectResponseQuery } from '@iota/iota-sdk/client';
import { IotaClient, Network as IotaNetwork } from '@iota/iota-sdk/client';
import { KioskClient as IotaKioskClient } from '@iota/kiosk';
import { KioskClient, Network } from '@mysten/kiosk';
import type { DynamicFieldInfo, SuiObjectDataOptions, SuiObjectResponse, SuiObjectResponseQuery } from '@mysten/sui/client';
import { SuiClient } from '@mysten/sui/client';
import PromisePool from '@supercharge/promise-pool';

import { KAVA_CHAINLIST_ID, PERSISTENCE_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { IOTA_COIN_TYPE } from '@/constants/iota';
import { SUI_COIN_TYPE } from '@/constants/sui';
import type {
  AccountAddress,
  AccountAptosAsset,
  AccountBitcoinAsset,
  AccountCosmosAsset,
  AccountCustomCosmosAsset,
  AccountCustomEvmAsset,
  AccountCw20Asset,
  AccountErc20Asset,
  AccountEvmAsset,
  AccountIotaAsset,
  AccountSuiAsset,
} from '@/types/account';
import type { AptosAsset, Asset, AssetBase, AssetId, BitcoinAsset, CosmosAsset, EvmAsset, IotaAsset, SuiAsset } from '@/types/asset';
import type { BitcoinChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import type { IotaGetDynamicFieldsResponse, IotaGetObjectsOwnedByAddressResponse, IotaGetObjectsResponse } from '@/types/iota/api';
import type { SuiGetDynamicFieldsResponse, SuiGetObjectsOwnedByAddressResponse, SuiGetObjectsResponse } from '@/types/sui/api';
import { chunkArray } from '@/utils/array';
import { post } from '@/utils/axios';
import { formattingAccount } from '@/utils/cosmos/account';
import { getDelegatedVestingTotal, getPersistenceVestingRelatedBalances, getVestingRelatedBalances, getVestingRemained } from '@/utils/cosmos/vesting';
import { getObjectDisplay as getIotaObjectDisplay, isKiosk as isIotaKiosk } from '@/utils/iota/nft';
import { gt, minus, plus, sum, toBaseDenomAmount } from '@/utils/numbers';
import { getCoinIdWithManual } from '@/utils/queryParamGenerator';
import { getObjectDisplay, isKiosk } from '@/utils/sui/nft';

import { getAccountAddress, getAllAccountAddress } from './account';
import { getAddedCustomChains, getChains } from './chain';

export async function getHiddenAssets(id: string) {
  const storage = await chrome.storage.local.get<ExtensionStorage>(`${id}-hidden-assetIds`);

  const hiddenAssetIds = storage[`${id}-hidden-assetIds`];

  return hiddenAssetIds ?? [];
}

export async function updateHiddenAssets(id: string, hiddenAssetIds: AssetId[]) {
  const storedHiddenAssetIds = await getHiddenAssets(id);

  const filteredStoredHiddenAssetIds = storedHiddenAssetIds.filter(
    (storedHiddenAssetId) => !hiddenAssetIds.find((hiddenAssetId) => getCoinIdWithManual(storedHiddenAssetId) === getCoinIdWithManual(hiddenAssetId)),
  );

  const updatedHiddenAssetIds = [...filteredStoredHiddenAssetIds, ...hiddenAssetIds];

  await chrome.storage.local.set({ [`${id}-hidden-assetIds`]: updatedHiddenAssetIds });
}

export async function getHiddenCustomAssets() {
  const storage = await chrome.storage.local.get<ExtensionStorage>('customHiddenAssetIds');

  const hiddenCustomAssetIds = storage['customHiddenAssetIds'];

  return hiddenCustomAssetIds ?? [];
}

export async function getVisibleAssets(id: string) {
  const storage = await chrome.storage.local.get<ExtensionStorage>(`${id}-visible-assetIds`);

  const visibleAssetIds = storage[`${id}-visible-assetIds`];

  return visibleAssetIds ?? [];
}

export async function getAssets() {
  const {
    assetsV11: assets,
    paramsV11: chains,
    erc20Assets,
    cw20Assets,
    customErc20Assets,
    customCw20Assets,
  } = await chrome.storage.local.get<ExtensionStorage>(['assetsV11', 'paramsV11', 'cw20Assets', 'erc20Assets', 'customErc20Assets', 'customCw20Assets']);
  if (!assets) {
    throw new Error('No assets found');
  }

  const { evmChains, suiChains, aptosChains, cosmosChains, bitcoinChains, iotaChains } = await getChains();

  const evmChainIds = evmChains.map((chain) => chain.id);
  const cosmosChainIds = cosmosChains.map((chain) => chain.id);
  const suiChainIds = suiChains.map((chain) => chain.id);
  const aptosChainIds = aptosChains.map((chain) => chain.id);
  const bitcoinChainIds = bitcoinChains.map((chain) => chain.id);
  const iotaChainIds = iotaChains.map((chain) => chain.id);

  const filteredEvmAssets = assets.filter((asset) => {
    const chainParam = chains?.[asset.chain]?.params?.chainlist_params;
    const gasCoinDenom = chainParam?.gas_asset_denom || chainParam?.staking_asset_denom || chainParam?.main_asset_denom;

    return evmChainIds.includes(asset.chain) && asset.type === 'native' && gasCoinDenom === asset.denom;
  });

  const evmAssets: EvmAsset[] = filteredEvmAssets.map((asset) => {
    return {
      ...asset,
      type: 'native',
      id: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      chainId: asset.chain,
      chainType: 'evm',
      decimals: 18,
    };
  });

  const filteredCosmosAssets = assets.filter((asset) => cosmosChainIds.includes(asset.chain));

  const cosmosAssets: CosmosAsset[] = filteredCosmosAssets.map((asset) => {
    return {
      ...asset,
      chainId: asset.chain,
      id: asset.denom,
      chainType: 'cosmos',
    };
  });

  const filteredSuiAssets = assets.filter((asset) => suiChainIds.includes(asset.chain));

  const suiAssets: SuiAsset[] = filteredSuiAssets.map((asset) => {
    return {
      ...asset,
      id: asset.denom,
      chainId: asset.chain,
      chainType: 'sui',
    };
  });

  const filteredAptosAssets = assets.filter((asset) => aptosChainIds.includes(asset.chain));

  const aptosAssets: AptosAsset[] = filteredAptosAssets.map((asset) => {
    return {
      ...asset,
      id: asset.denom,
      chainId: asset.chain,
      chainType: 'aptos',
    };
  });

  const filteredBitcoinAssets = assets.filter((asset) => bitcoinChainIds.includes(asset.chain));

  const bitcoinAssets: BitcoinAsset[] = filteredBitcoinAssets.map((asset) => {
    return {
      ...asset,
      id: asset.denom,
      chainId: asset.chain,
      chainType: 'bitcoin',
    };
  });

  const filteredIotaAssets = assets.filter((asset) => iotaChainIds.includes(asset.chain));

  const iotaAssets: IotaAsset[] = filteredIotaAssets.map((asset) => {
    return {
      ...asset,
      id: asset.denom,
      chainId: asset.chain,
      chainType: 'iota',
    };
  });

  return {
    cosmosAssets,
    evmAssets,
    suiAssets,
    aptosAssets,
    bitcoinAssets,
    iotaAssets,
    erc20Assets,
    customErc20Assets,
    cw20Assets,
    customCw20Assets,
  };
}

type GetAccountAssetsOption = {
  disableFilterHidden?: boolean;
  disableBalanceFilter?: boolean;
};

const vestingChainIds = new Set([KAVA_CHAINLIST_ID]);

export async function getAccountAssets(id: string, option?: GetAccountAssetsOption) {
  console.time('getAccountAssets');
  const concurrency = 10;
  const storage = await chrome.storage.local.get<ExtensionStorage>([
    `${id}-address`,
    `${id}-balance-cosmos`,
    `${id}-delegation-cosmos`,
    `${id}-undelegation-cosmos`,
    `${id}-reward-cosmos`,
    `${id}-commission-cosmos`,
    `${id}-account-info-cosmos`,
    `${id}-balance-evm`,
    `${id}-balance-aptos`,
    `${id}-balance-sui`,
    `${id}-delegation-sui`,
    `${id}-balance-bitcoin`,
    `${id}-balance-iota`,
    `${id}-delegation-iota`,
    `${id}-balance-erc20`,
    `${id}-balance-cw20`,
    `${id}-custom-balance-erc20`,
    `${id}-custom-balance-cw20`,
  ]);

  const hiddenAssetIds = await getHiddenAssets(id);
  const visibleAssetIds = await getVisibleAssets(id);

  const { aptosChains, cosmosChains, evmChains, suiChains, bitcoinChains, iotaChains } = await getChains();
  const addedCustomChains = await getAddedCustomChains();

  const allEVMChains = [...evmChains, ...addedCustomChains.filter((chain) => chain.chainType === 'evm')];
  const allCosmosChains = [...cosmosChains, ...addedCustomChains.filter((chain) => chain.chainType === 'cosmos')];

  const { aptosAssets, cosmosAssets, cw20Assets, customCw20Assets, erc20Assets, customErc20Assets, evmAssets, suiAssets, bitcoinAssets, iotaAssets } =
    await getAssets();

  const filterHiddenAssets = <T extends Asset>(assets: T[]): T[] => {
    if (option?.disableFilterHidden) {
      return assets;
    } else {
      return assets.filter((asset) => {
        const isVisible = visibleAssetIds.find(
          (assetId) => assetId.chainId === asset.chainId && assetId.id === asset.id && assetId.chainType === asset.chainType,
        );
        if (isVisible) {
          return true;
        }

        const isHidden = hiddenAssetIds.find(
          (assetId) => assetId.chainId === asset.chainId && assetId.id === asset.id && assetId.chainType === asset.chainType,
        );

        if (isHidden) {
          return false;
        }

        return true;
      });
    }
  };

  const aptosAssetsWithoutHidden = filterHiddenAssets(aptosAssets);
  const cosmosAssetsWithoutHidden = filterHiddenAssets(cosmosAssets);
  const cw20AssetsWithoutHidden = filterHiddenAssets(cw20Assets);
  const erc20AssetsWithoutHidden = filterHiddenAssets(erc20Assets);
  const evmAssetsWithoutHidden = filterHiddenAssets(evmAssets);
  const suiAssetsWithoutHidden = filterHiddenAssets(suiAssets);
  const bitcoinAssetsWithoutHidden = filterHiddenAssets(bitcoinAssets);
  const iotaAssetsWithoutHidden = filterHiddenAssets(iotaAssets);

  const accountAddress = storage[`${id}-address`] || [];
  const allAccountAddress = await getAllAccountAddress(id);

  const cosmosBalances = storage[`${id}-balance-cosmos`] || [];
  const cosmosDelegations = storage[`${id}-delegation-cosmos`] || [];
  const cosmosUndelegations = storage[`${id}-undelegation-cosmos`] || [];
  const cosmosRewards = storage[`${id}-reward-cosmos`] || [];
  const cosmosCommissions = storage[`${id}-commission-cosmos`] || [];
  const cosmosAccountInfo = storage[`${id}-account-info-cosmos`] || [];

  const evmBalances = storage[`${id}-balance-evm`] || [];
  const aptosBalances = storage[`${id}-balance-aptos`] || [];

  const suiBalances = storage[`${id}-balance-sui`] || [];
  const suiDelegations = storage[`${id}-delegation-sui`] || [];

  const iotaBalances = storage[`${id}-balance-iota`] || [];
  const iotaDelegations = storage[`${id}-delegation-iota`] || [];

  const bitcoinBalances = storage[`${id}-balance-bitcoin`] || [];
  const erc20Balances = storage[`${id}-balance-erc20`] || [];
  const customErc20Balances = storage[`${id}-custom-balance-erc20`] || [];
  const cw20Balances = storage[`${id}-balance-cw20`] || [];
  const customCw20Balances = storage[`${id}-custom-balance-cw20`] || [];

  const cosmosPromise = PromisePool.withConcurrency(concurrency)
    .for(cosmosAssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = cosmosChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process(async (address) => {
          const isVestingChainMainAsset = vestingChainIds.has(chain.id) && chain.mainAssetDenom === asset.id;

          const accountInfo = isVestingChainMainAsset
            ? formattingAccount(
                cosmosAccountInfo.find((accountInfo) => accountInfo.address === address.address && accountInfo.chainId === chain.id)?.accountInfo,
              )
            : undefined;

          const type = asset.id;
          const balanceInfo = cosmosBalances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.denom === type)?.amount || '0';

          const delegationInfo = cosmosDelegations?.find(
            (balance) =>
              balance.assetId === type && balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );

          const delegation =
            delegationInfo?.delegations
              ?.filter((item) => item.balance.denom === type)
              ?.reduce((ac, cu) => plus(ac, cu.balance.amount), '0')
              .toString() || '0';

          const undelegationInfo = cosmosUndelegations?.find(
            (balance) =>
              balance.assetId === type && balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );

          const undelegation =
            undelegationInfo?.unbondings
              .map((item) =>
                item.entries.map((entry) => ({ delegator_address: item.delegator_address, validator_address: item.validator_address, entries: entry })),
              )
              .flat()
              .reduce((ac, cu) => plus(ac, cu.entries.balance), '0') || '0';

          const rewardInfo = cosmosRewards?.find(
            (balance) =>
              balance.assetId === type && balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );

          const reward =
            rewardInfo?.rewards.total
              ?.filter((item) => item.denom === type)
              ?.reduce((ac, cu) => plus(ac, cu.amount), '0')
              .toString() || '0';

          const commissioInfo = cosmosCommissions?.find(
            (balance) =>
              balance.assetId === type && balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );

          const commission =
            commissioInfo?.commissions?.commission.commission
              ?.filter((item) => item.denom === type)
              ?.reduce((ac, cu) => plus(ac, cu.amount), '0')
              .toString() || '0';

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

          const totalBalance = sum([resolvedBalance, delegation, undelegation, reward, commission]);

          const result: AccountCosmosAsset = {
            chain,
            asset,
            address,
            balance: resolvedBalance,
            delegation,
            undelegation,
            reward,
            commission,
            totalBalance,
          };

          return result;
        });

      return results;
    });

  const cw20Promise = PromisePool.withConcurrency(concurrency)
    .for(cw20AssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = cosmosChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = asset.id;
          const balanceInfo = cw20Balances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.contract === type)?.balance || '0';

          const result: AccountCw20Asset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const evmPromise = PromisePool.withConcurrency(concurrency)
    .for(evmAssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = evmChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const balanceInfo = evmBalances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );

          const balance = balanceInfo?.balance ? BigInt(balanceInfo?.balance).toString() : '0';

          if (chain.isCosmos) {
            const mainAssetDenom = chain.mainAssetDenom;
            const cosmosStyleCoin = cosmosAssets.find(
              (cosmosCoin) => cosmosCoin.id === mainAssetDenom && cosmosCoin.chainId === chain.id && cosmosCoin.chainType === 'cosmos',
            );

            const cosmosStyleAddress = accountAddress.find((aa) => aa.chainId === address.chainId && aa.accountType.hdPath === address.accountType.hdPath);

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
            };

            return result;
          }

          const result: AccountEvmAsset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const erc20Promise = PromisePool.withConcurrency(concurrency)
    .for(erc20AssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = evmChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = asset.id;
          const balanceInfo = erc20Balances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.contract === type)?.balance || '0';

          const result: AccountErc20Asset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const customErc20Promise = PromisePool.withConcurrency(concurrency)
    .for(customErc20Assets)
    .process(async (asset) => {
      const addresses = allAccountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = allEVMChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = asset.id;
          const balanceInfo = customErc20Balances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.contract === type)?.balance || '0';

          const result: AccountErc20Asset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const customCW20Promise = PromisePool.withConcurrency(concurrency)
    .for(customCw20Assets)
    .process(async (asset) => {
      const addresses = allAccountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = allCosmosChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = asset.id;
          const balanceInfo = customCw20Balances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.contract === type)?.balance || '0';

          const result: AccountCw20Asset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const aptosPromise = PromisePool.withConcurrency(concurrency)
    .for(aptosAssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = aptosChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = `0x1::coin::CoinStore<${asset.id}>`;
          const balanceInfo = aptosBalances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.type === type)?.data?.coin?.value || '0';
          const result: AccountAptosAsset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const suiPromise = PromisePool.withConcurrency(concurrency)
    .for(suiAssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = suiChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = asset.id;
          const balanceInfo = suiBalances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.coinType === type)?.totalBalance || '0';

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
            };

            return result;
          }

          const result: AccountSuiAsset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const bitcoinPromise = PromisePool.withConcurrency(concurrency)
    .for(bitcoinAssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = bitcoinChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const balanceInfo = bitcoinBalances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );

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
          };

          return result;
        });

      return results;
    });

  const iotaPromise = PromisePool.withConcurrency(concurrency)
    .for(iotaAssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = iotaChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = asset.id;
          const balanceInfo = iotaBalances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.coinType === type)?.totalBalance || '0';

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
            };

            return result;
          }

          const result: AccountIotaAsset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const results = await Promise.all([
    cosmosPromise,
    evmPromise,
    aptosPromise,
    suiPromise,
    cw20Promise,
    erc20Promise,
    customErc20Promise,
    customCW20Promise,
    bitcoinPromise,
    iotaPromise,
  ]);

  const cosmosAccountAssets = results[0].results.flat().filter((asset) => asset.chain && asset.address);
  const evmAccountAssets = results[1].results.flat().filter((asset) => asset.chain && asset.address);
  const aptosAccountAssets = results[2].results.flat().filter((asset) => asset.chain && asset.address);
  const suiAccountAssets = results[3].results.flat().filter((asset) => asset.chain && asset.address);
  const cw20AccountAssets = results[4].results.flat().filter((asset) => asset.chain && asset.address);
  const erc20AccountAssets = results[5].results.flat().filter((asset) => asset.chain && asset.address);
  const customErc20AccountAssets = results[6].results.flat().filter((asset) => asset.chain && asset.address);
  const customCw20AccountAssets = results[7].results.flat().filter((asset) => asset.chain && asset.address);
  const bitcoinAccountAssets = results[8].results.flat().filter((asset) => asset.chain && asset.address);
  const iotaAccountAssets = results[9].results.flat().filter((asset) => asset.chain && asset.address);

  type AssetWithBalance = {
    balance: string;
    asset: AssetBase;
    address: AccountAddress;
  };

  const filterHiddenAssetsByBalance = <T extends AssetWithBalance>(assets: T[]): T[] => {
    if (option?.disableBalanceFilter) {
      return assets;
    } else {
      return assets.filter((asset) => {
        const isVisible = visibleAssetIds.find(
          (assetId) => assetId.chainId === asset.asset.chainId && assetId.id === asset.asset.id && assetId.chainType === asset.asset.chainType,
        );
        if (isVisible) {
          return true;
        }

        if (asset.asset.chainType === 'bitcoin') {
          const balanceInfo = bitcoinBalances?.find(
            (balance) =>
              balance.chainId === asset.address.chainId && balance.chainType === asset.address.chainType && balance.address === asset.address.address,
          );

          const pendingFundedAmount = balanceInfo?.balance.chainStats?.funded_txo_sum || '0';
          const isPendingReceiveBalanceGreaterThanZero = gt(pendingFundedAmount, '0');

          const isBalanceGreaterThanZero = gt(asset.balance, '0');

          return isBalanceGreaterThanZero || isPendingReceiveBalanceGreaterThanZero;
        } else {
          const isBalanceGreaterThanZero = gt(asset.balance, '0');

          return isBalanceGreaterThanZero;
        }
      });
    }
  };

  const filterHiddenStakableAssetsByBalance = <T extends AccountCosmosAsset | AccountEvmAsset | AccountSuiAsset | AccountIotaAsset>(assets: T[]): T[] => {
    if (option?.disableBalanceFilter) {
      return assets;
    } else {
      return assets.filter((asset) => {
        const isVisible = visibleAssetIds.find(
          (assetId) => assetId.chainId === asset.asset.chainId && assetId.id === asset.asset.id && assetId.chainType === asset.asset.chainType,
        );
        if (isVisible) {
          return true;
        }

        const isBalanceGreaterThanZero = gt(asset.totalBalance || asset.balance || '0', '0');

        return isBalanceGreaterThanZero;
      });
    }
  };

  const filteredCosmosAccountAssets = filterHiddenStakableAssetsByBalance(cosmosAccountAssets);
  const filteredEVMAccountAssets = filterHiddenStakableAssetsByBalance(evmAccountAssets);
  const filteredSuiAccountAssets = filterHiddenStakableAssetsByBalance(suiAccountAssets);
  const filteredIotaAccountAssets = filterHiddenStakableAssetsByBalance(iotaAccountAssets);

  const filteredAptosAccountAssets = filterHiddenAssetsByBalance(aptosAccountAssets);
  const filteredCW20AccountAssets = filterHiddenAssetsByBalance(cw20AccountAssets);
  const filteredERC20AccountAssets = filterHiddenAssetsByBalance(erc20AccountAssets);
  const filteredCustomERC20AccountAssets = filterHiddenAssetsByBalance(customErc20AccountAssets);
  const filteredCustomCW20AccountAssets = filterHiddenAssetsByBalance(customCw20AccountAssets);

  const filteredBitcoinAccountAssets = filterHiddenAssetsByBalance(bitcoinAccountAssets);

  console.timeEnd('getAccountAssets');

  return {
    cosmosAccountAssets: filteredCosmosAccountAssets,
    evmAccountAssets: filteredEVMAccountAssets,
    aptosAccountAssets: filteredAptosAccountAssets,
    suiAccountAssets: filteredSuiAccountAssets,
    cw20AccountAssets: filteredCW20AccountAssets,
    erc20AccountAssets: filteredERC20AccountAssets,
    customErc20AccountAssets: filteredCustomERC20AccountAssets,
    customCw20AccountAssets: filteredCustomCW20AccountAssets,
    bitcoinAccountAssets: filteredBitcoinAccountAssets,
    iotaAccountAssets: filteredIotaAccountAssets,
  };
}

type GetAccountCustomAssetsOption = {
  disableFilterHidden?: boolean;
  disableBalanceFilter?: boolean;
};

export async function getAccountCustomAssets(id: string, option?: GetAccountCustomAssetsOption) {
  console.time('getAccountCustomAssets');
  const concurrency = 10;
  const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-custom-address`, `${id}-custom-balance-cosmos`, `${id}-custom-balance-evm`]);

  const hiddenAssetIds = await getHiddenCustomAssets();
  const visibleAssetIds = await getVisibleAssets(id);

  const customChains = await getAddedCustomChains();

  const cosmosChains = customChains.filter((chain) => chain.chainType === 'cosmos');
  const evmChains = customChains.filter((chain) => chain.chainType === 'evm');

  const { customAssets } = await chrome.storage.local.get<ExtensionStorage>(['customAssets']);

  const visibleCustomAssets = option?.disableFilterHidden
    ? customAssets
    : customAssets.filter((asset) => {
        const isVisible = visibleAssetIds.find(
          (assetId) => assetId.chainId === asset.chainId && assetId.id === asset.id && assetId.chainType === asset.chainType,
        );
        if (isVisible) {
          return true;
        }

        const isHidden = hiddenAssetIds.find((assetId) => getCoinIdWithManual(assetId) === getCoinIdWithManual(asset));

        if (isHidden) {
          return false;
        }

        return true;
      });

  const customCosmosAssets = visibleCustomAssets.filter((asset) => asset.chainType === 'cosmos');
  const customEvmAssets = visibleCustomAssets.filter((asset) => asset.chainType === 'evm');

  const accountAddress = storage[`${id}-custom-address`] || [];

  const customCosmosBalances = storage[`${id}-custom-balance-cosmos`] || [];
  const customEvmBalances = storage[`${id}-custom-balance-evm`] || [];

  const cosmosPromise = PromisePool.withConcurrency(concurrency)
    .for(customCosmosAssets)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = cosmosChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = asset.id;
          const balanceInfo = customCosmosBalances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.denom === type)?.amount || '0';

          const result: AccountCustomCosmosAsset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const evmPromise = PromisePool.withConcurrency(concurrency)
    .for(customEvmAssets)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = evmChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const balanceInfo = customEvmBalances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );

          const balance = balanceInfo?.balance ? BigInt(balanceInfo?.balance).toString() : '0';

          const result: AccountCustomEvmAsset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const results = await Promise.all([cosmosPromise, evmPromise]);

  const cosmosAccountCustomAssets = results[0].results.flat().filter((asset) => asset.chain && asset.address);
  const evmAccountCustomAssets = results[1].results.flat().filter((asset) => asset.chain && asset.address);

  type AssetWithBalance = {
    balance: string;
    asset: AssetBase;
  };

  const filterHiddenAssetsByBalance = <T extends AssetWithBalance>(assets: T[]): T[] => {
    if (option?.disableBalanceFilter) {
      return assets;
    } else {
      return assets.filter((asset) => {
        const isVisible = visibleAssetIds.find(
          (assetId) => assetId.chainId === asset.asset.chainId && assetId.id === asset.asset.id && assetId.chainType === asset.asset.chainType,
        );
        if (isVisible) {
          return true;
        }

        const isBalanceGreaterThanZero = gt(asset.balance, '0');

        return isBalanceGreaterThanZero;
      });
    }
  };

  const filteredCosmosAccountCustomAssets = filterHiddenAssetsByBalance(cosmosAccountCustomAssets);
  const filteredEVMAccountCustomAssets = filterHiddenAssetsByBalance(evmAccountCustomAssets);

  console.timeEnd('getAccountCustomAssets');

  return {
    cosmosAccountCustomAssets: filteredCosmosAccountCustomAssets,
    evmAccountCustomAssets: filteredEVMAccountCustomAssets,
  };
}

type GetSuiNFTSOption = {
  objectResponseQuery?: SuiObjectResponseQuery;
};

export async function getSuiNFTs(id: string, option?: GetSuiNFTSOption) {
  const concurrency = 10;

  const { suiChains } = await getChains();

  const accountAddress = await getAccountAddress(id);

  const suiAddresses = accountAddress.filter((address) => address.chainType === 'sui');

  const addressWithChain = suiAddresses
    .map((addr) => {
      const chain = suiChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(concurrency)
    .for(addressWithChain)
    .process(async (addr) => {
      try {
        const { chainId, chainType, address, chain } = addr;

        const normalNFTObjects = await (async () => {
          const objectsOwnedByAddress = await getObjectsByOwnedAddress(address, chain.id, chainType, option?.objectResponseQuery);

          const objectIdList = objectsOwnedByAddress.map((object) => object.data?.objectId || '');

          const objects = await getMultiObjects(objectIdList, chain.id, chainType, option?.objectResponseQuery?.options);

          const nftObjects = objects?.filter((item) => getObjectDisplay(item)?.data) || [];

          return nftObjects;
        })();

        const anotherKioskObjects = await (async () => {
          const anotherkioskObjects = normalNFTObjects.filter((item) => item.data && isKiosk(item.data));

          const kioskObjectParentId = anotherkioskObjects
            ? anotherkioskObjects.map((item) => getObjectDisplay(item)?.data?.kiosk || '').filter((item) => !!item)
            : [];

          const dynamicFields = await Promise.all(
            kioskObjectParentId.map(async (kioskId) => {
              return await getSuiDynamicFields(kioskId, chainId, chainType);
            }),
          );
          const flatDynamicFields = dynamicFields.flat();

          const kioskDynamicFieldsObjectIds = flatDynamicFields?.map((item) => item.objectId) || [];

          const kioskObjects = await getMultiObjects(kioskDynamicFieldsObjectIds, chainId, chainType, option?.objectResponseQuery?.options);
          const filteredKioskObjects = kioskObjects.filter((item) => getObjectDisplay(item)?.data);

          return filteredKioskObjects;
        })();

        const kioskNFTs = await getSuiKioskNFTs(address, chainId, chainType, option?.objectResponseQuery);

        const total = [...normalNFTObjects, ...kioskNFTs, ...anotherKioskObjects];

        const result = { accountId: id, chainId, chainType, address, nftObjects: total };

        return result;
      } catch {
        return null;
      }
    });

  return results.filter((result) => !!result);
}

export async function getSuiKioskNFTs(address: string, chainId: string, chainType: string, option?: SuiObjectResponseQuery) {
  const { suiChains } = await getChains();
  const suiChain = suiChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!suiChain) throw new Error('Chain not found');

  const rpcUrls = suiChain.rpcUrls.map((rpcUrl) => rpcUrl.url);

  for (const rpcUrl of rpcUrls) {
    try {
      const suiClient = new SuiClient({ url: rpcUrl });
      const network = suiChain.isTestnet ? Network.TESTNET : Network.MAINNET;
      const kioskClient = new KioskClient({ client: suiClient, network });
      const { kioskIds } = await kioskClient.getOwnedKiosks({ address });

      const kioskDatas = await Promise.all(
        kioskIds.map(async (id) => {
          return kioskClient.getKiosk({
            id,
            options: { withKioskFields: true, withListingPrices: true },
          });
        }),
      );

      const kioskObjectIds = kioskDatas.flatMap((kiosk) => kiosk.itemIds);

      const kioskNFTObjects = await getMultiObjects(kioskObjectIds, chainId, chainType, option?.options);

      const filteredKioskNFTs = kioskNFTObjects.filter((item) => !!item && !!getObjectDisplay(item)?.data) || [];

      return filteredKioskNFTs;
    } catch {
      continue;
    }
  }
  return [];
}

export async function getSuiDynamicFields(parentObjectId: string, chainId: string, chainType: string) {
  const { suiChains } = await getChains();
  const suiChain = suiChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!suiChain) throw new Error('Chain not found');

  const rpcUrls = suiChain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  let nextKey: string | null = null;
  const dynamicFieldsInfoResponse: DynamicFieldInfo[][] = [];

  do {
    for (const rpcUrl of rpcUrls) {
      try {
        const response: SuiGetDynamicFieldsResponse | undefined = await post<SuiGetDynamicFieldsResponse>(rpcUrl, {
          jsonrpc: '2.0',
          method: 'suix_getDynamicFields',
          params: [parentObjectId, nextKey, null],
          id: parentObjectId,
        });
        if (response.error) {
          throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: suix_getDynamicFields, Message: ${response.error?.message}`);
        }
        if (response.result) {
          nextKey = response.result.nextCursor && response.result.hasNextPage ? response.result.nextCursor : null;
          dynamicFieldsInfoResponse.push(response.result.data ?? []);
          break;
        }
      } catch {
        continue;
      }
    }
  } while (nextKey);

  return dynamicFieldsInfoResponse.flat();
}

export async function getObjectsByOwnedAddress(
  address: string,
  chainId: string,
  chainType: string,
  option?: SuiObjectResponseQuery,
): Promise<SuiObjectResponse[]> {
  const { suiChains } = await getChains();
  const suiChain = suiChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!suiChain) throw new Error('Chain not found');

  const rpcUrls = suiChain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  let nextKey: string | null = null;
  const suiObjectResponses: SuiObjectResponse[][] = [];

  do {
    let success = false;
    for (const rpcUrl of rpcUrls) {
      try {
        const response: SuiGetObjectsOwnedByAddressResponse | undefined = await post<SuiGetObjectsOwnedByAddressResponse>(rpcUrl, {
          jsonrpc: '2.0',
          method: 'suix_getOwnedObjects',
          params: nextKey ? [address, { ...option }, nextKey] : [address, { ...option }],
          id: address,
        });
        if (response.error) {
          throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: suix_getOwnedObjects, Message: ${response.error?.message}`);
        }

        if (response.result) {
          nextKey = response.result.nextCursor && response.result.hasNextPage ? response.result.nextCursor : null;
          suiObjectResponses.push(response.result.data ?? []);
          success = true;
          break;
        }
      } catch {
        continue;
      }
    }
    if (!success) break;
  } while (nextKey);

  return suiObjectResponses.flat();
}

export async function getMultiObjects(
  objectIds: string[],
  chainId: string,
  chainType: string,
  option?: SuiObjectDataOptions | null,
): Promise<SuiObjectResponse[]> {
  const { suiChains } = await getChains();
  const suiChain = suiChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!suiChain) throw new Error('Chain not found');

  const rpcUrls = suiChain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  const chunkedArray = chunkArray(objectIds, 50);
  const multiGetObjectResponses: SuiObjectResponse[][] = [];

  for (const chunk of chunkedArray) {
    let success = false;
    for (const rpcUrl of rpcUrls) {
      try {
        const response = await post<SuiGetObjectsResponse>(rpcUrl, {
          jsonrpc: '2.0',
          method: 'sui_multiGetObjects',
          params: [
            [...chunk],
            {
              ...option,
              showType: true,
              showContent: true,
              showOwner: true,
              showDisplay: true,
            },
          ],
          id: 'getMultiObjects',
        });
        if (response.error) {
          throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: sui_multiGetObjects, Message: ${response.error?.message}`);
        }

        if (response.result) {
          multiGetObjectResponses.push(response.result ?? []);
          success = true;
          break;
        }
      } catch {
        continue;
      }
    }
    if (!success) break;
  }

  return multiGetObjectResponses.flat();
}

type GetIotaNFTSOption = {
  objectResponseQuery?: IotaObjectResponseQuery;
};

export async function getIotaNFTs(id: string, option?: GetIotaNFTSOption) {
  const concurrency = 10;

  const { iotaChains } = await getChains();

  const accountAddress = await getAccountAddress(id);

  const iotaAddresses = accountAddress.filter((address) => address.chainType === 'iota');

  const addressWithChain = iotaAddresses
    .map((addr) => {
      const chain = iotaChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(concurrency)
    .for(addressWithChain)
    .process(async (addr) => {
      try {
        const { chainId, chainType, address, chain } = addr;

        const normalNFTObjects = await (async () => {
          const objectsOwnedByAddress = await getIotaObjectsByOwnedAddress(address, chain.id, chainType, option?.objectResponseQuery);

          const objectIdList = objectsOwnedByAddress.map((object) => object.data?.objectId || '');

          const objects = await getIotaMultiObjects(objectIdList, chain.id, chainType, option?.objectResponseQuery?.options);

          const nftObjects = objects?.filter((item) => getIotaObjectDisplay(item)?.data) || [];

          return nftObjects;
        })();

        const anotherKioskObjects = await (async () => {
          const anotherkioskObjects = normalNFTObjects.filter((item) => item.data && isIotaKiosk(item.data));

          const kioskObjectParentId = anotherkioskObjects
            ? anotherkioskObjects.map((item) => getIotaObjectDisplay(item)?.data?.kiosk || '').filter((item) => !!item)
            : [];

          const dynamicFields = await Promise.all(
            kioskObjectParentId.map(async (kioskId) => {
              return await getIotaDynamicFields(kioskId, chainId, chainType);
            }),
          );
          const flatDynamicFields = dynamicFields.flat();

          const kioskDynamicFieldsObjectIds = flatDynamicFields?.map((item) => item.objectId) || [];

          const kioskObjects = await getIotaMultiObjects(kioskDynamicFieldsObjectIds, chainId, chainType, option?.objectResponseQuery?.options);
          const filteredKioskObjects = kioskObjects.filter((item) => getIotaObjectDisplay(item)?.data);

          return filteredKioskObjects;
        })();

        const kioskNFTs = await getIotaKioskNFTs(address, chainId, chainType, option?.objectResponseQuery);

        const total = [...normalNFTObjects, ...kioskNFTs, ...anotherKioskObjects];

        const result = { accountId: id, chainId, chainType, address, nftObjects: total };

        return result;
      } catch {
        return null;
      }
    });

  return results.filter((result) => !!result);
}

export async function getIotaKioskNFTs(address: string, chainId: string, chainType: string, option?: IotaObjectResponseQuery) {
  const { iotaChains } = await getChains();
  const iotaChain = iotaChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!iotaChain) throw new Error('Chain not found');

  const rpcUrls = iotaChain.rpcUrls.map((rpcUrl) => rpcUrl.url);

  for (const rpcUrl of rpcUrls) {
    try {
      const iotaClient = new IotaClient({ url: rpcUrl });
      const network = iotaChain.isTestnet ? IotaNetwork.Testnet : IotaNetwork.Mainnet;
      const kioskClient = new IotaKioskClient({ client: iotaClient, network });
      const { kioskIds } = await kioskClient.getOwnedKiosks({ address });

      const kioskDatas = await Promise.all(
        kioskIds.map(async (id) => {
          return kioskClient.getKiosk({
            id,
            options: { withKioskFields: true, withListingPrices: true },
          });
        }),
      );

      const kioskObjectIds = kioskDatas.flatMap((kiosk) => kiosk.itemIds);

      const kioskNFTObjects = await getIotaMultiObjects(kioskObjectIds, chainId, chainType, option?.options);

      const filteredKioskNFTs = kioskNFTObjects.filter((item) => !!item && !!getIotaObjectDisplay(item)?.data) || [];

      return filteredKioskNFTs;
    } catch {
      continue;
    }
  }
  return [];
}

export async function getIotaDynamicFields(parentObjectId: string, chainId: string, chainType: string) {
  const { iotaChains } = await getChains();
  const iotaChain = iotaChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!iotaChain) throw new Error('Chain not found');

  const rpcUrls = iotaChain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  let nextKey: string | null = null;
  const dynamicFieldsInfoResponse: IotaDynamicFieldInfo[][] = [];

  do {
    for (const rpcUrl of rpcUrls) {
      try {
        const response: IotaGetDynamicFieldsResponse | undefined = await post<IotaGetDynamicFieldsResponse>(rpcUrl, {
          jsonrpc: '2.0',
          method: 'iotax_getDynamicFields',
          params: [parentObjectId, nextKey, null],
          id: parentObjectId,
        });
        if (response.error) {
          throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: iotax_getDynamicFields, Message: ${response.error?.message}`);
        }
        if (response.result) {
          nextKey = response.result.nextCursor && response.result.hasNextPage ? response.result.nextCursor : null;
          dynamicFieldsInfoResponse.push(response.result.data ?? []);
          break;
        }
      } catch {
        continue;
      }
    }
  } while (nextKey);

  return dynamicFieldsInfoResponse.flat();
}

export async function getIotaObjectsByOwnedAddress(
  address: string,
  chainId: string,
  chainType: string,
  option?: IotaObjectResponseQuery,
): Promise<IotaObjectResponse[]> {
  const { iotaChains } = await getChains();
  const iotaChain = iotaChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!iotaChain) throw new Error('Chain not found');

  const rpcUrls = iotaChain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  let nextKey: string | null = null;
  const iotaObjectResponses: IotaObjectResponse[][] = [];

  do {
    let success = false;
    for (const rpcUrl of rpcUrls) {
      try {
        const response: IotaGetObjectsOwnedByAddressResponse | undefined = await post<IotaGetObjectsOwnedByAddressResponse>(rpcUrl, {
          jsonrpc: '2.0',
          method: 'iotax_getOwnedObjects',
          params: nextKey ? [address, { ...option }, nextKey] : [address, { ...option }],
          id: address,
        });
        if (response.error) {
          throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: iotax_getOwnedObjects, Message: ${response.error?.message}`);
        }

        if (response.result) {
          nextKey = response.result.nextCursor && response.result.hasNextPage ? response.result.nextCursor : null;
          iotaObjectResponses.push(response.result.data ?? []);
          success = true;
          break;
        }
      } catch {
        continue;
      }
    }
    if (!success) break;
  } while (nextKey);

  return iotaObjectResponses.flat();
}

export async function getIotaMultiObjects(
  objectIds: string[],
  chainId: string,
  chainType: string,
  option?: IotaObjectDataOptions | null,
): Promise<IotaObjectResponse[]> {
  const { iotaChains } = await getChains();
  const iotaChain = iotaChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!iotaChain) throw new Error('Chain not found');

  const rpcUrls = iotaChain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  const chunkedArray = chunkArray(objectIds, 50);
  const multiGetObjectResponses: IotaObjectResponse[][] = [];

  for (const chunk of chunkedArray) {
    let success = false;
    for (const rpcUrl of rpcUrls) {
      try {
        const response = await post<IotaGetObjectsResponse>(rpcUrl, {
          jsonrpc: '2.0',
          method: 'iota_multiGetObjects',
          params: [
            [...chunk],
            {
              ...option,
              showType: true,
              showContent: true,
              showOwner: true,
              showDisplay: true,
            },
          ],
          id: 'getMultiObjects',
        });
        if (response.error) {
          throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: iota_multiGetObjects, Message: ${response.error?.message}`);
        }

        if (response.result) {
          multiGetObjectResponses.push(response.result ?? []);
          success = true;
          break;
        }
      } catch {
        continue;
      }
    }
    if (!success) break;
  }

  return multiGetObjectResponses.flat();
}
