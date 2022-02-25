import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PATH } from '~/constants/route';
import IconButton from '~/Popup/components/common/IconButton';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
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
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { pathname } = useLocation();
  const { navigate } = useNavigate();

  const { rootPath } = chromeStorage;

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
              void setChromeStorage('rootPath', buttonPath);
              navigate(buttonPath);
            }}
          >
            {
              // pathname === PATH.WALLET 로직은 없어도 되지만 렌더링을 조금 더 빠르게 반영하기 위해 넣은 코드
              buttonPath === PATH.DASHBOARD || pathname === PATH.WALLET ? <Dashboard24Icon /> : <Wallet24Icon />
            }
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
