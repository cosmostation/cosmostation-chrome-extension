import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';

import AccountItemButton from './AccountItemButton';
import { AccountListContainer, BodyContainer, Container, HeaderContainer, HeaderLeftContainer, HeaderRightContainer, StyledIconButton } from './styled';

import SettingIcon from '~/images/icons/Setting.svg';

type AccountPopoverProps = Omit<PopoverProps, 'children'>;

export default function AccountPopover(props: AccountPopoverProps) {
  return (
    <Popover {...props}>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h5">Select a account</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer>
            <StyledIconButton>
              <SettingIcon />
            </StyledIconButton>
          </HeaderRightContainer>
        </HeaderContainer>
        <Divider />
        <BodyContainer>
          <AccountListContainer>
            <AccountItemButton isActive>Cosmos</AccountItemButton>
            <AccountItemButton>cosmos</AccountItemButton>
            <AccountItemButton>Cosmos</AccountItemButton>
            <AccountItemButton>Cosmos</AccountItemButton>
            <AccountItemButton>Cosmos</AccountItemButton>
            <AccountItemButton>Cosmos</AccountItemButton>
          </AccountListContainer>
        </BodyContainer>
      </Container>
    </Popover>
  );
}
