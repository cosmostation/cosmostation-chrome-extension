import { useMemo } from 'react';

import { gt, times } from '@/utils/numbers';
import { parseCoinId } from '@/utils/queryParamGenerator';

import { useFeemarket } from './useFeemarket';
import type { UseFetchConfig } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseSimulateProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useGasRate({ coinId, config }: UseSimulateProps) {
  const { getCosmosAccountAsset, error } = useGetAccountAsset({ coinId });

  const feemarketData = useFeemarket({
    coinId,
    config: {
      ...config,
    },
  });

  const asset = getCosmosAccountAsset();

  const isEnabledFeemarket = asset?.chain.feeInfo.isFeemarketEnabled;

  const isFeemarketActive = isEnabledFeemarket && gt(feemarketData.data?.prices.length || '0', '0');

  const defaultGasRateKey = (() => {
    if (isFeemarketActive) {
      return 0;
    }

    const baseGasRateKey = asset?.chain.feeInfo.defaultFeeRateKey;

    return baseGasRateKey ? parseInt(baseGasRateKey, 10) : 0;
  })();

  const gasRate: Record<string, string[]> = useMemo(() => {
    const result: Record<string, string[]> = {};

    if (isFeemarketActive) {
      feemarketData.data?.prices
        .sort((a) => {
          if (a.denom === asset.chain.mainAssetDenom) {
            return -1;
          }

          return 1;
        })
        .forEach((price) => {
          const { denom, amount } = price;
          const fast = times(amount, '1.2');
          const faster = times(amount, '1.5');
          const instant = times(amount, '2');

          result[denom] = [amount, fast, faster, instant];
        });

      return result;
    }

    const chainlistFeeRates = asset ? (asset.chain.feeInfo.gasRate ?? []) : [];

    if (chainlistFeeRates.length === 0) {
      const parsedCoinId = parseCoinId(coinId);
      return { [parsedCoinId.id]: ['1.3'] };
    }

    chainlistFeeRates.forEach((gr, idx) => {
      const splitedItems = gr.split(',');

      splitedItems.forEach((splitedItem) => {
        const subIndex = splitedItem.search(/(?![0-9.])+/);

        const rate = splitedItem.substring(0, subIndex);
        const denom = splitedItem.substring(subIndex);

        if (idx === 0) {
          result[denom] = [rate];
        }

        if (idx === 1) {
          if (!result[denom]) {
            result[denom] = [rate];
          } else {
            result[denom] = [...result[denom], rate];
          }
        }

        if (idx === 2) {
          if (!result[denom]) {
            result[denom] = [rate];
          } else {
            result[denom] = [...result[denom], rate];
          }
        }
      });
    });

    return result;
  }, [asset, coinId, feemarketData.data?.prices, isFeemarketActive]);

  const returnData = useMemo(
    () => ({
      gasRate,
      defaultGasRateKey,
      isFeemarketActive,
    }),
    [defaultGasRateKey, gasRate, isFeemarketActive],
  );

  const returnError = useMemo(() => {
    if (error) {
      return error;
    }

    if (feemarketData.error) {
      return feemarketData.error;
    }

    return undefined;
  }, [feemarketData.error, error]);

  return { data: returnData, error: returnError };
}
