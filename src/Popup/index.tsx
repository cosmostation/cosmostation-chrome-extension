import '~/Popup/i18n';
import '~/Popup/styles/normalize.css';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { RecoilRoot } from 'recoil';
import Grow from '@mui/material/Grow';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { PATH } from '~/constants/route';
import { THEME_TYPE } from '~/constants/theme';
import LoadingOverlay from '~/Popup/components/Loading/Overlay';
import Lock from '~/Popup/components/Lock';
import Wrapper from '~/Popup/components/Wrapper';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import ChainManagement from '~/Popup/pages/Chain/Management';
import ChainManagementUse from '~/Popup/pages/Chain/Management/Use';
import Dashboard from '~/Popup/pages/Dashboard';
import Home from '~/Popup/pages/Home';
import Register from '~/Popup/pages/Register';
import RegisterAccount from '~/Popup/pages/Register/Account';
import RehisterAccountMnemonic from '~/Popup/pages/Register/Account/Mnemonic';
import RehisterAccountNew from '~/Popup/pages/Register/Account/New';
import RehisterAccountPrivateKey from '~/Popup/pages/Register/Account/PrivateKey';
import RegisterPassword from '~/Popup/pages/Register/Password';
import Restore from '~/Popup/pages/Restore';
import SettingChangeCurrency from '~/Popup/pages/Setting/ChangeCurrency';
import SettingChangeLanguage from '~/Popup/pages/Setting/ChangeLanguage';
import SettingChangePassword from '~/Popup/pages/Setting/ChangePassword';
import Wallet from '~/Popup/pages/Wallet';
import { darkEnTheme, darkKoTheme, lightEnTheme, lightKoTheme } from '~/Popup/styles/theme';

function Popup() {
  const { chromeStorage } = useChromeStorage();

  const theme = createTheme(
    chromeStorage.theme === THEME_TYPE.LIGHT
      ? chromeStorage.language === 'ko'
        ? lightKoTheme
        : lightEnTheme
      : chromeStorage.language === 'ko'
      ? darkKoTheme
      : darkEnTheme,
  );

  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <Wrapper>
          <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} TransitionComponent={Grow as React.ComponentType}>
            <Routes>
              <Route path={PATH.HOME} element={<Home />} />
              <Route path={PATH.DASHBOARD} element={<Dashboard />} />
              <Route path={PATH.WALLET} element={<Wallet />} />
              <Route path={PATH.SETTING__CHANGE_PASSWORD} element={<SettingChangePassword />} />
              <Route path={PATH.SETTING__CHANGE_LANGUAGE} element={<SettingChangeLanguage />} />
              <Route path={PATH.SETTING__CHANGE_CURRENCY} element={<SettingChangeCurrency />} />
              <Route path={PATH.CHAIN__MANAGEMENT} element={<ChainManagement />} />
              <Route path={PATH.CHAIN__MANAGEMENT__USE} element={<ChainManagementUse />} />
              <Route path={PATH.REGISTER} element={<Register />} />
              <Route path={PATH.REGISTER__ACCOUNT} element={<RegisterAccount />} />
              <Route path={PATH.REGISTER__ACCOUNT__MNEMONIC} element={<RehisterAccountMnemonic />} />
              <Route path={PATH.REGISTER__ACCOUNT__PRIVATE_KEY} element={<RehisterAccountPrivateKey />} />
              <Route path={PATH.REGISTER__ACCOUNT__NEW} element={<RehisterAccountNew />} />
              <Route path={PATH.REGISTER__PASSWORD} element={<RegisterPassword />} />
              <Route path={PATH.RESTORE} element={<Restore />} />
            </Routes>
            <LoadingOverlay />
          </SnackbarProvider>
        </Wrapper>
      </HashRouter>
    </ThemeProvider>
  );
}

ReactDOM.render(
  <StrictMode>
    <RecoilRoot>
      <Popup />
    </RecoilRoot>
  </StrictMode>,
  document.getElementById('root'),
);
