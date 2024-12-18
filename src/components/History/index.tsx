import { useTranslation } from 'react-i18next';

import { shorterAddress } from '@/utils/string';

import DateLine from './components/DateLine';
import TxDetail from './components/TxDetail';
import { AmountContainer, Container, DateLineContainer, SymbolText, TxDetailContainer } from './styled';
import Base1000Text from '../common/Base1000Text';
import Base1300Text from '../common/Base1300Text';
import NumberTypo from '../common/NumberTypo';

export default function History() {
  const { t } = useTranslation();

  const timeStamp = '2024-12-18T01:52:47Z';

  const date = new Date(timeStamp);

  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const displayAmount = '1000';
  const symbol = 'ATOPM';
  const symbolColor = '#9248DB';
  const decimals = 6;

  const fromAddress = shorterAddress('cosmos1aygdt8742gamxv8ca99wzh56ry4xw5s39smmhm', 18);
  return (
    <Container>
      <DateLineContainer>
        <DateLine date={timeStamp} />
      </DateLineContainer>
      <TxDetailContainer>
        <TxDetail
          leftTop={<Base1300Text variant="b2_M">{t('components.History.received')}</Base1300Text>}
          rightTop={
            <AmountContainer>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimals}>
                {displayAmount}
              </NumberTypo>
              &nbsp;
              <SymbolText variant="b4_M" data-symbol-color={symbolColor}>
                {symbol}
              </SymbolText>
            </AmountContainer>
          }
          leftBottom={
            <Base1000Text variant="b4_R">
              To : <Base1000Text variant="b4_M">{fromAddress}</Base1000Text>
            </Base1000Text>
          }
          rightBottom={<Base1000Text variant="h7n_R">{`${hour} : ${minute} : ${second}`}</Base1000Text>}
        />
        <TxDetail
          leftTop={<Base1300Text variant="b2_M">{t('components.History.received')}</Base1300Text>}
          rightTop={
            <AmountContainer>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimals}>
                {displayAmount}
              </NumberTypo>
              &nbsp;
              <SymbolText variant="b4_M" data-symbol-color={symbolColor}>
                {symbol}
              </SymbolText>
            </AmountContainer>
          }
          leftBottom={
            <Base1000Text variant="b4_R">
              To : <Base1000Text variant="b4_M">{fromAddress}</Base1000Text>
            </Base1000Text>
          }
          rightBottom={<Base1000Text variant="h7n_R">{`${hour} : ${minute} : ${second}`}</Base1000Text>}
        />
      </TxDetailContainer>
    </Container>
  );
}
