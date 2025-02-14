import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gt } from 'lodash';
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
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { Route as Home } from '@/pages/index';
import { isDecimal, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers';
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

type EIP1559FeeCustomOverlayProps = {
  baseGasAmount: string;
  baseMaxBaseFeeAmount: string;
  basePriorityFeeAmount: string;
  open?: boolean;
  feeCoinId?: string;
  onClose: () => void;
  onConfirm: (gasAmount: string, maxBaseFeeAmount: string, priorityFeeAmount: string) => void;
};

export default function EIP1559FeeCustomOverlay({
  open = false,
  baseMaxBaseFeeAmount,
  basePriorityFeeAmount,
  baseGasAmount,
  feeCoinId,
  onClose,
  onConfirm,
}: EIP1559FeeCustomOverlayProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { currency } = useExtensionStorageStore((state) => state);

  const [inputGasAmount, setInputGasAmount] = useState('');
  const [inputMaxBaseFeeAmount, setInputMaxBaseFeeAmount] = useState('');
  const [inputPriorityFeeAmount, setInputPriorityFeeAmount] = useState('');

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  const { getEVMAccountAsset } = useGetAccountAsset({ coinId: feeCoinId || '' });

  const selectedFeeCoin = getEVMAccountAsset();

  const coinSymbol = selectedFeeCoin?.asset.symbol;
  const decimals = selectedFeeCoin?.asset.decimals || 0;

  const baseMaxBaseFeeAmountInGwei = toDisplayDenomAmount(baseMaxBaseFeeAmount, 9);
  const basePriorityFeeAmountInGwei = toDisplayDenomAmount(basePriorityFeeAmount, 9);

  const currentMaxBaseFeeAmount = inputMaxBaseFeeAmount || baseMaxBaseFeeAmountInGwei || '0';
  const currentPriorityFeeAmount = inputPriorityFeeAmount || basePriorityFeeAmountInGwei || '0';

  const currentGas = inputGasAmount || baseGasAmount;

  const displayFeeAmount = useMemo(
    () => toDisplayDenomAmount(times(toBaseDenomAmount(currentMaxBaseFeeAmount, 9), currentGas), decimals),
    [currentGas, currentMaxBaseFeeAmount, decimals],
  );

  const coinPrice = useMemo(
    () => (selectedFeeCoin?.asset.coinGeckoId && coinGeckoPrice?.[selectedFeeCoin?.asset.coinGeckoId]?.[currency]) || 0,
    [selectedFeeCoin, coinGeckoPrice, currency],
  );

  const value = useMemo(() => times(displayFeeAmount, coinPrice), [coinPrice, displayFeeAmount]);

  const inputGasAmountErrorMsg = useMemo(() => {
    if (inputGasAmount && (!isDecimal(inputGasAmount, decimals) || !gt(inputGasAmount, '0'))) {
      return t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.EIP1559FeeCustomOverlay.index.inputGasAmountError');
    }
  }, [decimals, inputGasAmount, t]);

  const inputMaxBaseFeeAmountErrorMsg = useMemo(() => {
    if (inputMaxBaseFeeAmount && !isDecimal(inputMaxBaseFeeAmount, decimals)) {
      return t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.EIP1559FeeCustomOverlay.index.inputMaxBaseFeeAmountError');
    }
  }, [decimals, inputMaxBaseFeeAmount, t]);

  const inputPriorityFeeAmountErrorMsg = useMemo(() => {
    if (inputPriorityFeeAmount && (!isDecimal(inputPriorityFeeAmount, decimals) || gt(inputPriorityFeeAmount, currentMaxBaseFeeAmount))) {
      return t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.EIP1559FeeCustomOverlay.index.inputPriorityFeeAmountError');
    }
  }, [currentMaxBaseFeeAmount, decimals, inputPriorityFeeAmount, t]);

  const reset = () => {
    setInputGasAmount('');
    onClose();
  };

  const onHandleConfirm = () => {
    onConfirm(currentGas, toBaseDenomAmount(currentMaxBaseFeeAmount, 9), toBaseDenomAmount(currentPriorityFeeAmount, 9));
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
          <Base1000Text variant="h3_M">
            {t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.EIP1559FeeCustomOverlay.index.networkFee')}
          </Base1000Text>
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
            coinList={accountAllAssets?.allEVMAccountAssets || []}
            currentCoinId={feeCoinId}
            label={t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.EIP1559FeeCustomOverlay.index.feeToken')}
            disabled
          />
          <StandardInput
            label={t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.EIP1559FeeCustomOverlay.index.gasAmount')}
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
            label={t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.EIP1559FeeCustomOverlay.index.maxbaseFee')}
            placeholder={baseMaxBaseFeeAmountInGwei}
            error={!!inputMaxBaseFeeAmountErrorMsg}
            helperText={inputMaxBaseFeeAmountErrorMsg}
            value={inputMaxBaseFeeAmount}
            onChange={(e) => {
              if (!isDecimal(e.currentTarget.value, decimals || 0) && e.currentTarget.value) {
                return;
              }

              setInputMaxBaseFeeAmount(e.currentTarget.value);
            }}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          <StandardInput
            label={t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.EIP1559FeeCustomOverlay.index.priorityFee')}
            placeholder={basePriorityFeeAmountInGwei}
            error={!!inputPriorityFeeAmountErrorMsg}
            helperText={inputPriorityFeeAmountErrorMsg}
            value={inputPriorityFeeAmount}
            onChange={(e) => {
              if (!isDecimal(e.currentTarget.value, decimals || 0) && e.currentTarget.value) {
                return;
              }

              setInputPriorityFeeAmount(e.currentTarget.value);
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
                  {t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.EIP1559FeeCustomOverlay.index.inform')}
                </Typography>
              }
              body={
                <Typography variant="b4_R_Multiline">
                  {t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.EIP1559FeeCustomOverlay.index.informDescription')}
                </Typography>
              }
            />
          </InformationContainer>
          <Button onClick={onHandleConfirm}>{t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.EIP1559FeeCustomOverlay.index.done')}</Button>
        </BottomContainer>
      </ContentsContainer>
    </Overlay>
  );
}
