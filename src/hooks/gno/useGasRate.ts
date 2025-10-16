import { useMemo } from 'react';

import { parseCoinId } from '@/utils/queryParamGenerator';

import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGasRateProps = {
  coinId: string;
};

export function useGasRate({ coinId }: UseGasRateProps) {
  const { getGnoAccountAsset, error } = useGetAccountAsset({ coinId });

  const asset = getGnoAccountAsset();

  const defaultGasRateKey = useMemo(() => {
    const baseGasRateKey = asset?.chain.feeInfo.defaultFeeRateKey;

    return baseGasRateKey ? parseInt(baseGasRateKey, 10) : 0;
  }, [asset?.chain.feeInfo.defaultFeeRateKey]);

  const gasRate: Record<string, string[]> = useMemo(() => {
    const result: Record<string, string[]> = {};

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
  }, [asset, coinId]);

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

    return undefined;
  }, [error]);

  return { data: returnData, error: returnError };
}
