import type { DrawerProps as BaseDrawerProps } from '@mui/material';
import { Typography } from '@mui/material';

import { THEME_TYPE } from '~/constants/theme';
import Button from '~/Popup/components/common/Button';
import Divider from '~/Popup/components/common/Divider';
import IconButton from '~/Popup/components/common/IconButton';
import Switch from '~/Popup/components/common/Switch';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';

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
import Close24Icon from '~/images/icons/Close24.svg';
import Connect24Icon from '~/images/icons/Connect24.svg';
import Cosmostation14Icon from '~/images/icons/Cosmostation14.svg';
import Currency24Icon from '~/images/icons/Currency24.svg';
import DarkMode24Icon from '~/images/icons/DarkMode24.svg';
import Expand24Icon from '~/images/icons/Expand24.svg';
import Guide24Icon from '~/images/icons/Guide24.svg';
import HelpIcon from '~/images/icons/Help.svg';
import LanguageChangeIcon from '~/images/icons/LanguageChange.svg';
import Ledger24Icon from '~/images/icons/Ledger24.svg';
import Lock16 from '~/images/icons/Lock16.svg';
import Logo24Icon from '~/images/icons/Logo28.svg';
import PasswordChangeIcon from '~/images/icons/PasswordChange.svg';
import Provider24Icon from '~/images/icons/Provider24.svg';
import SettingIcon24 from '~/images/icons/Setting24.svg';

type DrawerProps = Omit<BaseDrawerProps, 'children'>;

export default function Drawer({ onClose, ...remainder }: DrawerProps) {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { navigate } = useNavigate();
  const { setCurrentPassword } = useCurrentPassword();
  const { t } = useTranslation();

  const isDarkMode = extensionStorage.theme === THEME_TYPE.DARK;

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
                    await setExtensionStorage('theme', event.currentTarget.checked ? THEME_TYPE.DARK : THEME_TYPE.LIGHT);
                  }}
                />
              </ItemRightContainer>
            </ItemToggleContainer>

            <ItemButton
              Icon={Expand24Icon}
              onClick={() => {
                void debouncedOpenTab();
              }}
            >
              {t('components.Header.Drawer.index.expand')}
            </ItemButton>

            <ItemButton Icon={AddressBook24Icon} onClick={() => navigate('/setting/address-book', { isDuplicateCheck: true })}>
              {t('components.Header.Drawer.index.addressBook')}
            </ItemButton>

            <ItemButton Icon={Connect24Icon} onClick={() => navigate('/setting/connected-sites', { isDuplicateCheck: true })}>
              {t('components.Header.Drawer.index.connectedSites')}
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

            <ItemButton Icon={Provider24Icon} onClick={() => navigate('/setting/provider', { isDuplicateCheck: true })}>
              {t('components.Header.Drawer.index.provider')}
            </ItemButton>

            <ItemButton Icon={Guide24Icon} onClick={() => window.open('https://docs.cosmostation.io/extension')}>
              {t('components.Header.Drawer.index.guide')}
            </ItemButton>

            <ItemButton Icon={SettingIcon24} onClick={() => navigate('/chain/management', { isDuplicateCheck: true })}>
              {t('components.Header.Drawer.index.addCustomChain')}
            </ItemButton>

            <ItemButton Icon={HelpIcon} onClick={() => window.open('https://cosmostation.io/contact')}>
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
