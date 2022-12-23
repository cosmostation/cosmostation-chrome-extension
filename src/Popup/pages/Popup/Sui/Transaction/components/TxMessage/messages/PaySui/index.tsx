import { Typography } from '@mui/material';
import type { PaySuiTransaction } from '@mysten/sui.js';

import Number from '~/Popup/components/common/Number';
import { useTranslation } from '~/Popup/hooks/useTranslation';

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
                    {String(amount)}
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
