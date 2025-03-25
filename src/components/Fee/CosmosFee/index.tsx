import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import type { CosmosFeeAsset } from '@/types/cosmos/fee';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import FeeSettingBottomSheet from './components/FeeSettingBottomSheet';
import { Container, EstimatedFeeTextContainer, FeeCustomButton, LeftContentContainer, NetworkFeeText, RightContentContainer, StyledButton } from './styled';
import Base1300Text from '../../common/Base1300Text';
import NumberTypo from '../../common/NumberTypo';

type FeeProps = {
  feeAssets: CosmosFeeAsset[];
  feeStepKey: number;
  selectedFeeCoinId: string;
  gases: string[];
  gasRates: string[];
  disableConfirm?: boolean;
  isLoading?: boolean;
  onClickConfirm: () => void;
  onClickFeeStep: (gasRateKey: number) => void;
  onChangeGas: (gas: string) => void;
  onChangeGasRate: (gasRate: string) => void;
  onChangeFeeCoinId?: (feeCoinId: string) => void;
};

export default function Fee({
  feeAssets,
  feeStepKey,
  selectedFeeCoinId,
  gases,
  gasRates,
  disableConfirm,
  isLoading,
  onClickConfirm,
  onClickFeeStep,
  onChangeGas,
  onChangeGasRate,
  onChangeFeeCoinId,
}: FeeProps) {
  const { t } = useTranslation();
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const [isOpenFeeCustomBottomSheet, setIsOpenFeeCustomBottomSheet] = useState(false);

  const selectedFeeCoin = useMemo(() => feeAssets.find((item) => isMatchingCoinId(item.asset, selectedFeeCoinId)), [feeAssets, selectedFeeCoinId]);

  const decimals = selectedFeeCoin?.asset.decimals || 0;
  const coinGeckoId = selectedFeeCoin?.asset.coinGeckoId || '';
  const coinSymbol = selectedFeeCoin?.asset.symbol || '';

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const currentGas = gases?.[feeStepKey] || '0';
  const currnetGasRate = gasRates?.[feeStepKey] || '0';

  const baseFeeAmount = useMemo(() => times(currnetGasRate, currentGas), [currentGas, currnetGasRate]);
  const displayFeeAmount = useMemo(() => toDisplayDenomAmount(baseFeeAmount, decimals), [baseFeeAmount, decimals]);

  const value = useMemo(() => times(displayFeeAmount, coinPrice), [coinPrice, displayFeeAmount]);

  return (
    <Container>
      <LeftContentContainer>
        <NetworkFeeText variant="b3_R">{t('components.Fee.CosmosFee.index.networkFee')}</NetworkFeeText>
        <FeeCustomButton
          onClick={() => {
            setIsOpenFeeCustomBottomSheet(true);
          }}
        >
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
            {t('components.Fee.CosmosFee.index.continue')}
          </StyledButton>
        }
      </RightContentContainer>
      <FeeSettingBottomSheet
        feeAssets={feeAssets}
        selectedFeeCoinId={selectedFeeCoinId}
        gases={gases}
        gasRates={gasRates}
        currentSelectedFeeOptionKey={feeStepKey}
        open={isOpenFeeCustomBottomSheet}
        onClose={() => setIsOpenFeeCustomBottomSheet(false)}
        onChangeGas={(gas) => {
          onChangeGas(gas);
        }}
        onChangeGasRate={(gasRate) => {
          onChangeGasRate(gasRate);
        }}
        onChangeFeeCoinId={(feeCoinId) => {
          onChangeFeeCoinId?.(feeCoinId);
        }}
        onSelectOption={(val) => {
          onClickFeeStep(val);
        }}
      />
    </Container>
  );
}
