import { useTranslation } from 'react-i18next';

import Tooltip from '@/components/common/Tooltip';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Container, EstimatedFeeTextContainer, FeeCustomButton, LeftContentContainer, NetworkFeeText, RightContentContainer, StyledButton } from './styled';
import Base1300Text from '../../common/Base1300Text';
import NumberTypo from '../../common/NumberTypo';

type SolanaFeeProps = {
  displayFeeAmount?: string;
  displayFeePrice?: string;
  coinSymbol?: string;
  disableConfirm?: boolean;
  errorMessage?: string;
  isLoading?: boolean;
  onClickConfirm: () => void;
};

export default function SolanaFee({ displayFeeAmount, displayFeePrice, coinSymbol, disableConfirm, isLoading, errorMessage, onClickConfirm }: SolanaFeeProps) {
  const { t } = useTranslation();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  return (
    <Container>
      <LeftContentContainer>
        <NetworkFeeText variant="b3_R">{t('components.Fee.SolanaFee.index.networkFee')}</NetworkFeeText>
        <FeeCustomButton disabled>
          {displayFeeAmount && (
            <EstimatedFeeTextContainer>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference} fixed={6} isDisableLeadingCurreny>
                {displayFeeAmount}
              </NumberTypo>
              &nbsp;
              <Base1300Text variant="h7n_M">{coinSymbol}</Base1300Text>
              &nbsp;
              <Base1300Text variant="b2_M">{'('}</Base1300Text>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference} fixed={6}>
                {displayFeePrice}
              </NumberTypo>
              <Base1300Text variant="b2_M">{')'}</Base1300Text>
            </EstimatedFeeTextContainer>
          )}
        </FeeCustomButton>
      </LeftContentContainer>
      <RightContentContainer>
        <Tooltip title={errorMessage} varient="error" placement="top">
          <div>
            <StyledButton isProgress={isLoading} disabled={disableConfirm} onClick={onClickConfirm}>
              {t('components.Fee.SolanaFee.index.continue')}
            </StyledButton>
          </div>
        </Tooltip>
      </RightContentContainer>
    </Container>
  );
}
