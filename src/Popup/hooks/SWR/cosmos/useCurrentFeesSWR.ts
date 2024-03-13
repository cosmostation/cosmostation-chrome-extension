import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { gt } from '~/Popup/utils/big';
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
        gasRate: assetGasRate.data[chain.baseDenom] ?? chain.gasRate,
      },
      ...coinList.coins.map((item) => ({ ...item, gasRate: assetGasRate.data[item.baseDenom] })),
      ...coinList.ibcCoins.map((item) => ({ ...item, gasRate: assetGasRate.data[item.baseDenom] })),
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
    const feeCoinBaseDenoms = [...Object.keys(assetGasRate.data)];

    const filteredFeeCoins = currentChainAssets.data
      .filter((item) => feeCoinBaseDenoms.includes(item.denom))
      .map((item) => ({
        ...item,
        originBaseDenom: item.origin_denom,
        baseDenom: item.denom,
        displayDenom: item.symbol,
        imageURL: item.image,
        availableAmount: coinAll.find((coin) => coin.baseDenom === item.denom)?.availableAmount ?? '0',
        gasRate: assetGasRate.data[item.denom],
      }));

    const sortedFeeCoinList = filteredFeeCoins.sort((a, b) => {
      if (
        gt(
          feeCoinBaseDenoms.findIndex((item) => item === b.baseDenom),
          feeCoinBaseDenoms.findIndex((item) => item === a.baseDenom),
        )
      ) {
        return -1;
      }

      if (
        gt(
          feeCoinBaseDenoms.findIndex((item) => item === a.baseDenom),
          feeCoinBaseDenoms.findIndex((item) => item === b.baseDenom),
        )
      ) {
        return 1;
      }

      if (a.baseDenom === chain.baseDenom && b.baseDenom !== chain.baseDenom) {
        return -1;
      }
      if (a.baseDenom !== chain.baseDenom && b.baseDenom === chain.baseDenom) {
        return 1;
      }

      if (a.baseDenom !== chain.baseDenom && gt(a.availableAmount, '0') && !gt(b.availableAmount, '0')) {
        return -1;
      }
      if (a.baseDenom !== chain.baseDenom && !gt(a.availableAmount, '0') && gt(b.availableAmount, '0')) {
        return 1;
      }

      return 0;
    });

    return sortedFeeCoinList.length > 0 ? sortedFeeCoinList : [coinAll[0]];
  }, [assetGasRate.data, chain.baseDenom, coinAll, currentChainAssets.data]);

  return { feeCoins };
}
