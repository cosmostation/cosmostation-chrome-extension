import { useCallback, useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { SUI_COIN } from '~/constants/sui';
import { plus } from '~/Popup/utils/big';
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

  const coinBalance = useMemo(() => {
    const copiedList = objects?.result ? [...objects.result] : [];

    return (
      copiedList?.reduce((result, object) => {
        const suiObject = getCoinType(object.data?.type) === SUI_COIN;

        if (suiObject && object.data?.content?.dataType === 'moveObject') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return plus(result, object.data.content.fields.balance as string);
        }

        return result;
      }, '0') || '0'
    );
  }, [objects?.result]);

  const filteredTokenBalanceObjects = useMemo(() => {
    const copiedList = objects?.result ? [...objects.result] : [];

    return (
      copiedList
        ?.filter((item) => getCoinType(item.data?.type) && getCoinType(item.data?.type) !== SUI_COIN && item.data?.content?.dataType === 'moveObject')
        .map((object) => ({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          balance: object.data?.content?.dataType === 'moveObject' ? (object.data?.content.fields.balance as string) : '0',
          coinType: getCoinType(object.data?.type),
        })) || []
    );
  }, [objects]);

  const totalSuiTokenBalanceObjects = useMemo(
    () => [{ balance: coinBalance, coinType: SUI_COIN }, ...filteredTokenBalanceObjects],
    [coinBalance, filteredTokenBalanceObjects],
  );

  const mutateTokenBalance = useCallback(() => {
    void mutateGetObjectsOwnedByAddress();
    void mutateGetObjects();
  }, [mutateGetObjects, mutateGetObjectsOwnedByAddress]);

  return { coinBalance, filteredTokenBalanceObjects, totalSuiTokenBalanceObjects, mutateTokenBalance };
}
