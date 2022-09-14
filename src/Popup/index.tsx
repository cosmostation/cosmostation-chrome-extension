import '~/Popup/i18n';
import '~/Popup/styles/normalize.css';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { HashRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { RecoilRoot } from 'recoil';
import Grow from '@mui/material/Grow';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { THEME_TYPE } from '~/constants/theme';
import LoadingLedgerSigning from '~/Popup/components/Loading/LedgerSigning';
import LoadingOverlay from '~/Popup/components/Loading/Overlay';
import Wrapper from '~/Popup/components/Wrapper';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import Routes from '~/Popup/Routes';
import { darkEnTheme, darkKoTheme, lightEnTheme, lightKoTheme } from '~/Popup/styles/theme';

import Info16Icon from '~/images/icons/Info16.svg';

function Popup() {
  const { chromeStorage } = useChromeStorage();

  const theme = createTheme({
    ...(chromeStorage.theme === THEME_TYPE.LIGHT
      ? chromeStorage.language === 'ko'
        ? lightKoTheme
        : lightEnTheme
      : chromeStorage.language === 'ko'
      ? darkKoTheme
      : darkEnTheme),
  });

  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <Wrapper>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={2000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            variant="success"
            TransitionComponent={Grow as React.ComponentType}
            iconVariant={{ success: <Info16Icon />, error: <Info16Icon /> }}
          >
            <Routes />
            <LoadingOverlay />
            <LoadingLedgerSigning />
          </SnackbarProvider>
        </Wrapper>
      </HashRouter>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <RecoilRoot>
      <HelmetProvider>
        <Popup />
      </HelmetProvider>
    </RecoilRoot>
  </StrictMode>,
);
