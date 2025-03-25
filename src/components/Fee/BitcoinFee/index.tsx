import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { times } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Container, EstimatedFeeTextContainer, FeeCustomButton, LeftContentContainer, NetworkFeeText, RightContentContainer, StyledButton } from './styled';
import Base1300Text from '../../common/Base1300Text';
import NumberTypo from '../../common/NumberTypo';

type BitcoinFeeProps = {
  feeCoinId: string;
  displayFeeAmount?: string;
  disableConfirm?: boolean;
  isLoading?: boolean;
  onClickConfirm: () => void;
};

export default function BitcoinFee({ feeCoinId, displayFeeAmount, disableConfirm, isLoading, onClickConfirm }: BitcoinFeeProps) {
  const { t } = useTranslation();
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const { getBitcoinAccountAsset } = useGetAccountAsset({ coinId: feeCoinId });

  const selectedFeeAsset = getBitcoinAccountAsset();

  const coinPrice = (selectedFeeAsset?.asset?.coinGeckoId && coinGeckoPrice?.[selectedFeeAsset.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;
  const coinSymbol = selectedFeeAsset?.asset?.symbol || '';

  const value = useMemo(() => times(displayFeeAmount || '0', coinPrice), [coinPrice, displayFeeAmount]);

  return (
    <Container>
      <LeftContentContainer>
        <NetworkFeeText variant="b3_R">{t('components.Fee.BitcoinFee.index.networkFee')}</NetworkFeeText>
        <FeeCustomButton disabled>
          {displayFeeAmount ? (
            <EstimatedFeeTextContainer>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6} isDisableLeadingCurreny>
                {displayFeeAmount}
              </NumberTypo>
              &nbsp;
              <Base1300Text variant="h7n_M">{coinSymbol}</Base1300Text>
              &nbsp;
              <Base1300Text variant="b2_M">{'('}</Base1300Text>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference}>
                {value}
              </NumberTypo>
              <Base1300Text variant="b2_M">{')'}</Base1300Text>
            </EstimatedFeeTextContainer>
          ) : (
            <Base1300Text variant="b2_M">{')'}</Base1300Text>
          )}
        </FeeCustomButton>
      </LeftContentContainer>
      <RightContentContainer>
        {
          <StyledButton isProgress={isLoading} disabled={disableConfirm} onClick={onClickConfirm}>
            {t('components.Fee.BitcoinFee.index.continue')}
          </StyledButton>
        }
      </RightContentContainer>
    </Container>
  );
}
