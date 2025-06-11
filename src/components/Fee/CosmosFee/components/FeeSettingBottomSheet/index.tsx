import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import TextButton from '@/components/common/TextButton';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import type { CosmosFeeAsset } from '@/types/cosmos/fee';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Body, Container, FeeCustomContainer, Header, HeaderTitle, StyledBottomSheet } from './styled';
import FeeCustomOverlay from '../FeeSettingBottomSheet/components/FeeCustomOverlay';
import OptionButton from '../FeeSettingBottomSheet/components/OptionButton';

import Close24Icon from 'assets/images/icons/Close24.svg';

type FeeSettingBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
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
  onSelectOption?: (id: number) => void;
  onChangeGas?: (gas: string) => void;
  onChangeGasRate?: (gasRate: string) => void;
  onChangeFeeCoinId?: (feeCoinId: string) => void;
};

export default function FeeSettingBottomSheet({
  feeOptionDatas,
  availableFeeAssets,
  currentSelectedFeeOptionKey,
  selectedCustomFeeCoinId,
  onClose,
  onSelectOption,
  onChangeGas,
  onChangeGasRate,
  onChangeFeeCoinId,
  ...remainder
}: FeeSettingBottomSheetProps) {
  const { t } = useTranslation();
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const [isOpenFeeCustomOverlay, setIsOpenFeeCustomOverlay] = useState(false);

  const customFeeStepKey = feeOptionDatas ? feeOptionDatas.length - 1 : 0;

  const feeOptions = useMemo(
    () =>
      feeOptionDatas
        .map((item, index) => {
          if (item.title === 'Custom' && !item.gas) return null;

          const gas = item.gas || '0';
          const gasRate = item.gasRate || '0';
          const decimals = item.decimals || 0;
          const symbol = item.symbol || '';
          const coinPrice = (item.coinGeckoId && coinGeckoPrice?.[item.coinGeckoId]?.[userCurrencyPreference]) || 0;

          const displayFeeAmount = toDisplayDenomAmount(times(gasRate, gas), decimals);
          const value = times(displayFeeAmount, coinPrice);

          const title = item.title || (index === customFeeStepKey ? 'Custom' : 'Default');

          return {
            id: index,
            title,
            amount: displayFeeAmount,
            symbol: symbol,
            value: value,
          };
        })
        .filter((item) => !!item),
    [coinGeckoPrice, userCurrencyPreference, customFeeStepKey, feeOptionDatas],
  );

  const defaultCustomGasAmount = useMemo(() => {
    const customGasAmount = feeOptionDatas?.[customFeeStepKey].gas;

    return customGasAmount || feeOptionDatas?.[0].gas || '0';
  }, [customFeeStepKey, feeOptionDatas]);

  const defatulCustomGasRate = useMemo(() => {
    const customGasRate = feeOptionDatas?.[customFeeStepKey].gasRate;

    return customGasRate || feeOptionDatas?.[0].gasRate || '0';
  }, [customFeeStepKey, feeOptionDatas]);

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
              <Typography variant="h2_B">{t('components.Fee.CosmosFee.FeeSettingBottomSheet.index.title')}</Typography>
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
            <Base1300Text variant="b3_R">{t('components.Fee.CosmosFee.FeeSettingBottomSheet.index.customDescription')}</Base1300Text>
            <TextButton
              variant="hyperlink"
              onClick={() => {
                setIsOpenFeeCustomOverlay(true);
              }}
            >
              {t('components.Fee.CosmosFee.FeeSettingBottomSheet.index.custom')}
            </TextButton>
          </FeeCustomContainer>
        </Container>
        <FeeCustomOverlay
          open={isOpenFeeCustomOverlay}
          onClose={() => {
            setIsOpenFeeCustomOverlay(false);
          }}
          baseGasAmount={defaultCustomGasAmount}
          baseGasRate={defatulCustomGasRate}
          feeAssets={availableFeeAssets}
          feeCoinId={selectedCustomFeeCoinId}
          currentSelectedFeeOptionKey={currentSelectedFeeOptionKey}
          onConfirm={(feeCoinId, gasAmount, gasRate) => {
            onChangeFeeCoinId?.(feeCoinId);
            if (gasAmount && gasRate) {
              onChangeGas?.(gasAmount);
              onChangeGasRate?.(gasRate);
              onSelectOption?.(customFeeStepKey);
            }

            onHandelClose();
          }}
        />
      </StyledBottomSheet>
    </>
  );
}
