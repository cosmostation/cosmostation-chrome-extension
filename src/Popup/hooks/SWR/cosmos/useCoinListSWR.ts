import { useMemo } from 'react';
import Big from 'big.js';

import { COSMOS_CHAINS } from '~/constants/chain';
import { ASSET_MANTLE } from '~/constants/chain/cosmos/assetMantle';
import { CRYPTO_ORG } from '~/constants/chain/cosmos/cryptoOrg';
import { FETCH_AI } from '~/constants/chain/cosmos/fetchAi';
import { GRAVITY_BRIDGE } from '~/constants/chain/cosmos/gravityBridge';
import { KAVA } from '~/constants/chain/cosmos/kava';
import { KI } from '~/constants/chain/cosmos/ki';
import { SIF } from '~/constants/chain/cosmos/sif';
import { STAFIHUB } from '~/constants/chain/cosmos/stafihub';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useDelegationSWR } from '~/Popup/hooks/SWR/cosmos/useDelegationSWR';
import { useRewardSWR } from '~/Popup/hooks/SWR/cosmos/useRewardSWR';
import { plus } from '~/Popup/utils/big';
import { getDelegatedVestingTotal, getVestingRelatedBalances, getVestingRemained } from '~/Popup/utils/cosmosVesting';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { Coin, CosmosChain } from '~/types/chain';

import { useAssetsSWR } from './useAssetsSWR';
import { useBalanceSWR } from './useBalanceSWR';
import { useIncentiveSWR } from './useIncentiveSWR';

export type CoinInfo = {
  originChain?: string;
  coinType?: string;
  decimals: number;
  originBaseDenom?: string;
  baseDenom: string;
  displayDenom: string;
  imageURL?: string;
  channelId?: string;
  availableAmount: string;
  totalAmount: string;
  coinGeckoId?: string;
};

export function useCoinListSWR(chain: CosmosChain, suspense?: boolean) {
  const account = useAccountSWR(chain, suspense);
  const delegation = useDelegationSWR(chain, suspense);
  const reward = useRewardSWR(chain, suspense);
  const balance = useBalanceSWR(chain, suspense);
  const incentive = useIncentiveSWR(chain, suspense);
  const assets = useAssetsSWR(chain, { suspense });
  const nameMap = {
    [CRYPTO_ORG.baseDenom]: CRYPTO_ORG.chainName,
    [ASSET_MANTLE.baseDenom]: ASSET_MANTLE.chainName,
    [GRAVITY_BRIDGE.baseDenom]: GRAVITY_BRIDGE.chainName,
    [SIF.baseDenom]: SIF.chainName,
    [KI.baseDenom]: KI.chainName,
    [STAFIHUB.baseDenom]: STAFIHUB.chainName,
    [FETCH_AI.baseDenom]: FETCH_AI.chainName,
  };
  const nativeAssets: Coin[] = useMemo(
    () =>
      assets?.data
        ?.filter((item) => item.type === 'native' || item.type === 'bridge')
        ?.map((item) => ({
          path: item.path,
          type: item.type,
          originBaseDenom: item.base_denom || '',
          baseDenom: item.denom,
          displayDenom: item.dp_denom,
          decimals: item.decimal,
          imageURL: item.image ? `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/${item.image}` : undefined,
          coinGeckoId: item.coinGeckoId,
        })) || [],
    [assets.data],
  );

  const ibcAssets = useMemo(() => assets?.data?.filter((item) => item.type === 'ibc') || [], [assets?.data]);

  const coins: CoinInfo[] = useMemo(() => {
    const chainCoins = nativeAssets || [];

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
            originChain:
              nameMap[coinInfo.baseDenom] ??
              COSMOS_CHAINS.find((cosmosChain) => cosmosChain.chainName.toLowerCase() === coinInfo.path?.split('>').at(-2))?.chainName,
            coinType: coinInfo.type,
            decimals: coinInfo.decimals,
            baseDenom: coin.denom,
            originBaseDenom: coinInfo.originBaseDenom,
            displayDenom: coinInfo.displayDenom,
            imageURL: coinInfo.imageURL,
            coinGeckoId: coinInfo.coinGeckoId,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.data, balance.data?.balance, chain.chainName, delegation?.data, incentive?.data, nativeAssets, reward?.data?.total]);

  const ibcCoins: CoinInfo[] =
    balance.data?.balance
      ?.filter((coin) => ibcAssets.map((item) => item.denom).includes(coin.denom))
      .map((coin) => {
        const coinInfo = ibcAssets.find((item) => item.denom === coin.denom)!;
        return {
          originChain:
            nameMap[coinInfo.base_denom] ??
            COSMOS_CHAINS.find((cosmosChain) => cosmosChain.chainName.toLowerCase() === coinInfo.path?.split('>').at(-2))?.chainName,
          coinType: coinInfo.type,
          decimals: coinInfo?.decimal,
          originBaseDenom: coinInfo?.base_denom,
          baseDenom: coin.denom,
          displayDenom: coinInfo?.dp_denom,
          imageURL: coinInfo?.image
            ? `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/${coinInfo.image}`
            : undefined,
          coinGeckoId: coinInfo.coinGeckoId,
          channelId: coinInfo?.channel,
          availableAmount: coin.amount,
          totalAmount: coin.amount,
        };
      }) || [];

  return { coins, ibcCoins };
}
