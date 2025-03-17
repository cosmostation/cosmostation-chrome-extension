import { useMemo } from 'react';

import { divide, plus } from '@/utils/numbers';
import { toPercentages } from '@/utils/string';

import { useGetAPY } from './useGetAPY';
import { type UseFetchConfig } from '../common/useFetch';

type UseGetAverageAPYProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useGetAverageAPY({ coinId, config }: UseGetAverageAPYProps) {
  const { data: suiAPY } = useGetAPY({ coinId, config });

  const averageAPY = useMemo(() => {
    const apySum =
      suiAPY?.result?.apys.reduce((acc, item) => {
        return plus(acc, item.apy);
      }, '0') || '0';
    const totalValidatorCounts = suiAPY?.result?.apys.length || 1;
    return toPercentages(divide(apySum, totalValidatorCounts), {
      fixed: 2,
      disableMark: true,
    });
  }, [suiAPY?.result?.apys]);

  return { averageAPY };
}
