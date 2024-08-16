import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { COSMOS_NON_NATIVE_GAS_RATES } from '~/constants/chain';
import { gt, times } from '~/Popup/utils/big';
import type { CosmosChain, GasRate, GasRateKey } from '~/types/chain';

import { useFeemarketSWR } from './useFeemarketSWR';
import { useParamsSWR } from './useParamsSWR';

const PARAM_BASE_GAS_RATE_OPTIONS = {
  TINY: '0',
  LOW: '1',
  AVERAGE: '2',
} as const;

const PARAM_BASE_GAS_RATE_KEY: Record<string, GasRateKey> = {
  [PARAM_BASE_GAS_RATE_OPTIONS.TINY]: 'tiny',
  [PARAM_BASE_GAS_RATE_OPTIONS.LOW]: 'low',
  [PARAM_BASE_GAS_RATE_OPTIONS.AVERAGE]: 'average',
} as const;

export function useGasRateSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const { data, error, mutate } = useParamsSWR(chain, config);

  const isEnabledFeemarket = useMemo(() => data?.params?.chainlist_params?.fee?.feemarket, [data?.params?.chainlist_params?.fee?.feemarket]);

  const feemarketData = useFeemarketSWR({ chain }, config);

  const isFeemarketActive = useMemo(
    () => isEnabledFeemarket && gt(feemarketData.data?.prices.length || '0', '0'),
    [feemarketData.data?.prices.length, isEnabledFeemarket],
  );

  const defaultGasRateKey = useMemo(() => {
    if (isFeemarketActive) {
      return PARAM_BASE_GAS_RATE_KEY[PARAM_BASE_GAS_RATE_OPTIONS.LOW];
    }

    const baseGasRateKey = data?.params?.chainlist_params?.fee?.base;

    if (baseGasRateKey && baseGasRateKey in PARAM_BASE_GAS_RATE_KEY) {
      return PARAM_BASE_GAS_RATE_KEY[baseGasRateKey];
    }

    return PARAM_BASE_GAS_RATE_KEY[PARAM_BASE_GAS_RATE_OPTIONS.LOW];
  }, [data?.params?.chainlist_params?.fee?.base, isFeemarketActive]);

  const gasRate: Record<string, GasRate> = useMemo(() => {
    const result: Record<string, GasRate> = {};

    if (isFeemarketActive) {
      feemarketData.data?.prices
        .sort((a) => {
          if (a.denom === chain.baseDenom) {
            return -1;
          }

          return 1;
        })
        .forEach((price) => {
          const { denom, amount } = price;

          result[denom] = {
            tiny: times(amount, '1.1'),
            low: times(amount, '1.2'),
            average: times(amount, '1.3'),
          };
        });

      return result;
    }

    const chainlistFeeRates = data ? data.params?.chainlist_params?.fee?.rate ?? [] : [];

    if (chainlistFeeRates.length === 0) {
      const nonNativeGasRates = COSMOS_NON_NATIVE_GAS_RATES.filter((item) => item.chainId === chain.id);

      return nonNativeGasRates
        ? nonNativeGasRates.reduce((acc: Record<string, GasRate>, item) => {
            acc[item.baseDenom] = item.gasRate;
            return acc;
          }, {})
        : { [chain.baseDenom]: chain.gasRate };
    }

    chainlistFeeRates.forEach((gr, idx) => {
      const splitedItems = gr.split(',');

      splitedItems.forEach((splitedItem) => {
        const subIndex = splitedItem.search(/(?![0-9.])+/);

        const rate = splitedItem.substring(0, subIndex);
        const denom = splitedItem.substring(subIndex);

        if (idx === 0) {
          result[denom] = {
            tiny: rate,
            low: rate,
            average: rate,
          };
        }

        if (idx === 1) {
          if (!result[denom]) {
            result[denom] = {
              tiny: rate,
              low: rate,
              average: rate,
            };
          } else {
            result[denom] = { ...result[denom], low: rate, average: rate };
          }
        }

        if (idx === 2) {
          if (!result[denom]) {
            result[denom] = {
              tiny: rate,
              low: rate,
              average: rate,
            };
          } else {
            result[denom] = { ...result[denom], average: rate };
          }
        }
      });
    });

    return result;
  }, [chain.baseDenom, chain.gasRate, chain.id, data, feemarketData.data?.prices, isFeemarketActive]);

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

  return { data: returnData, error: returnError, mutate };
}
