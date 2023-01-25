import { divide, minus, plus, pow, times } from './big';

export function calcSpotPrice(tokenBalanceIn: string, tokenWeightIn: string, tokenBalaceOut: string, tokenWeightOut: string, swapFee: string) {
  const calcIn = divide(tokenBalanceIn, tokenWeightIn);
  const calcOut = divide(tokenBalaceOut, tokenWeightOut);

  const scale = divide(1, minus(1, swapFee));

  return times(divide(calcIn, calcOut), scale);
}

export function calcOutGivenIn(
  tokenBalanceIn: string,
  tokenWeightIn: string,
  tokenBalaceOut: string,
  tokenWeightOut: string,
  tokenAmountIn: string,
  swapFee: string,
) {
  const weightRatio = divide(tokenWeightIn, tokenWeightOut);

  const adjustedIn = times(tokenAmountIn, minus(1, swapFee));

  const y = divide(tokenBalanceIn, plus(tokenBalanceIn, adjustedIn));

  const foo = Number(y) ** Number(weightRatio);
  const bar = minus(1, foo);

  return times(tokenBalaceOut, bar);
}

export function decimalScaling(number: string | number, decimalDiff: number, outputCoinDecimal?: number) {
  return times(number, pow(10, decimalDiff * -1), outputCoinDecimal);
}
