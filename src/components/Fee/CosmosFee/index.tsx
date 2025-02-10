import { useState } from 'react';
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
  gasRateKey: number;
  gasRate: string[];
  selectedFeeCoinId: string;
  gas: string;
  feeAssets: CosmosFeeAsset[];
  disableConfirm?: boolean;
  onClickConfirm: () => void;
  onClickGasRate: (gasRateKey: number) => void;
  onChangeGas: (gas: string) => void;
  onChangeFeeCoinId?: (feeCoinId: string) => void;
};

export default function Fee({
  gasRateKey,
  gasRate,
  gas,
  selectedFeeCoinId,
  feeAssets,
  disableConfirm,
  onClickConfirm,
  onClickGasRate,
  onChangeGas,
  onChangeFeeCoinId,
}: FeeProps) {
  const { t } = useTranslation();
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { currency } = useExtensionStorageStore((state) => state);

  const [isOpenFeeCustomBottomSheet, setIsOpenFeeCustomBottomSheet] = useState(false);

  const selectedFeeCoin = feeAssets.find((item) => isMatchingCoinId(item.asset, selectedFeeCoinId));

  const decimals = selectedFeeCoin?.asset.decimals || 0;
  const coinGeckoId = selectedFeeCoin?.asset.coinGeckoId || '';
  const coinSymbol = selectedFeeCoin?.asset.symbol || '';

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[currency]) || 0;

  const feeGasRate = gasRate[gasRateKey];

  const baseFeeAmount = times(feeGasRate, gas);
  const displayFeeAmount = toDisplayDenomAmount(baseFeeAmount, decimals);

  const value = times(displayFeeAmount, coinPrice);

  return (
    <Container>
      <LeftContentContainer>
        <NetworkFeeText variant="b3_R">{t('components.Fee.index.networkFee')}</NetworkFeeText>
        <FeeCustomButton
          onClick={() => {
            setIsOpenFeeCustomBottomSheet(true);
          }}
        >
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
          <StyledButton disabled={disableConfirm} onClick={onClickConfirm}>
            {t('components.Fee.index.continue')}
          </StyledButton>
        }
      </RightContentContainer>
      <FeeSettingBottomSheet
        feeAssets={feeAssets}
        selectedFeeCoinId={selectedFeeCoinId}
        gas={gas}
        currentSelectedFeeOptionKey={gasRateKey}
        open={isOpenFeeCustomBottomSheet}
        onClose={() => setIsOpenFeeCustomBottomSheet(false)}
        onChangeGas={(gas) => {
          onChangeGas?.(gas);
        }}
        onChangeFeeCoinId={(feeCoinId) => {
          onChangeFeeCoinId?.(feeCoinId);
        }}
        onSelectOption={(val) => {
          onClickGasRate(val);
        }}
      />
    </Container>
  );
}
