import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

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
import { Route as Home } from '@/pages/index';
import type { CosmosFeeAsset } from '@/types/cosmos/fee';
import { isDecimal, times, toDisplayDenomAmount } from '@/utils/numbers';
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

import HomeIcon from '@/assets/images/icons/Home14.svg';
import ArrowBackIcon from '@/assets/images/icons/LeftArrow14.svg';

type FeeCustomOverlayProps = {
  baseGasAmount: string;
  open?: boolean;
  feeCoinId?: string;
  feeAssets: CosmosFeeAsset[];
  currentSelectedFeeOptionKey?: number;
  onClose: () => void;
  onConfirm: (feeCoinId: string, gasAmount: string) => void;
};

export default function FeeCustomOverlay({
  open = false,
  baseGasAmount,
  feeAssets,
  currentSelectedFeeOptionKey,
  feeCoinId,
  onClose,
  onConfirm,
}: FeeCustomOverlayProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { currency } = useExtensionStorageStore((state) => state);

  const [inputGasAmount, setInputGasAmount] = useState('');
  const [selectedFeeCoinId, setSelectedFeeCoinId] = useState(feeCoinId);

  const selectedFeeCoin = feeAssets.find(({ asset }) => getCoinId(asset) === selectedFeeCoinId);

  const coinSymbol = selectedFeeCoin?.asset.symbol;
  const decimals = selectedFeeCoin?.asset.decimals || 0;

  const currentGasRate = selectedFeeCoin?.gasRate[currentSelectedFeeOptionKey || 0] || 0;
  const currentGas = inputGasAmount || baseGasAmount;

  const displayFeeAmount = toDisplayDenomAmount(times(currentGasRate, currentGas), decimals);

  const chainPrice = (selectedFeeCoin?.asset.coinGeckoId && coinGeckoPrice?.[selectedFeeCoin?.asset.coinGeckoId]?.[currency]) || 0;

  const value = times(displayFeeAmount, chainPrice);

  const reset = () => {
    setInputGasAmount('');
    onClose();
  };

  const onHandleConfirm = () => {
    if (!inputGasAmount && selectedFeeCoinId) {
      onConfirm(selectedFeeCoinId, baseGasAmount);
    }

    if (inputGasAmount && selectedFeeCoinId) {
      onConfirm(selectedFeeCoinId, inputGasAmount);
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
              <IconButton
                onClick={() => {
                  navigate({
                    to: Home.to,
                  });
                }}
              >
                <IconContainer>
                  <HomeIcon />
                </IconContainer>
              </IconButton>
            </HeaderLeftContainer>
          }
        />
      </HeaderContainer>
      <ContentsContainer>
        <FeeContainer>
          <Base1000Text variant="h3_M">{t('components.Fee.Components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.networkFee')}</Base1000Text>
          <EstimatedFeeTextContainer>
            <NumberTypo typoOfIntegers="h3n_M" typoOfDecimals="h5n_R" currency={currency} fixed={decimals} isDisableLeadingCurreny>
              {displayFeeAmount}
            </NumberTypo>
            &nbsp;
            <Base1300Text variant="b2_M">{coinSymbol}</Base1300Text>
            &nbsp;
            <Base1300Text variant="b2_M">{'('}</Base1300Text>
            <NumberTypo typoOfIntegers="h3n_M" typoOfDecimals="h5n_R" currency={currency}>
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
            label={t('components.Fee.Components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.feeToken')}
            bottomSheetTitle={t('components.Fee.Components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.selectFeeToken')}
          />
          <StandardInput
            label={t('components.Fee.Components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.gasAmount')}
            placeholder={baseGasAmount}
            // error={!!errors.password}
            // helperText={errors.password?.message}
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
        </InputContainer>

        <BottomContainer>
          <InformationContainer>
            <InformationPanel
              varitant="info"
              title={<Typography variant="b3_M">{t('components.Fee.Components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.inform')}</Typography>}
              body={
                <Typography variant="b4_R_Multiline">
                  {t('components.Fee.Components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.informDescription')}
                </Typography>
              }
            />
          </InformationContainer>
          <Button onClick={onHandleConfirm}>{t('components.Fee.Components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.done')}</Button>
        </BottomContainer>
      </ContentsContainer>
    </Overlay>
  );
}
