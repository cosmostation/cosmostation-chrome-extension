import { useState } from 'react';

import IconButton from '~/Popup/components/common/IconButton';

import Drawer from './Drawer';
import { Container, LeftContentContainer, LeftContentLogoContainer, LeftContentTextContainer, RightContentContainer } from './styled';

import Cosmostation14Icon from '~/images/icons/Cosmostation14.svg';
import DashboardIcon from '~/images/icons/Dashboard.svg';
import Logo28Icon from '~/images/icons/Logo28.svg';
import MenuIcon from '~/images/icons/Menu.svg';

export default function Header() {
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  return (
    <Container>
      <LeftContentContainer>
        <LeftContentLogoContainer>
          <Logo28Icon />
        </LeftContentLogoContainer>
        <LeftContentTextContainer>
          <Cosmostation14Icon />
        </LeftContentTextContainer>
      </LeftContentContainer>
      <RightContentContainer>
        <IconButton>
          <DashboardIcon />
        </IconButton>
        <IconButton onClick={() => setIsOpenDrawer(true)}>
          <MenuIcon />
        </IconButton>
      </RightContentContainer>
      <Drawer anchor="right" open={isOpenDrawer} onClose={() => setIsOpenDrawer(false)} />
    </Container>
  );
}
