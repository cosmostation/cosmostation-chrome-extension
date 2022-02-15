import type { SVGProps, VFC } from 'react';
import { useLocation } from 'react-router-dom';
import type { DrawerProps as BaseDrawerProps } from '@mui/material';
import { Typography } from '@mui/material';

import { PATH } from '~/constants/route';
import { THEME_TYPE } from '~/constants/theme';
import Button from '~/Popup/components/common/Button';
import Divider from '~/Popup/components/common/Divider';
import IconButton from '~/Popup/components/common/IconButton';
import Switch from '~/Popup/components/common/Switch';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { useNavigate } from '~/Popup/hooks/useNavigate';

import {
  HeaderContainer,
  HeaderLeftContainer,
  HeaderLeftImageContainer,
  HeaderLeftTextContainer,
  HeaderRightContainer,
  ItemButtonContainer,
  ItemContainer,
  ItemLeftContainer,
  ItemLeftImageContainer,
  ItemLeftTextContainer,
  ItemRightContainer,
  LockButtonContainer,
  StyledDrawer,
} from './styled';

import Close24Icon from '~/images/icons/Close24.svg';
import CurrencyChangeIcon from '~/images/icons/CurrencyChange.svg';
import DarkModeIcon from '~/images/icons/DarkMode.svg';
import HelpIcon from '~/images/icons/Help.svg';
import LanguageChangeIcon from '~/images/icons/LanguageChange.svg';
import Lock16 from '~/images/icons/Lock16.svg';
import LogoIcon from '~/images/icons/Logo.svg';
import PasswordChangeIcon from '~/images/icons/PasswordChange.svg';
import RightArrowIcon from '~/images/icons/RightArrow.svg';

type DrawerProps = Omit<BaseDrawerProps, 'children' | 'onClose'> & {
  onClose: () => void;
};

export default function Drawer({ onClose, ...remainder }: DrawerProps) {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { navigate } = useNavigate();
  const { setInMemory } = useInMemory();
  const { pathname } = useLocation();

  const isDarkMode = chromeStorage.theme === THEME_TYPE.DARK;

  return (
    <StyledDrawer {...remainder} onClose={onClose}>
      <HeaderContainer>
        <HeaderLeftContainer>
          <HeaderLeftImageContainer>
            <LogoIcon />
          </HeaderLeftImageContainer>
          <HeaderLeftTextContainer>
            <Typography variant="h4">STATION</Typography>
          </HeaderLeftTextContainer>
        </HeaderLeftContainer>
        <HeaderRightContainer>
          <IconButton onClick={() => onClose()}>
            <Close24Icon />
          </IconButton>
        </HeaderRightContainer>
      </HeaderContainer>
      <Divider />

      <ItemContainer>
        <ItemLeftContainer>
          <ItemLeftImageContainer>
            <DarkModeIcon />
          </ItemLeftImageContainer>
          <ItemLeftTextContainer>
            <Typography variant="h4">Dark mode</Typography>
          </ItemLeftTextContainer>
        </ItemLeftContainer>
        <ItemRightContainer>
          <Switch
            checked={isDarkMode}
            onChange={async (event) => {
              await setChromeStorage('theme', event.currentTarget.checked ? THEME_TYPE.DARK : THEME_TYPE.LIGHT);
            }}
          />
        </ItemRightContainer>
      </ItemContainer>

      <ItemButton
        Icon={PasswordChangeIcon}
        onClick={() => {
          if (!pathname?.startsWith(PATH.SETTING__CHANGE_PASSWORD)) {
            navigate(PATH.SETTING__CHANGE_PASSWORD);
          }
        }}
      >
        Change Password
      </ItemButton>

      <ItemButton
        Icon={LanguageChangeIcon}
        onClick={() => {
          if (!pathname?.startsWith(PATH.SETTING__CHANGE_LANGUAGE)) {
            navigate(PATH.SETTING__CHANGE_LANGUAGE);
          }
        }}
      >
        Language
      </ItemButton>

      <ItemButton
        Icon={CurrencyChangeIcon}
        onClick={() => {
          if (!pathname?.startsWith(PATH.SETTING__CHANGE_CURRENCY)) {
            navigate(PATH.SETTING__CHANGE_CURRENCY);
          }
        }}
      >
        Currency
      </ItemButton>

      <ItemButton Icon={HelpIcon}>Help & Support</ItemButton>

      <LockButtonContainer>
        <Button
          Icon={Lock16}
          typoVarient="h5"
          onClick={async () => {
            await setInMemory('password', null);
          }}
        >
          Lock
        </Button>
      </LockButtonContainer>
    </StyledDrawer>
  );
}

type ItemButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: string;
  Icon: VFC<SVGProps<SVGSVGElement>>;
};

function ItemButton({ onClick, children, Icon }: ItemButtonProps) {
  return (
    <ItemButtonContainer onClick={onClick}>
      <ItemLeftContainer>
        <ItemLeftImageContainer>
          <Icon />
        </ItemLeftImageContainer>
        <ItemLeftTextContainer>
          <Typography variant="h4">{children}</Typography>
        </ItemLeftTextContainer>
      </ItemLeftContainer>
      <ItemRightContainer>
        <RightArrowIcon />
      </ItemRightContainer>
    </ItemButtonContainer>
  );
}
