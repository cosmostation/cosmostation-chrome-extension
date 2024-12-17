import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AllNetworkButton from '@/components/AllNetworkButton';
import ChipButton from '@/components/common/ChipButton';
import IconTextButton from '@/components/common/IconTextButton';
import NumberTypo from '@/components/common/NumberTypo';
import { TEST_CHAIN_LIST } from '@/constants/test';
import { Route as SelectReceiveCoin } from '@/pages/wallet/receive';
import { Route as SelectSendCoin } from '@/pages/wallet/send';
import { Route as SelectSwapCoin } from '@/pages/wallet/swap';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  BodyBottomChipButtonContainer,
  BodyBottomContainer,
  BodyContainer,
  BodyTopContainer,
  BottomButtonContainer,
  HistoryButtonTypo,
  SpacedTypography,
  StyledIconButton,
  StyledIconTextButton,
  TopContainer,
  TopLeftContainer,
  TopRightContainer,
  TotalBalanceContainer,
  ViewTotalValueText,
} from './styled';
import MainBox from '..';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';
import HistoryIcon from '@/assets/images/icons/History14.svg';
import StakeIcon from '@/assets/images/icons/Stake22.svg';
import ViewIcon from '@/assets/images/icons/View12.svg';

import CosmostationLogoImg from '@/assets/images/logos/GreyCosmostationLogo.png';

export default function PortFolio() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currency } = useExtensionStorageStore((state) => state);
  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<string>();

  const dummyChainList = TEST_CHAIN_LIST;

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
                currentChainId={currentSelectedChainId}
                chainList={dummyChainList}
                selectChainOption={(id) => {
                  setCurrentSelectedChainId(id);
                }}
              />
            </TopRightContainer>
          </TopContainer>
        }
        body={
          <BodyContainer>
            <BodyTopContainer>
              <TotalBalanceContainer>
                <NumberTypo typoOfIntegers="h1n_B" typoOfDecimals="h2n_M" currency={currency} isDisableLeadingCurreny>
                  95000.000
                </NumberTypo>
                &nbsp;
                <Typography variant="h2_M">USD</Typography>
              </TotalBalanceContainer>
              <StyledIconButton>
                <BottomFilledChevronIcon />
              </StyledIconButton>
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
            <StyledIconTextButton leadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.Portfolio.index.stake')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton
              leadingIcon={<StakeIcon />}
              direction="vertical"
              onClick={() => {
                navigate({
                  to: SelectSwapCoin.to,
                });
              }}
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.Portfolio.index.swap')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton leadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.Portfolio.index.buy')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton leadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.Portfolio.index.dapp')}</SpacedTypography>
            </StyledIconTextButton>
          </BottomButtonContainer>
        }
        className="portfoiloBackground"
        backgroundImage={CosmostationLogoImg}
      />
    </>
  );
}
