import { useCallback, useMemo } from 'react';

import { getMatchinCoinFromCoinId, parseCoinId } from '@/utils/queryParamGenerator';

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
      cosmos: () => getMatchinCoinFromCoinId(accountAllAssets?.allCosmosAccountAssets, coinId),
      filteredCosmosAssetByAccountType: () => getMatchinCoinFromCoinId(accountAllAssets?.allCosmosAccountAssetsFiltered, coinId),
      evm: () => getMatchinCoinFromCoinId(accountAllAssets?.allEVMAccountAssets, coinId),
      aptos: () => getMatchinCoinFromCoinId(accountAllAssets?.aptosAccountAssets, coinId),
      sui: () => getMatchinCoinFromCoinId(accountAllAssets?.suiAccountAssets, coinId),
      bitcoin: () => getMatchinCoinFromCoinId(accountAllAssets?.bitcoinAccountAssets, coinId),
      iota: () => getMatchinCoinFromCoinId(accountAllAssets?.iotaAccountAssets, coinId),
      solana: () => getMatchinCoinFromCoinId(accountAllAssets?.allSolanaAccountAssets, coinId),
      gno: () => getMatchinCoinFromCoinId(accountAllAssets?.allGnoAccountAssets, coinId),
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
