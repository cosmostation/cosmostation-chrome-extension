import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { COSMOS_NON_NATIVE_GAS_RATES } from '~/constants/chain';
import { gt } from '~/Popup/utils/big';
import type { CosmosChain, GasRate, GasRateKey } from '~/types/chain';

import { useFeemarketSWR } from './useFeemarketSWR';
import { useParamsSWR } from '../useParamsSWR';

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
  const feemarketData = useFeemarketSWR({ chain }, config);

  const defaultGasRateKey = useMemo(() => {
    const baseGasRateKey = data?.params?.chainlist_params?.fee?.base;

    if (baseGasRateKey && baseGasRateKey in PARAM_BASE_GAS_RATE_KEY) {
      return PARAM_BASE_GAS_RATE_KEY[baseGasRateKey];
    }

    return PARAM_BASE_GAS_RATE_KEY[PARAM_BASE_GAS_RATE_OPTIONS.LOW];
  }, [data?.params?.chainlist_params?.fee]);

  const gasRate: Record<string, GasRate> = useMemo(() => {
    const chainlistGasRates = data ? data.params?.chainlist_params?.fee?.rate ?? [] : [];
    const result: Record<string, GasRate> = {};

    if (chainlistGasRates.length === 0) {
      const nonNativeGasRates = COSMOS_NON_NATIVE_GAS_RATES.filter((item) => item.chainId === chain.id);

      return nonNativeGasRates
        ? nonNativeGasRates.reduce((acc: Record<string, GasRate>, item) => {
            acc[item.baseDenom] = item.gasRate;
            return acc;
          }, {})
        : { [chain.baseDenom]: chain.gasRate };
    }

    chainlistGasRates.forEach((gr, idx) => {
      const splitedItems = gr.split(',');

      splitedItems.forEach((splitedItem) => {
        const subIndex = splitedItem.search(/(?![0-9.])+/);

        const denom = splitedItem.substring(subIndex);

        const chainlistGasRate = splitedItem.substring(0, subIndex);
        const feemarketGasRate = feemarketData.data?.prices.find((item) => item.denom === denom)?.amount || '0';
        const selectedGasRate = gt(feemarketGasRate, chainlistGasRate) ? feemarketGasRate : chainlistGasRate;

        if (idx === 0) {
          result[denom] = {
            tiny: selectedGasRate,
            low: selectedGasRate,
            average: selectedGasRate,
          };
        }

        if (idx === 1) {
          if (!result[denom]) {
            result[denom] = {
              tiny: selectedGasRate,
              low: selectedGasRate,
              average: selectedGasRate,
            };
          } else {
            result[denom] = { ...result[denom], low: selectedGasRate, average: selectedGasRate };
          }
        }

        if (idx === 2) {
          if (!result[denom]) {
            result[denom] = {
              tiny: selectedGasRate,
              low: selectedGasRate,
              average: selectedGasRate,
            };
          } else {
            result[denom] = { ...result[denom], average: selectedGasRate };
          }
        }
      });
    });

    return result;
  }, [feemarketData.data?.prices, chain.baseDenom, chain.gasRate, chain.id, data]);

  const returnData = useMemo(
    () => ({
      gasRate,
      defaultGasRateKey,
    }),
    [defaultGasRateKey, gasRate],
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
