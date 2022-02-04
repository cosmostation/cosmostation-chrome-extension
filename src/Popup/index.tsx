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
import Home from '~/Popup/pages/Home';
import Register from '~/Popup/pages/Register';
import RegisterAccount from '~/Popup/pages/Register/Account';
import RehisterAccountMnemonic from '~/Popup/pages/Register/Account/Mnemonic';
import RehisterAccountNew from '~/Popup/pages/Register/Account/New';
import RehisterAccountPrivateKey from '~/Popup/pages/Register/Account/PrivateKey';
import RegisterPassword from '~/Popup/pages/Register/Password';
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
            <Lock>
              <Routes>
                <Route path={PATH.HOME} element={<Home />} />
                <Route path={PATH.REGISTER} element={<Register />} />
                <Route path={PATH.REGISTER__ACCOUNT} element={<RegisterAccount />} />
                <Route path={PATH.REGISTER__ACCOUNT__MNEMONIC} element={<RehisterAccountMnemonic />} />
                <Route path={PATH.REGISTER__ACCOUNT__PRIVATE_KEY} element={<RehisterAccountPrivateKey />} />
                <Route path={PATH.REGISTER__ACCOUNT__NEW} element={<RehisterAccountNew />} />
              </Routes>
            </Lock>
            <Routes>
              <Route path={PATH.REGISTER__PASSWORD} element={<RegisterPassword />} />
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
