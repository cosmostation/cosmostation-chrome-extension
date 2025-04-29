import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BalanceDisplay from '@/components/BalanceDisplay';
import Tooltip from '@/components/common/Tooltip';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import type { CosmosFeeAsset } from '@/types/cosmos/fee';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import FeeSettingBottomSheet from './components/FeeSettingBottomSheet';
import { Container, EstimatedFeeTextContainer, FeeCustomButton, LeftContentContainer, NetworkFeeText, RightContentContainer, StyledButton } from './styled';
import Base1300Text from '../../common/Base1300Text';

type FeeProps = {
  feeOptionDatas: {
    gas?: string;
    gasRate: string;
    decimals: number;
    symbol: string;
    coinGeckoId?: string;
    title?: string;
  }[];
  availableFeeAssets: CosmosFeeAsset[];
  selectedCustomFeeCoinId: string;
  currentSelectedFeeOptionKey: number;
  disableConfirm?: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  onClickConfirm: () => void;
  onClickFeeStep: (gasRateKey: number) => void;
  onChangeGas: (gas: string) => void;
  onChangeGasRate: (gasRate: string) => void;
  onChangeFeeCoinId?: (feeCoinId: string) => void;
};

export default function Fee({
  feeOptionDatas,
  availableFeeAssets,
  selectedCustomFeeCoinId,
  currentSelectedFeeOptionKey,
  disableConfirm,
  isLoading,
  errorMessage,
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

  const selectedFee = feeOptionDatas[currentSelectedFeeOptionKey];

  const decimals = selectedFee.decimals || 0;
  const coinGeckoId = selectedFee.coinGeckoId || '';
  const coinSymbol = selectedFee.symbol || '';

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const currentGas = selectedFee.gas || '0';
  const currnetGasRate = selectedFee.gasRate || '0';

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
              <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6} isDisableLeadingCurreny isDisableHidden>
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
                {t('components.Fee.CosmosFee.index.continue')}
              </StyledButton>
            </div>
          </Tooltip>
        }
      </RightContentContainer>
      <FeeSettingBottomSheet
        feeOptionDatas={feeOptionDatas}
        availableFeeAssets={availableFeeAssets}
        selectedCustomFeeCoinId={selectedCustomFeeCoinId}
        currentSelectedFeeOptionKey={currentSelectedFeeOptionKey}
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
