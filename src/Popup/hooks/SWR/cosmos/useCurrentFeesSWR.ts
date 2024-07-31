import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { minus } from '~/Popup/utils/big';
import type { CosmosChain, FeeCoin } from '~/types/chain';

import { useAmountSWR } from './useAmountSWR';
import { useAssetsSWR } from './useAssetsSWR';
import { useGasRateSWR } from './useGasRateSWR';

export function useCurrentFeesSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const currentChainAssets = useAssetsSWR(chain);

  const assetGasRate = useGasRateSWR(chain, config);

  const { vestingRelatedAvailable } = useAmountSWR(chain);
  const coinList = useCoinListSWR(chain, true);
  const coinAll = useMemo(
    () => [
      {
        availableAmount: vestingRelatedAvailable,
        decimals: chain.decimals,
        imageURL: chain.imageURL,
        displayDenom: chain.displayDenom,
        baseDenom: chain.baseDenom,
        coinGeckoId: chain.coinGeckoId,
        gasRate: assetGasRate.data.gasRate[chain.baseDenom] ?? chain.gasRate,
      },
      ...coinList.coins.map((item) => ({ ...item, gasRate: assetGasRate.data.gasRate[item.baseDenom] })),
      ...coinList.ibcCoins.map((item) => ({ ...item, gasRate: assetGasRate.data.gasRate[item.baseDenom] })),
    ],
    [
      assetGasRate.data,
      chain.baseDenom,
      chain.coinGeckoId,
      chain.decimals,
      chain.displayDenom,
      chain.gasRate,
      chain.imageURL,
      coinList.coins,
      coinList.ibcCoins,
      vestingRelatedAvailable,
    ],
  );

  const feeCoins: FeeCoin[] = useMemo(() => {
    const feeCoinBaseDenoms = [...Object.keys(assetGasRate.data.gasRate)];

    const filteredFeeCoins = currentChainAssets.data
      .filter((item) => feeCoinBaseDenoms.includes(item.denom))
      .map((item) => ({
        ...item,
        originBaseDenom: item.origin_denom,
        baseDenom: item.denom,
        displayDenom: item.symbol,
        imageURL: item.image,
        availableAmount: coinAll.find((coin) => coin.baseDenom === item.denom)?.availableAmount ?? '0',
        gasRate: assetGasRate.data.gasRate[item.denom],
      }));

    const sortedFeeCoinList = filteredFeeCoins.sort((a, b) =>
      Number(
        minus(
          feeCoinBaseDenoms.findIndex((item) => item === a.baseDenom),
          feeCoinBaseDenoms.findIndex((item) => item === b.baseDenom),
        ),
      ),
    );

    return sortedFeeCoinList.length > 0 ? sortedFeeCoinList : [coinAll[0]];
  }, [assetGasRate.data, coinAll, currentChainAssets.data]);

  return { feeCoins, defaultGasRateKey: assetGasRate.data.defaultGasRateKey, isFeemarketActive: assetGasRate.data.isFeemarketActive };
}
