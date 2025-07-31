import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
<<<<<<< Updated upstream
import { Typography } from '@mui/material';
=======
>>>>>>> Stashed changes
import { useNavigate } from '@tanstack/react-router';

import AddressActionButtons from '@/components/AddressActionButtons';
import AllNetworkButton from '@/components/AllNetworkButton';
import StaleBalanceErrorBanner from '@/components/StaleBalanceErrorBanner';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { Route as DappList } from '@/pages/dapp-list';
import CurrencyBottomSheet from '@/pages/general-setting/-components/CurrencyBottomSheet';
import { Route as SelectStakeCoin } from '@/pages/wallet/stake';
import type { UniqueChainId } from '@/types/chain';
import { getFilteredChainsByChainId, getMainAssetByChainId } from '@/utils/asset';
import { getCoinId, getUniqueChainId } from '@/utils/queryParamGenerator';

import BalanceValueWrapper from './components/BalanceValueWrapper';
import BalanceVisibleControlButton from './components/BalanceVisibleControlButton';
import MoreOptionBottomSheet from './components/MoreOptionBottomSheet';
import { BottomButtonContainer, SpacedTypography, StyledIconTextButton, TopContainer, TopLeftContainer, TopRightContainer } from './styled';
import MainBox from '..';

import DappIcon from '@/assets/images/icons/Dapp22.svg';
import MoreIcon from '@/assets/images/icons/More22.svg';
import StakeIcon from '@/assets/images/icons/Stake22.svg';
import SwapIcon from '@/assets/images/icons/Swap22.svg';

import cosmostationLogoImg from '@/assets/images/logos/greyCosmostationLogo.png';

type PortFolioProps = {
  selectedChainId?: UniqueChainId;
  onChangeChaindId: (chainId?: UniqueChainId) => void;
};

export default function PortFolio({ selectedChainId, onChangeChaindId }: PortFolioProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

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

  const isShowAccountDetail = !!selectedChainMainAsset?.asset && !!coinIdForReceivePage;

  const swapDappURL = useMemo(() => {
    if (!selectedChainId || (selectedChainMainAsset?.chain.chainType === 'cosmos' && selectedChainMainAsset.chain.isSupportHistory)) {
      return 'https://www.mintscan.io/wallet/swap';
    }

    return undefined;
  }, [selectedChainId, selectedChainMainAsset?.chain]);

  return (
    <>
      {selectedChainMainAsset?.lastUpdatedAtMs && (
        <StaleBalanceErrorBanner
          chainId={getUniqueChainId(selectedChainMainAsset.chain)}
          address={selectedChainMainAsset.address.address}
          lastUpdatedAtMs={selectedChainMainAsset.lastUpdatedAtMs}
        />
      )}
      <MainBox
        top={
          <TopContainer>
            {isShowAccountDetail ? (
              <AddressActionButtons coinId={coinIdForReceivePage} variant="underline" typoVarient="h6n_M" />
            ) : (
              <TopLeftContainer>
                <BalanceVisibleControlButton />
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
          <BalanceValueWrapper
            accountAssets={accountAllAssets?.flatAccountAssets || []}
            selectedChainId={selectedChainId}
            selectedChainMainAsset={selectedChainMainAsset}
          />
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
