import { divide, minus, times } from './big';

export function calcPriceImpact(amountIn: string, amountOut: string): string {
  if (amountIn === '0' || amountOut === '0') return '0';

  return times(divide(minus(amountIn, amountOut), amountIn), '100');
}
