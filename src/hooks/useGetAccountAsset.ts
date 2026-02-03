import { useCallback, useMemo } from 'react';

import { getMatchingCoinFromCoinId, parseCoinId } from '@/utils/queryParamGenerator';

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
      cosmos: () => getMatchingCoinFromCoinId(accountAllAssets?.allCosmosAccountAssets, coinId),
      filteredCosmosAssetByAccountType: () => getMatchingCoinFromCoinId(accountAllAssets?.allCosmosAccountAssetsFiltered, coinId),
      evm: () => getMatchingCoinFromCoinId(accountAllAssets?.allEVMAccountAssets, coinId),
      aptos: () => getMatchingCoinFromCoinId(accountAllAssets?.aptosAccountAssets, coinId),
      sui: () => getMatchingCoinFromCoinId(accountAllAssets?.suiAccountAssets, coinId),
      bitcoin: () => getMatchingCoinFromCoinId(accountAllAssets?.bitcoinAccountAssets, coinId),
      iota: () => getMatchingCoinFromCoinId(accountAllAssets?.iotaAccountAssets, coinId),
      solana: () => getMatchingCoinFromCoinId(accountAllAssets?.allSolanaAccountAssets, coinId),
      gno: () => getMatchingCoinFromCoinId(accountAllAssets?.allGnoAccountAssets, coinId),
    };
  }, [
    accountAllAssets?.allCosmosAccountAssets,
    accountAllAssets?.allCosmosAccountAssetsFiltered,
    accountAllAssets?.allEVMAccountAssets,
    accountAllAssets?.allSolanaAccountAssets,
    accountAllAssets?.aptosAccountAssets,
    accountAllAssets?.bitcoinAccountAssets,
    accountAllAssets?.iotaAccountAssets,
    accountAllAssets?.suiAccountAssets,
    accountAllAssets?.allGnoAccountAssets,
    coinId,
  ]);

  const getAccountAsset = useCallback(() => {
    const parsedCoinId = parseCoinId(coinId);
    const { chainType } = parsedCoinId;

    return assetFinders[chainType]?.();
  }, [assetFinders, coinId]);

  return {
    accountAllAssets,
    getAccountAsset,
    getCosmosAccountAsset: () => assetFinders.cosmos(),
    getCosmosAccountAssetFilteredByAccountType: () => assetFinders.filteredCosmosAssetByAccountType(),
    getEVMAccountAsset: () => assetFinders.evm(),
    getAptosAccountAsset: () => assetFinders.aptos(),
    getSuiAccountAsset: () => assetFinders.sui(),
    getBitcoinAccountAsset: () => assetFinders.bitcoin(),
    getIotaAccountAsset: () => assetFinders.iota(),
    getSolanaAccountAsset: () => assetFinders.solana(),
    getGnoAccountAsset: () => assetFinders.gno(),
    error,
  };
}
