import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import FeeSettingBottomSheet from './components/FeeSettingBottomSheet';
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

  const [isOpenFeeCustomBottomSheet, setIsOpenFeeCustomBottomSheet] = useState(false);

  const defaultFeeId = '1';
  const [selectedFeeId, setSelectedFeeId] = useState(defaultFeeId);

  console.log('🚀 ~ Fee ~ selectedFeeId:', selectedFeeId);

  return (
    <Container>
      <LeftContentContainer>
        <NetworkFeeText variant="b3_R">{t('components.Fee.index.networkFee')}</NetworkFeeText>
        <FeeCustomButton
          onClick={() => {
            setIsOpenFeeCustomBottomSheet(true);
          }}
        >
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
      <FeeSettingBottomSheet
        feeList={[
          {
            id: '1',
            amount: '0.000013',
            value: '0.0006',
          },
          {
            id: '2',
            amount: '0.000013',
            value: '0.0006',
          },
          {
            id: '3',
            amount: '0.000013',
            value: '0.0006',
          },
        ]}
        currentSelectedFeeId={selectedFeeId}
        open={isOpenFeeCustomBottomSheet}
        onClose={() => setIsOpenFeeCustomBottomSheet(false)}
        onSelectOption={(val) => {
          setSelectedFeeId(val);
        }}
      />
    </Container>
  );
}
