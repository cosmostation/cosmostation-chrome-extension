import { useTranslation } from 'react-i18next';

import BalanceDisplay from '@/components/BalanceDisplay';
import { KAVA_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { useAmount } from '@/hooks/cosmos/useAmount';
import { useReward } from '@/hooks/cosmos/useReward';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { toDisplayDenomAmount } from '@/utils/numbers';

import { AmountDetailWrapper, Container, DetailRow, LabelText, TitleText, ValueText } from './styled';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { t } = useTranslation();

  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const { delegationAmount, unbondingAmount, rewardAmount, incentiveAmount } = useAmount(coinId);

  const reward = useReward({
    coinId,
  });

  const selectedCoin = getCosmosAccountAsset();

  const decimal = selectedCoin?.asset.decimals || 0;

  const availableDisplayAmount = toDisplayDenomAmount(selectedCoin?.balance || '0', decimal);
  const stakedDisplayAmount = toDisplayDenomAmount(delegationAmount, decimal);
  const unstakingDisplayAmount = toDisplayDenomAmount(unbondingAmount, decimal);
  const rewardsDisplayAmount = toDisplayDenomAmount(rewardAmount, decimal);
  const rewardsCoinCounts = reward?.data?.total?.length && reward.data.total.length > 1 ? reward.data.total.length - 1 : 0;
  const incentiveDisplayAmount = toDisplayDenomAmount(incentiveAmount, decimal);

  return (
    <Container>
      <TitleText variant="h3_B">{t('pages.coin-detail.components.AmountDetail.Cosmos.title')}</TitleText>
      <AmountDetailWrapper>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Cosmos.available')}</LabelText>
          <ValueText>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {availableDisplayAmount}
            </BalanceDisplay>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Cosmos.staked')}</LabelText>
          <ValueText>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {stakedDisplayAmount}
            </BalanceDisplay>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Cosmos.unstaking')}</LabelText>
          <ValueText>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {unstakingDisplayAmount}
            </BalanceDisplay>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <LabelText variant="b3_R">{`${t('pages.coin-detail.components.AmountDetail.Cosmos.rewards')} ${rewardsCoinCounts ? `+ ${rewardsCoinCounts}` : ''}`}</LabelText>
          <ValueText>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {rewardsDisplayAmount}
            </BalanceDisplay>
          </ValueText>
        </DetailRow>
        {selectedCoin?.chain.id === KAVA_CHAINLIST_ID && (
          <DetailRow>
            <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Cosmos.incentive')}</LabelText>
            <ValueText>
              <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
                {incentiveDisplayAmount}
              </BalanceDisplay>
            </ValueText>
          </DetailRow>
        )}
      </AmountDetailWrapper>
    </Container>
  );
}
