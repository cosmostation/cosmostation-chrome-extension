import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gt } from 'lodash';
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
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { isDecimal, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers';
import { trimTrailingZeros } from '@/utils/string';
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

type GasPriceCustomOverlayProps = {
  baseGasAmount: string;
  baseGasPrice: string;
  open?: boolean;
  feeCoinId?: string;
  onClose: () => void;
  onConfirm: (gasAmount: string, gasPrice: string) => void;
};

export default function GasPriceCustomOverlay({ open = false, baseGasAmount, baseGasPrice, feeCoinId, onClose, onConfirm }: GasPriceCustomOverlayProps) {
  const { t } = useTranslation();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const [inputGasAmount, setInputGasAmount] = useState('');
  const [inputGasPrice, setInputGasPrice] = useState('');

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  const { getEVMAccountAsset } = useGetAccountAsset({ coinId: feeCoinId || '' });

  const selectedFeeCoin = getEVMAccountAsset();

  const coinSymbol = selectedFeeCoin?.asset.symbol;
  const decimals = selectedFeeCoin?.asset.decimals || 0;

  const currentGas = inputGasAmount || baseGasAmount;

  const baseGasPriceInGwei = trimTrailingZeros(toDisplayDenomAmount(baseGasPrice, 9));
  const currentGasPrice = inputGasPrice || baseGasPriceInGwei || '0';

  const displayFeeAmount = useMemo(
    () => trimTrailingZeros(toDisplayDenomAmount(times(toBaseDenomAmount(currentGasPrice, 9), currentGas), decimals)),
    [currentGas, currentGasPrice, decimals],
  );

  const chainPrice = useMemo(
    () => (selectedFeeCoin?.asset.coinGeckoId && coinGeckoPrice?.[selectedFeeCoin?.asset.coinGeckoId]?.[userCurrencyPreference]) || 0,
    [coinGeckoPrice, userCurrencyPreference, selectedFeeCoin?.asset.coinGeckoId],
  );

  const value = useMemo(() => times(displayFeeAmount, chainPrice), [chainPrice, displayFeeAmount]);

  const inputGasAmountErrorMsg = useMemo(() => {
    if (inputGasAmount && (!isDecimal(inputGasAmount, decimals) || !gt(inputGasAmount, '0'))) {
      return t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.GasPriceCustomOverlay.index.inputGasAmountError');
    }
  }, [decimals, inputGasAmount, t]);

  const inputGasPriceErrorMsg = useMemo(() => {
    if (inputGasPrice && !isDecimal(inputGasPrice, decimals)) {
      return t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.GasPriceCustomOverlay.index.inputMaxBaseFeeAmountError');
    }
  }, [decimals, inputGasPrice, t]);

  const reset = () => {
    setInputGasAmount('');
    onClose();
  };

  const onHandleConfirm = () => {
    onConfirm(currentGas, toBaseDenomAmount(currentGasPrice, 9));
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
            {t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.GasPriceCustomOverlay.index.networkFee')}
          </Base1000Text>
          <EstimatedFeeTextContainer>
            <NumberTypo typoOfIntegers="h3n_M" typoOfDecimals="h5n_R" isDisableLeadingCurreny>
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
            coinList={accountAllAssets?.allEVMAccountAssets || []}
            currentCoinId={feeCoinId}
            label={t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.GasPriceCustomOverlay.index.feeToken')}
            disabled
          />
          <StandardInput
            label={t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.GasPriceCustomOverlay.index.gasAmount')}
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
            label={t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.GasPriceCustomOverlay.index.gasPrice')}
            placeholder={baseGasPriceInGwei}
            error={!!inputGasPriceErrorMsg}
            helperText={inputGasPriceErrorMsg}
            value={inputGasPrice}
            onChange={(e) => {
              if (!isDecimal(e.currentTarget.value, decimals || 0) && e.currentTarget.value) {
                return;
              }

              setInputGasPrice(e.currentTarget.value);
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
                  {t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.GasPriceCustomOverlay.index.inform')}
                </Typography>
              }
              body={
                <Typography variant="b4_R_Multiline">
                  {t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.GasPriceCustomOverlay.index.informDescription')}
                </Typography>
              }
            />
          </InformationContainer>
          <Button onClick={onHandleConfirm}>{t('components.Fee.EVMFee.Components.FeeSettingBottomSheet.components.GasPriceCustomOverlay.index.done')}</Button>
        </BottomContainer>
      </ContentsContainer>
    </Overlay>
  );
}
