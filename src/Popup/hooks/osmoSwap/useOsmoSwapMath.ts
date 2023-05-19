import { useMemo } from 'react';

import type { AssetV3 as CosmosAssetV3 } from '~/types/cosmos/asset';

import { usePoolsAssetSWR } from './SWR/usePoolsAssetSWR';
import { usePoolSWR } from './SWR/usePoolsSWR';
import { divide, minus, times } from '../../utils/big';
import { calcOutGivenIn, calcSpotPrice, decimalScaling } from '../../utils/osmosis';
import { isEqualsIgnoringCase } from '../../utils/string';

const STABLE_POOL_TYPE = '/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool';
const WEIGHTED_POOL_TYPE = '/osmosis.gamm.v1beta1.Pool';

type useOsmoSwapMathProps = {
  chainName: string;
  inputBaseAmount: string;
  inputCoin?: CosmosAssetV3;
  outputCoin?: CosmosAssetV3;
};

export function useOsmoSwapMath(osmoSwapMathProps?: useOsmoSwapMathProps) {
  const poolsAssetData = usePoolsAssetSWR(osmoSwapMathProps?.chainName);

  const poolDenomList = useMemo(
    () => (poolsAssetData.data ? [...poolsAssetData.data.map((item) => item.adenom), ...poolsAssetData.data.map((item) => item.bdenom)] : []),
    [poolsAssetData.data],
  );

  const uniquePoolDenomList = useMemo(() => poolDenomList.filter((denom, idx, arr) => arr.findIndex((item) => item === denom) === idx), [poolDenomList]);

  const currentPool = useMemo(
    () =>
      poolsAssetData.data?.find(
        (item) =>
          (isEqualsIgnoringCase(item.adenom, osmoSwapMathProps?.outputCoin?.denom) && isEqualsIgnoringCase(item.bdenom, osmoSwapMathProps?.inputCoin?.denom)) ||
          (isEqualsIgnoringCase(item.adenom, osmoSwapMathProps?.inputCoin?.denom) && isEqualsIgnoringCase(item.bdenom, osmoSwapMathProps?.outputCoin?.denom)),
      ),
    [osmoSwapMathProps?.inputCoin?.denom, osmoSwapMathProps?.outputCoin?.denom, poolsAssetData.data],
  );

  const currentPoolId = useMemo(() => currentPool?.id, [currentPool?.id]);

  const poolData = usePoolSWR(currentPoolId);

  const swapServiceFeeRate = useMemo(() => poolData.data?.pool.pool_params.swap_fee || '0', [poolData.data?.pool.pool_params.swap_fee]);

  const poolAssetsTokenList = useMemo(() => {
    if (poolData.data && poolData.data.pool['@type'] === WEIGHTED_POOL_TYPE) {
      const poolAssets = poolData.data.pool.pool_assets;
      return poolAssets?.map((item) => item.token);
    }
    if (poolData.data && poolData.data.pool['@type'] === STABLE_POOL_TYPE) {
      return poolData.data.pool.pool_liquidity;
    }
    return [];
  }, [poolData.data]);

  const tokenBalanceIn = useMemo(
    () => poolAssetsTokenList?.find((item) => isEqualsIgnoringCase(item.denom, osmoSwapMathProps?.inputCoin?.denom))?.amount,
    [osmoSwapMathProps?.inputCoin?.denom, poolAssetsTokenList],
  );

  const tokenWeightIn = useMemo(
    () =>
      poolData.data && poolData.data.pool['@type'] === WEIGHTED_POOL_TYPE
        ? poolData.data.pool.pool_assets.find((item) => isEqualsIgnoringCase(item.token.denom, osmoSwapMathProps?.inputCoin?.denom))?.weight
        : undefined,
    [osmoSwapMathProps?.inputCoin?.denom, poolData.data],
  );

  const tokenBalanceOut = useMemo(
    () => poolAssetsTokenList?.find((item) => isEqualsIgnoringCase(item.denom, osmoSwapMathProps?.outputCoin?.denom))?.amount,
    [osmoSwapMathProps?.outputCoin?.denom, poolAssetsTokenList],
  );

  const tokenWeightOut = useMemo(
    () =>
      poolData.data && poolData.data.pool['@type'] === WEIGHTED_POOL_TYPE
        ? poolData.data.pool.pool_assets.find((item) => isEqualsIgnoringCase(item.token.denom, osmoSwapMathProps?.outputCoin?.denom))?.weight
        : undefined,
    [osmoSwapMathProps?.outputCoin?.denom, poolData.data],
  );

  const scalingFactors = useMemo(
    () => (poolData.data && poolData.data.pool['@type'] === STABLE_POOL_TYPE ? poolData.data.pool.scaling_factors : undefined),
    [poolData.data],
  );

  const beforeSpotPriceInOverOut = useMemo(() => {
    try {
      return calcSpotPrice(
        swapServiceFeeRate,
        poolAssetsTokenList,
        tokenBalanceIn,
        tokenWeightIn,
        tokenBalanceOut,
        tokenWeightOut,
        osmoSwapMathProps?.outputCoin?.denom,
        osmoSwapMathProps?.inputCoin?.denom,
        scalingFactors,
      );
    } catch {
      return '0';
    }
  }, [
    osmoSwapMathProps?.outputCoin?.denom,
    osmoSwapMathProps?.inputCoin?.denom,
    poolAssetsTokenList,
    scalingFactors,
    swapServiceFeeRate,
    tokenBalanceIn,
    tokenBalanceOut,
    tokenWeightIn,
    tokenWeightOut,
  ]);

  const exchangeRate = useMemo(() => {
    try {
      const beforeSpotPriceWithoutSwapFeeInOverOutDec = times(beforeSpotPriceInOverOut, minus(1, swapServiceFeeRate));
      const multiplicationInOverOut = minus(osmoSwapMathProps?.outputCoin?.decimals || 0, osmoSwapMathProps?.inputCoin?.decimals || 0);

      return multiplicationInOverOut === '0'
        ? divide(1, beforeSpotPriceWithoutSwapFeeInOverOutDec)
        : decimalScaling(divide(1, beforeSpotPriceWithoutSwapFeeInOverOutDec, 18), Number(multiplicationInOverOut), osmoSwapMathProps?.outputCoin?.decimals);
    } catch {
      return '0';
    }
  }, [beforeSpotPriceInOverOut, osmoSwapMathProps?.inputCoin?.decimals, swapServiceFeeRate, osmoSwapMathProps?.outputCoin?.decimals]);

  const estimatedOutputBaseAmount = useMemo(() => {
    try {
      return calcOutGivenIn(
        osmoSwapMathProps?.inputBaseAmount || '0',
        swapServiceFeeRate,
        poolAssetsTokenList,
        tokenBalanceIn,
        tokenWeightIn,
        tokenBalanceOut,
        tokenWeightOut,
        osmoSwapMathProps?.inputCoin?.denom,
        osmoSwapMathProps?.outputCoin?.denom,
        scalingFactors,
      );
    } catch {
      return '0';
    }
  }, [
    osmoSwapMathProps?.inputBaseAmount,
    swapServiceFeeRate,
    poolAssetsTokenList,
    tokenBalanceIn,
    tokenWeightIn,
    tokenBalanceOut,
    tokenWeightOut,
    osmoSwapMathProps?.inputCoin?.denom,
    osmoSwapMathProps?.outputCoin?.denom,
    scalingFactors,
  ]);

  const priceImpact = useMemo(() => {
    try {
      const effective = divide(osmoSwapMathProps?.inputBaseAmount || 0, estimatedOutputBaseAmount);
      return times(minus(divide(effective, beforeSpotPriceInOverOut), '1'), '100', 18);
    } catch {
      return '0';
    }
  }, [beforeSpotPriceInOverOut, osmoSwapMathProps?.inputBaseAmount, estimatedOutputBaseAmount]);

  return {
    priceImpact,
    exchangeRate,
    uniquePoolDenomList,
    swapServiceFeeRate,
    poolsAssetData,
    estimatedOutputBaseAmount,
    currentPoolId,
    poolData,
    tokenBalanceIn,
  };
}
