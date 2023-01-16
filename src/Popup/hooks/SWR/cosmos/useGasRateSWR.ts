import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { NYX, NYX_GAS_RATES } from '~/constants/chain/cosmos/nyx';
import { get } from '~/Popup/utils/axios';
import { convertCosmosToAssetName } from '~/Popup/utils/cosmos';
import type { CosmosChain, GasRate } from '~/types/chain';
import type { GasRateResponse } from '~/types/cosmos/gasRate';

export function useGasRateSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const fetcher = async () => {
    try {
      return await get<GasRateResponse>('https://api.mintscan.io/v2/utils/gas_prices');
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<GasRateResponse | null, AxiosError>({}, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 0,
    errorRetryCount: 0,
    isPaused: () => !chain,
    ...config,
  });

  const mappedName = convertCosmosToAssetName(chain);

  const gasRate = useMemo(() => (data ? data.find((item) => item.chain === mappedName)?.rate ?? [] : []), [data, mappedName]);

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
