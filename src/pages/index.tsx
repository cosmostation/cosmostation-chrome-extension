import { useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';
import { createFileRoute, Link } from '@tanstack/react-router';

import Carousel from '@/components/common/Carousel';
import StandardInput from '@/components/common/StandardInput';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton';
import Header from '@/components/Header';
import IconButton from '@/components/IconButton';
import IconTextButton from '@/components/IconTextButton';
import SettingPopover from '@/components/SettingPopover';
import SortBottomSheet from '@/components/SortBottomSheet';
import { Tab, Tabs } from '@/components/Tab';
import ChainSelectBox from '@/components/ChainSelectBox';

import {
  BodyContainer,
  CarouselImg,
  Container,
  FilterContaienr,
  FilterIconButton,
  HeaderRightContainer,
  SpacedTypography,
  StyledInput,
  StyledTabPanel,
} from './-styled';

import FilterSettingIcon from '@/assets/images/icons/FilterSetting20.svg';
import SettingIcon from '@/assets/images/icons/Setting14.svg';
import StakeIcon from '@/assets/images/icons/Stake22.svg';
import SearchIcon from '@/assets/images/icons/Search18.svg';

import testAdImg from '@/assets/images/test-ad.png';

export const Route = createFileRoute('/')({
  component: Index,
  errorComponent: () => <div>Failed to load</div>,
});

function Index() {
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
            <IconButton
              onClick={async () => {
                const queryOptions = { active: true, currentWindow: true };
                const [tab] = await chrome.tabs.query(queryOptions);

                const origin = tab?.url ? new URL(tab.url).origin : undefined;

                console.log({ ...tab, origin });
              }}
            >
              <SettingIcon />
            </IconButton>
          </HeaderRightContainer>
        }
      />
      <h3>Welcome Home!</h3>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          about
        </Link>{' '}
        <Link to="/dashboard" className="[&.active]:font-bold">
          dashboard
        </Link>
      </div>

      <BodyContainer>
        <Tabs value={tabValue} onChange={handleChange} variant="fullWidth">
          {tabLabels.map((item) => (
            <Tab key={item} label={item} />
          ))}
        </Tabs>
        <StyledTabPanel value={tabValue} index={0}>
          <>
            <Carousel>
              <CarouselImg src={testAdImg} />
              <CarouselImg src={testAdImg} />
            </Carousel>
          </>
          <StandardInput
            label="Recipient Address"
            type="password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <FilterIconButton
                      onClick={() => {
                        setIsOpenSortBottomSheet(true);
                      }}
                      sx={{
                        width: '2rem',
                        height: '2rem',
                      }}
                    >
                      <FilterSettingIcon />
                    </FilterIconButton>
                  </InputAdornment>
                ),
              },
            }}
            error
            // helperText={
            //   'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
            // }
            // helperText={'helperTExt'}
            rightBottomAdornment={<BalanceButton />}
          />

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
          <ChainSelectBox label="Recipient Chain" rightAdornmentComponent={<Typography variant="b3_R">Commission</Typography>} />
        </StyledTabPanel>
        <StyledTabPanel value={tabValue} index={1}>
          <IconTextButton Icon={<StakeIcon />} direction="vertical">
            {/* TODO i18n 적용 필요 */}
            <SpacedTypography variant="b3_M">Setting</SpacedTypography>
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
      <SortBottomSheet open={isOpenSortBottomSheet} onClose={() => setIsOpenSortBottomSheet(false)} />
    </Container>
  );
}
