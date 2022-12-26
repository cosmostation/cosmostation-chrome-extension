import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { COSMOS_FEE_BASE_DENOMS } from '~/constants/chain';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { gt } from '~/Popup/utils/big';
import type { CosmosChain, FeeCoin } from '~/types/chain';

import { useAmountSWR } from '../SWR/cosmos/useAmountSWR';
import { useAssetsSWR } from '../SWR/cosmos/useAssetsSWR';
import { useGasRateSWR } from '../SWR/cosmos/useGasRateSWR';

export function useCurrentFees(chain: CosmosChain, config?: SWRConfiguration) {
  const currentChainAssets = useAssetsSWR(chain);

  const assetGasRate = useGasRateSWR(chain, config);

  const { vestingRelatedAvailable } = useAmountSWR(chain, true);
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
    const feeBaseDenoms = COSMOS_FEE_BASE_DENOMS.find((item) => item.chainId === chain.id)?.feeBaseDenoms;

    const filteredFeeCoins = currentChainAssets.data
      .filter((item) => [...Object.keys(assetGasRate.data)].includes(item.denom) || feeBaseDenoms?.includes(item.denom))
      .map((item) => ({
        ...item,
        originBaseDenom: item.origin_denom,
        baseDenom: item.denom,
        displayDenom: item.symbol,
        imageURL: item.image,
        availableAmount: coinAll.find((coin) => coin.baseDenom === item.denom)?.availableAmount ?? '0',
        gasRate: assetGasRate.data[item.denom],
      }));

    const sortedFeeCoinList = [
      ...filteredFeeCoins.filter((item) => item.baseDenom === chain.baseDenom),
      ...filteredFeeCoins.filter((item) => item.baseDenom !== chain.baseDenom && gt(item.availableAmount, '0')),
      ...filteredFeeCoins.filter((item) => item.baseDenom !== chain.baseDenom && !gt(item.availableAmount, '0')),
    ];

    return sortedFeeCoinList.length > 0 ? sortedFeeCoinList : [coinAll[0]];
  }, [assetGasRate.data, chain.baseDenom, chain.id, coinAll, currentChainAssets.data]);

  return { feeCoins };
}
