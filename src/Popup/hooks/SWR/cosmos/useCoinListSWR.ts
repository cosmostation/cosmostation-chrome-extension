import { useMemo } from 'react';
import Big from 'big.js';

import { KAVA } from '~/constants/chain/cosmos/kava';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useDelegationSWR } from '~/Popup/hooks/SWR/cosmos/useDelegationSWR';
import { useRewardSWR } from '~/Popup/hooks/SWR/cosmos/useRewardSWR';
import { plus } from '~/Popup/utils/big';
import { getDelegatedVestingTotal, getVestingRelatedBalances, getVestingRemained } from '~/Popup/utils/cosmosVesting';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { Coin, CosmosChain } from '~/types/chain';

import { useAssetsSWR } from './useAssetsSWR';
import { useBalanceSWR } from './useBalanceSWR';
import { useIbcCoinSWR } from './useIbcCoinSWR';
import { useIncentiveSWR } from './useIncentiveSWR';

export type CoinInfo = {
  auth?: boolean;
  decimals?: number;
  originBaseDenom?: string;
  baseDenom?: string;
  displayDenom?: string;
  imageURL?: string;
  channelId?: string;
  availableAmount: string;
  totalAmount: string;
};

export function useCoinListSWR(chain: CosmosChain, suspense?: boolean) {
  const account = useAccountSWR(chain, suspense);
  const delegation = useDelegationSWR(chain, suspense);
  const reward = useRewardSWR(chain, suspense);
  const balance = useBalanceSWR(chain, suspense);
  const ibcCoin = useIbcCoinSWR(chain, suspense);
  const incentive = useIncentiveSWR(chain, suspense);
  const assets = useAssetsSWR(chain);

  const ibcCoinArray = useMemo(() => ibcCoin.data?.ibc_tokens?.map((token) => token.hash) || [], [ibcCoin.data?.ibc_tokens]);

  const modifiedAssets: Coin[] = useMemo(
    () =>
      assets?.data?.map((item) => ({
        originBaseDenom: item.base_denom || '',
        baseDenom: item.denom.toLowerCase(),
        displayDenom: item.dp_denom,
        decimals: item.decimal,
        imageURL: item.image ? `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/${item.image}` : undefined,
      })) || [],
    [assets.data],
  );

  const coins: CoinInfo[] = useMemo(() => {
    const chainCoins = modifiedAssets || [];

    const coinArray = chainCoins.map((item) => item.baseDenom);
    return (
      balance.data?.balance
        ?.filter((coin) => coinArray.includes(coin.denom.toLowerCase()))
        .map((coin) => {
          const coinInfo = chainCoins.find((item) => isEqualsIgnoringCase(item.baseDenom, coin.denom))!;

          const availableAmount = balance?.data?.balance?.find((item) => item.denom === coin.denom)?.amount || '0';
          const delegationAmount =
            delegation?.data
              ?.filter((item) => item.amount?.denom === coin.denom)
              ?.reduce((ac, cu) => plus(ac, cu.amount.amount), '0')
              .toString() || '0';

          const unbondingAmount = '0';

          const vestingRemained = getVestingRemained(account?.data, coin.denom);
          const delegatedVestingTotal = chain.chainName === KAVA.chainName ? getDelegatedVestingTotal(account?.data, coin.denom) : delegationAmount;

          const rewardAmount = reward?.data?.total?.find((item) => item.denom === coin.denom)?.amount || '0';

          const [vestingRelatedAvailable, vestingNotDelegate] = getVestingRelatedBalances(
            availableAmount,
            vestingRemained,
            delegatedVestingTotal,
            unbondingAmount,
          );

          const incentiveAmount = incentive?.data?.[coin.denom] || '0';

          return {
            decimals: coinInfo.decimals,
            baseDenom: coin.denom,
            originBaseDenom: coinInfo.originBaseDenom,
            displayDenom: coinInfo.displayDenom,
            imageURL: coinInfo.imageURL,
            availableAmount: vestingRelatedAvailable,
            totalAmount: new Big(delegationAmount)
              .plus(unbondingAmount)
              .plus(rewardAmount)
              .plus(vestingNotDelegate)
              .plus(vestingRelatedAvailable)
              .plus(incentiveAmount)
              .toString(),
          };
        }) || []
    );
  }, [account, balance, chain, delegation, incentive, reward, modifiedAssets]);

  const ibcCoins: CoinInfo[] =
    balance.data?.balance
      ?.filter((coin) => ibcCoinArray.includes(coin.denom.replace('ibc/', '')))
      .map((coin) => {
        const coinInfo = ibcCoin.data?.ibc_tokens?.find((item) => item.hash === coin.denom.replace('ibc/', ''));

        return {
          auth: !!coinInfo?.auth,
          decimals: coinInfo?.decimal,
          originBaseDenom: coinInfo?.base_denom,
          baseDenom: coin.denom,
          displayDenom: displayDenomUppercase(coinInfo?.display_denom),
          imageURL: coinInfo?.moniker,
          channelId: coinInfo?.channel_id,
          availableAmount: coin.amount,
          totalAmount: coin.amount,
        };
      }) || [];

  return { coins, ibcCoins };
}

function displayDenomUppercase(displayDenom?: string) {
  if (displayDenom?.toLowerCase() === 'bcre') {
    return 'bCRE';
  }

  return displayDenom?.toUpperCase();
}
