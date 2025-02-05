import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import NumberTypo from '@/components/common/NumberTypo';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';

import { AmountDetailWrapper, Container, DetailRow, LabelText, PendingAmountContainer, TitleText, ValueText } from './styled';

type BitcoinProps = {
  coinId: string;
};

export default function Bitcoin({ coinId }: BitcoinProps) {
  const { t } = useTranslation();

  const { data } = useAccountAssets();

  const selectedCoin = (() => {
    if (!data) return undefined;

    return data.bitcoinAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
  })();

  const decimal = selectedCoin?.asset.decimals || 0;

  const availableDisplayAmount = toDisplayDenomAmount(selectedCoin?.balance || '0', decimal);
  const pendingReceiveDisplayAmount = '90';

  return (
    <Container>
      {/* TODO Coin Details말고 다른 텍스트 변경 고려필요 */}
      <TitleText variant="h3_B">{t('pages.coin-detail.components.AmountDetail.Bitcoin.title')}</TitleText>
      <AmountDetailWrapper>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Bitcoin.available')}</LabelText>
          <ValueText>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {availableDisplayAmount}
            </NumberTypo>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <PendingAmountContainer>
            <Typography variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Bitcoin.pendingReceive')}</Typography>
          </PendingAmountContainer>
          <PendingAmountContainer>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {pendingReceiveDisplayAmount}
            </NumberTypo>
          </PendingAmountContainer>
        </DetailRow>
      </AmountDetailWrapper>
    </Container>
  );
}
