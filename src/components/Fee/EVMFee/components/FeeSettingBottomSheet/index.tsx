import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import TextButton from '@/components/common/TextButton';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import type { FeeType } from '@/types/evm/fee';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, getUniqueChainIdWithManual, isMatchingUniqueChainId, parseCoinId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Body, Container, FeeCustomContainer, Header, HeaderTitle, StyledBottomSheet } from './styled';
import EIP1559FeeCustomOverlay from '../FeeSettingBottomSheet/components/EIP1559FeeCustomOverlay';
import GasPriceCustomOverlay from '../FeeSettingBottomSheet/components/GasPriceCustomOverlay';
import OptionButton from '../FeeSettingBottomSheet/components/OptionButton';

import Close24Icon from 'assets/images/icons/Close24.svg';

export type BasicFeeOption = {
  coinId: string;
  decimals: number;
  denom: string;
  coinGeckoId?: string;
  symbol: string;
  type: 'BASIC';
  gas?: string;
  gasPrice?: string;
  title: string;
};

export type EIP1559FeeOption = {
  coinId: string;
  decimals: number;
  denom: string;
  coinGeckoId?: string;
  symbol: string;
  type: 'EIP-1559';
  gas?: string;
  maxBaseFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  title: string;
};

export type FeeOption = BasicFeeOption | EIP1559FeeOption;

type FeeSettingBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  feeOptionDatas: FeeOption[];
  feeType: FeeType | null;
  currentSelectedFeeOptionKey?: number;
  onSelectOption?: (id: number) => void;
  onChangeGas?: (gas: string) => void;
  onChangeGasPrice?: (gasPrice: string) => void;
  onChangeMaxBaseFee?: (maxBaseFee: string) => void;
  onChangePriorityFee?: (priorityFee: string) => void;
};

export default function FeeSettingBottomSheet({
  feeOptionDatas,
  feeType,
  currentSelectedFeeOptionKey,
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

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const curretFeeOption = useMemo(
    () => (currentSelectedFeeOptionKey !== undefined ? feeOptionDatas[currentSelectedFeeOptionKey] : undefined),
    [currentSelectedFeeOptionKey, feeOptionDatas],
  );

  const nativeAccountAsset = useMemo(() => {
    const parsedCoinId = curretFeeOption?.coinId ? parseCoinId(curretFeeOption?.coinId) : undefined;

    const chainId = parsedCoinId ? getUniqueChainIdWithManual(parsedCoinId.chainId, parsedCoinId.chainType) : undefined;

    return [...(accountAllAssets?.evmAccountAssets || []), ...(accountAllAssets?.evmAccountCustomAssets || [])].find(
      (item) => isMatchingUniqueChainId(item.chain, chainId) && isEqualsIgnoringCase(item.asset.id, NATIVE_EVM_COIN_ADDRESS),
    );
  }, [accountAllAssets?.evmAccountAssets, accountAllAssets?.evmAccountCustomAssets, curretFeeOption?.coinId]);
  const feeCoinId = nativeAccountAsset?.asset ? getCoinId(nativeAccountAsset?.asset) : '';

  const customFeeStepKey = feeOptionDatas ? feeOptionDatas.length - 1 : 0;

  const feeOptions = useMemo(
    () =>
      feeOptionDatas
        .map((item, index) => {
          if (item.title === 'Custom' && !item.gas) return null;

          const gas = item.gas || '0';
          const gasRate = item.type === 'BASIC' ? item.gasPrice || '0' : item.maxBaseFeePerGas || '0';
          const decimals = item.decimals || 0;
          const symbol = item.symbol || '';
          const coinPrice = (item.coinGeckoId && coinGeckoPrice?.[item.coinGeckoId]?.[userCurrencyPreference]) || 0;

          const displayFeeAmount = toDisplayDenomAmount(times(gasRate, gas), decimals);
          const value = times(displayFeeAmount, coinPrice);

          return {
            id: index,
            title: item.title,
            amount: displayFeeAmount,
            symbol: symbol,
            value: value,
          };
        })
        .filter((item) => !!item),
    [coinGeckoPrice, userCurrencyPreference, feeOptionDatas],
  );

  const defaultCustomGasAmount = useMemo(() => {
    const customGasAmount = feeOptionDatas?.[customFeeStepKey]?.gas;

    return customGasAmount || feeOptionDatas?.[0]?.gas || '0';
  }, [customFeeStepKey, feeOptionDatas]);

  const defatultCustomGasPrice = useMemo(() => {
    const customGasRate = feeOptionDatas?.[customFeeStepKey]?.type === 'BASIC' ? feeOptionDatas?.[customFeeStepKey]?.gasPrice : undefined;

    if (customGasRate) {
      return customGasRate;
    }

    if (feeOptionDatas?.[0]?.type === 'BASIC') {
      return feeOptionDatas[0]?.gasPrice || '0';
    }

    return '0';
  }, [customFeeStepKey, feeOptionDatas]);

  const defatultCustomMaxBaseFeePerGas = useMemo(() => {
    const customMaxBaseFeePerGas = feeOptionDatas?.[customFeeStepKey]?.type === 'EIP-1559' ? feeOptionDatas?.[customFeeStepKey]?.maxBaseFeePerGas : undefined;

    if (customMaxBaseFeePerGas) {
      return customMaxBaseFeePerGas;
    }

    if (feeOptionDatas?.[0]?.type === 'EIP-1559') {
      return feeOptionDatas[0]?.maxBaseFeePerGas || '0';
    }

    return '0';
  }, [customFeeStepKey, feeOptionDatas]);

  const defatultCustomMaxPriorityFeePerGas = useMemo(() => {
    const customMaxPriorityFeePerGas =
      feeOptionDatas?.[customFeeStepKey]?.type === 'EIP-1559' ? feeOptionDatas?.[customFeeStepKey]?.maxPriorityFeePerGas : undefined;

    if (customMaxPriorityFeePerGas) {
      return customMaxPriorityFeePerGas;
    }

    if (feeOptionDatas?.[0]?.type === 'EIP-1559') {
      return feeOptionDatas[0]?.maxPriorityFeePerGas || '0';
    }

    return '0';
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
              <Typography variant="h2_B">{t('components.FeeSettingBottomSheet.index.title')}</Typography>
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
            baseGasAmount={defaultCustomGasAmount}
            baseMaxBaseFeeAmount={defatultCustomMaxBaseFeePerGas}
            basePriorityFeeAmount={defatultCustomMaxPriorityFeePerGas}
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
            baseGasAmount={defaultCustomGasAmount}
            baseGasPrice={defatultCustomGasPrice}
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
