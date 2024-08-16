import { useMemo, useState } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, equal, gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getCapitalize } from '~/Popup/utils/common';
import type { FeeCoin, GasRate, GasRateKey } from '~/types/chain';

import FeeSettingDialog from './components/FeeSettingDialog';
import GasSettingDialog from './components/GasSettingDialog';
import {
  ArrowIconContainer,
  BodyContainer,
  Container,
  FeeButton,
  FeeButtonContainer,
  FeeCoinButton,
  FeeCoinContentContainer,
  FeeCoinContentLeftContainer,
  FeeCoinDenomContainer,
  FeeCoinImageContainer,
  FeeInfoContainer,
  GasButton,
  HeaderContainer,
  HeaderLeftContainer,
  HeaderLeftIconContainer,
  LeftContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightContainer,
  RightValueContainer,
} from './styled';
import Tooltip from '../common/Tooltip';

import BottomArrow from '~/images/icons/BottomArrow.svg';
import Info16Icon from '~/images/icons/Info16.svg';
import UpArrow from '~/images/icons/UpArrow.svg';

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
  const { extensionStorage } = useExtensionStorage();
  const { decimals, displayDenom, coinGeckoId, imageURL } = feeCoin;

  const { t } = useTranslation();

  const [isOpenGasDialog, setIsOpenGasDialog] = useState(false);
  const [isOpenFeeDialog, setIsOpenFeeDialog] = useState(false);

  const { currency } = extensionStorage;

  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const chainPrice = useMemo(
    () => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[extensionStorage.currency]) || 0,
    [coinGeckoId, coinGeckoPrice.data, extensionStorage.currency],
  );

  const ceiledBaseFee = useMemo(() => ceil(baseFee), [baseFee]);

  const displayFee = useMemo(() => toDisplayDenomAmount(ceiledBaseFee, decimals), [ceiledBaseFee, decimals]);
  const value = useMemo(() => times(displayFee, chainPrice), [chainPrice, displayFee]);

  const gasRateKeys = useMemo(() => Object.keys(gasRate), [gasRate]);

  const baseFeeValues = useMemo(
    () =>
      gasRateKeys.reduce((acc: GasRate, key) => {
        acc[key] = ceil(times(gasRate[key], gas));
        return acc;
      }, {}),
    [gas, gasRate, gasRateKeys],
  );

  const currentGasRate = useMemo(() => {
    const matchedKey = gasRateKeys.find((key) => equal(baseFeeValues[key], ceiledBaseFee));

    if (matchedKey) {
      return gasRate[matchedKey];
    }

    return gt(gas, '0') ? divide(baseFee, gas) : '0';
  }, [baseFee, baseFeeValues, ceiledBaseFee, gas, gasRate, gasRateKeys]);

  if (isEdit) {
    return (
      <>
        <Container>
          <HeaderContainer>
            <HeaderLeftContainer>
              <Typography variant="h5">{t('components.Fee.index.fee')}</Typography>
              <Tooltip title={t('components.Fee.index.feeInfo')} arrow placement="top">
                <HeaderLeftIconContainer>
                  <Info16Icon />
                </HeaderLeftIconContainer>
              </Tooltip>
            </HeaderLeftContainer>
            <RightContainer>
              <GasButton type="button" onClick={() => setIsOpenGasDialog(true)}>
                <Typography variant="h6">{t('components.Fee.index.gasSettings')}</Typography>
              </GasButton>
            </RightContainer>
          </HeaderContainer>
          <BodyContainer>
            <FeeCoinButton
              onClick={() => {
                setIsOpenFeeDialog(true);
              }}
              type="button"
            >
              <FeeCoinContentContainer>
                <FeeCoinContentLeftContainer>
                  <FeeCoinImageContainer>
                    <Image src={imageURL} />
                  </FeeCoinImageContainer>
                  <FeeCoinDenomContainer>
                    <div>
                      <Typography variant="h7">{displayDenom}</Typography>
                    </div>
                  </FeeCoinDenomContainer>
                </FeeCoinContentLeftContainer>
                <ArrowIconContainer>{isOpenFeeDialog ? <UpArrow /> : <BottomArrow />}</ArrowIconContainer>
              </FeeCoinContentContainer>
            </FeeCoinButton>

            <RightColumnContainer>
              <RightAmountContainer>
                <FeeCoinDenomContainer>
                  <div>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                      {displayFee}
                    </Number>
                  </div>
                </FeeCoinDenomContainer>
                &nbsp;
                <FeeCoinDenomContainer>
                  <div>
                    <Typography variant="h5n">{displayDenom}</Typography>
                  </div>
                </FeeCoinDenomContainer>
              </RightAmountContainer>
              <RightValueContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                  {value}
                </Number>
              </RightValueContainer>
            </RightColumnContainer>
          </BodyContainer>
          <FeeButtonContainer>
            {gasRateKeys.map((key) => {
              const gasRateValue = gasRate[key];

              const buttonText = getCapitalize(key);

              return (
                <FeeButton
                  key={key}
                  type="button"
                  onClick={() => {
                    onChangeFee?.(times(gasRateValue, gas));
                    onChangeGasRateKey?.(key);
                  }}
                  data-is-active={equal(currentGasRate, gasRateValue) ? 1 : 0}
                >
                  <Typography variant="h7">{buttonText}</Typography>
                </FeeButton>
              );
            })}
          </FeeButtonContainer>
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
