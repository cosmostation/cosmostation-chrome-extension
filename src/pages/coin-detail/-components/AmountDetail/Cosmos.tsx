import { useTranslation } from 'react-i18next';

import NumberTypo from '@/components/common/NumberTypo';

import { AmountDetailWrapper, Container, DetailRow, LabelText, TitleText, ValueText } from './styled';

type CosmosProps = {
  uniqueCoinId: string;
};

export default function Cosmos({ uniqueCoinId }: CosmosProps) {
  console.log('🚀 ~ AmountDetail ~ uniqueCoinId:', uniqueCoinId);

  const { t } = useTranslation();

  const availableDisplayAmount = '1000';
  const stakedDisplayAmount = '500';
  const unstakingDisplayAmount = '20';
  const rewardsDisplayAmount = '20';
  const rewardsCoinCounts = '3';

  const decimal = 6;

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
      </AmountDetailWrapper>
    </Container>
  );
}
