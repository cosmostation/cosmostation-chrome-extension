import '~/Popup/i18n';
import '~/Popup/styles/normalize.css';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { RecoilRoot } from 'recoil';
import Grow from '@mui/material/Grow';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { PATH } from '~/constants/route';
import { THEME_TYPE } from '~/constants/theme';
import LoadingOverlay from '~/Popup/components/Loading/Overlay';
import Wrapper from '~/Popup/components/Wrapper';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import AccountCreate from '~/Popup/pages/Account/Create';
import AccountCreateImportMnemonic from '~/Popup/pages/Account/Create/Import/Mnemonic';
import AccountCreateImportPrivateKey from '~/Popup/pages/Account/Create/Import/PrivateKey';
import AccountCreateNewMnemonicStep1 from '~/Popup/pages/Account/Create/New/Mnemonic/Step1';
import AccountCreateNewMnemonicStep2 from '~/Popup/pages/Account/Create/New/Mnemonic/Step2';
import AccountCreateNewMnemonicStep3 from '~/Popup/pages/Account/Create/New/Mnemonic/Step3';
import AccountInitialize from '~/Popup/pages/Account/Initialize';
import AccountInitializeComplete from '~/Popup/pages/Account/Initialize/Complete';
import AccountInitializeImport from '~/Popup/pages/Account/Initialize/Import';
import AccountInitializeImportMnemonic from '~/Popup/pages/Account/Initialize/Import/Mnemonic';
import AccountInitializeImportPrivateKey from '~/Popup/pages/Account/Initialize/Import/PrivateKey';
import AccountInitializeImportStep2 from '~/Popup/pages/Account/Initialize/Import/Step2';
import AccountInitializeImportStep3 from '~/Popup/pages/Account/Initialize/Import/Step3';
import AccountInitializeNewMnemonicStep1 from '~/Popup/pages/Account/Initialize/New/Mnemonic/Step1';
import AccountInitializeNewMnemonicStep2 from '~/Popup/pages/Account/Initialize/New/Mnemonic/Step2';
import AccountInitializeNewMnemonicStep3 from '~/Popup/pages/Account/Initialize/New/Mnemonic/Step3';
import AccountInitializeNewMnemonicStep4 from '~/Popup/pages/Account/Initialize/New/Mnemonic/Step4';
import AccountInitializeNewMnemonicStep5 from '~/Popup/pages/Account/Initialize/New/Mnemonic/Step5';
import AccountInitializeWelcome from '~/Popup/pages/Account/Initialize/Welcome';
import AccountManagement from '~/Popup/pages/Account/Management';
import ChainEthereumNetworkAdd from '~/Popup/pages/Chain/Ethereum/Network/Add';
import ChainEthereumTokenAddERC20 from '~/Popup/pages/Chain/Ethereum/Token/Add/ERC20';
import ChainManagement from '~/Popup/pages/Chain/Management';
import ChainManagementUse from '~/Popup/pages/Chain/Management/Use';
import Dashboard from '~/Popup/pages/Dashboard';
import Home from '~/Popup/pages/Home';
import PopupEthereumAddNetwork from '~/Popup/pages/Popup/Ethereum/AddNetwork';
import PopupEthereumAddTokens from '~/Popup/pages/Popup/Ethereum/AddTokens';
import PopupEthereumPersonalSign from '~/Popup/pages/Popup/Ethereum/PersonalSign';
import PopupEthereumSign from '~/Popup/pages/Popup/Ethereum/Sign';
import PopupEthereumSignTypedData from '~/Popup/pages/Popup/Ethereum/SignTypedData';
import PopupEthereumSwitchNetwork from '~/Popup/pages/Popup/Ethereum/SwitchNetwork';
import PopupEthereumTransaction from '~/Popup/pages/Popup/Ethereum/Transaction';
import PopupRequestAccount from '~/Popup/pages/Popup/RequestAccount';
import PopupTendermintAddChain from '~/Popup/pages/Popup/Tendermint/AddChain';
import PopupTendermintSignAmino from '~/Popup/pages/Popup/Tendermint/Sign/Amino';
import PopupTendermintSignDirect from '~/Popup/pages/Popup/Tendermint/Sign/Direct';
import SettingAddressBook from '~/Popup/pages/Setting/AddressBook';
import SettingAddressBookAdd from '~/Popup/pages/Setting/AddressBook/Add';
import SettingChangeCurrency from '~/Popup/pages/Setting/ChangeCurrency';
import SettingChangeLanguage from '~/Popup/pages/Setting/ChangeLanguage';
import SettingChangePassword from '~/Popup/pages/Setting/ChangePassword';
import Wallet from '~/Popup/pages/Wallet';
import WalletReceive from '~/Popup/pages/Wallet/Receive';
import WalletSend from '~/Popup/pages/Wallet/Send';
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
            <Routes>
              {chromeStorage.accounts.length === 0 ? (
                <>
                  <Route path={PATH.ACCOUNT__INITIALIZE} element={<AccountInitialize />} />
                  <Route path={PATH.ACCOUNT__INITIALIZE__WELCOME} element={<AccountInitializeWelcome />} />
                  <Route path={PATH.ACCOUNT__INITIALIZE__IMPORT} element={<AccountInitializeImport />} />
                  <Route path={PATH.ACCOUNT__INITIALIZE__IMPORT__MNEMONIC} element={<AccountInitializeImportMnemonic />} />
                  <Route path={PATH.ACCOUNT__INITIALIZE__IMPORT__PRIVATE_KEY} element={<AccountInitializeImportPrivateKey />} />
                  <Route path={PATH.ACCOUNT__INITIALIZE__IMPORT__STEP2} element={<AccountInitializeImportStep2 />} />
                  <Route path={PATH.ACCOUNT__INITIALIZE__IMPORT__STEP3} element={<AccountInitializeImportStep3 />} />
                  <Route path={PATH.ACCOUNT__INITIALIZE__NEW__MNEMONIC__STEP1} element={<AccountInitializeNewMnemonicStep1 />} />
                  <Route path={PATH.ACCOUNT__INITIALIZE__NEW__MNEMONIC__STEP2} element={<AccountInitializeNewMnemonicStep2 />} />
                  <Route path={PATH.ACCOUNT__INITIALIZE__NEW__MNEMONIC__STEP3} element={<AccountInitializeNewMnemonicStep3 />} />
                  <Route path={PATH.ACCOUNT__INITIALIZE__NEW__MNEMONIC__STEP4} element={<AccountInitializeNewMnemonicStep4 />} />
                  <Route path={PATH.ACCOUNT__INITIALIZE__NEW__MNEMONIC__STEP5} element={<AccountInitializeNewMnemonicStep5 />} />
                </>
              ) : (
                <>
                  <Route path={PATH.DASHBOARD} element={<Dashboard />} />

                  <Route path={PATH.WALLET} element={<Wallet />} />
                  <Route path={PATH.WALLET__SEND} element={<WalletSend />}>
                    <Route path=":coin" element={<WalletSend />} />
                  </Route>
                  <Route path={PATH.WALLET__RECEIVE} element={<WalletReceive />} />

                  <Route path={PATH.SETTING__CHANGE_PASSWORD} element={<SettingChangePassword />} />
                  <Route path={PATH.SETTING__CHANGE_LANGUAGE} element={<SettingChangeLanguage />} />
                  <Route path={PATH.SETTING__CHANGE_CURRENCY} element={<SettingChangeCurrency />} />
                  <Route path={PATH.SETTING__ADDRESS_BOOK} element={<SettingAddressBook />} />
                  <Route path={PATH.SETTING__ADDRESS_BOOK__ADD} element={<SettingAddressBookAdd />} />

                  <Route path={PATH.ACCOUNT__MANAGEMENT} element={<AccountManagement />} />
                  <Route path={PATH.ACCOUNT__CREATE} element={<AccountCreate />} />
                  <Route path={PATH.ACCOUNT__CREATE__NEW__MNEMONIC__STEP1} element={<AccountCreateNewMnemonicStep1 />} />
                  <Route path={PATH.ACCOUNT__CREATE__NEW__MNEMONIC__STEP2} element={<AccountCreateNewMnemonicStep2 />} />
                  <Route path={PATH.ACCOUNT__CREATE__NEW__MNEMONIC__STEP3} element={<AccountCreateNewMnemonicStep3 />} />
                  <Route path={PATH.ACCOUNT__CREATE__IMPORT__MNEMONIC} element={<AccountCreateImportMnemonic />} />
                  <Route path={PATH.ACCOUNT__CREATE__IMPORT__PRIVATE_KEY} element={<AccountCreateImportPrivateKey />} />

                  <Route path={PATH.CHAIN__MANAGEMENT} element={<ChainManagement />} />
                  <Route path={PATH.CHAIN__MANAGEMENT__USE} element={<ChainManagementUse />} />

                  <Route path={PATH.CHAIN__ETHEREUM__TOKEN__ADD__ERC20} element={<ChainEthereumTokenAddERC20 />} />
                  <Route path={PATH.CHAIN__ETHEREUM__NETWORK__ADD} element={<ChainEthereumNetworkAdd />} />

                  <Route path={PATH.POPUP__REQUEST_ACCOUNT} element={<PopupRequestAccount />} />

                  <Route path={PATH.POPUP__ETHEREUM__ADD_NETWORK} element={<PopupEthereumAddNetwork />} />
                  <Route path={PATH.POPUP__ETHEREUM__ADD_TOKENS} element={<PopupEthereumAddTokens />} />
                  <Route path={PATH.POPUP__ETHEREUM__SWITCH_NETWORK} element={<PopupEthereumSwitchNetwork />} />
                  <Route path={PATH.POPUP__ETHEREUM__SIGN} element={<PopupEthereumSign />} />
                  <Route path={PATH.POPUP__ETHEREUM__SIGN_TYPED_DATA} element={<PopupEthereumSignTypedData />} />
                  <Route path={PATH.POPUP__ETHEREUM__PERSONAL_SIGN} element={<PopupEthereumPersonalSign />} />
                  <Route path={PATH.POPUP__ETHEREUM__TRANSACTION} element={<PopupEthereumTransaction />} />

                  <Route path={PATH.POPUP__TENDERMINT__ADD_CHAIN} element={<PopupTendermintAddChain />} />
                  <Route path={PATH.POPUP__TENDERMINT__SIGN__AMINO} element={<PopupTendermintSignAmino />} />
                  <Route path={PATH.POPUP__TENDERMINT__SIGN__DIRECT} element={<PopupTendermintSignDirect />} />
                </>
              )}
              <Route path={PATH.HOME} element={<Home />} />
              <Route path={PATH.ACCOUNT__INITIALIZE__COMPLETE} element={<AccountInitializeComplete />} />
              <Route path="*" element={<Home />} />
            </Routes>
            <LoadingOverlay />
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
