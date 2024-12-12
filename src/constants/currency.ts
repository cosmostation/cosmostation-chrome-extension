export const CURRENCY_TYPE = {
  USD: 'usd',
  KRW: 'krw',
  EUR: 'eur',
  JPY: 'jpy',
  CNY: 'cny',
} as const;

export const CURRENCY_SYMBOL = {
  [CURRENCY_TYPE.USD]: '$',
  [CURRENCY_TYPE.KRW]: '₩',
  [CURRENCY_TYPE.EUR]: '€',
  [CURRENCY_TYPE.JPY]: '¥',
  [CURRENCY_TYPE.CNY]: '¥',
} as const;

export const CURRENCY_DECIMALS = {
  [CURRENCY_TYPE.USD]: 3,
  [CURRENCY_TYPE.KRW]: 0,
  [CURRENCY_TYPE.EUR]: 3,
  [CURRENCY_TYPE.JPY]: 1,
  [CURRENCY_TYPE.CNY]: 3,
} as const;
