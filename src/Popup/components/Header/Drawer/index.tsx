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
import { useTranslation } from '~/Popup/hooks/useTranslation';

import ItemButton from './components/ItemButton';
import {
  Container,
  DownContainer,
  HeaderContainer,
  HeaderLeftContainer,
  HeaderLeftImageContainer,
  HeaderLeftTextContainer,
  HeaderRightContainer,
  ItemContainer,
  ItemLeftContainer,
  ItemLeftImageContainer,
  ItemLeftTextContainer,
  ItemRightContainer,
  ItemToggleContainer,
  LockButtonContainer,
  StyledDrawer,
  UpContainer,
} from './styled';

import AddressBook24Icon from '~/images/icons/AddressBook24.svg';
import AutoSign24Icon from '~/images/icons/AutoSign24.svg';
import Close24Icon from '~/images/icons/Close24.svg';
import Connect24Icon from '~/images/icons/Connect24.svg';
import Cosmostation14Icon from '~/images/icons/Cosmostation14.svg';
import Currency24Icon from '~/images/icons/Currency24.svg';
import DarkMode24Icon from '~/images/icons/DarkMode24.svg';
import Guide24Icon from '~/images/icons/Guide24.svg';
import HelpIcon from '~/images/icons/Help.svg';
import LanguageChangeIcon from '~/images/icons/LanguageChange.svg';
import Ledger24Icon from '~/images/icons/Ledger24.svg';
import Lock16 from '~/images/icons/Lock16.svg';
import Logo24Icon from '~/images/icons/Logo28.svg';
import PasswordChangeIcon from '~/images/icons/PasswordChange.svg';

type DrawerProps = Omit<BaseDrawerProps, 'children'>;

export default function Drawer({ onClose, ...remainder }: DrawerProps) {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { navigate } = useNavigate();
  const { setCurrentPassword } = useCurrentPassword();
  const { t } = useTranslation();

  const isDarkMode = chromeStorage.theme === THEME_TYPE.DARK;

  return (
    <StyledDrawer {...remainder} onClose={onClose}>
      <Container>
        <UpContainer>
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
            <ItemToggleContainer>
              <ItemLeftContainer>
                <ItemLeftImageContainer>
                  <DarkMode24Icon id="darkMode" />
                </ItemLeftImageContainer>
                <ItemLeftTextContainer>
                  <Typography variant="h4">{t('components.Header.Drawer.index.darkMode')}</Typography>
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
            </ItemToggleContainer>

            <ItemButton Icon={AddressBook24Icon} onClick={() => navigate('/setting/address-book', { isDuplicateCheck: true })}>
              {t('components.Header.Drawer.index.addressBook')}
            </ItemButton>

            <ItemButton Icon={Connect24Icon} onClick={() => navigate('/setting/connected-sites', { isDuplicateCheck: true })}>
              {t('components.Header.Drawer.index.connectedSites')}
            </ItemButton>

            <ItemButton Icon={AutoSign24Icon} onClick={() => navigate('/setting/auto-sign', { isDuplicateCheck: true })}>
              {t('components.Header.Drawer.index.autoSign')}
            </ItemButton>

            <ItemButton Icon={LanguageChangeIcon} onClick={() => navigate('/setting/change-language', { isDuplicateCheck: true })}>
              {t('components.Header.Drawer.index.language')}
            </ItemButton>

            <ItemButton Icon={Currency24Icon} onClick={() => navigate('/setting/change-currency', { isDuplicateCheck: true })}>
              {t('components.Header.Drawer.index.currency')}
            </ItemButton>

            <ItemButton Icon={PasswordChangeIcon} onClick={() => navigate('/setting/change-password', { isDuplicateCheck: true })}>
              {t('components.Header.Drawer.index.changePassword')}
            </ItemButton>

            <ItemButton Icon={Ledger24Icon} onClick={() => navigate('/setting/ledger', { isDuplicateCheck: true })}>
              {t('components.Header.Drawer.index.ledger')}
            </ItemButton>

            <ItemButton Icon={Guide24Icon} onClick={() => window.open('https://docs.cosmostation.io/docs/User%20Guide/Cosmostation%20Extension/introduction')}>
              {t('components.Header.Drawer.index.guide')}
            </ItemButton>

            <ItemButton Icon={HelpIcon} onClick={() => window.open('https://cosmostation.io/about#contact')}>
              {t('components.Header.Drawer.index.helpSupport')}
            </ItemButton>
          </ItemContainer>
        </UpContainer>
        <DownContainer>
          <LockButtonContainer>
            <Button
              Icon={Lock16}
              typoVarient="h5"
              onClick={async () => {
                await setCurrentPassword(null);
              }}
            >
              {t('components.Header.Drawer.index.lock')}
            </Button>
          </LockButtonContainer>
        </DownContainer>
      </Container>
    </StyledDrawer>
  );
}
