import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { NYX, NYX_GAS_RATES } from '~/constants/chain/cosmos/nyx';
import type { CosmosChain, GasRate } from '~/types/chain';

import { useParamsSWR } from './useParamsSWR';

export function useGasRateSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const { data, error, mutate } = useParamsSWR(chain, config);

  const gasRate = useMemo(() => (data ? data.params?.chainlist_params?.fee?.rate ?? [] : []), [data]);

  const returnData: Record<string, GasRate> = useMemo(() => {
    const result: Record<string, GasRate> =
      chain.baseDenom === NYX.baseDenom
        ? { [NYX.baseDenom]: NYX_GAS_RATES.find((item) => item.chainId === NYX.id)!.gasRate }
        : { [chain.baseDenom]: chain.gasRate };

    gasRate.forEach((gr, idx) => {
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
  }, [chain.baseDenom, chain.gasRate, gasRate]);

  return { data: returnData, error, mutate };
}
