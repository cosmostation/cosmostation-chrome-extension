import { useCallback, useMemo } from 'react';
import type { SWRConfiguration } from 'swr';
import type { SuiObjectResponse } from '@mysten/sui/client';

import { SUI_COIN } from '~/constants/sui';
import { plus } from '~/Popup/utils/big';
import { getCoinType } from '~/Popup/utils/sui';
import type { SuiNetwork } from '~/types/chain';
import type { TokenBalanceObject } from '~/types/sui/rpc';

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

type UseTokenBalanceObjectsSWRProps = {
  address?: string;
  network?: SuiNetwork;
  options?: Options;
};

export function useTokenBalanceObjectsSWR({ network, address, options }: UseTokenBalanceObjectsSWRProps, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();

  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentAccount.id, currentChain.id],
  );

  const addr = useMemo(() => address || currentAddress, [address, currentAddress]);

  const { data: objectsOwnedByAddress, mutate: mutateGetObjectsOwnedByAddress } = useGetObjectsOwnedByAddressSWR({ address: addr, network }, config);

  const objectIdList = useMemo(
    () =>
      objectsOwnedByAddress?.reduce((acc: string[], item) => {
        const objectIds = item.result?.data.map((dataItem) => dataItem.data?.objectId || '') || [];
        return [...acc, ...objectIds];
      }, []) || [],
    [objectsOwnedByAddress],
  );

  const { data: objects, mutate: mutateGetObjects } = useGetObjectsSWR(
    {
      network,
      objectIds: objectIdList,
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
        showDisplay: true,
      },
      ...options,
    },
    config,
  );

  const tokenBalanceObjects = useMemo<TokenBalanceObject[]>(() => {
    const suiObjectResponses = objects
      ?.reduce((acc: SuiObjectResponse[], item) => (item && item.result ? [...acc, ...item.result] : acc), [])
      .filter((item) => item);

    const coinObjectsTypeList = Array.from(
      new Set([
        ...(suiObjectResponses
          ?.filter((item) => getCoinType(item.data?.type) && item.data?.content?.dataType === 'moveObject' && item.data.content.hasPublicTransfer)
          .map((item) => item.data?.type) || []),
      ]),
    );

    return coinObjectsTypeList
      .map((type) => ({
        balance: suiObjectResponses
          ? suiObjectResponses
              .filter((item) => type === item.data?.type && item.data?.content?.dataType === 'moveObject' && item.data.content.hasPublicTransfer)
              .reduce((ac, cu) => {
                if (cu.data?.content?.dataType === 'moveObject' && 'balance' in cu.data.content.fields && typeof cu.data?.content.fields.balance === 'string')
                  return plus(ac, cu.data?.content.fields.balance || '0');

                return ac;
              }, '0')
          : '0',
        coinType: getCoinType(type),
        objects: [
          ...(suiObjectResponses?.filter(
            (item) =>
              type === item.data?.type && type === item.data?.type && item.data?.content?.dataType === 'moveObject' && item.data.content.hasPublicTransfer,
          ) || []),
        ],
      }))
      .sort((coin) => (coin.coinType === SUI_COIN ? -1 : 1));
  }, [objects]);

  const mutateTokenBalanceObjects = useCallback(() => {
    void mutateGetObjectsOwnedByAddress();
    void mutateGetObjects();
  }, [mutateGetObjects, mutateGetObjectsOwnedByAddress]);

  return { tokenBalanceObjects, mutateTokenBalanceObjects };
}
