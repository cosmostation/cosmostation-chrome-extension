import { useCallback, useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { SMART_CHAIN } from '~/constants/chain/ethereum/network/smartChain';
import { GAS_SETTINGS_BY_GAS_RATE_KEY } from '~/constants/ethereum';
import { calculatePercentiles, divide, gt, plus } from '~/Popup/utils/big';
import type { GasRateKey } from '~/types/chain';
import type { FeeType, GasRateKeyConfigurations } from '~/types/ethereum/common';

import { useFeeHistorySWR } from './useFeeHistorySWR';
import { useGasPriceSWR } from './useGasPriceSWR';
import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';

const REWARD_PERCENTILES = [25, 50, 75];

const BLOCK_COUNT = 20;

export function useFeeSWR(config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const feeHistory = useFeeHistorySWR([BLOCK_COUNT, 'latest', REWARD_PERCENTILES], config);

  const gasPrice = useGasPriceSWR(config);

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

    return (['tiny', 'low', 'average'] as GasRateKey[]).reduce((acc, gasRateKey, index) => {
      const { minBaseFeePerGas, minMaxPriorityFeePerGas } = GAS_SETTINGS_BY_GAS_RATE_KEY[gasRateKey];

      const maxPriorityFeePerGas = averageReward[index] && gt(averageReward[index], minMaxPriorityFeePerGas) ? averageReward[index] : minMaxPriorityFeePerGas;

      const maxBaseFeePerGas = plus(
        baseFeePercentiles[index] && gt(baseFeePercentiles[index], minBaseFeePerGas) ? baseFeePercentiles[index] : minBaseFeePerGas,
        maxPriorityFeePerGas,
      );

      return {
        ...acc,
        [gasRateKey]: {
          maxBaseFeePerGas,
          maxPriorityFeePerGas,
        },
      };
    }, {} as GasRateKeyConfigurations);
  }, [feeHistory]);

  const type: FeeType | null = (() => {
    if (!currentFee && !currentGasPrice) {
      return null;
    }

    const basicFeeOnlyChainIds = [SMART_CHAIN.id];

    if (basicFeeOnlyChainIds.includes(currentEthereumNetwork.id)) {
      return 'BASIC';
    }

    return currentFee ? 'EIP-1559' : 'BASIC';
  })();

  const mutate = useCallback(async () => {
    await feeHistory.mutate();
    await gasPrice.mutate();
  }, [feeHistory, gasPrice]);

  const returnData = useMemo(
    () => ({
      type,
      currentGasPrice,
      currentFee,
      mutate,
    }),
    [currentFee, currentGasPrice, mutate, type],
  );

  return returnData;
}
