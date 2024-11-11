import { useTranslation } from 'react-i18next';

import {
  BodyContainer,
  BottomButtonContainer,
  SpacedTypography,
  ChevronIconContainer,
  StyledIconTextButton,
  TopContainer,
  TopLeftContainer,
  TopRightContainer,
  TopRightText,
  BodyBottomChipButtonContainer,
  BodyBottomContainer,
  BodyTopContainer,
  HistoryButtonTypo,
  TotalBalanceContainer,
  StyledIconButton,
} from './styled';

import MainBox from '..';
import { Typography } from '@mui/material';
import IconButton from '@/components/IconButton';

import CosmostationLogoImg from '@/assets/images/logos/GreyCosmostationLogo.png';

import StakeIcon from '@/assets/images/icons/Stake22.svg';

import ViewIcon from '@/assets/images/icons/View12.svg';
import GridMenuIcon from '@/assets/images/icons/GridMenu14.svg';
import HistoryIcon from '@/assets/images/icons/History14.svg';
import BottomChevronIcon from '@/assets/images/icons/BottomChevron14.svg';
import IconTextButton from '@/components/IconTextButton';
import ChipButton from '@/components/common/ChipButton';
import NumberTypo from '@/components/common/NumberTypo';

export default function PortFolio() {
  const { t } = useTranslation();

  return (
    <>
      <MainBox
        top={
          <TopContainer>
            <TopLeftContainer>
              <Typography variant="b3_M">{t('components.MainBox.Portfolio.index.totalValue')}</Typography>
              <IconButton>
                <ViewIcon />
              </IconButton>
            </TopLeftContainer>
            <TopRightContainer>
              <IconTextButton
                LeadingIcon={<GridMenuIcon />}
                TrailingIcon={
                  <ChevronIconContainer>
                    <BottomChevronIcon />
                  </ChevronIconContainer>
                }
              >
                <TopRightText variant="b4_M">{t('components.MainBox.Portfolio.index.allNetworks')}</TopRightText>
              </IconTextButton>
            </TopRightContainer>
          </TopContainer>
        }
        body={
          <BodyContainer>
            <BodyTopContainer>
              <TotalBalanceContainer>
                <NumberTypo typoOfIntegers="h1n_B" typoOfDecimals="h2n_M" currency="usd" isDisableLeadingCurreny>
                  95000.000
                </NumberTypo>
                &nbsp;
                <Typography variant="h2_M">USD</Typography>
              </TotalBalanceContainer>
              <StyledIconButton onClick={() => {}}>
                <BottomChevronIcon />
              </StyledIconButton>
            </BodyTopContainer>
            <BodyBottomContainer>
              <IconTextButton LeadingIcon={<HistoryIcon />}>
                <HistoryButtonTypo variant="b3_M">{t('components.MainBox.Portfolio.index.history')}</HistoryButtonTypo>
              </IconTextButton>
              <BodyBottomChipButtonContainer>
                <ChipButton variant="light">
                  <Typography variant="b4_M">{t('components.MainBox.Portfolio.index.send')}</Typography>
                </ChipButton>
                <ChipButton variant="dark">
                  <Typography variant="b4_M">{t('components.MainBox.Portfolio.index.receive')}</Typography>
                </ChipButton>
              </BodyBottomChipButtonContainer>
            </BodyBottomContainer>
          </BodyContainer>
        }
        bottom={
          <BottomButtonContainer>
            <StyledIconTextButton LeadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.Portfolio.index.setting')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton LeadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.Portfolio.index.setting')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton LeadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.Portfolio.index.setting')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton LeadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.Portfolio.index.setting')}</SpacedTypography>
            </StyledIconTextButton>
          </BottomButtonContainer>
        }
        className="portfoiloBackground"
        backgroundImage={CosmostationLogoImg}
      />
    </>
  );
}
