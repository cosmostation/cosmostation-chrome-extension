import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BalanceDisplay from '@/components/BalanceDisplay';
import Tooltip from '@/components/common/Tooltip';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Container, EstimatedFeeTextContainer, FeeCustomButton, LeftContentContainer, NetworkFeeText, RightContentContainer, StyledButton } from './styled';
import Base1300Text from '../../common/Base1300Text';
import type { FeeOption } from '../EVMFee/components/FeeSettingBottomSheet';
import FeeSettingBottomSheet from '../EVMFee/components/FeeSettingBottomSheet';

type EVMFeeProps = {
  feeOptionDatas: FeeOption[];
  currentSelectedFeeOptionKey: number;
  disableConfirm?: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  onClickConfirm: () => void;
  onClickFeeStep: (gasRateKey: number) => void;
  onChangeGas: (gas: string) => void;
  onChangeGasPrice?: (gasPrice: string) => void;
  onChangeMaxBaseFee?: (maxBaseFee: string) => void;
  onChangePriorityFee?: (priorityFee: string) => void;
};

export default function EVMFee({
  feeOptionDatas,
  currentSelectedFeeOptionKey,
  disableConfirm,
  isLoading,
  errorMessage,
  onClickConfirm,
  onClickFeeStep,
  onChangeGas,
  onChangeGasPrice,
  onChangeMaxBaseFee,
  onChangePriorityFee,
}: EVMFeeProps) {
  const { t } = useTranslation();
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const selectedFeeOption = feeOptionDatas[currentSelectedFeeOptionKey] ? feeOptionDatas[currentSelectedFeeOptionKey] : null;

  const [isOpenFeeCustomBottomSheet, setIsOpenFeeCustomBottomSheet] = useState(false);

  const decimals = selectedFeeOption?.decimals || 0;
  const coinGeckoId = selectedFeeOption?.coinGeckoId || '';
  const coinSymbol = selectedFeeOption?.symbol || '';

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const feeGasRate = useMemo(() => {
    if (selectedFeeOption?.type === 'EIP-1559') {
      return selectedFeeOption.maxBaseFeePerGas || '0';
    }
    return selectedFeeOption?.gasPrice || '0';
  }, [selectedFeeOption]);

  const gas = selectedFeeOption?.gas || '0';

  const baseFeeAmount = useMemo(() => times(feeGasRate, gas), [feeGasRate, gas]);

  const displayFeeAmount = useMemo(() => toDisplayDenomAmount(baseFeeAmount, decimals), [baseFeeAmount, decimals]);

  const value = useMemo(() => times(displayFeeAmount, coinPrice), [coinPrice, displayFeeAmount]);

  return (
    <Container>
      <LeftContentContainer>
        <NetworkFeeText variant="b3_R">{t('components.Fee.EVMFee.index.networkFee')}</NetworkFeeText>
        <FeeCustomButton
          onClick={() => {
            setIsOpenFeeCustomBottomSheet(true);
          }}
        >
          {displayFeeAmount ? (
            <EstimatedFeeTextContainer>
              <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference} fixed={6} isDisableLeadingCurreny isDisableHidden>
                {displayFeeAmount}
              </BalanceDisplay>
              &nbsp;
              <Base1300Text variant="h7n_M">{coinSymbol}</Base1300Text>
              &nbsp;
              <Base1300Text variant="b2_M">{'('}</Base1300Text>
              <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference} isDisableHidden>
                {value}
              </BalanceDisplay>
              <Base1300Text variant="b2_M">{')'}</Base1300Text>
            </EstimatedFeeTextContainer>
          ) : (
            <Base1300Text variant="b2_M">{'-'}</Base1300Text>
          )}
        </FeeCustomButton>
      </LeftContentContainer>
      <RightContentContainer>
        {
          <Tooltip title={errorMessage} varient="error" placement="top">
            <div>
              <StyledButton isProgress={isLoading} disabled={disableConfirm} onClick={onClickConfirm}>
                {t('components.Fee.EVMFee.index.continue')}
              </StyledButton>
            </div>
          </Tooltip>
        }
      </RightContentContainer>
      <FeeSettingBottomSheet
        feeOptionDatas={feeOptionDatas}
        feeType={selectedFeeOption?.type || null}
        currentSelectedFeeOptionKey={currentSelectedFeeOptionKey}
        open={isOpenFeeCustomBottomSheet}
        onClose={() => setIsOpenFeeCustomBottomSheet(false)}
        onChangeGas={(gas) => {
          onChangeGas(gas);
        }}
        onChangeGasPrice={(price) => {
          onChangeGasPrice?.(price);
        }}
        onChangeMaxBaseFee={(fee) => {
          onChangeMaxBaseFee?.(fee);
        }}
        onChangePriorityFee={(fee) => {
          onChangePriorityFee?.(fee);
        }}
        onSelectOption={(val) => {
          onClickFeeStep(val);
        }}
      />
    </Container>
  );
}
