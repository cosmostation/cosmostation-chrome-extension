import { useTranslation } from 'react-i18next';

import NumberTypo from '@/components/common/NumberTypo';
import { KAVA_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { useAmount } from '@/hooks/cosmos/useAmount';
import { useReward } from '@/hooks/cosmos/useReward';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';

import { AmountDetailWrapper, Container, DetailRow, LabelText, TitleText, ValueText } from './styled';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { t } = useTranslation();

  const { data } = useAccountAssets();

  const { delegationAmount, unbondingAmount, rewardAmount, incentiveAmount } = useAmount(coinId);

  const reward = useReward({
    coinId,
  });

  const selectedCoin = (() => {
    if (!data) return undefined;

    const aggregatedCosmosAccountAssets = [
      ...data.cosmosAccountAssets,
      ...data.cosmosAccountCustomAssets,
      ...data.cw20AccountAssets,
      ...data.customCw20AccountAssets,
    ];

    return aggregatedCosmosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
  })();

  const decimal = selectedCoin?.asset.decimals || 0;

  const availableDisplayAmount = toDisplayDenomAmount(selectedCoin?.balance || '0', decimal);
  const stakedDisplayAmount = toDisplayDenomAmount(delegationAmount, decimal);
  const unstakingDisplayAmount = toDisplayDenomAmount(unbondingAmount, decimal);
  const rewardsDisplayAmount = toDisplayDenomAmount(rewardAmount, decimal);
  const rewardsCoinCounts = reward?.data?.total?.length || 0;
  const incentiveDisplayAmount = toDisplayDenomAmount(incentiveAmount, decimal);

  return (
    <Container>
      <TitleText variant="h3_B">{t('pages.coin-detail.components.AmountDetail.Cosmos.title')}</TitleText>
      <AmountDetailWrapper>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Cosmos.available')}</LabelText>
          <ValueText>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimal}>
              {availableDisplayAmount}
            </NumberTypo>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Cosmos.staked')}</LabelText>
          <ValueText>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimal}>
              {stakedDisplayAmount}
            </NumberTypo>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Cosmos.unstaking')}</LabelText>
          <ValueText>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimal}>
              {unstakingDisplayAmount}
            </NumberTypo>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <LabelText variant="b3_R">{`${t('pages.coin-detail.components.AmountDetail.Cosmos.rewards')} + ${rewardsCoinCounts}`}</LabelText>
          <ValueText>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimal}>
              {rewardsDisplayAmount}
            </NumberTypo>
          </ValueText>
        </DetailRow>
        {/* FIXME 현재는 60패스에서 코스모스쪽 코인을 디리스팅하고 있어서 카바 60이면 얘 안나옴 */}
        {selectedCoin?.chain.id === KAVA_CHAINLIST_ID && (
          <DetailRow>
            <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Cosmos.incentive')}</LabelText>
            <ValueText>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimal}>
                {incentiveDisplayAmount}
              </NumberTypo>
            </ValueText>
          </DetailRow>
        )}
      </AmountDetailWrapper>
    </Container>
  );
}
