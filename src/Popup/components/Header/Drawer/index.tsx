import { useLocation } from 'react-router-dom';
import type { DrawerProps as BaseDrawerProps } from '@mui/material';
import { Typography } from '@mui/material';

import { THEME_TYPE } from '~/constants/theme';
import Button from '~/Popup/components/common/Button';
import Divider from '~/Popup/components/common/Divider';
import IconButton from '~/Popup/components/common/IconButton';
import Switch from '~/Popup/components/common/Switch';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
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
import Cosmostation14Icon from '~/images/icons/Cosmostation14.svg';
import Currency24Icon from '~/images/icons/Currency24.svg';
import DarkMode24Icon from '~/images/icons/DarkMode24.svg';
import HelpIcon from '~/images/icons/Help.svg';
import LanguageChangeIcon from '~/images/icons/LanguageChange.svg';
import Lock16 from '~/images/icons/Lock16.svg';
import Logo24Icon from '~/images/icons/Logo28.svg';
import PasswordChangeIcon from '~/images/icons/PasswordChange.svg';
import RightArrowIcon from '~/images/icons/RightArrow.svg';

type DrawerProps = Omit<BaseDrawerProps, 'children'>;

export default function Drawer({ onClose, ...remainder }: DrawerProps) {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { navigate } = useNavigate();
  const { pathname } = useLocation();
  const { setCurrentPassword } = useCurrentPassword();

  const isDarkMode = chromeStorage.theme === THEME_TYPE.DARK;

  return (
    <StyledDrawer {...remainder} onClose={onClose}>
      <HeaderContainer>
        <HeaderLeftContainer>
          <HeaderLeftImageContainer>
            <Logo24Icon />
          </HeaderLeftImageContainer>
          <HeaderLeftTextContainer>
            <Cosmostation14Icon />
          </HeaderLeftTextContainer>
        </HeaderLeftContainer>
        <HeaderRightContainer>
          <IconButton onClick={() => onClose?.({}, 'backdropClick')}>
            <Close24Icon />
          </IconButton>
        </HeaderRightContainer>
      </HeaderContainer>
      <Divider />

      <ItemContainer>
        <ItemLeftContainer>
          <ItemLeftImageContainer>
            <DarkMode24Icon id="darkMode" />
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

      <ItemButton Icon={PasswordChangeIcon} onClick={() => navigate('/setting/change-password', { isDuplicateCheck: true })}>
        Change Password
      </ItemButton>

      <ItemButton Icon={LanguageChangeIcon} onClick={() => navigate('/setting/change-language', { isDuplicateCheck: true })}>
        Language
      </ItemButton>

      <ItemButton Icon={Currency24Icon} onClick={() => navigate('/setting/change-currency', { isDuplicateCheck: true })}>
        Currency
      </ItemButton>

      <ItemButton Icon={HelpIcon}>Help & Support</ItemButton>

      <LockButtonContainer>
        <Button
          Icon={Lock16}
          typoVarient="h5"
          onClick={async () => {
            await setCurrentPassword(null);
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
  Icon: SvgElement;
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
