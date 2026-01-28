import { getHiddenCustomAssetsSet, getVisibleAssetsSet } from '@/libs/asset';
import type { AccountCustomCosmosAsset, AccountCustomEvmAsset } from '@/types/account';
import type { AssetBase } from '@/types/asset';
import type { ExtensionStorage } from '@/types/extension';
import { createAllChainMap } from '@/utils/cache/chainMap';
import { devLogger } from '@/utils/devLogger';
import { gt } from '@/utils/numbers';
import { getCoinId, getUniqueChainId, getUniqueChainIdWithManual, getUniqueCoinId } from '@/utils/queryParamGenerator';

type GetAccountCustomAssetsOption = {
  disableFilterHidden?: boolean;
  disableBalanceFilter?: boolean;
};

export async function getAccountCustomAssets(id: string, option?: GetAccountCustomAssetsOption) {
  devLogger.time('getAccountCustomAssets');
  const storage = await chrome.storage.local.get<ExtensionStorage>([
    `${id}-custom-address`,
    `${id}-custom-balance-cosmos`,
    `${id}-custom-balance-evm`,
    'customAssets',
  ]);

  const chainMaps = await createAllChainMap();
  const { cosmos: cosmosChainsMap, evm: evmChainsMap } = chainMaps || {};

  const visibleAssetIdSet = await getVisibleAssetsSet(id);
  const hiddenAssetIdSet = await getHiddenCustomAssetsSet();

  const customAssets = storage.customAssets ?? [];

  const visibleCustomAssets = option?.disableFilterHidden ? customAssets : customAssets.filter((asset) => !hiddenAssetIdSet.has(getCoinId(asset)));

  const customCosmosAssets = visibleCustomAssets.filter((asset) => asset.chainType === 'cosmos');
  const customEvmAssets = visibleCustomAssets.filter((asset) => asset.chainType === 'evm');

  const accountAddress = storage[`${id}-custom-address`] || [];

  const customCosmosBalances = storage[`${id}-custom-balance-cosmos`] || [];
  const customEvmBalances = storage[`${id}-custom-balance-evm`] || [];

  const cosmosAccountCustomAssets = customCosmosAssets.flatMap((asset) => {
    const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);

    if (!addresses.length) return [];

    const chainKey = getUniqueChainIdWithManual(asset.chainId, 'cosmos');
    const chain = cosmosChainsMap?.get(chainKey);
    if (!chain) return [];

    return addresses.map((address) => {
      const type = asset.id;
      const balanceInfo = customCosmosBalances?.find(
        (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
      );
      const balance = balanceInfo?.balances?.find((balance) => balance.denom === type)?.amount || '0';

      const result: AccountCustomCosmosAsset = {
        uniqueCoinId: getUniqueCoinId(asset),
        uniqueChainId: getUniqueChainId(chain),
        chain,
        asset,
        address,
        balance: balance,
      };
      return result;
    });
  });

  const evmAccountCustomAssets = customEvmAssets.flatMap((asset) => {
    const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);

    if (!addresses.length) return [];

    const evmChainKey = getUniqueChainIdWithManual(asset.chainId, 'evm');
    const chain = evmChainsMap?.get(evmChainKey);
    if (!chain) return [];

    return addresses.map((address) => {
      const balanceInfo = customEvmBalances?.find(
        (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
      );

      const balance = balanceInfo?.balance ? BigInt(balanceInfo?.balance).toString() : '0';

      const result: AccountCustomEvmAsset = {
        uniqueCoinId: getUniqueCoinId(asset),
        uniqueChainId: getUniqueChainId(chain),
        chain,
        asset,
        address,
        balance: balance,
      };

      return result;
    });
  });

  type AssetWithBalance = {
    balance: string;
    asset: AssetBase;
  };

  const filterHiddenAssetsByBalance = <T extends AssetWithBalance>(assets: T[]): T[] => {
    if (option?.disableBalanceFilter) {
      return assets;
    } else {
      return assets.filter((asset) => {
        const isVisible = visibleAssetIdSet?.has(getCoinId(asset.asset));

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

  devLogger.timeEnd('getAccountCustomAssets');

  return {
    cosmosAccountCustomAssets: filteredCosmosAccountCustomAssets,
    evmAccountCustomAssets: filteredEVMAccountCustomAssets,
  };
}
