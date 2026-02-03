import { useMemo } from 'react';

import { minus } from '@/utils/numbers';
import { getUniqueChainId, getUniqueCoinId, parseCoinId } from '@/utils/queryParamGenerator';

import { useBalance } from './useBalance';
import { useGasRate } from './useGasRate';
import type { UseFetchConfig } from '../common/useFetch';
import { useAccountAllAssets } from '../useAccountAllAssets';

type UseFeesProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useFees({ coinId, config }: UseFeesProps) {
  const { data: cosmosBalances } = useBalance({ coinId });

  const { data: accountAssets } = useAccountAllAssets({ disableDupeEthermint: true, filterByPreferAccountType: true });

  const baseCoinList = useMemo(() => [...(accountAssets?.allCosmosAccountAssets || [])], [accountAssets?.allCosmosAccountAssets]);

  const chain = baseCoinList.find((asset) => asset.uniqueCoinId === coinId)?.chain;
  const currentUniqueChainId = chain && getUniqueChainId(chain);

  const assetGasRate = useGasRate({
    coinId,
    config: {
      ...config,
    },
  });

  const defaultFeeCoin = useMemo(() => {
    const parsedCoinId = parseCoinId(coinId);

    const mainAssetCoinId = getUniqueCoinId({
      id: chain?.mainAssetDenom || '',
      chainId: parsedCoinId.chainId,
      chainType: parsedCoinId.chainType,
    });

    const sourceChainAsset = baseCoinList.find((item) => item.uniqueCoinId === mainAssetCoinId);

    return (
      sourceChainAsset && {
        ...sourceChainAsset,
        gasRate: sourceChainAsset?.asset.id ? assetGasRate.data.gasRate[sourceChainAsset?.asset.id] : ['1.5'],
      }
    );
  }, [assetGasRate.data.gasRate, baseCoinList, chain?.mainAssetDenom, coinId]);

  const feeAssets = useMemo(() => {
    const feeCoinIds = [...Object.keys(assetGasRate.data.gasRate)];

    const filteredFeeCoins = baseCoinList
      .filter((item) => currentUniqueChainId && currentUniqueChainId === item.uniqueChainId && feeCoinIds.includes(item.asset.id))
      .map((item) => ({
        ...item,
        gasRate: assetGasRate.data.gasRate[item.asset.id],
      }));

    const sortedFeeCoinList = filteredFeeCoins.sort((a, b) =>
      Number(
        minus(
          feeCoinIds.findIndex((item) => item === a.asset.id),
          feeCoinIds.findIndex((item) => item === b.asset.id),
        ),
      ),
    );

    return sortedFeeCoinList.length > 0 ? sortedFeeCoinList : defaultFeeCoin ? [defaultFeeCoin] : [];
  }, [assetGasRate.data.gasRate, baseCoinList, currentUniqueChainId, defaultFeeCoin]);

  const wrappedFeeAssets = useMemo(
    () =>
      feeAssets.map((item) => ({
        ...item,
        balance: cosmosBalances?.balances?.find((balanceItem) => balanceItem.denom === item.asset.id)?.amount || '0',
      })),
    [cosmosBalances?.balances, feeAssets],
  );

  return { feeAssets: wrappedFeeAssets, defaultGasRateKey: assetGasRate.data.defaultGasRateKey, isFeemarketActive: assetGasRate.data.isFeemarketActive };
}
