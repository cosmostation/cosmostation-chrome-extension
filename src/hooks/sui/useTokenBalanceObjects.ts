import { useMemo } from 'react';
import type { SuiObjectDataOptions, SuiObjectResponse } from '@mysten/sui/client';

import { SUI_COIN_TYPE } from '@/constants/sui';
import type { TokenBalanceObject } from '@/types/sui/api';
import { plus } from '@/utils/numbers';
import { getCoinType } from '@/utils/sui/coin';

import { useGetObjects } from './useGetObjects';
import { useGetObjectsOwnedByAddress } from './useGetObjectsOwnedByAddress';
import type { UseFetchConfig } from '../common/useFetch';

type UseTokenBalanceObjectsProps = {
  coinId: string;
  options?: SuiObjectDataOptions;
  config?: UseFetchConfig;
};

export function useTokenBalanceObjects({ coinId, options, config }: UseTokenBalanceObjectsProps) {
  const { data: objectsOwnedByAddress } = useGetObjectsOwnedByAddress({
    coinId,
    config,
  });

  const objectIdList = useMemo(
    () =>
      objectsOwnedByAddress?.reduce((acc: string[], item) => {
        const objectIds = item.result?.data.map((dataItem) => dataItem.data?.objectId || '') || [];
        return [...acc, ...objectIds];
      }, []) || [],
    [objectsOwnedByAddress],
  );

  const { data: objects } = useGetObjects({
    coinId,
    objectIds: objectIdList,
    options: {
      showType: true,
      showContent: true,
      showOwner: true,
      showDisplay: true,
      ...options,
    },
    config,
  });

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
      .sort((coin) => (coin.coinType === SUI_COIN_TYPE ? -1 : 1));
  }, [objects]);

  return { tokenBalanceObjects };
}
