import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AllNetworkButton from '@/components/AllNetworkButton';
import ChipButton from '@/components/common/ChipButton';
import IconTextButton from '@/components/common/IconTextButton';
import NumberTypo from '@/components/common/NumberTypo';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { Route as DappList } from '@/pages/dapp-list';
import CurrencyBottomSheet from '@/pages/general-setting/-components/CurrencyBottomSheet';
import { Route as SelectReceiveCoin } from '@/pages/wallet/receive';
import { Route as SelectSendCoin } from '@/pages/wallet/send';
import { Route as SelectStakeCoin } from '@/pages/wallet/stake';
import type { UniqueChainId } from '@/types/chain';
import { getFilteredAssetsByChainId, getfilteredChainsByChainId } from '@/utils/asset';
import { plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import MoreOptionBottomSheet from './components/MoreOptionBottomSheet';
import {
  BodyBottomChipButtonContainer,
  BodyBottomContainer,
  BodyContainer,
  BodyTopContainer,
  BottomButtonContainer,
  HistoryButtonTypo,
  SpacedTypography,
  StyledIconContainer,
  StyledIconTextButton,
  TopContainer,
  TopLeftContainer,
  TopRightContainer,
  TotalBalanceContainer,
  ViewTotalValueText,
} from './styled';
import MainBox from '..';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';
import DappIcon from '@/assets/images/icons/Dapp22.svg';
import HistoryIcon from '@/assets/images/icons/History14.svg';
import MoreIcon from '@/assets/images/icons/More22.svg';
import StakeIcon from '@/assets/images/icons/Stake22.svg';
import SwapIcon from '@/assets/images/icons/Swap22.svg';
import ViewIcon from '@/assets/images/icons/View12.svg';

import CosmostationLogoImg from '@/assets/images/logos/GreyCosmostationLogo.png';

type PortFolioProps = {
  selectedChainId?: UniqueChainId;
  onChangeChaindId: (chainId?: UniqueChainId) => void;
};

export default function PortFolio({ selectedChainId, onChangeChaindId }: PortFolioProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currency } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice, isLoading } = useCoinGeckoPrice();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  const [isProcessing, setIsProcessing] = useState(true);
  const [aggregatedTotalValue, setAggregatedTotalValue] = useState('0');

  const [isOpenCurrencyBottomSheet, setIsOpenCurrencyBottomSheet] = useState(false);
  const [isOpenMoreOptionBottomSheet, setIsOpenMoreOptionBottomSheet] = useState(false);

  const chainList = useMemo(() => getfilteredChainsByChainId(accountAllAssets?.flatAccountAssets), [accountAllAssets?.flatAccountAssets]);

  useEffect(() => {
    setIsProcessing(true);

    if (!accountAllAssets?.flatAccountAssets || accountAllAssets.flatAccountAssets.length === 0) {
      return;
    }

    const filteredAssetsByChainId = getFilteredAssetsByChainId(accountAllAssets?.flatAccountAssets, selectedChainId);

    const aggregateValue = filteredAssetsByChainId.reduce((acc, item) => {
      const displayAmount = toDisplayDenomAmount(item.balance || '0', item.asset.decimals || 0);
      const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[currency]) || 0;

      const value = times(displayAmount, coinPrice);

      return plus(acc, value);
    }, '0');

    setAggregatedTotalValue(aggregateValue);
    if (!isLoading) {
      setIsProcessing(false);
    }
  }, [accountAllAssets?.flatAccountAssets, coinGeckoPrice, currency, isLoading, selectedChainId]);

  return (
    <>
      <MainBox
        top={
          <TopContainer>
            <TopLeftContainer>
              <IconTextButton trailingIcon={<ViewIcon />}>
                <ViewTotalValueText variant="b3_M">{t('components.MainBox.Portfolio.index.totalValue')}</ViewTotalValueText>
              </IconTextButton>
            </TopLeftContainer>
            <TopRightContainer>
              <AllNetworkButton
                variant="chip"
                currentChainId={selectedChainId}
                chainList={chainList}
                isManageAssets
                selectChainOption={(id) => {
                  onChangeChaindId(id);
                }}
              />
            </TopRightContainer>
          </TopContainer>
        }
        body={
          <BodyContainer>
            <BodyTopContainer>
              <IconTextButton
                onClick={() => {
                  setIsOpenCurrencyBottomSheet(true);
                }}
                trailingIcon={
                  <StyledIconContainer>
                    <BottomFilledChevronIcon />
                  </StyledIconContainer>
                }
              >
                <TotalBalanceContainer>
                  {isProcessing ? (
                    <Typography variant="h1n_B">{'--'}</Typography>
                  ) : (
                    <NumberTypo typoOfIntegers="h1n_B" typoOfDecimals="h2n_M" currency={currency} isDisableLeadingCurreny>
                      {aggregatedTotalValue}
                    </NumberTypo>
                  )}
                  &nbsp;
                  <Typography variant="h2_M">{currency.toLocaleUpperCase()}</Typography>
                </TotalBalanceContainer>
              </IconTextButton>
            </BodyTopContainer>
            <BodyBottomContainer>
              <IconTextButton leadingIcon={<HistoryIcon />}>
                <HistoryButtonTypo variant="b3_M">{t('components.MainBox.Portfolio.index.history')}</HistoryButtonTypo>
              </IconTextButton>
              <BodyBottomChipButtonContainer>
                <ChipButton
                  variant="light"
                  onClick={() => {
                    navigate({
                      to: SelectSendCoin.to,
                    });
                  }}
                >
                  <Typography variant="b4_M">{t('components.MainBox.Portfolio.index.send')}</Typography>
                </ChipButton>
                <ChipButton
                  variant="dark"
                  onClick={() => {
                    navigate({
                      to: SelectReceiveCoin.to,
                    });
                  }}
                >
                  <Typography variant="b4_M">{t('components.MainBox.Portfolio.index.receive')}</Typography>
                </ChipButton>
              </BodyBottomChipButtonContainer>
            </BodyBottomContainer>
          </BodyContainer>
        }
        bottom={
          <BottomButtonContainer>
            <StyledIconTextButton
              onClick={() => {
                navigate({
                  to: SelectStakeCoin.to,
                });
              }}
              leadingIcon={<StakeIcon />}
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.Portfolio.index.stake')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton
              leadingIcon={<SwapIcon />}
              direction="vertical"
              onClick={() => {
                window.open('https://www.mintscan.io/wallet/swap', '_blank');
              }}
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.Portfolio.index.swap')}</SpacedTypography>
            </StyledIconTextButton>

            <StyledIconTextButton
              onClick={() => {
                navigate({
                  to: DappList.to,
                });
              }}
              leadingIcon={<DappIcon />}
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.Portfolio.index.dapp')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton
              onClick={() => {
                setIsOpenMoreOptionBottomSheet(true);
              }}
              leadingIcon={<MoreIcon />}
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.Portfolio.index.more')}</SpacedTypography>
            </StyledIconTextButton>
          </BottomButtonContainer>
        }
        className="portfoiloBackground"
        backgroundImage={CosmostationLogoImg}
      />
      <CurrencyBottomSheet open={isOpenCurrencyBottomSheet} onClose={() => setIsOpenCurrencyBottomSheet(false)} />
      <MoreOptionBottomSheet open={isOpenMoreOptionBottomSheet} onClose={() => setIsOpenMoreOptionBottomSheet(false)} />
    </>
  );
}
