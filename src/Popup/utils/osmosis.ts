import type { StableSwapToken } from '@osmosis-labs/math';
import { StableSwapMath, WeightedPoolMath } from '@osmosis-labs/math';

import { pow, times, toDec, toInt } from './big';

type tokenAsset = {
  amount: string;
  denom: string;
};

export function calcSpotPrice(
  swapFee: string,
  poolAssetsTokenList: tokenAsset[],
  tokenBalanceIn?: string,
  tokenWeightIn?: string,
  tokenBalaceOut?: string,
  tokenWeightOut?: string,
  inputDenom?: string,
  outputDenom?: string,
  scalingFactors?: string[],
) {
  if (inputDenom && outputDenom && scalingFactors) {
    const stableSwapTokens: StableSwapToken[] = poolAssetsTokenList.map((item, index) => ({
      amount: toDec(item.amount),
      denom: item.denom,
      scalingFactor: Number(scalingFactors[index]),
    }));

    return String(StableSwapMath.calcSpotPrice(stableSwapTokens, inputDenom, outputDenom));
  }
  if (tokenBalanceIn && tokenWeightIn && tokenBalaceOut && tokenWeightOut) {
    return String(WeightedPoolMath.calcSpotPrice(toDec(tokenBalanceIn), toDec(tokenWeightIn), toDec(tokenBalaceOut), toDec(tokenWeightOut), toDec(swapFee)));
  }
  return '0';
}

export function calcOutGivenIn(
  tokenAmountIn: string,
  swapFee: string,
  poolAssetsTokenList: tokenAsset[],
  tokenBalanceIn?: string,
  tokenWeightIn?: string,
  tokenBalaceOut?: string,
  tokenWeightOut?: string,
  inputDenom?: string,
  outputDenom?: string,
  scalingFactors?: string[],
) {
  const decFee = toDec(swapFee);

  if (inputDenom && outputDenom && scalingFactors) {
    const inputCoin = {
      denom: inputDenom,
      amount: toInt(tokenAmountIn),
    };

    const stableSwapTokens: StableSwapToken[] = poolAssetsTokenList.map((item, index) => ({
      amount: toDec(item.amount),
      denom: item.denom,
      scalingFactor: Number(scalingFactors[index]),
    }));

    return String(StableSwapMath.calcOutGivenIn(stableSwapTokens, inputCoin, outputDenom, decFee));
  }
  if (tokenBalanceIn && tokenWeightIn && tokenBalaceOut && tokenWeightOut) {
    return String(
      WeightedPoolMath.calcOutGivenIn(toDec(tokenBalanceIn), toDec(tokenWeightIn), toDec(tokenBalaceOut), toDec(tokenWeightOut), toDec(tokenAmountIn), decFee),
    );
  }
  return '0';
}

export function decimalScaling(number: string | number, decimalDiff: number, outputCoinDecimal?: number) {
  return times(number, pow(10, decimalDiff * -1), outputCoinDecimal);
}
