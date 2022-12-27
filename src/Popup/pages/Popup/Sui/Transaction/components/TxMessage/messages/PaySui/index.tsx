import { useMemo } from 'react';
import { Typography } from '@mui/material';
import type { PaySuiTransaction } from '@mysten/sui.js';

import { SUI_COIN } from '~/constants/sui';
import Number from '~/Popup/components/common/Number';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayDenomAmount } from '~/Popup/utils/big';

import {
  AddressContainer,
  AmountInfoContainer,
  ContentContainer,
  LabelContainer,
  LeftContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightContainer,
  ValueContainer,
} from './styled';
import Container from '../../components/Container';

type TransactionProps = {
  transaction: PaySuiTransaction;
};

export default function Transaction({ transaction }: TransactionProps) {
  const { t } = useTranslation();

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: SUI_COIN });

  const decimals = useMemo(() => coinMetadata?.result?.decimals || 0, [coinMetadata?.result?.decimals]);

  return (
    <Container title="Transaction">
      <ContentContainer>
        {transaction.recipients.map((recipient) => (
          <AddressContainer key={recipient}>
            <LabelContainer>
              <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Send.index.toAddress')}</Typography>
            </LabelContainer>
            <ValueContainer>
              <Typography variant="h5">{recipient}</Typography>
            </ValueContainer>
          </AddressContainer>
        ))}
        {transaction.amounts.map((amount, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <AmountInfoContainer key={idx}>
            <LeftContainer>
              <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Send.index.amount')}</Typography>
            </LeftContainer>
            <RightContainer>
              <RightColumnContainer>
                <RightAmountContainer>
                  <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                    {toDisplayDenomAmount(amount, decimals)}
                  </Number>
                </RightAmountContainer>
              </RightColumnContainer>
            </RightContainer>
          </AmountInfoContainer>
        ))}
      </ContentContainer>
    </Container>
  );
}
