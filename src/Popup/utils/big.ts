import type { RoundingMode } from 'big.js';
import Big from 'big.js';
import { Dec, Int } from '@keplr-wallet/unit';

export function pow(base: number | string, exponent: number) {
  return new Big(base).pow(exponent).toString();
}

export function times(num1: number | string, num2: number | string, toFix?: number) {
  if (toFix !== undefined) {
    return new Big(num1).times(num2).toFixed(toFix, 0);
  }

  return new Big(num1).times(num2).toString();
}

export function plus(num1: number | string, num2: number | string, toFix?: number) {
  if (toFix !== undefined) {
    return new Big(num1).plus(num2).toFixed(toFix, 0);
  }

  return new Big(num1).plus(num2).toString();
}

export function equal(num1: number | string, num2: number | string) {
  return new Big(num1).eq(num2);
}

export function divide(num1: number | string, num2: number | string, toFix?: number) {
  if (toFix !== undefined) {
    return new Big(num1).div(num2).toFixed(toFix, 0);
  }

  return new Big(num1).div(num2).toString();
}

export function gt(num1: number | string, num2: number | string) {
  return new Big(num1).gt(num2);
}

export function gte(num1: number | string, num2: number | string) {
  return new Big(num1).gte(num2);
}

export function lt(num1: number | string, num2: number | string) {
  return new Big(num1).lt(num2);
}

export function lte(num1: number | string, num2: number | string) {
  return new Big(num1).lte(num2);
}

export function minus(num1: number | string, num2: number | string, toFix?: number) {
  if (toFix !== undefined) {
    return new Big(num1).minus(num2).toFixed(toFix, 0);
  }

  return new Big(num1).minus(num2).toString();
}

export function ceil(num: string | number) {
  const splitedNum = String(num).split('.');

  if (gt(splitedNum?.[1] || '0', '0')) {
    return new Big(num).plus('1').toFixed(0, 0);
  }

  return new Big(num).toFixed(0, 0);
}

export function calculatePercentiles(numbers: number[], percentiles: number[]) {
  if (numbers.length === 0) {
    return [];
  }

  const sortedNumbers = numbers.slice().sort((a, b) => a - b);

  return percentiles.map((percentile) => {
    const index = Number(minus(ceil(times(divide(percentile, '100'), sortedNumbers.length)), '1'));
    return sortedNumbers[index];
  });
}

export function fix(number: string, decimal?: number, optional: RoundingMode = 0) {
  return Big(number).toFixed(decimal, optional);
}

export function toDisplayDenomAmount(number: string | number, decimal: number) {
  return times(number, pow(10, -decimal), decimal);
}

export function toBaseDenomAmount(number: string | number, decimal: number) {
  return times(number, pow(10, decimal), 0);
}

export function isNumber(number: string) {
  try {
    Big(number);
  } catch {
    return false;
  }
  return true;
}

export function isDecimal(number: string, decimal: number) {
  if (!isNumber(number)) {
    return false;
  }

  const regex = new RegExp(`^([1-9][0-9]*\\.?[0-9]{0,${decimal}}|0\\.[0-9]{0,${decimal}}|0)$`);

  if (!regex.test(number)) {
    return false;
  }

  return true;
}

export function toDec(number: string) {
  return new Dec(number);
}

export function toInt(number: string) {
  return new Int(number);
}
