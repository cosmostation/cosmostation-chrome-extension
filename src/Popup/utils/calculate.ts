import { divide, equal, minus, times } from './big';

export function calcPriceImpact(amountIn: string, amountOut: string): string {
  if (equal(amountIn, '0') || equal(amountOut, '0')) return '0';

  return times(divide(minus(amountIn, amountOut), amountIn), '100');
}
