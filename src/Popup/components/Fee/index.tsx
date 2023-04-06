import { useState } from 'react';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, equal, gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { FeeCoin, GasRate, GasRateKey } from '~/types/chain';

import FeeSettingDialog from './components/FeeSettingDialog';
import GasSettingDialog from './components/GasSettingDialog';
import {
  Container,
  EditContainer,
  EditLeftContainer,
  EditRightContainer,
  FeeButton,
  FeeButtonContainer,
  FeeInfoContainer,
  FeeSettingButton,
  GasButton,
  LeftContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightContainer,
  RightValueContainer,
} from './styled';

import ChangeIcon from '~/images/icons/Change.svg';

type FeeProps = {
  feeCoin: FeeCoin;
  feeCoinList: FeeCoin[];
  isEdit?: boolean;
  baseFee: string;
  gas: string;
  gasRate: GasRate;
  onChangeGasRateKey?: (key: GasRateKey) => void;
  onChangeFee?: (fee: string) => void;
  onChangeGas?: (gas: string) => void;
  onChangeFeeCoin?: (selectedFeeCoin: FeeCoin) => void;
};

export default function Fee({
  isEdit = false,
  gasRate,
  baseFee,
  gas,
  feeCoin,
  feeCoinList,
  onChangeFee,
  onChangeGasRateKey,
  onChangeGas,
  onChangeFeeCoin,
}: FeeProps) {
  const { chromeStorage } = useChromeStorage();
  const { decimals, displayDenom, coinGeckoId } = feeCoin;

  const { average, tiny, low } = gasRate;

  const { t } = useTranslation();

  const [isOpenGasDialog, setIsOpenGasDialog] = useState(false);
  const [isOpenFeeDialog, setIsOpenFeeDialog] = useState(false);

  const { currency } = chromeStorage;

  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const chainPrice = (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[chromeStorage.currency]) || 0;

  const displayFee = toDisplayDenomAmount(ceil(baseFee), decimals);
  const value = times(displayFee, chainPrice);

  const currentGasRate = gt(gas, '0') ? divide(baseFee, gas) : '0';

  if (isEdit) {
    return (
      <>
        <Container>
          <FeeInfoContainer>
            <LeftContainer>
              <FeeSettingButton type="button" onClick={() => setIsOpenFeeDialog(true)}>
                <Typography variant="h5">{t('components.Fee.index.fee')}</Typography>
                <ChangeIcon />
              </FeeSettingButton>
            </LeftContainer>
            <RightContainer>
              <RightColumnContainer>
                <RightAmountContainer>
                  <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                    {displayFee}
                  </Number>
                  &nbsp;
                  <Typography variant="h5n">{displayDenom}</Typography>
                </RightAmountContainer>
                <RightValueContainer>
                  <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                    {value}
                  </Number>
                </RightValueContainer>
              </RightColumnContainer>
            </RightContainer>
          </FeeInfoContainer>
          <EditContainer>
            <EditLeftContainer>
              <GasButton type="button" onClick={() => setIsOpenGasDialog(true)}>
                <Typography variant="h6">{t('components.Fee.index.gasSettings')}</Typography>
              </GasButton>
            </EditLeftContainer>
            <EditRightContainer>
              <FeeButtonContainer>
                <FeeButton
                  type="button"
                  onClick={() => {
                    onChangeFee?.(times(tiny, gas));
                    onChangeGasRateKey?.('tiny');
                  }}
                  data-is-active={equal(currentGasRate, tiny) ? 1 : 0}
                >
                  {t('components.Fee.index.tiny')}
                </FeeButton>
                <FeeButton
                  type="button"
                  onClick={() => {
                    onChangeFee?.(times(low, gas));
                    onChangeGasRateKey?.('low');
                  }}
                  data-is-active={equal(currentGasRate, low) ? 1 : 0}
                >
                  {t('components.Fee.index.low')}
                </FeeButton>
                <FeeButton
                  type="button"
                  onClick={() => {
                    onChangeFee?.(times(average, gas));
                    onChangeGasRateKey?.('average');
                  }}
                  data-is-active={equal(currentGasRate, average) ? 1 : 0}
                >
                  {t('components.Fee.index.average')}
                </FeeButton>
              </FeeButtonContainer>
            </EditRightContainer>
          </EditContainer>
        </Container>
        <GasSettingDialog
          open={isOpenGasDialog}
          currentGas={gas}
          onClose={() => setIsOpenGasDialog(false)}
          onSubmitGas={(gasData) => {
            onChangeFee?.(times(currentGasRate, gasData.gas));
            onChangeGas?.(String(gasData.gas));
          }}
        />
        <FeeSettingDialog
          open={isOpenFeeDialog}
          onClose={() => setIsOpenFeeDialog(false)}
          currentFeeCoin={feeCoin}
          feeCoinList={feeCoinList}
          onChangeFeeCoin={(selectedFeeCoin) => {
            onChangeFeeCoin?.(selectedFeeCoin);
          }}
        />
      </>
    );
  }

  return (
    <Container>
      <FeeInfoContainer>
        <LeftContainer>
          <Typography variant="h5">{t('components.Fee.index.fee')}</Typography>
        </LeftContainer>
        <RightContainer>
          <RightColumnContainer>
            <RightAmountContainer>
              <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                {displayFee}
              </Number>
              &nbsp;
              <Typography variant="h5n">{displayDenom}</Typography>
            </RightAmountContainer>
            <RightValueContainer>
              <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                {value}
              </Number>
            </RightValueContainer>
          </RightColumnContainer>
        </RightContainer>
      </FeeInfoContainer>
    </Container>
  );
}
