import { useTranslation } from 'react-i18next';

import { Container, EstimatedFeeTextContainer, FeeCustomButton, LeftContentContainer, NetworkFeeText, RightContentContainer, StyledButton } from './styled';
import Base1300Text from '../common/Base1300Text';
import NumberTypo from '../common/NumberTypo';

// type FeeProps = {

// };

export default function Fee() {
  const { t } = useTranslation();

  const baseAmount = '0.000013';
  const coinSymbol = 'ATOM';
  const value = '0.0006';
  const decimal = 6;

  return (
    <Container>
      <LeftContentContainer>
        <NetworkFeeText>{t('pages.account.set-password.index.next')}</NetworkFeeText>
        <FeeCustomButton>
          {baseAmount ? (
            <EstimatedFeeTextContainer>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency="usd" fixed={decimal} isDisableLeadingCurreny>
                {baseAmount}
              </NumberTypo>
              &nbsp;
              <Base1300Text variant="h7n_M">{coinSymbol}</Base1300Text>
              &nbsp;
              <Base1300Text variant="b2_M">{'('}</Base1300Text>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency="usd">
                {value}
              </NumberTypo>
              <Base1300Text variant="b2_M">{')'}</Base1300Text>
            </EstimatedFeeTextContainer>
          ) : (
            <Base1300Text variant="b2_M">{')'}</Base1300Text>
          )}
        </FeeCustomButton>
      </LeftContentContainer>
      <RightContentContainer>{<StyledButton>{t('pages.account.set-password.index.next')}</StyledButton>}</RightContentContainer>
    </Container>
  );
}
