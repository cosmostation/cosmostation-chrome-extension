import { useMemo } from 'react';
import Big from 'big.js';

import { CRESCENT, CRESCENT_COINS } from '~/constants/chain/tendermint/crescent';
import { EMONEY, EMONEY_COINS } from '~/constants/chain/tendermint/emoney';
import { KAVA, KAVA_COINS } from '~/constants/chain/tendermint/kava';
import { useAccountSWR } from '~/Popup/hooks/SWR/tendermint/useAccountSWR';
import { useDelegationSWR } from '~/Popup/hooks/SWR/tendermint/useDelegationSWR';
import { useRewardSWR } from '~/Popup/hooks/SWR/tendermint/useRewardSWR';
import { useUndelegationSWR } from '~/Popup/hooks/SWR/tendermint/useUndelegationSWR';
import { plus } from '~/Popup/utils/big';
import { calculatingDelegatedVestingTotal, getDelegatedVestingTotal, getVestingRelatedBalances, getVestingRemained } from '~/Popup/utils/tendermintVesting';
import type { TendermintChain } from '~/types/chain';

import { useBalanceSWR } from './useBalanceSWR';
import { useIbcCoinSWR } from './useIbcCoinSWR';
import { useIncentiveSWR } from './useIncentiveSWR';

export type CoinInfo = {
  auth?: boolean;
  decimals?: number;
  baseDenom?: string;
  displayDenom?: string;
  imageURL?: string;
  channelId?: string;
  availableAmount: string;
  totalAmount: string;
};

export function useCoinListSWR(chain: TendermintChain, suspense?: boolean) {
  const account = useAccountSWR(chain, suspense);
  const delegation = useDelegationSWR(chain, suspense);
  const undelegation = useUndelegationSWR(chain, suspense);
  const reward = useRewardSWR(chain, suspense);
  const balance = useBalanceSWR(chain, suspense);
  const ibcCoin = useIbcCoinSWR(chain, suspense);
  const incentive = useIncentiveSWR(chain, suspense);

  const ibcCoinArray = useMemo(() => ibcCoin.data?.ibc_tokens?.map((token) => token.hash) || [], [ibcCoin.data?.ibc_tokens]);

  const coinChainIds = [KAVA, EMONEY, CRESCENT].map((item) => item.id);

  const coins: CoinInfo[] = useMemo(() => {
    if (coinChainIds.includes(chain.id)) {
      const chainCoins = (() => {
        if (chain.id === KAVA.id) {
          return KAVA_COINS;
        }

        if (chain.id === EMONEY.id) {
          return EMONEY_COINS;
        }

        if (chain.id === CRESCENT.id) {
          return CRESCENT_COINS;
        }

        return [];
      })();

      const coinArray = chainCoins.map((item) => item.baseDenom);

      return (
        balance.data?.balance
          ?.filter((coin) => coinArray.includes(coin.denom))
          .map((coin) => {
            const coinInfo = chainCoins.find((item) => item.baseDenom === coin.denom)!;

            const availableAmount = balance?.data?.balance?.find((item) => item.denom === coin.denom)?.amount || '0';
            const delegationAmount =
              delegation?.data
                ?.filter((item) => item.amount?.denom === coin.denom)
                ?.reduce((ac, cu) => plus(ac, cu.amount.amount), '0')
                .toString() || '0';

            const unbondingAmount = undelegation?.data?.reduce((ac, cu) => plus(ac, cu.entries.balance), '0').toString() || '0';

            const vestingRemained = getVestingRemained(account?.data, coin.denom);
            const delegatedVestingTotal =
              chain.chainName === KAVA.chainName
                ? getDelegatedVestingTotal(account?.data, coin.denom)
                : calculatingDelegatedVestingTotal(vestingRemained, delegationAmount);

            const rewardAmount = reward?.data?.result?.total?.find((item) => item.denom === coin.denom)?.amount || '0';

            const [vestingRelatedAvailable, vestingNotDelegate] = getVestingRelatedBalances(availableAmount, vestingRemained, delegatedVestingTotal);

            const incentiveAmount = incentive?.data?.[coin.denom] || '0';

            return {
              decimals: coinInfo.decimals,
              baseDenom: coinInfo.baseDenom,
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
    }

    return [];
  }, [account, balance, chain, delegation, incentive, reward, undelegation, coinChainIds]);

  const ibcCoins: CoinInfo[] =
    balance.data?.balance
      ?.filter((coin) => ibcCoinArray.includes(coin.denom.replace('ibc/', '')))
      .map((coin) => {
        const coinInfo = ibcCoin.data?.ibc_tokens?.find((item) => item.hash === coin.denom.replace('ibc/', ''));

        return {
          auth: !!coinInfo?.auth,
          decimals: coinInfo?.decimal,
          baseDenom: coin.denom,
          displayDenom: coinInfo?.display_denom,
          imageURL: coinInfo?.moniker,
          channelId: coinInfo?.channel_id,
          availableAmount: coin.amount,
          totalAmount: coin.amount,
        };
      }) || [];

  return { coins, ibcCoins };
}
