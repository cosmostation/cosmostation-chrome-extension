import { useCallback, useMemo } from 'react';

import { GAS_SETTINGS_BY_GAS_RATE_KEY } from '@/constants/evm/fee';
import type { EIP1559Configuration, FeeType } from '@/types/evm/fee';
import { calculatePercentiles, divide, gt, plus } from '@/utils/numbers';

import { useFeeHistory } from './useFeeHistory';
import { useGasPrice } from './useGasPrice';
import type { UseFetchConfig } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

const REWARD_PERCENTILES = [25, 50, 75];

const BLOCK_COUNT = 20;

type UseFeeProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useFee({ coinId, config }: UseFeeProps) {
  const { getEVMAccountAsset } = useGetAccountAsset({ coinId });

  const evmAccountAsset = getEVMAccountAsset();

  const skipDefaultFeeOverride = evmAccountAsset?.chain.feeInfo.isEip1559 || false;

  const feeHistory = useFeeHistory({ coinId, bodyParams: [BLOCK_COUNT, 'latest', REWARD_PERCENTILES], config });

  const gasPrice = useGasPrice({ coinId, config });

  const currentGasPrice = gasPrice.data?.result ? plus(parseInt(gasPrice.data.result, 16), '1000') : null;

  const currentFee = useMemo(() => {
    if (!feeHistory.data?.result || feeHistory.data.result.baseFeePerGas.some((item) => item === null)) {
      return null;
    }

    const { baseFeePerGas } = feeHistory.data.result;

    const baseFeePercentiles = calculatePercentiles(
      baseFeePerGas.map((item) => parseInt(item || '0', 16)),
      REWARD_PERCENTILES,
    );

    const originReward = feeHistory.data.result.reward || [];

    const rewardCount = originReward.length;
    const averageReward = originReward
      .reduce((prev, cur) => [plus(prev[0], parseInt(cur[0], 16)), plus(prev[1], parseInt(cur[1], 16)), plus(prev[2], parseInt(cur[2], 16))], ['0', '0', '0'])
      .map((item) => divide(item, rewardCount, 0));

    return Array.from({ length: 3 }).reduce((acc: EIP1559Configuration[], _, index) => {
      const { minBaseFeePerGas, minMaxPriorityFeePerGas } = GAS_SETTINGS_BY_GAS_RATE_KEY[index];

      const maxPriorityFeePerGas = (() => {
        if (skipDefaultFeeOverride) {
          return averageReward[index];
        } else {
          return averageReward[index] && gt(averageReward[index], minMaxPriorityFeePerGas) ? averageReward[index] : minMaxPriorityFeePerGas;
        }
      })();

      const baseFeePerGas = (() => {
        if (skipDefaultFeeOverride) {
          return baseFeePercentiles[index];
        } else {
          return baseFeePercentiles[index] && gt(baseFeePercentiles[index], minBaseFeePerGas) ? baseFeePercentiles[index] : minBaseFeePerGas;
        }
      })();

      const maxBaseFeePerGas = plus(baseFeePerGas, maxPriorityFeePerGas);

      return [
        ...acc,
        {
          maxBaseFeePerGas,
          maxPriorityFeePerGas,
        },
      ];
    }, []);
  }, [feeHistory.data?.result, skipDefaultFeeOverride]);

  const type = useMemo<FeeType | null>(() => {
    if (!currentFee && !currentGasPrice) {
      return null;
    }

    return currentFee ? 'EIP-1559' : 'BASIC';
  }, [currentFee, currentGasPrice]);

  const refetch = useCallback(async () => {
    await feeHistory.refetch();
    await gasPrice.refetch();
  }, [feeHistory, gasPrice]);

  const isFetching = useMemo(() => feeHistory.isFetching || gasPrice.isFetching, [feeHistory.isFetching, gasPrice.isFetching]);

  const returnData = useMemo(
    () => ({
      type,
      currentGasPrice,
      currentFee,
      refetch,
      isFetching,
    }),
    [currentFee, currentGasPrice, isFetching, refetch, type],
  );

  return returnData;
}
