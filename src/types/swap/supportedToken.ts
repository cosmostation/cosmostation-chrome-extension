import type { TokenData } from '@0xsquid/sdk/dist/types';

import type { Token } from '../1inch/swap';

export type IntegratedOsmoSwapToken = {
  denom: string;
  displayDenom: string;
  name: string;
  decimals: number;
  address: string;
  logoURI: string;
  supportedApi: string;

  coingeckoId?: string;
  availableAmount?: string;
};

export type IntegratedEVMSwapToken = (Token | TokenData) & { coingeckoId?: string; availableAmount?: string; supportedApi: string };

export type IntegratedSwapToken = (Token | TokenData) & { coingeckoId?: string; availableAmount?: string };
