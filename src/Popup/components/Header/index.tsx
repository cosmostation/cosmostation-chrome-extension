import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PATH } from '~/constants/route';
import IconButton from '~/Popup/components/common/IconButton';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';

import Drawer from './Drawer';
import { Container, LeftContentContainer, LeftContentLogoContainer, LeftContentTextContainer, RightContentContainer } from './styled';

import Cosmostation14Icon from '~/images/icons/Cosmostation14.svg';
import Dashboard24Icon from '~/images/icons/Dashboard24.svg';
import Logo28Icon from '~/images/icons/Logo28.svg';
import MenuIcon from '~/images/icons/Menu.svg';
import Wallet24Icon from '~/images/icons/Wallet24.svg';

type HeaderProps = {
  isShowPageButton?: boolean;
  isShowMenuButton?: boolean;
};

export default function Header({ isShowMenuButton = true, isShowPageButton = true }: HeaderProps) {
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const { extensionStorage } = useExtensionStorage();

  const { pathname } = useLocation();
  const { navigate } = useNavigate();

  const { rootPath } = extensionStorage;

  const buttonPath = ([PATH.DASHBOARD, PATH.WALLET] as string[]).includes(pathname) ? (rootPath === PATH.DASHBOARD ? PATH.WALLET : PATH.DASHBOARD) : rootPath;

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
        {isShowPageButton && (
          <IconButton
            onClick={() => {
              navigate(buttonPath);
            }}
          >
            {buttonPath === PATH.DASHBOARD ? <Dashboard24Icon /> : <Wallet24Icon />}
          </IconButton>
        )}
        {isShowMenuButton && (
          <IconButton onClick={() => setIsOpenDrawer(true)}>
            <MenuIcon />
          </IconButton>
        )}
      </RightContentContainer>
      <Drawer anchor="right" open={isOpenDrawer} onClose={() => setIsOpenDrawer(false)} />
    </Container>
  );
}
