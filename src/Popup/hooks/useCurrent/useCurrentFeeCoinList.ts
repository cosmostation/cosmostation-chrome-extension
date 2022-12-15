import { useMemo } from 'react';

import { COSMOS_CHAINS } from '~/constants/chain';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { gt } from '~/Popup/utils/big';
import type { CosmosChain, FeeCoin } from '~/types/chain';

import { useAmountSWR } from '../SWR/cosmos/useAmountSWR';
import { useGasRateSWR } from '../SWR/cosmos/useGasRateSWR';

const cosmosDenoms = COSMOS_CHAINS.map((item) => item.baseDenom);

export function useCurrentFeeCoinList(chain: CosmosChain) {
  const assetGasRate = useGasRateSWR(chain);
  const { vestingRelatedAvailable, totalAmount } = useAmountSWR(chain, true);
  const coinList = useCoinListSWR(chain, true);
  const coinAll = useMemo(
    () => [
      {
        availableAmount: vestingRelatedAvailable,
        totalAmount,
        coinType: 'staking',
        decimals: chain.decimals,
        imageURL: chain.imageURL,
        displayDenom: chain.displayDenom,
        baseDenom: chain.baseDenom,
        coinGeckoId: chain.coinGeckoId,
      },
      ...coinList.coins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item })),
      ...coinList.ibcCoins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item })),
    ],
    [
      chain.baseDenom,
      chain.coinGeckoId,
      chain.decimals,
      chain.displayDenom,
      chain.imageURL,
      coinList.coins,
      coinList.ibcCoins,
      totalAmount,
      vestingRelatedAvailable,
    ],
  );

  const feeCoins: FeeCoin[] = useMemo(() => {
    const assetGasFeeRateDenomList = [...Object.keys(assetGasRate.data)];

    const filteredFeeCoins = coinAll.filter(
      (item) =>
        assetGasFeeRateDenomList?.includes(item.baseDenom) && cosmosDenoms.includes(item.originBaseDenom ?? item.baseDenom) && gt(item.availableAmount, '0'),
    );

    return filteredFeeCoins.length > 0 ? filteredFeeCoins : [coinAll[0]];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetGasRate.data, coinAll]);

  return { feeCoins };
}
