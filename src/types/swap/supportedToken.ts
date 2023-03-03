import type { TokenData } from '@0xsquid/sdk/dist/types';

import type { Token } from '../1inch/swap';

export type IntegratedSwapToken = (Token | TokenData) & { coingeckoId?: string; availableAmount?: string };
