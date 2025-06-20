import { useCallback, useMemo } from 'react';

import { isMatchingCoinId, parseCoinId } from '@/utils/queryParamGenerator';

import { useAccountAllAssets } from './useAccountAllAssets';

type UseGetAccountAsset = {
  coinId: string;
  options?: {
    filterByPreferAccountType?: boolean;
    disableHiddenFilter?: boolean;
    disableBalanceFilter?: boolean;
  };
};

export function useGetAccountAsset({ coinId, options }: UseGetAccountAsset) {
  const { data: accountAllAssets, error } = useAccountAllAssets({
    filterByPreferAccountType: options?.filterByPreferAccountType || true,
    disableHiddenFilter: options?.disableHiddenFilter || true,
    disableBalanceFilter: options?.disableBalanceFilter || true,
    disableDupeEthermint: true,
  });

  const assetFinders = useMemo(() => {
    return {
      cosmos: () => accountAllAssets?.allCosmosAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId)),
      filteredCosmosAssetByAccountType: () => accountAllAssets?.allCosmosAccountAssetsFiltered.find(({ asset }) => isMatchingCoinId(asset, coinId)),
      evm: () => accountAllAssets?.allEVMAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId)),
      aptos: () => accountAllAssets?.aptosAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId)),
      sui: () => accountAllAssets?.suiAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId)),
      bitcoin: () => accountAllAssets?.bitcoinAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId)),
      iota: () => accountAllAssets?.iotaAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId)),
    };
  }, [
    accountAllAssets?.allCosmosAccountAssets,
    accountAllAssets?.allCosmosAccountAssetsFiltered,
    accountAllAssets?.allEVMAccountAssets,
    accountAllAssets?.aptosAccountAssets,
    accountAllAssets?.bitcoinAccountAssets,
    accountAllAssets?.iotaAccountAssets,
    accountAllAssets?.suiAccountAssets,
    coinId,
  ]);

  const getAccountAsset = useCallback(() => {
    const parsedCoinId = parseCoinId(coinId);
    const { chainType } = parsedCoinId;

    return assetFinders[chainType]?.();
  }, [assetFinders, coinId]);

  return {
    getAccountAsset,
    getCosmosAccountAsset: () => assetFinders.cosmos(),
    getCosmosAccountAssetFilteredByAccountType: () => assetFinders.filteredCosmosAssetByAccountType(),
    getEVMAccountAsset: () => assetFinders.evm(),
    getAptosAccountAsset: () => assetFinders.aptos(),
    getSuiAccountAsset: () => assetFinders.sui(),
    getBitcoinAccountAsset: () => assetFinders.bitcoin(),
    getIotaAccountAsset: () => assetFinders.iota(),
    error,
  };
}
