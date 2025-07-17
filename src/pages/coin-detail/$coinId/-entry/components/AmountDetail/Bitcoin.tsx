import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';

import BalanceDisplay from '@/components/BalanceDisplay';
import { useBalance } from '@/hooks/bitcoin/useBalance';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { toDisplayDenomAmount } from '@/utils/numbers';

import { AmountDetailWrapper, Container, DetailRow, LabelText, PendingAmountContainer, TitleText, ValueText } from './styled';

type BitcoinProps = {
  coinId: string;
};

export default function Bitcoin({ coinId }: BitcoinProps) {
  const { t } = useTranslation();

  const { getBitcoinAccountAsset } = useGetAccountAsset({ coinId });
  const { data: currentAccountBalance } = useBalance({ coinId });

  const selectedCoin = getBitcoinAccountAsset();

  const decimal = selectedCoin?.asset.decimals || 0;

  const availableDisplayAmount = toDisplayDenomAmount(selectedCoin?.balance || '0', decimal);

  const pendingReceiveDisplayAmount = toDisplayDenomAmount(currentAccountBalance?.mempool_stats?.funded_txo_sum || '0', decimal);

  return (
    <Container>
      <TitleText variant="h3_B">{t('pages.coin-detail.components.AmountDetail.Bitcoin.title')}</TitleText>
      <AmountDetailWrapper>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Bitcoin.available')}</LabelText>
          <ValueText>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {availableDisplayAmount}
            </BalanceDisplay>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <PendingAmountContainer>
            <Typography variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Bitcoin.pendingReceive')}</Typography>
          </PendingAmountContainer>
          <PendingAmountContainer>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {pendingReceiveDisplayAmount}
            </BalanceDisplay>
          </PendingAmountContainer>
        </DetailRow>
      </AmountDetailWrapper>
    </Container>
  );
}
