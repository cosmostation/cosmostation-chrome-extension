import { useTranslation } from 'react-i18next';

import BalanceDisplay from '@/components/BalanceDisplay';
import { useDelegations } from '@/hooks/iota/useDelegations';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { plus, toDisplayDenomAmount } from '@/utils/numbers';

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

type IotaProps = {
  coinId: string;
};

export default function Iota({ coinId }: IotaProps) {
  const { t } = useTranslation();

  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });

  useDelegations({ coinId });

  const selectedCoin = getIotaAccountAsset();

  const decimal = selectedCoin?.asset.decimals || 0;

  const availableDisplayAmount = toDisplayDenomAmount(selectedCoin?.balance || '0', decimal);
  const stakedDisplayAmount = toDisplayDenomAmount(selectedCoin?.delegation || '0', decimal);
  const earnedDisplayAmount = toDisplayDenomAmount(selectedCoin?.reward || '0', decimal);

  const totalStakedDisplayAmount = plus(stakedDisplayAmount, earnedDisplayAmount);
  return (
    <Container>
      <TitleText variant="h3_B">{t('pages.coin-detail.components.AmountDetail.Iota.title')}</TitleText>
      <AmountDetailWrapper>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Iota.available')}</LabelText>
          <ValueText>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {availableDisplayAmount}
            </BalanceDisplay>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Iota.totalStaked')}</LabelText>
          <ValueText>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {totalStakedDisplayAmount}
            </BalanceDisplay>
          </ValueText>
        </DetailRow>
      </AmountDetailWrapper>
      <AmountDetailAttributeWrapper>
        <DetailRow>
          <LabelLeftContainer>
            <ClassificationIcon />
            <LabelAttributeText variant="b4_R">{t('pages.coin-detail.components.AmountDetail.Iota.staked')}</LabelAttributeText>
          </LabelLeftContainer>

          <ValueAttributeText>
            <BalanceDisplay typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={6}>
              {stakedDisplayAmount}
            </BalanceDisplay>
          </ValueAttributeText>
        </DetailRow>
        <DetailRow>
          <LabelLeftContainer>
            <ClassificationIcon />
            <LabelAttributeText variant="b4_R">{t('pages.coin-detail.components.AmountDetail.Iota.earned')}</LabelAttributeText>
          </LabelLeftContainer>

          <ValueAttributeText>
            <BalanceDisplay typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={6}>
              {earnedDisplayAmount}
            </BalanceDisplay>
          </ValueAttributeText>
        </DetailRow>
      </AmountDetailAttributeWrapper>
    </Container>
  );
}
