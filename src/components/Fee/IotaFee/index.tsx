import { useTranslation } from 'react-i18next';

import Tooltip from '@/components/common/Tooltip';
import { IOTA_COIN_TYPE } from '@/constants/iota';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { times } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Container, EstimatedFeeTextContainer, FeeCustomButton, LeftContentContainer, NetworkFeeText, RightContentContainer, StyledButton } from './styled';
import Base1300Text from '../../common/Base1300Text';
import NumberTypo from '../../common/NumberTypo';

type IotaFeeProps = {
  displayFeeAmount?: string;
  disableConfirm?: boolean;
  errorMessage?: string;
  isLoading?: boolean;
  onClickConfirm: () => void;
};

export default function IotaFee({ displayFeeAmount, disableConfirm, isLoading, errorMessage, onClickConfirm }: IotaFeeProps) {
  const { t } = useTranslation();
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const { data: accountAsset } = useAccountAllAssets();

  const selectedFeeAsset = accountAsset?.iotaAccountAssets.find((item) => item.asset.id === IOTA_COIN_TYPE)?.asset;

  const coinPrice = (selectedFeeAsset?.coinGeckoId && coinGeckoPrice?.[selectedFeeAsset.coinGeckoId]?.[userCurrencyPreference]) || 0;
  const coinSymbol = selectedFeeAsset?.symbol || '';

  const value = times(displayFeeAmount || '0', coinPrice);

  return (
    <Container>
      <LeftContentContainer>
        <NetworkFeeText variant="b3_R">{t('components.Fee.IotaFee.index.networkFee')}</NetworkFeeText>
        <FeeCustomButton disabled>
          {displayFeeAmount ? (
            <EstimatedFeeTextContainer>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference} fixed={6} isDisableLeadingCurreny>
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
        <Tooltip title={errorMessage} varient="error" placement="top">
          <div>
            <StyledButton isProgress={isLoading} disabled={disableConfirm} onClick={onClickConfirm}>
              {t('components.Fee.IotaFee.index.continue')}
            </StyledButton>
          </div>
        </Tooltip>
      </RightContentContainer>
    </Container>
  );
}
