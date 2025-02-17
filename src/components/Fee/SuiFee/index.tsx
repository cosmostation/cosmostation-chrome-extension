import { useTranslation } from 'react-i18next';

import { SUI_COIN_TYPE } from '@/constants/sui';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { times } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Container, EstimatedFeeTextContainer, FeeCustomButton, LeftContentContainer, NetworkFeeText, RightContentContainer, StyledButton } from './styled';
import Base1300Text from '../../common/Base1300Text';
import NumberTypo from '../../common/NumberTypo';

type SuiFeeProps = {
  displayFeeAmount?: string;
  disableConfirm?: boolean;
  isLoading?: boolean;
  onClickConfirm: () => void;
};

export default function SuiFee({ displayFeeAmount, disableConfirm, isLoading, onClickConfirm }: SuiFeeProps) {
  const { t } = useTranslation();
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { currency } = useExtensionStorageStore((state) => state);

  const { data: accountAsset } = useAccountAssets();

  const selectedFeeAsset = accountAsset?.suiAccountAssets.find((item) => item.asset.id === SUI_COIN_TYPE)?.asset;

  const coinPrice = (selectedFeeAsset?.coinGeckoId && coinGeckoPrice?.[selectedFeeAsset.coinGeckoId]?.[currency]) || 0;
  const coinSymbol = selectedFeeAsset?.symbol || '';

  const value = times(displayFeeAmount || '0', coinPrice);

  return (
    <Container>
      <LeftContentContainer>
        <NetworkFeeText variant="b3_R">{t('components.Fee.SuiFee.index.networkFee')}</NetworkFeeText>
        <FeeCustomButton disabled>
          {displayFeeAmount ? (
            <EstimatedFeeTextContainer>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={currency} fixed={6} isDisableLeadingCurreny>
                {displayFeeAmount}
              </NumberTypo>
              &nbsp;
              <Base1300Text variant="h7n_M">{coinSymbol}</Base1300Text>
              &nbsp;
              <Base1300Text variant="b2_M">{'('}</Base1300Text>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={currency}>
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
            {t('components.Fee.SuiFee.index.continue')}
          </StyledButton>
        }
      </RightContentContainer>
    </Container>
  );
}
