import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import type { UniqueChainId } from '@/types/chain';
import type { FeeType } from '@/types/evm/fee';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import FeeSettingBottomSheet from './components/FeeSettingBottomSheet';
import { Container, EstimatedFeeTextContainer, FeeCustomButton, LeftContentContainer, NetworkFeeText, RightContentContainer, StyledButton } from './styled';
import Base1300Text from '../../common/Base1300Text';
import NumberTypo from '../../common/NumberTypo';

type EVMFeeProps = {
  feeStepKey: number;
  gasRate?: string[];
  gas: string;
  chainId: UniqueChainId;
  feeType: FeeType | null;
  defaultFeeOption: {
    maxBaseFeePerGas: string | undefined;
    maxPriorityFeePerGas: string | undefined;
    gasPrice: string | undefined;
    gas: string;
  };
  disableConfirm?: boolean;
  isLoading?: boolean;
  onClickConfirm: () => void;
  onClickFeeStep: (gasRateKey: number) => void;
  onChangeGas: (gas: string) => void;
  onChangeGasPrice?: (gasPrice: string) => void;
  onChangeMaxBaseFee?: (maxBaseFee: string) => void;
  onChangePriorityFee?: (priorityFee: string) => void;
};

export default function EVMFee({
  feeStepKey,
  gasRate,
  gas,
  chainId,
  feeType,
  defaultFeeOption,
  disableConfirm,
  isLoading,
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

  const parsedChainId = parseUniqueChainId(chainId);
  const feeCoinId = getCoinId({
    id: NATIVE_EVM_COIN_ADDRESS,
    chainId: parsedChainId.id,
    chainType: parsedChainId.chainType,
  });

  const { getEVMAccountAsset } = useGetAccountAsset({ coinId: feeCoinId });

  const selectedFeeCoin = getEVMAccountAsset();

  const [isOpenFeeCustomBottomSheet, setIsOpenFeeCustomBottomSheet] = useState(false);

  const decimals = selectedFeeCoin?.asset.decimals || 0;
  const coinGeckoId = selectedFeeCoin?.asset.coinGeckoId || '';
  const coinSymbol = selectedFeeCoin?.asset.symbol || '';

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const feeGasRate = gasRate?.[feeStepKey] || '0';

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
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference} fixed={6} isDisableLeadingCurreny>
                {displayFeeAmount}
              </NumberTypo>
              &nbsp;
              <Base1300Text variant="h7n_M">{coinSymbol}</Base1300Text>
              &nbsp;
              <Base1300Text variant="b2_M">{'('}</Base1300Text>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference}>
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
          <StyledButton isProgress={isLoading} disabled={disableConfirm} onClick={onClickConfirm}>
            {t('components.Fee.EVMFee.index.continue')}
          </StyledButton>
        }
      </RightContentContainer>
      <FeeSettingBottomSheet
        gasRate={gasRate}
        feeCoinId={feeCoinId}
        gas={gas}
        defaultFeeOption={defaultFeeOption}
        currentSelectedFeeOptionKey={feeStepKey}
        feeType={feeType}
        open={isOpenFeeCustomBottomSheet}
        onClose={() => setIsOpenFeeCustomBottomSheet(false)}
        onChangeGas={(gas) => {
          onChangeGas?.(gas);
        }}
        onChangeGasPrice={(gasPrice) => {
          onChangeGasPrice?.(gasPrice);
        }}
        onChangeMaxBaseFee={(maxBaseFee) => {
          onChangeMaxBaseFee?.(maxBaseFee);
        }}
        onChangePriorityFee={(priorityFee) => {
          onChangePriorityFee?.(priorityFee);
        }}
        onSelectOption={(val) => {
          onClickFeeStep(val);
        }}
      />
    </Container>
  );
}
