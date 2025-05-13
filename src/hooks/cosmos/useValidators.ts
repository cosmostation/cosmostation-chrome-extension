import { useMemo, useState } from 'react';

import { DEFAULT_FETCH_TIME_OUT_MS } from '@/constants/common';
import { VALIDATOR_STATUS } from '@/constants/cosmos/validator';
import type { CosmosValidator, FormattedCosmosValidator, GetValidatorsResponse, ValidatorStatus } from '@/types/cosmos/validator';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { gt } from '@/utils/numbers';
import { parseCoinId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseValidatorsProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useValidators({ coinId, config }: UseValidatorsProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const asset = getCosmosAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.chain.lcdUrls) return [];

    const { chainId } = parseCoinId(coinId);

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));
    const validatorInfosEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getValidators());

    return validatorInfosEndpoints;
  }, [asset?.chain.lcdUrls, coinId]);

  const fetcher = async (index = 0) => {
    try {
      if (!asset?.chain.isSupportStaking) return null;

      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const returnData: CosmosValidator[][] = [];

      const response = await get<GetValidatorsResponse>(requestURLs[index], {
        timeout: DEFAULT_FETCH_TIME_OUT_MS * 5,
      });

      returnData.push(response.validators);

      let nextCursor = response?.pagination.next_key;

      while (nextCursor) {
        const nextCursorRequestURL = `${requestURLs[index]}?pagination.key=${nextCursor}`;

        const nextResponse = await get<GetValidatorsResponse>(nextCursorRequestURL, {
          timeout: DEFAULT_FETCH_TIME_OUT_MS * 5,
        });

        returnData.push(nextResponse.validators ?? []);
        nextCursor = nextResponse?.pagination?.next_key ?? null;
      }

      const flattenedReturnData = returnData.flat();

      setIsAllRequestsFailed(false);

      const sortedByVotingPower = flattenedReturnData.toSorted((a, b) => (gt(a.tokens, b.tokens) ? -1 : 1));
      const activeValidators = asset.chain.maxApproveValidator
        ? sortedByVotingPower.filter((item) => item.status === 'BOND_STATUS_BONDED').toSpliced(Number(asset.chain.maxApproveValidator))
        : undefined;
      const topActiveValidators = activeValidators && new Set(activeValidators.map((item) => item.operator_address));

      const mappedData = sortedByVotingPower
        .map((validator) => {
          const validatorStatus: ValidatorStatus | undefined = (() => {
            if (validator.jailed) return VALIDATOR_STATUS.JAILED;

            if (validator.status !== 'BOND_STATUS_BONDED') return VALIDATOR_STATUS.INACTIVE;

            if (asset.chain.reportedValidators?.includes(validator.operator_address)) return VALIDATOR_STATUS.FAKE;

            if (topActiveValidators) {
              return topActiveValidators.has(validator.operator_address) ? undefined : VALIDATOR_STATUS.INACTIVE;
            }
            return undefined;
          })();

          return {
            ...validator,
            monikerImage: `https://serve.dev-mintscan.com/assets/moniker/${parseCoinId(coinId).chainId}/64/${validator.operator_address}.png`,
            validatorStatus,
          };
        })
        .toSorted((a, b) => {
          const aIsUndefined = a.validatorStatus === undefined ? -1 : 1;
          const bIsUndefined = b.validatorStatus === undefined ? -1 : 1;

          if (aIsUndefined !== bIsUndefined) {
            return aIsUndefined - bIsUndefined;
          }

          if (gt(a.tokens, b.tokens)) return -1;
          if (gt(b.tokens, a.tokens)) return 1;

          return 0;
        })
        .toSorted((a) => (a.description.moniker.toLocaleLowerCase().includes('cosmostation') ? -1 : 1));

      return mappedData;
    } catch {
      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        return null;
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['cosmosValidaotrsInfo', coinId],
    fetchFunction: () => fetcher(),
    config: {
      retry: false,
      enabled: !!coinId && !!requestURLs.length && !isAllRequestsFailed,
      ...config,
    },
  });

  const returnData = useMemo<FormattedCosmosValidator[]>(() => {
    if (!data) return [];

    return data;
  }, [data]);

  return { data: returnData, error, refetch, isLoading };
}
