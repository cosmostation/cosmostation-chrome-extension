import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import NumberTypo from '@/components/common/NumberTypo';

import { AmountDetailWrapper, Container, DetailRow, LabelText, PendingAmountContainer, TitleText, ValueText } from './styled';

type BitcoinProps = {
  uniqueCoinId: string;
};

export default function Bitcoin({ uniqueCoinId }: BitcoinProps) {
  console.log('🚀 ~ AmountDetail ~ uniqueCoinId:', uniqueCoinId);

  const { t } = useTranslation();

  const availableDisplayAmount = '1000';
  const pendingReceiveDisplayAmount = '90';

  const decimal = 6;

  return (
    <Container>
      {/* TODO Coin Details말고 다른 텍스트 변경 고려필요 */}
      <TitleText variant="h3_B">{t('pages.coin-detail.components.AmountDetail.Bitcoin.title')}</TitleText>
      <AmountDetailWrapper>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Bitcoin.available')}</LabelText>
          <ValueText>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimal}>
              {availableDisplayAmount}
            </NumberTypo>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <PendingAmountContainer>
            <Typography variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Bitcoin.pendingReceive')}</Typography>
          </PendingAmountContainer>
          <PendingAmountContainer>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimal}>
              {pendingReceiveDisplayAmount}
            </NumberTypo>
          </PendingAmountContainer>
        </DetailRow>
      </AmountDetailWrapper>
    </Container>
  );
}
