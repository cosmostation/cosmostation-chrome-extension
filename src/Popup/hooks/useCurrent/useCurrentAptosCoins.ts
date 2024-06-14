import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { ACCOUNT_TYPE, APTOS_COIN } from '~/constants/aptos';
import { getCoinAddress } from '~/Popup/utils/aptos';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { X1CoinCoinstore } from '~/types/aptos/accounts';

import { useCurrentAptosNetwork } from './useCurrentAptosNetwork';
import { useAccountResourcesSWR } from '../SWR/aptos/useAccountResourcesSWR';

export function useCurrentAptosCoins(config?: SWRConfiguration) {
  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const accountResources = useAccountResourcesSWR({ network: currentAptosNetwork }, config);

  const currentAptosCoins = useMemo(
    () =>
      (accountResources.data?.filter((item) => item.type.startsWith(ACCOUNT_TYPE.X1___COIN___COIN_STORE)) || []).sort((item) =>
        isEqualsIgnoringCase(getCoinAddress(item.type), APTOS_COIN) ? -1 : 1,
      ) as X1CoinCoinstore[],
    [accountResources.data],
  );

  return { currentAptosCoins };
}
