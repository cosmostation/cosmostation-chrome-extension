import type { SWRConfiguration } from 'swr';

import { ACCOUNT_TYPE } from '~/constants/aptos';
import type { X1CoinCoinstore } from '~/types/aptos/accounts';

import { useCurrentAptosNetwork } from './useCurrentAptosNetwork';
import { useAccountResourcesSWR } from '../SWR/aptos/useAccountResourcesSWR';

export function useCurrentAptosCoins(config?: SWRConfiguration) {
  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const accountResources = useAccountResourcesSWR({ network: currentAptosNetwork }, config);

  const currentAptosCoins = (accountResources.data?.filter((item) => item.type.startsWith(ACCOUNT_TYPE.X1___COIN___COIN_STORE)) || []) as X1CoinCoinstore[];

  return { currentAptosCoins };
}
