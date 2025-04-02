import { useMemo } from 'react';

import { minus } from '@/utils/numbers';
import { getCoinId, isMatchingCoinId, isSameChain, parseCoinId } from '@/utils/queryParamGenerator';

import { useGasRate } from './useGasRate';
import type { UseFetchConfig } from '../common/useFetch';
import { useAccountAllAssets } from '../useAccountAllAssets';

type UseFeesProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useFees({ coinId, config }: UseFeesProps) {
  const { data: accountAssets } = useAccountAllAssets({ disableDupeEthermint: true, filterByPreferAccountType: true });

  const baseCoinList = useMemo(() => [...(accountAssets?.allCosmosAccountAssets || [])], [accountAssets?.allCosmosAccountAssets]);

  const chain = baseCoinList.find((asset) => isMatchingCoinId(asset.asset, coinId))?.chain;

  const assetGasRate = useGasRate({
    coinId,
    config: {
      ...config,
    },
  });

  const defaultFeeCoin = useMemo(() => {
    const parsedCoinId = parseCoinId(coinId);

    const mainAssetCoinId = getCoinId({
      id: chain?.mainAssetDenom || '',
      chainId: parsedCoinId.chainId,
      chainType: parsedCoinId.chainType,
    });

    const sourceChainAsset = baseCoinList.find((item) => isMatchingCoinId(item.asset, mainAssetCoinId));

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
      .filter((item) => chain && isSameChain(chain, item.chain) && feeCoinIds.includes(item.asset.id))
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
  }, [assetGasRate.data.gasRate, baseCoinList, chain, defaultFeeCoin]);

  return { feeAssets, defaultGasRateKey: assetGasRate.data.defaultGasRateKey, isFeemarketActive: assetGasRate.data.isFeemarketActive };
}
