import { useCallback, useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { SUI_COIN } from '~/constants/sui';
import { gt, plus } from '~/Popup/utils/big';
import { getCoinType } from '~/Popup/utils/sui';
import type { SuiNetwork } from '~/types/chain';

import { useGetObjectsOwnedByAddressSWR } from './useGetObjectsOwnedByAddressSWR';
import { useGetObjectsSWR } from './useGetObjectsSWR';
import { useCurrentAccount } from '../../useCurrent/useCurrentAccount';
import { useCurrentChain } from '../../useCurrent/useCurrentChain';
import { useAccounts } from '../cache/useAccounts';

type Options = {
  showType?: boolean;
  showContent?: boolean;
  showBcs?: boolean;
  showOwner?: boolean;
  showPreviousTransaction?: boolean;
  showStorageRebate?: boolean;
  showDisplay?: boolean;
};

type UseTokenBalanceSWRProps = {
  address?: string;
  network?: SuiNetwork;
  options?: Options;
};
export function useTokenBalanceSWR({ network, address, options }: UseTokenBalanceSWRProps, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();

  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentAccount.id, currentChain.id],
  );

  const addr = useMemo(() => address || currentAddress, [address, currentAddress]);

  const { data: objectsOwnedByAddress, mutate: mutateGetObjectsOwnedByAddress } = useGetObjectsOwnedByAddressSWR({ address: addr, network, ...config });

  const objectIdList = useMemo(
    () => (objectsOwnedByAddress?.result && objectsOwnedByAddress?.result.data.map((item) => item.data?.objectId || '')) || [],
    [objectsOwnedByAddress?.result],
  );

  const { data: objects, mutate: mutateGetObjects } = useGetObjectsSWR({
    network,
    objectIds: objectIdList,
    options: {
      showType: true,
      showContent: true,
      showOwner: true,
      showDisplay: true,
    },
    ...options,
    ...config,
  });

  const coinObjects = useMemo(() => {
    const copiedList = objects?.result ? [...objects.result] : [];
    return copiedList
      .filter((item) => getCoinType(item.data?.type) && item.data?.content?.dataType === 'moveObject' && item.data.content.hasPublicTransfer)
      .map((item, _, array) => ({
        balance:
          array.reduce((ac, cu) => {
            if (item.data?.type === cu.data?.type && cu.data?.content?.dataType === 'moveObject')
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              return plus(ac, (cu.data?.content.fields.balance as string) || '0');

            return ac;
          }, '0') || '0',
        coinType: getCoinType(item.data?.type),
        ...item,
      }))
      .filter((object, idx, arr) => arr.findIndex((item) => item.data?.type === object.data?.type) === idx && gt(object.balance, '0') && object.coinType)
      .sort((coin) => (coin.coinType === SUI_COIN ? -1 : 1));
  }, [objects?.result]);

  const mutateTokenBalance = useCallback(() => {
    void mutateGetObjectsOwnedByAddress();
    void mutateGetObjects();
  }, [mutateGetObjects, mutateGetObjectsOwnedByAddress]);

  return { coinObjects, mutateTokenBalance };
}
