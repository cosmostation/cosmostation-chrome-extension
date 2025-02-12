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
  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: options?.filterByPreferAccountType || true,
    disableHiddenFilter: options?.disableHiddenFilter || true,
    disableBalanceFilter: options?.disableBalanceFilter || true,
  });

  const selectedAsset = (() => {
    const parsedCoinId = parseCoinId(coinId);
    const { chainType } = parsedCoinId;

    if (chainType === 'cosmos') {
      return accountAllAssets?.allCosmosAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId));
    }
    if (chainType === 'evm') {
      return accountAllAssets?.allEVMAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId));
    }
    if (chainType === 'aptos') {
      return accountAllAssets?.aptosAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId));
    }
    if (chainType === 'sui') {
      return accountAllAssets?.suiAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId));
    }
    if (chainType === 'bitcoin') {
      return accountAllAssets?.bitcoinAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId));
    }

    return undefined;
  })();

  return selectedAsset;
}
