import { CURRENCY_TYPE } from './chromeStorage';

export const CURRENCY_SYMBOL = {
  [CURRENCY_TYPE.USD]: '$',
  [CURRENCY_TYPE.KRW]: '₩',
  [CURRENCY_TYPE.EUR]: '€',
  [CURRENCY_TYPE.JPY]: '¥',
  [CURRENCY_TYPE.CNY]: '¥',
} as const;
