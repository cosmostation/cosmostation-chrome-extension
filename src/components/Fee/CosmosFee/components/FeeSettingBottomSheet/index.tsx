import { useState } from 'react';
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
  gas: string;
  feeAssets: CosmosFeeAsset[];
  currentSelectedFeeOptionKey?: number;
  onSelectOption?: (id: number) => void;
  onChangeGas?: (gas: string) => void;
  onChangeFeeCoinId?: (feeCoinId: string) => void;
};

export default function FeeSettingBottomSheet({
  feeAssets,
  selectedFeeCoinId,
  gas,
  currentSelectedFeeOptionKey,
  onClose,
  onSelectOption,
  onChangeGas,
  onChangeFeeCoinId,
  ...remainder
}: FeeSettingBottomSheetProps) {
  const { t } = useTranslation();
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { currency } = useExtensionStorageStore((state) => state);

  const [isOpenFeeCustomOverlay, setIsOpenFeeCustomOverlay] = useState(false);

  const selectedFeeCoin = feeAssets.find((item) => isMatchingCoinId(item.asset, selectedFeeCoinId));

  const coinGeckoId = selectedFeeCoin?.asset.coinGeckoId || '';

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[currency]) || 0;

  const feeOptions =
    selectedFeeCoin?.gasRate.map((item, index) => {
      const displayFeeAmount = toDisplayDenomAmount(times(item, gas), selectedFeeCoin.asset.decimals);
      const value = times(displayFeeAmount, coinPrice);

      return {
        id: index,
        // TODO 정책 설정 필요.
        title: 'Default',
        amount: displayFeeAmount,
        symbol: selectedFeeCoin.asset.symbol,
        value: value,
      };
    }) || [];

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
        <FeeCustomOverlay
          open={isOpenFeeCustomOverlay}
          onClose={() => {
            setIsOpenFeeCustomOverlay(false);
          }}
          baseGasAmount={gas}
          feeAssets={feeAssets}
          feeCoinId={selectedFeeCoinId}
          onConfirm={(feeCoinId, gasAmount) => {
            onChangeFeeCoinId?.(feeCoinId);
            onChangeGas?.(gasAmount);
          }}
        />
      </StyledBottomSheet>
    </>
  );
}
