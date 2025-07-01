import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AddressActionButtons from '@/components/AddressActionButtons';
import AllNetworkButton from '@/components/AllNetworkButton';
import BalanceDisplay from '@/components/BalanceDisplay';
import BalanceSyncStatusIcon from '@/components/BalanceSyncStatusIcon';
import ChipButton from '@/components/common/ChipButton';
import IconTextButton from '@/components/common/IconTextButton';
import { useManualBalanceUpdate } from '@/hooks/common/useManualBalanceUpdate';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { Route as DappList } from '@/pages/dapp-list';
import CurrencyBottomSheet from '@/pages/general-setting/-components/CurrencyBottomSheet';
import { Route as SelectReceiveCoin } from '@/pages/wallet/receive';
import { Route as ReceiveWithChainId } from '@/pages/wallet/receive/chain/$chainId';
import { Route as SelectSendCoin } from '@/pages/wallet/send';
import { Route as SendCoinWithChainId } from '@/pages/wallet/send/chain/$chainId';
import { Route as SelectStakeCoin } from '@/pages/wallet/stake';
import type { UniqueChainId } from '@/types/chain';
import { getFilteredAssetsByChainId, getFilteredChainsByChainId, getMainAssetByChainId, isStakeableAsset } from '@/utils/asset';
import { plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, getUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import MoreOptionBottomSheet from './components/MoreOptionBottomSheet';
import {
  BodyBottomChipButtonContainer,
  BodyBottomContainer,
  BodyContainer,
  BodyTopContainer,
  BottomButtonContainer,
  ChipButtonContentsContainer,
  SpacedTypography,
  StyledChipButton,
  StyledIconContainer,
  StyledIconTextButton,
  TopContainer,
  TopLeftContainer,
  TopRightContainer,
  TotalBalanceContainer,
  ViewIconContainer,
  ViewTotalValueText,
} from './styled';
import MainBox from '..';

import DappIcon from '@/assets/images/icons/Dapp22.svg';
import MoreIcon from '@/assets/images/icons/More22.svg';
import RefreshIcon from '@/assets/images/icons/Refresh18.svg';
import StakeIcon from '@/assets/images/icons/Stake22.svg';
import SwapIcon from '@/assets/images/icons/Swap22.svg';
import ViewIcon from '@/assets/images/icons/View12.svg';
import ViewHideIcon from '@/assets/images/icons/ViewHide20.svg';

import cosmostationLogoImg from '@/assets/images/logos/greyCosmostationLogo.png';

type PortFolioProps = {
  selectedChainId?: UniqueChainId;
  onChangeChaindId: (chainId?: UniqueChainId) => void;
};

export default function PortFolio({ selectedChainId, onChangeChaindId }: PortFolioProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { userCurrencyPreference, isBalanceVisible, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice, isLoading } = useCoinGeckoPrice();
  const { updateAllBalance, updateChainBalance, isLoadingAllBalance, isLoadingChainBalance } = useManualBalanceUpdate();
  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  const [isBalanceUpdateButtonHovered, setIsBalanceUpdateButtonHovered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [aggregatedTotalValue, setAggregatedTotalValue] = useState('0');

  const [isOpenCurrencyBottomSheet, setIsOpenCurrencyBottomSheet] = useState(false);
  const [isOpenMoreOptionBottomSheet, setIsOpenMoreOptionBottomSheet] = useState(false);

  const chainList = useMemo(() => getFilteredChainsByChainId(accountAllAssets?.flatAccountAssets), [accountAllAssets?.flatAccountAssets]);

  const selectedChainMainAsset = useMemo(
    () => selectedChainId && getMainAssetByChainId(accountAllAssets?.flatAccountAssets, selectedChainId),
    [accountAllAssets?.flatAccountAssets, selectedChainId],
  );

  const coinIdForReceivePage = useMemo(() => {
    if (!selectedChainMainAsset?.asset) return undefined;

    return getCoinId(selectedChainMainAsset.asset);
  }, [selectedChainMainAsset?.asset]);

  const chainIdForReceivePage = useMemo(() => {
    if (!selectedChainMainAsset?.chain) return undefined;

    return getUniqueChainId(selectedChainMainAsset.chain);
  }, [selectedChainMainAsset?.chain]);

  const isShowAccountDetail = !!selectedChainMainAsset?.asset && !!coinIdForReceivePage;

  const swapDappURL = useMemo(() => {
    if (!selectedChainId || (selectedChainMainAsset?.chain.chainType === 'cosmos' && selectedChainMainAsset.chain.isSupportHistory)) {
      return 'https://www.mintscan.io/wallet/swap';
    }

    return undefined;
  }, [selectedChainId, selectedChainMainAsset?.chain]);

  const isUpdatingBalance = selectedChainId && selectedChainMainAsset?.address.address ? isLoadingChainBalance : isLoadingAllBalance;

  const handleManualBalanceUpdate = async () => {
    if (selectedChainId && selectedChainMainAsset?.address.address) {
      await updateChainBalance(selectedChainId, selectedChainMainAsset.address.address);
      return;
    }

    await updateAllBalance();
  };

  useEffect(() => {
    setIsProcessing(true);

    if (!accountAllAssets?.flatAccountAssets || accountAllAssets.flatAccountAssets.length === 0) {
      return;
    }

    const filteredAssetsByChainId = getFilteredAssetsByChainId(accountAllAssets?.flatAccountAssets, selectedChainId);

    const aggregateValue = filteredAssetsByChainId.reduce((acc, item) => {
      const balance = isStakeableAsset(item) ? item.totalBalance || '0' : item.balance;

      const displayAmount = toDisplayDenomAmount(balance, item.asset.decimals || 0);
      const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;

      const value = times(displayAmount, coinPrice);

      return plus(acc, value);
    }, '0');

    setAggregatedTotalValue(aggregateValue);
    if (!isLoading) {
      setIsProcessing(false);
    }
  }, [accountAllAssets?.flatAccountAssets, coinGeckoPrice, userCurrencyPreference, isLoading, selectedChainId]);

  return (
    <>
      <MainBox
        top={
          <TopContainer>
            {isShowAccountDetail ? (
              <AddressActionButtons coinId={coinIdForReceivePage} variant="underline" typoVarient="h6n_M" />
            ) : (
              <TopLeftContainer>
                <IconTextButton
                  onClick={() => {
                    updateExtensionStorageStore('isBalanceVisible', !isBalanceVisible);
                  }}
                  trailingIcon={<ViewIconContainer>{isBalanceVisible ? <ViewIcon /> : <ViewHideIcon />}</ViewIconContainer>}
                >
                  <ViewTotalValueText variant="b3_M">{t('components.MainBox.Portfolio.index.totalValue')}</ViewTotalValueText>
                </IconTextButton>
              </TopLeftContainer>
            )}
            <TopRightContainer>
              <AllNetworkButton
                typoVarient="b4_M"
                variant="chip"
                currentChainId={selectedChainId}
                chainList={chainList}
                isManageAssets
                isWithValue
                sizeVariant="small"
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
                onClick={handleManualBalanceUpdate}
                onMouseEnter={() => setIsBalanceUpdateButtonHovered(true)}
                onMouseLeave={() => setIsBalanceUpdateButtonHovered(false)}
                trailingIcon={
                  isBalanceUpdateButtonHovered || isUpdatingBalance ? (
                    <StyledIconContainer data-is-loading={isUpdatingBalance}>
                      <RefreshIcon />
                    </StyledIconContainer>
                  ) : undefined
                }
              >
                <TotalBalanceContainer>
                  {isProcessing ? (
                    <Typography variant="h1n_B">{'--'}</Typography>
                  ) : (
                    <BalanceDisplay typoOfIntegers="h1n_B" typoOfDecimals="h2n_M" currency={userCurrencyPreference} isDisableLeadingCurreny>
                      {aggregatedTotalValue}
                    </BalanceDisplay>
                  )}
                  &nbsp;
                  <Typography variant="h2_M">{userCurrencyPreference.toLocaleUpperCase()}</Typography>
                </TotalBalanceContainer>
              </IconTextButton>
            </BodyTopContainer>
            <BodyBottomContainer>
              {selectedChainMainAsset?.lastUpdatedAtMs && <BalanceSyncStatusIcon lastUpdatedAtMs={selectedChainMainAsset.lastUpdatedAtMs} />}

              <BodyBottomChipButtonContainer>
                <ChipButton
                  variant="light"
                  onClick={() => {
                    if (isShowAccountDetail) {
                      navigate({
                        to: SendCoinWithChainId.to,
                        params: {
                          chainId: selectedChainId as string,
                        },
                      });
                    } else {
                      navigate({
                        to: SelectSendCoin.to,
                      });
                    }
                  }}
                >
                  <Typography variant="b4_M">{t('components.MainBox.Portfolio.index.send')}</Typography>
                </ChipButton>
                <StyledChipButton
                  variant="dark"
                  onClick={() => {
                    if (isShowAccountDetail && chainIdForReceivePage) {
                      navigate({
                        to: ReceiveWithChainId.to,
                        params: {
                          chainId: chainIdForReceivePage as UniqueChainId,
                        },
                      });
                    } else {
                      navigate({
                        to: SelectReceiveCoin.to,
                      });
                    }
                  }}
                >
                  <ChipButtonContentsContainer>
                    <Typography variant="b4_M">{t('components.MainBox.Portfolio.index.receive')}</Typography>
                  </ChipButtonContentsContainer>
                </StyledChipButton>
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
              disabled={!swapDappURL}
              onClick={() => {
                if (swapDappURL) {
                  window.open(swapDappURL, '_blank');
                }
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
        backgroundImage={cosmostationLogoImg}
      />
      <CurrencyBottomSheet open={isOpenCurrencyBottomSheet} onClose={() => setIsOpenCurrencyBottomSheet(false)} />
      <MoreOptionBottomSheet open={isOpenMoreOptionBottomSheet} onClose={() => setIsOpenMoreOptionBottomSheet(false)} />
    </>
  );
}
