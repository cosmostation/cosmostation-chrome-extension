import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import IconButton from '@/components/common/IconButton';
import NumberTypo from '@/components/common/NumberTypo';
import StandardInput from '@/components/common/StandardInput';
import Header from '@/components/Header';
import InformationPanel from '@/components/InformationPanel';
import { Route as Home } from '@/pages/index';
import { isDecimal } from '@/utils/numbers';
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
  Overlay,
} from './styled';

import HomeIcon from '@/assets/images/icons/Home14.svg';
import ArrowBackIcon from '@/assets/images/icons/LeftArrow14.svg';

type FeeCustomOverlayProps = {
  open?: boolean;
  onClose: () => void;
  onConfirm: (feeCoinId: string, gasAmount: string) => void;
};

export default function FeeCustomOverlay({ open = false, onClose, onConfirm }: FeeCustomOverlayProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currency } = useExtensionStorageStore((state) => state);

  const [inputGasAmount, setInputGasAmount] = useState('');

  const amount = '0.000013';
  const value = '0.0006';
  const coinSymbol = 'ATOM';
  const decimals = 6;
  const selectedFeeCoinId = 'cosmos';

  const reset = () => {
    setInputGasAmount('');
    onClose();
  };

  const onHandleConfirm = () => {
    if (inputGasAmount) {
      onConfirm(inputGasAmount, selectedFeeCoinId);
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
          <Base1000Text variant="b3_M">{t('components.Fee.Components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.networkFee')}</Base1000Text>
          <EstimatedFeeTextContainer>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={currency} fixed={decimals} isDisableLeadingCurreny>
              {amount}
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
        </FeeContainer>
        {/* TODO - CoinSelectBox */}
        <StandardInput
          label={t('components.Fee.Components.FeeSettingBottomSheet.components.FeeCustomOverlay.index.gasAmount')}
          placeholder="1000.000"
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
