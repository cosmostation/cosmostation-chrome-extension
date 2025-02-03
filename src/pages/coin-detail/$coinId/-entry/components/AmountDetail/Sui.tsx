import { useTranslation } from 'react-i18next';

import NumberTypo from '@/components/common/NumberTypo';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';

import {
  AmountDetailAttributeWrapper,
  AmountDetailWrapper,
  Container,
  DetailRow,
  LabelAttributeText,
  LabelLeftContainer,
  LabelText,
  TitleText,
  ValueAttributeText,
  ValueText,
} from './styled';

import ClassificationIcon from '@/assets/images/icons/Classification10.svg';

type SuiProps = {
  coinId: string;
};

export default function Sui({ coinId }: SuiProps) {
  const { t } = useTranslation();

  const { data } = useAccountAssets();

  const selectedCoin = (() => {
    if (!data) return undefined;

    return data.suiAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
  })();

  const decimal = selectedCoin?.asset.decimals || 0;

  const availableDisplayAmount = toDisplayDenomAmount(selectedCoin?.balance || '0', decimal);
  const totalStakedDisplayAmount = '500';
  const stakedDisplayAmount = '500';
  const earnedDisplayAmount = '500';

  return (
    <Container>
      <TitleText variant="h3_B">{t('pages.coin-detail.components.AmountDetail.Sui.title')}</TitleText>
      <AmountDetailWrapper>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Sui.available')}</LabelText>
          <ValueText>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimal}>
              {availableDisplayAmount}
            </NumberTypo>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Sui.totalStaked')}</LabelText>
          <ValueText>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimal}>
              {totalStakedDisplayAmount}
            </NumberTypo>
          </ValueText>
        </DetailRow>
      </AmountDetailWrapper>
      <AmountDetailAttributeWrapper>
        <DetailRow>
          <LabelLeftContainer>
            <ClassificationIcon />
            <LabelAttributeText variant="b4_R">{t('pages.coin-detail.components.AmountDetail.Sui.staked')}</LabelAttributeText>
          </LabelLeftContainer>

          <ValueAttributeText>
            <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimal}>
              {stakedDisplayAmount}
            </NumberTypo>
          </ValueAttributeText>
        </DetailRow>
        <DetailRow>
          <LabelLeftContainer>
            <ClassificationIcon />
            <LabelAttributeText variant="b4_R">{t('pages.coin-detail.components.AmountDetail.Sui.earned')}</LabelAttributeText>
          </LabelLeftContainer>

          <ValueAttributeText>
            <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimal}>
              {earnedDisplayAmount}
            </NumberTypo>
          </ValueAttributeText>
        </DetailRow>
      </AmountDetailAttributeWrapper>
    </Container>
  );
}
