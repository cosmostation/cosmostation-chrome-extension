import { useMemo } from 'react';

import { gt } from '~/Popup/utils/big';
import type { CosmosChain } from '~/types/chain';
import type { AssetV3 as CosmosAssetV3 } from '~/types/cosmos/asset';

import { type SkipRouteProps, useSkipRouteSWR } from './SWR/useSkipRouteSWR';

type useSkipSwapProps = {
  inputBaseAmount: string;
  srcCoin?: CosmosAssetV3;
  fromChain?: CosmosChain;
  toChain?: CosmosChain;
  destCoin?: CosmosAssetV3;
};

export function useSkipSwap(skipSwapProps?: useSkipSwapProps) {
  const skipRouteParam = useMemo<SkipRouteProps | undefined>(() => {
    if (
      gt(skipSwapProps?.inputBaseAmount || '0', '0') &&
      skipSwapProps?.srcCoin?.denom &&
      skipSwapProps?.fromChain?.chainId &&
      skipSwapProps?.destCoin?.denom &&
      skipSwapProps?.toChain?.chainId
    ) {
      return {
        amountIn: skipSwapProps.inputBaseAmount,
        sourceAssetDenom: skipSwapProps.srcCoin.denom,
        sourceAssetChainId: skipSwapProps.fromChain.chainId,
        destAssetDenom: skipSwapProps.destCoin.denom,
        destAssetChainId: skipSwapProps.toChain.chainId,
        cumulativeAffiliateFeeBps: '0',
      };
    }
    return undefined;
  }, [
    skipSwapProps?.destCoin?.denom,
    skipSwapProps?.fromChain?.chainId,
    skipSwapProps?.inputBaseAmount,
    skipSwapProps?.srcCoin?.denom,
    skipSwapProps?.toChain?.chainId,
  ]);

  const skipRoute = useSkipRouteSWR({ routeParam: skipRouteParam });

  return { skipRouteParam, skipRoute };
}
