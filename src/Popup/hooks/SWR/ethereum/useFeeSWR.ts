import { useCallback, useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { SMART_CHAIN } from '~/constants/chain/ethereum/network/smartChain';
import { calculatePercentiles, divide, gt, plus } from '~/Popup/utils/big';
import type { FeeType } from '~/types/ethereum/common';

import { useFeeHistorySWR } from './useFeeHistorySWR';
import { useGasPriceSWR } from './useGasPriceSWR';
import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';

export function useFeeSWR(config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const feeHistory = useFeeHistorySWR([20, 'latest', [25, 50, 75]], config);

  const gasPrice = useGasPriceSWR(config);

  const currentGasPrice = gasPrice.data?.result ? plus(parseInt(gasPrice.data.result, 16), '1000') : null;

  const currentFee = useMemo(() => {
    if (!feeHistory.data?.result || !feeHistory.data.result.baseFeePerGas.every((item) => item !== null)) {
      return null;
    }

    const { baseFeePerGas } = feeHistory.data.result;

    const gasFeePercentiles = calculatePercentiles(
      baseFeePerGas.map((item) => parseInt(item || '0', 16)),
      [25, 50, 75],
    );

    const originReward = feeHistory.data.result.reward || [];

    const rewardCount = originReward.length;
    const averageReward = originReward
      .reduce((prev, cur) => [plus(prev[0], parseInt(cur[0], 16)), plus(prev[1], parseInt(cur[1], 16)), plus(prev[2], parseInt(cur[2], 16))], ['0', '0', '0'])
      .map((item) => divide(item, rewardCount, 0));

    return {
      tiny: {
        maxBaseFeePerGas: plus(
          gasFeePercentiles[0] && gt(gasFeePercentiles[0], '500000000') ? gasFeePercentiles[0] : '500000000',
          averageReward[0] && gt(averageReward[0], '1000000000') ? averageReward[0] : '1000000000',
        ),
        maxPriorityFeePerGas: averageReward[0] && gt(averageReward[0], '1000000000') ? averageReward[0] : '1000000000',
      },
      low: {
        maxBaseFeePerGas: plus(
          gasFeePercentiles[1] && gt(gasFeePercentiles[1], '500000000') ? gasFeePercentiles[1] : '500000000',
          averageReward[1] && gt(averageReward[1], '1000000000') ? averageReward[1] : '1000000000',
        ),
        maxPriorityFeePerGas: averageReward[1] && gt(averageReward[1], '1000000000') ? averageReward[1] : '1000000000',
      },
      average: {
        maxBaseFeePerGas: plus(
          gasFeePercentiles[2] && gt(gasFeePercentiles[2], '500000000') ? gasFeePercentiles[2] : '500000000',
          averageReward[2] && gt(averageReward[2], '1000000000') ? averageReward[2] : '1000000000',
        ),
        maxPriorityFeePerGas: averageReward[2] && gt(averageReward[2], '1000000000') ? averageReward[2] : '1000000000',
      },
    };
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
