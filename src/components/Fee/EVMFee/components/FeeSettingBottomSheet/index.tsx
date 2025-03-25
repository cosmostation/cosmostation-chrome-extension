import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import TextButton from '@/components/common/TextButton';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import type { FeeType } from '@/types/evm/fee';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import EIP1559FeeCustomOverlay from './components/EIP1559FeeCustomOverlay';
import GasPriceCustomOverlay from './components/GasPriceCustomOverlay';
import OptionButton from './components/OptionButton';
import { Body, Container, FeeCustomContainer, Header, HeaderTitle, StyledBottomSheet } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type FeeSettingBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  feeCoinId: string;
  gas: string;
  gasRate?: string[];
  feeType: FeeType | null;
  currentSelectedFeeOptionKey?: number;
  defaultFeeOption: {
    maxBaseFeePerGas: string | undefined;
    maxPriorityFeePerGas: string | undefined;
    gasPrice: string | undefined;
    gas: string;
  };
  onSelectOption?: (id: number) => void;
  onChangeGas?: (gas: string) => void;
  onChangeGasPrice?: (gasPrice: string) => void;
  onChangeMaxBaseFee?: (maxBaseFee: string) => void;
  onChangePriorityFee?: (priorityFee: string) => void;
};

export default function FeeSettingBottomSheet({
  gasRate,
  feeCoinId,
  gas,
  feeType,
  currentSelectedFeeOptionKey,
  defaultFeeOption,
  onClose,
  onSelectOption,
  onChangeGas,
  onChangeGasPrice,
  onChangeMaxBaseFee,
  onChangePriorityFee,
  ...remainder
}: FeeSettingBottomSheetProps) {
  const { t } = useTranslation();
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const [isOpenFeeCustomOverlay, setIsOpenFeeCustomOverlay] = useState(false);

  const { getEVMAccountAsset } = useGetAccountAsset({ coinId: feeCoinId });

  const selectedFeeCoin = getEVMAccountAsset();

  const coinGeckoId = selectedFeeCoin?.asset.coinGeckoId || '';

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const customFeeStepKey = gasRate ? gasRate.length - 1 : 0;

  const feeOptions = useMemo(() => {
    return gasRate
      ? gasRate
          .map((item, index) => {
            if (!item) return undefined;
            const displayFeeAmount = toDisplayDenomAmount(times(item, gas), selectedFeeCoin?.asset.decimals || 0);

            const value = times(displayFeeAmount, coinPrice);

            // TODO 정책 설정 필요.
            const title = index === customFeeStepKey ? 'Custom' : 'Default';

            return {
              id: index,
              title,
              amount: displayFeeAmount,
              symbol: selectedFeeCoin?.asset.symbol || '',
              value: value,
            };
          })
          .filter((item) => !!item)
      : [];
  }, [coinPrice, customFeeStepKey, gas, gasRate, selectedFeeCoin?.asset.decimals, selectedFeeCoin?.asset.symbol]);

  const onHandelClose = () => {
    setIsOpenFeeCustomOverlay(false);
    onClose?.({}, 'backdropClick');
  };

  const onHandleClick = (id: number) => {
    onSelectOption?.(id);
    onHandelClose();
  };

  return (
    <>
      <StyledBottomSheet {...remainder} onClose={onHandelClose}>
        <Container>
          <Header>
            <HeaderTitle>
              <Typography variant="h3_B">{t('components.FeeSettingBottomSheet.index.title')}</Typography>
            </HeaderTitle>

            <IconTextButton onClick={onHandelClose}>
              <Close24Icon />
            </IconTextButton>
          </Header>
          <Body>
            {feeOptions.map((item, index) => (
              <OptionButton
                key={item.id}
                fee={item}
                isActive={currentSelectedFeeOptionKey === index}
                onClick={() => {
                  onHandleClick(index);
                }}
              />
            ))}
          </Body>

          <FeeCustomContainer>
            <Base1300Text variant="b3_R">{t('components.FeeSettingBottomSheet.index.customDescription')}</Base1300Text>
            <TextButton
              variant="hyperlink"
              onClick={() => {
                setIsOpenFeeCustomOverlay(true);
              }}
            >
              {t('components.FeeSettingBottomSheet.index.custom')}
            </TextButton>
          </FeeCustomContainer>
        </Container>
        {feeType === 'EIP-1559' && (
          <EIP1559FeeCustomOverlay
            open={isOpenFeeCustomOverlay && feeType === 'EIP-1559'}
            onClose={() => {
              setIsOpenFeeCustomOverlay(false);
            }}
            baseGasAmount={defaultFeeOption.gas || '0'}
            baseMaxBaseFeeAmount={defaultFeeOption.maxBaseFeePerGas || '0'}
            basePriorityFeeAmount={defaultFeeOption.maxPriorityFeePerGas || '0'}
            feeCoinId={feeCoinId}
            onConfirm={(gasAmount, maxBaseFeeAmount, priorityFeeAmount) => {
              onChangeGas?.(gasAmount);
              onChangeMaxBaseFee?.(maxBaseFeeAmount);
              onChangePriorityFee?.(priorityFeeAmount);
              onSelectOption?.(customFeeStepKey);

              onHandelClose();
            }}
          />
        )}
        {feeType === 'BASIC' && (
          <GasPriceCustomOverlay
            open={isOpenFeeCustomOverlay && feeType === 'BASIC'}
            onClose={() => {
              setIsOpenFeeCustomOverlay(false);
            }}
            baseGasAmount={defaultFeeOption.gas || '0'}
            baseGasPrice={defaultFeeOption.gasPrice || '0'}
            feeCoinId={feeCoinId}
            onConfirm={(gasAmount, gasPrice) => {
              onChangeGas?.(gasAmount);
              onChangeGasPrice?.(gasPrice);
              onSelectOption?.(customFeeStepKey);

              onHandelClose();
            }}
          />
        )}
      </StyledBottomSheet>
    </>
  );
}
