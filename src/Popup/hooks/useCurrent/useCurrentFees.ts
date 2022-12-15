import { useMemo } from 'react';

import { COSMOS_FEE_BASE_DENOMS } from '~/constants/chain';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import type { CosmosChain, FeeCoin } from '~/types/chain';

import { useAmountSWR } from '../SWR/cosmos/useAmountSWR';
import { useAssetsSWR } from '../SWR/cosmos/useAssetsSWR';
import { useGasRateSWR } from '../SWR/cosmos/useGasRateSWR';

export function useCurrentFees(chain: CosmosChain) {
  const currentChainAssets = useAssetsSWR(chain);

  const assetGasRate = useGasRateSWR(chain);

  const { vestingRelatedAvailable, totalAmount } = useAmountSWR(chain, true);
  const coinList = useCoinListSWR(chain, true);
  const coinAll = useMemo(
    () => [
      {
        availableAmount: vestingRelatedAvailable,
        totalAmount,
        coinType: 'staking',
        decimals: chain.decimals,
        imageURL: chain.imageURL,
        displayDenom: chain.displayDenom,
        baseDenom: chain.baseDenom,
        coinGeckoId: chain.coinGeckoId,
      },
      ...coinList.coins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item })),
      ...coinList.ibcCoins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item })),
    ],
    [
      chain.baseDenom,
      chain.coinGeckoId,
      chain.decimals,
      chain.displayDenom,
      chain.imageURL,
      coinList.coins,
      coinList.ibcCoins,
      totalAmount,
      vestingRelatedAvailable,
    ],
  );

  const feeCoins: FeeCoin[] = useMemo(() => {
    const nyxFeeBaseDenoms = COSMOS_FEE_BASE_DENOMS.find((item) => item.chainId === chain.id)?.feeBaseDenoms;

    const filteredFeeCoins = currentChainAssets.data
      .filter((item) => [...Object.keys(assetGasRate.data)].includes(item.denom) || nyxFeeBaseDenoms?.includes(item.denom))
      .map((item) => ({
        decimals: item.decimals,
        baseDenom: item.denom,
        originBaseDenom: item.origin_denom,
        displayDenom: item.symbol,
        imageURL: item.image,
        availableAmount: coinAll.find((coin) => coin.baseDenom === item.denom)?.availableAmount ?? '0',
      }));

    return filteredFeeCoins.length > 0 ? filteredFeeCoins : [coinAll[0]];
  }, [assetGasRate.data, chain.id, coinAll, currentChainAssets.data]);

  return { feeCoins, assetGasRate };
}
