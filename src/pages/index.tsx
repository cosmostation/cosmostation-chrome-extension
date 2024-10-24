import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

import Header from '@/components/Header';
import IconButton from '@/components/IconButton';
import IconTextButton from '@/components/IconTextButton';
import SettingPopover from '@/components/SettingPopover';
import { Tab, Tabs } from '@/components/Tab';

import { BodyContainer, Container, FilterIconButton, HeaderRightContainer, SpacedTypography, StyledTabPanel } from './-styled';

import FilterSettingIcon from '@/assets/images/icons/FilterSetting20.svg';
import SettingIcon from '@/assets/images/icons/Setting14.svg';
import StakeIcon from '@/assets/images/icons/Stake22.svg';

export const Route = createFileRoute('/')({
  component: Index,
  errorComponent: () => <div>Failed to load</div>,
});

function Index() {
  Buffer.from('Hello from Index!').toString('base64');

  const [isOpenDialog, setisOpenDialog] = useState(false);
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
          <FilterIconButton>
            <FilterSettingIcon />
          </FilterIconButton>
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
    </Container>
  );
}
