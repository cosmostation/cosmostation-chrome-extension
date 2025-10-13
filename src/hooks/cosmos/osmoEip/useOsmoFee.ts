import { useMemo } from 'react';

import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import type { AllCosmosAccountAssets } from '@/types/accountAssets';
import { divide, times } from '@/utils/numbers';
import { isMatchingCoinId, parseCoinId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';

import { useOsmoEipFee } from './useOsmoEipFee';
import { useOsmoFeeToken } from './useOsmoFeeToken';
import { useOsmoSpotPrice } from './useOsmoSpotPrice';
import type { UseFetchConfig } from '../../common/useFetch';

type UseOsmoFeeProps =
  | {
      selectedFeeCoinId?: string;
      config?: UseFetchConfig;
    }
  | undefined;

const DEFAULT_GAS_RATES = ['0.04', '0.045', '0.05'];
const OSMO_CHAIN_ID = 'osmosis';
const OSMO_COIN_ID = 'uosmo';

export function useOsmoFee(props: UseOsmoFeeProps = {}) {
  const { selectedFeeCoinId, config } = props;

  const { data: accountAssets, isLoading: isFetchingAccountAssets } = useAccountAllAssets({
    disableDupeEthermint: true,
    filterByPreferAccountType: true,
  });

  const { data: baseFeeTokens } = useOsmoFeeToken({ config });
  const { data: osmoGasPrice, isFetching: isFetchingOsmoEipFee } = useOsmoEipFee({ config });

  const isOsmoCoin = useMemo(() => {
    if (!selectedFeeCoinId) return true;

    return parseCoinId(selectedFeeCoinId).id === OSMO_COIN_ID;
  }, [selectedFeeCoinId]);

  const availableFeeTokens = useMemo(() => {
    const osmoCoin = findOsmoCoin(accountAssets?.allCosmosAccountAssets);
    const otherTokens = findOtherFeeTokens(accountAssets?.allCosmosAccountAssets, baseFeeTokens?.fee_tokens);

    return [osmoCoin, ...otherTokens].filter((item) => !!item);
  }, [accountAssets?.allCosmosAccountAssets, baseFeeTokens?.fee_tokens]);

  const currentFeeCoin = useMemo(() => {
    if (isOsmoCoin) return availableFeeTokens[0];

    return availableFeeTokens.find((token) => token?.asset && selectedFeeCoinId && isMatchingCoinId(token.asset, selectedFeeCoinId));
  }, [isOsmoCoin, availableFeeTokens, selectedFeeCoinId]);

  const osmoGasRate = useMemo(() => {
    return calculateOsmoGasRates(osmoGasPrice?.base_fee);
  }, [osmoGasPrice?.base_fee]);

  const { data: selectedFeeTokenGasRate, isFetching: isFetchingOsmoSpotPrice } = useOsmoSpotPrice(
    !isOsmoCoin && selectedFeeCoinId ? { feeCoinDenom: parseCoinId(selectedFeeCoinId).id, config } : { config },
  );

  const currentFeeCoinGasRateStep = useMemo(() => {
    if (isOsmoCoin) return osmoGasRate;

    const spotPrice = selectedFeeTokenGasRate?.spot_price;
    if (!spotPrice) return ['1', '1', '1'];

    return calculateCustomTokenGasRates(osmoGasRate, spotPrice);
  }, [isOsmoCoin, osmoGasRate, selectedFeeTokenGasRate?.spot_price]);

  const isLoading = isFetchingOsmoEipFee || isFetchingOsmoSpotPrice || isFetchingAccountAssets;

  return {
    availableFeeCoin: availableFeeTokens,
    currentFeeCoin,
    currentFeeCoinGasRateStep,
    isLoading,
  };
}

function findOsmoCoin(assets: AllCosmosAccountAssets[] | undefined) {
  return assets?.find((asset) => asset.asset.id === OSMO_COIN_ID && asset.chain.id === OSMO_CHAIN_ID);
}

function findOtherFeeTokens(
  assets: AllCosmosAccountAssets[] | undefined,
  feeTokens:
    | {
        denom: string;
        poolID: string;
      }[]
    | undefined,
) {
  if (!feeTokens) return [];

  return feeTokens.map((token) => assets?.find((asset) => asset.chain.id === OSMO_CHAIN_ID && isEqualsIgnoringCase(asset.asset.id, token.denom)));
}

function calculateOsmoGasRates(baseFee?: string) {
  if (!baseFee) return DEFAULT_GAS_RATES;

  return [times(baseFee, '1.05'), times(baseFee, '2'), times(baseFee, '3')];
}

function calculateCustomTokenGasRates(osmoGasRates: readonly string[], spotPrice: string) {
  const priceRatio = divide('1', spotPrice);

  return [times(priceRatio, osmoGasRates[0]), times(priceRatio, osmoGasRates[1]), times(priceRatio, osmoGasRates[2])];
}
