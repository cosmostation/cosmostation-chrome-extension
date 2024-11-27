import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

import Carousel from '@/components/common/Carousel';
import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';
import IconButton from '@/components/common/IconButton';
import IconTextButton from '@/components/common/IconTextButton';
import { Tab, Tabs } from '@/components/common/Tab';
import HandleExtensionViewButton from '@/components/HandleExtensionViewButton';
import Header from '@/components/Header';
import Navigator from '@/components/Header/components/Navigator';
import PortFolio from '@/components/MainBox/Portfolio';
import SettingPopover from '@/components/SettingPopover';
import SortBottomSheet from '@/components/SortBottomSheet';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';

import {
  AdCarouselContainer,
  BodyContainer,
  CarouselImg,
  Container,
  FilterContaienr,
  FilterIconButton,
  HeaderRightContainer,
  ManageCryptoContainer,
  MarginLeftTypography,
  MarginTopTypography,
  StickyTabContainer,
  StickyTabPanelContentsContainer,
  StyledInput,
  StyledTabPanel,
} from './-styled';

import FilterSettingIcon from '@/assets/images/icons/FilterSetting20.svg';
import PlusIcon from '@/assets/images/icons/Plus12.svg';
import SearchIcon from '@/assets/images/icons/Search18.svg';
import SettingIcon from '@/assets/images/icons/Setting14.svg';
import StakeIcon from '@/assets/images/icons/Stake22.svg';

import testAdImg from '@/assets/images/test-ad.png';

export const Route = createFileRoute('/')({
  component: Index,
  errorComponent: () => <div>Failed to load</div>,
});

function Index() {
  const { t } = useTranslation();

  Buffer.from('Hello from Index!').toString('base64');

  const [isOpenDialog, setisOpenDialog] = useState(false);
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);

  // NOTE 디비에 저장할 것.
  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Crypto', 'NFTs'];

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const handleClickOpen = () => {
    setisOpenDialog(true);
  };
  const handleClose = () => {
    setisOpenDialog(false);
  };

  return (
    <Container>
      <Header
        leftContent={<Navigator />}
        rightContent={
          <HeaderRightContainer>
            <IconButton
              onClick={(event) => {
                handleClickOpen();

                setPopoverAnchorEl(event.currentTarget);
              }}
            >
              <SettingIcon />
            </IconButton>
            <HandleExtensionViewButton />
          </HeaderRightContainer>
        }
      />
      <PortFolio />

      <BodyContainer>
        <StickyTabContainer>
          <Tabs value={tabValue} onChange={handleChange} variant="fullWidth">
            {tabLabels.map((item) => (
              <Tab key={item} label={item} />
            ))}
          </Tabs>
        </StickyTabContainer>
        <StyledTabPanel value={tabValue} index={0}>
          <StickyTabPanelContentsContainer>
            <FilterContaienr>
              <StyledInput
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
                placeholder={'Search'}
                // value={search}
                // onChange={(event) => {
                //   setSearch(event.currentTarget.value);
                // }}
              />
              <FilterIconButton
                onClick={() => {
                  setIsOpenSortBottomSheet(true);
                }}
              >
                <FilterSettingIcon />
              </FilterIconButton>
            </FilterContaienr>
            <AdCarouselContainer>
              <Carousel>
                <CarouselImg src={testAdImg} />
                <CarouselImg src={testAdImg} />
              </Carousel>
            </AdCarouselContainer>
            <ManageCryptoContainer>
              <CheckBoxTextButton>
                <Typography variant="b3_R">{t('pages.index.hideSmallBalance')}</Typography>
              </CheckBoxTextButton>
              <IconTextButton LeadingIcon={<PlusIcon />}>
                <MarginLeftTypography variant="b3_M">{t('pages.index.manageCrypto')}</MarginLeftTypography>
              </IconTextButton>
            </ManageCryptoContainer>
          </StickyTabPanelContentsContainer>

          {/* NOTE 토큰 리스팅을 위한 컴포넌트 */}
          {/* <CoinButtonContainer >
              <CoinTrendIndicatorButton baseAmount="100" symbol={item.symbol} coinImageProps={item.coinImageProps} />
            </CoinButtonContainer> */}
        </StyledTabPanel>
        <StyledTabPanel value={tabValue} index={1}>
          <IconTextButton LeadingIcon={<StakeIcon />} direction="vertical">
            {/* TODO i18n 적용 필요 */}
            <MarginTopTypography variant="b3_M">Setting</MarginTopTypography>
          </IconTextButton>
        </StyledTabPanel>
      </BodyContainer>
      <SettingPopover
        open={isOpenDialog}
        onClose={handleClose}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      />
      <SortBottomSheet
        optionButtonProps={[
          {
            sortKey: DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER,
            children: <Typography variant="b2_M">{t('pages.index.valueHighOrder')}</Typography>,
          },
          {
            sortKey: DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC,
            children: <Typography variant="b2_M">{t('pages.index.alphabeticalAsc')}</Typography>,
          },
        ]}
        currentSortOption={DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER}
        open={isOpenSortBottomSheet}
        onClose={() => setIsOpenSortBottomSheet(false)}
        onSelectSortOption={(val) => {
          console.log(val);
        }}
      />
    </Container>
  );
}
