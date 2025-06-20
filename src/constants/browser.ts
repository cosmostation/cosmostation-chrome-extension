import ChromeIcon from '@/assets/images/icons/Chrome16.svg';

export const BROWSER_TYPE = {
  EDGE: 'edge',
  EDGE_CHROMIUM: 'edge-chromium',
  OPERA: 'opr',
  CHROME: 'chrome',
  IE: 'ie',
  FIREFOX: 'firefox',
  SAFARI: 'safari',
  ETC: 'etc',
} as const;

export const BROWSER_NAME = {
  [BROWSER_TYPE.EDGE]: 'MS Edge',
  [BROWSER_TYPE.EDGE_CHROMIUM]: 'Edge (chromium bases)',
  [BROWSER_TYPE.OPERA]: 'Opera',
  [BROWSER_TYPE.CHROME]: 'Chrome',
  [BROWSER_TYPE.IE]: 'MS IE',
  [BROWSER_TYPE.FIREFOX]: 'Firefox',
  [BROWSER_TYPE.SAFARI]: 'Safari',
  [BROWSER_TYPE.ETC]: 'etc',
} as const;

export const BROWSER_ICON = {
  [BROWSER_TYPE.EDGE]: ChromeIcon,
  [BROWSER_TYPE.EDGE_CHROMIUM]: ChromeIcon,
  [BROWSER_TYPE.OPERA]: ChromeIcon,
  [BROWSER_TYPE.CHROME]: ChromeIcon,
  [BROWSER_TYPE.IE]: ChromeIcon,
  [BROWSER_TYPE.FIREFOX]: ChromeIcon,
  [BROWSER_TYPE.SAFARI]: ChromeIcon,
  [BROWSER_TYPE.ETC]: ChromeIcon,
} as const;
