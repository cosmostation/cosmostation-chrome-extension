import { useLayoutEffect, useRef } from 'react';

import type { AllCosmosAccountAssets } from '@/types/accountAssets';
import { ceil, gt, gte, times } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';

type CosmosFeeAsset = AllCosmosAccountAssets & {
  gasRate: string[];
};

type UseAutoFeeCurrencySelectionOnInitProps = {
  feeAssets: CosmosFeeAsset[];
  isCustomFee: boolean;
  currentFeeStepKey: number;
  gas: string;
  setFeeCoinId: (coinId: string) => void;
  disableAutoSet?: boolean;
};

export function useAutoFeeCurrencySelectionOnInit({
  feeAssets,
  isCustomFee,
  gas,
  currentFeeStepKey,
  disableAutoSet = false,
  setFeeCoinId,
}: UseAutoFeeCurrencySelectionOnInitProps) {
  const hasRunRef = useRef(false);

  useLayoutEffect(() => {
    if (disableAutoSet || hasRunRef.current) {
      return;
    }

    const isMoreThanOneFeeOption = feeAssets.length > 1;
    const isGasAvailable = gt(gas, '0');

    if (!isCustomFee && isMoreThanOneFeeOption && isGasAvailable) {
      for (const feeCurrency of feeAssets) {
        const feeCurrencyBalance = feeCurrency.balance;
        const rate = feeCurrency.gasRate[currentFeeStepKey];

        if (rate === undefined) {
          continue;
        }

        const feeAmount = ceil(times(gas, rate));

        if (gte(feeCurrencyBalance, feeAmount)) {
          setFeeCoinId(getCoinId(feeCurrency.asset));
          hasRunRef.current = true;
          break;
        }
      }
    }
  }, [currentFeeStepKey, disableAutoSet, feeAssets, gas, isCustomFee, setFeeCoinId]);
}
