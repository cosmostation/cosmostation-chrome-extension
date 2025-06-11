import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import CoinSelectBox from '@/components/CoinSelectBox';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import IconButton from '@/components/common/IconButton';
import NumberTypo from '@/components/common/NumberTypo';
import StandardInput from '@/components/common/StandardInput';
import Header from '@/components/Header';
import InformationPanel from '@/components/InformationPanel';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import type { CosmosFeeAsset } from '@/types/cosmos/fee';
import { gt, isDecimal, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  BottomContainer,
  ContentsContainer,
  EstimatedFeeTextContainer,
  FeeContainer,
  HeaderContainer,
  HeaderLeftContainer,
  IconContainer,
  InformationContainer,
  InputContainer,
  Overlay,
} from './styled';

import ArrowBackIcon from '@/assets/images/icons/LeftArrow16.svg';

type FeeCustomOverlayProps = {
  baseGasAmount: string;
  baseGasRate: string;
  feeCoinId: string;
  feeAssets: CosmosFeeAsset[];
  currentSelectedFeeOptionKey: number;
  open?: boolean;
  onClose: () => void;
  onConfirm: (feeCoinId: string, gasAmount?: string, gasRate?: string) => void;
};

export default function FeeCustomOverlay({
  open = false,
  baseGasAmount,
  baseGasRate,
  feeAssets,
  feeCoinId,
  currentSelectedFeeOptionKey,
  onClose,
  onConfirm,
}: FeeCustomOverlayProps) {
  const { t } = useTranslation();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const [inputGasAmount, setInputGasAmount] = useState('');
  const [inputGasRate, setInputGasRate] = useState('');
  const [selectedFeeCoinId, setSelectedFeeCoinId] = useState(feeCoinId);

  const selectedFeeCoin = useMemo(() => feeAssets.find(({ asset }) => getCoinId(asset) === selectedFeeCoinId), [feeAssets, selectedFeeCoinId]);

  const coinSymbol = selectedFeeCoin?.asset.symbol;
  const decimals = selectedFeeCoin?.asset.decimals || 0;

  const isFeeCoinChanged = feeCoinId !== selectedFeeCoinId;
  const isFeeCoinOnlyChanged = isFeeCoinChanged && !inputGasRate && !inputGasAmount;

  const currentGasRate = inputGasRate ? inputGasRate : isFeeCoinChanged ? selectedFeeCoin?.gasRate[currentSelectedFeeOptionKey] || baseGasRate : baseGasRate;
  const currentGas = inputGasAmount || baseGasAmount;

  const displayFeeAmount = useMemo(() => toDisplayDenomAmount(times(currentGasRate, currentGas), decimals), [currentGas, currentGasRate, decimals]);

  const coinPrice = useMemo(
    () => (selectedFeeCoin?.asset.coinGeckoId && coinGeckoPrice?.[selectedFeeCoin?.asset.coinGeckoId]?.[userCurrencyPreference]) || 0,
    [coinGeckoPrice, userCurrencyPreference, selectedFeeCoin?.asset.coinGeckoId],
  );

  const value = useMemo(() => times(displayFeeAmount, coinPrice), [coinPrice, displayFeeAmount]);

  const inputGasAmountErrorMsg = useMemo(() => {
    if (inputGasAmount && (!isDecimal(inputGasAmount, decimals) || !gt(inputGasAmount, '0'))) {
      return t('components.Fee.CosmosFee.components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.inputGasAmountError');
    }
  }, [decimals, inputGasAmount, t]);

  const inputGasRateErrorMsg = useMemo(() => {
    if (inputGasRate && (!isDecimal(inputGasRate, decimals) || !gt(inputGasRate, '0'))) {
      return t('components.Fee.CosmosFee.components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.inputGasRateError');
    }
  }, [decimals, inputGasRate, t]);

  const reset = () => {
    setInputGasAmount('');
    onClose();
  };

  const onHandleConfirm = () => {
    if (isFeeCoinOnlyChanged) {
      onConfirm(selectedFeeCoinId);
    } else {
      onConfirm(selectedFeeCoinId, currentGas, currentGasRate);
    }
    reset();
  };

  if (!open) {
    return null;
  }

  return (
    <Overlay>
      <HeaderContainer>
        <Header
          leftContent={
            <HeaderLeftContainer>
              <IconButton onClick={reset}>
                <IconContainer>
                  <ArrowBackIcon />
                </IconContainer>
              </IconButton>
            </HeaderLeftContainer>
          }
        />
      </HeaderContainer>
      <ContentsContainer>
        <FeeContainer>
          <Base1000Text variant="h3_M">
            {t('components.Fee.CosmosFee.components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.networkFee')}
          </Base1000Text>
          <EstimatedFeeTextContainer>
            <NumberTypo typoOfIntegers="h3n_M" typoOfDecimals="h5n_R" fixed={decimals} isDisableLeadingCurreny>
              {displayFeeAmount}
            </NumberTypo>
            &nbsp;
            <Base1300Text variant="b2_M">{coinSymbol}</Base1300Text>
            &nbsp;
            <Base1300Text variant="b2_M">{'('}</Base1300Text>
            <NumberTypo typoOfIntegers="h3n_M" typoOfDecimals="h5n_R" currency={userCurrencyPreference}>
              {value}
            </NumberTypo>
            <Base1300Text variant="b2_M">{')'}</Base1300Text>
          </EstimatedFeeTextContainer>
        </FeeContainer>
        <InputContainer>
          <CoinSelectBox
            coinList={feeAssets}
            currentCoinId={selectedFeeCoinId}
            onClickCoin={(chainId) => {
              setSelectedFeeCoinId(chainId);
            }}
            label={t('components.Fee.CosmosFee.components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.feeToken')}
            bottomSheetTitle={t('components.Fee.CosmosFee.components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.selectFeeToken')}
          />
          <StandardInput
            label={t('components.Fee.CosmosFee.components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.gasAmount')}
            placeholder={baseGasAmount}
            error={!!inputGasAmountErrorMsg}
            helperText={inputGasAmountErrorMsg}
            value={inputGasAmount}
            onChange={(e) => {
              if (!isDecimal(e.currentTarget.value, decimals || 0) && e.currentTarget.value) {
                return;
              }

              setInputGasAmount(e.currentTarget.value);
            }}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          <StandardInput
            label={t('components.Fee.CosmosFee.components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.gasRate')}
            placeholder={isFeeCoinChanged ? selectedFeeCoin?.gasRate[currentSelectedFeeOptionKey] : baseGasRate}
            error={!!inputGasRateErrorMsg}
            helperText={inputGasRateErrorMsg}
            value={inputGasRate}
            onChange={(e) => {
              if (!isDecimal(e.currentTarget.value, decimals || 0) && e.currentTarget.value) {
                return;
              }

              setInputGasRate(e.currentTarget.value);
            }}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </InputContainer>

        <BottomContainer>
          <InformationContainer>
            <InformationPanel
              varitant="info"
              title={
                <Typography variant="b3_M">
                  {t('components.Fee.CosmosFee.components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.inform')}
                </Typography>
              }
              body={
                <Typography variant="b4_R_Multiline">
                  {t('components.Fee.CosmosFee.components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.informDescription')}
                </Typography>
              }
            />
          </InformationContainer>
          <Button onClick={onHandleConfirm}>{t('components.Fee.CosmosFee.components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.done')}</Button>
        </BottomContainer>
      </ContentsContainer>
    </Overlay>
  );
}
