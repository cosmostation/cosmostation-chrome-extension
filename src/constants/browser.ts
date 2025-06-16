import ChromeIcon from '@/assets/images/icons/Chrome16.svg';

export const BROWSWER_TYPE = {
  EDGE: 'edge',
  EDGE_CHROMIUM: 'edge-chromium',
  OPERA: 'opr',
  CHROME: 'chrome',
  IE: 'ie',
  FIREFOX: 'firefox',
  SAFARI: 'safari',
  ETC: 'etc',
} as const;

export const BROWSWER_NAME = {
  [BROWSWER_TYPE.EDGE]: 'MS Edge',
  [BROWSWER_TYPE.EDGE_CHROMIUM]: 'Edge (chromium bases)',
  [BROWSWER_TYPE.OPERA]: 'Opera',
  [BROWSWER_TYPE.CHROME]: 'Chrome',
  [BROWSWER_TYPE.IE]: 'MS IE',
  [BROWSWER_TYPE.FIREFOX]: 'Firefox',
  [BROWSWER_TYPE.SAFARI]: 'Safari',
  [BROWSWER_TYPE.ETC]: 'etc',
} as const;

export const BROWSWER_ICON = {
  [BROWSWER_TYPE.EDGE]: ChromeIcon,
  [BROWSWER_TYPE.EDGE_CHROMIUM]: ChromeIcon,
  [BROWSWER_TYPE.OPERA]: ChromeIcon,
  [BROWSWER_TYPE.CHROME]: ChromeIcon,
  [BROWSWER_TYPE.IE]: ChromeIcon,
  [BROWSWER_TYPE.FIREFOX]: ChromeIcon,
  [BROWSWER_TYPE.SAFARI]: ChromeIcon,
  [BROWSWER_TYPE.ETC]: ChromeIcon,
} as const;
