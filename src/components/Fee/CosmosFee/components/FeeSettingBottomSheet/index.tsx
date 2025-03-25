import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import TextButton from '@/components/common/TextButton';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import type { CosmosFeeAsset } from '@/types/cosmos/fee';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import FeeCustomOverlay from './components/FeeCustomOverlay';
import OptionButton from './components/OptionButton';
import { Body, Container, FeeCustomContainer, Header, HeaderTitle, StyledBottomSheet } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type FeeSettingBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  selectedFeeCoinId: string;
  gases: string[];
  gasRates: string[];
  feeAssets: CosmosFeeAsset[];
  currentSelectedFeeOptionKey: number;
  onSelectOption?: (id: number) => void;
  onChangeGas?: (gas: string) => void;
  onChangeGasRate?: (gasRate: string) => void;
  onChangeFeeCoinId?: (feeCoinId: string) => void;
};

export default function FeeSettingBottomSheet({
  feeAssets,
  selectedFeeCoinId,
  gases,
  gasRates,
  currentSelectedFeeOptionKey,
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

  const selectedFeeCoin = feeAssets.find((item) => isMatchingCoinId(item.asset, selectedFeeCoinId));

  const coinGeckoId = selectedFeeCoin?.asset.coinGeckoId || '';

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const customFeeStepKey = gasRates ? gasRates.length - 1 : 0;

  const feeOptions = useMemo(
    () =>
      gasRates
        .map((gasRate, index) => {
          if (!gasRate) return null;

          const gas = gases?.[index] || '0';

          const displayFeeAmount = toDisplayDenomAmount(times(gasRate || '0', gas), selectedFeeCoin?.asset.decimals || 0);
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
        .filter((item) => !!item),
    [coinPrice, customFeeStepKey, gasRates, gases, selectedFeeCoin?.asset.decimals, selectedFeeCoin?.asset.symbol],
  );

  const defaultCustomGasAmount = useMemo(() => {
    const customGasAmount = gases?.[customFeeStepKey];

    return customGasAmount || gases?.[0] || '0';
  }, [customFeeStepKey, gases]);

  const defatulCustomGasRate = useMemo(() => {
    const customGasRate = gasRates?.[customFeeStepKey];

    return customGasRate || gasRates?.[0] || '0';
  }, [customFeeStepKey, gasRates]);

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
              <Typography variant="h3_B">{t('components.Fee.CosmosFee.FeeSettingBottomSheet.index.title')}</Typography>
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
          feeAssets={feeAssets}
          feeCoinId={selectedFeeCoinId}
          onConfirm={(feeCoinId, gasAmount, gasRate) => {
            onChangeFeeCoinId?.(feeCoinId);
            onChangeGas?.(gasAmount);
            onChangeGasRate?.(gasRate);
            onSelectOption?.(customFeeStepKey);

            onHandelClose();
          }}
        />
      </StyledBottomSheet>
    </>
  );
}
