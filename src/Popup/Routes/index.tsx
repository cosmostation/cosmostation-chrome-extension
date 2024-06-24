import { Route, Routes as BaseRoutes } from 'react-router-dom';

import { PATH } from '~/constants/route';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import AccountCreate from '~/Popup/pages/Account/Create';
import AccountCreateImportMnemonic from '~/Popup/pages/Account/Create/Import/Mnemonic';
import AccountCreateImportPrivateKey from '~/Popup/pages/Account/Create/Import/PrivateKey';
import AccountCreateNewLedger from '~/Popup/pages/Account/Create/New/Ledger';
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
import ChainAptosCoinAdd from '~/Popup/pages/Chain/Aptos/Coin/Add';
import ChainCosmosChainAdd from '~/Popup/pages/Chain/Cosmos/Chain/Add';
import ChainCosmosNFTAddCW721 from '~/Popup/pages/Chain/Cosmos/NFT/Add/CW721';
import ChainCosmosNFTAddCW721Search from '~/Popup/pages/Chain/Cosmos/NFT/Add/CW721/Search';
import ChainCosmosTokenAddCW20 from '~/Popup/pages/Chain/Cosmos/Token/Add/CW20';
import ChainCosmosTokenAddCW20Search from '~/Popup/pages/Chain/Cosmos/Token/Add/CW20/Search';
import ChainEthereumNetworkAdd from '~/Popup/pages/Chain/Ethereum/Network/Add';
import ChainEthereumNFTAdd from '~/Popup/pages/Chain/Ethereum/NFT/Add';
import ChainEthereumTokenAddERC20 from '~/Popup/pages/Chain/Ethereum/Token/Add/ERC20';
import ChainEthereumTokenAddERC20Search from '~/Popup/pages/Chain/Ethereum/Token/Add/ERC20/Search';
import ChainManagement from '~/Popup/pages/Chain/Management';
import ChainManagementUse from '~/Popup/pages/Chain/Management/Use';
import Dashboard from '~/Popup/pages/Dashboard';
import Home from '~/Popup/pages/Home';
import PopupAptosSignMessage from '~/Popup/pages/Popup/Aptos/SignMessage';
import PopupAptosTransaction from '~/Popup/pages/Popup/Aptos/Transaction';
import PopupCosmosAddChain from '~/Popup/pages/Popup/Cosmos/AddChain';
import PopupCosmosAddNFTs from '~/Popup/pages/Popup/Cosmos/AddNFTs';
import PopupCosmosAddTokens from '~/Popup/pages/Popup/Cosmos/AddTokens';
import PopupCosmosSignAmino from '~/Popup/pages/Popup/Cosmos/Sign/Amino';
import PopupCosmosSignDirect from '~/Popup/pages/Popup/Cosmos/Sign/Direct';
import PopupCosmosSignMessage from '~/Popup/pages/Popup/Cosmos/Sign/Message';
import PopupEthereumAddNetwork from '~/Popup/pages/Popup/Ethereum/AddNetwork';
import PopupEthereumAddTokens from '~/Popup/pages/Popup/Ethereum/AddTokens';
import PopupEthereumPersonalSign from '~/Popup/pages/Popup/Ethereum/PersonalSign';
import PopupEthereumSign from '~/Popup/pages/Popup/Ethereum/Sign';
import PopupEthereumSignTypedData from '~/Popup/pages/Popup/Ethereum/SignTypedData';
import PopupEthereumSwitchNetwork from '~/Popup/pages/Popup/Ethereum/SwitchNetwork';
import PopupEthereumTransaction from '~/Popup/pages/Popup/Ethereum/Transaction';
import PopupRequestAccount from '~/Popup/pages/Popup/RequestAccount';
import PopupSuiSignMessage from '~/Popup/pages/Popup/Sui/SignMessage';
import PopupSuiTransaction from '~/Popup/pages/Popup/Sui/Transaction';
import PopupTxReceipt from '~/Popup/pages/Popup/TxReceipt';
import SettingAddressBook from '~/Popup/pages/Setting/AddressBook';
import SettingAddressBookAdd from '~/Popup/pages/Setting/AddressBook/Add';
import SettingChangeCurrency from '~/Popup/pages/Setting/ChangeCurrency';
import SettingChangeLanguage from '~/Popup/pages/Setting/ChangeLanguage';
import SettingChangePassword from '~/Popup/pages/Setting/ChangePassword';
import SettingConnectedSites from '~/Popup/pages/Setting/ConnectedSites';
import SettingLedger from '~/Popup/pages/Setting/Ledger';
import SettingProvider from '~/Popup/pages/Setting/Provider';
import Wallet from '~/Popup/pages/Wallet';
import WalletNFTDetail from '~/Popup/pages/Wallet/NFTDetail';
import WalletNFTSend from '~/Popup/pages/Wallet/NFTSend';
import WalletOsmosisSwap from '~/Popup/pages/Wallet/OsmosisSwap';
import WalletReceive from '~/Popup/pages/Wallet/Receive';
import WalletSend from '~/Popup/pages/Wallet/Send';
import WalletSwap from '~/Popup/pages/Wallet/Swap';

export default function Routes() {
  const { extensionStorage } = useExtensionStorage();

  return (
    <BaseRoutes>
      {extensionStorage.accounts.length === 0 ? (
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
            <Route path=":id" element={<WalletSend />} />
          </Route>
          <Route path={PATH.WALLET__SWAP} element={<WalletSwap />}>
            <Route path=":id" element={<WalletSwap />} />
          </Route>
          <Route path={PATH.WALLET__OSMOSIS_SWAP} element={<WalletOsmosisSwap />} />
          <Route path={PATH.WALLET__NFT_SEND} element={<WalletNFTSend />}>
            <Route path=":id" element={<WalletNFTSend />} />
          </Route>
          <Route path={PATH.WALLET__SWAP} element={<WalletSwap />} />
          <Route path={PATH.WALLET__RECEIVE} element={<WalletReceive />} />
          <Route path={PATH.WALLET__NFT_DETAIL} element={<WalletNFTDetail />}>
            <Route path=":id" element={<WalletNFTDetail />} />
          </Route>

          <Route path={PATH.SETTING__CHANGE_PASSWORD} element={<SettingChangePassword />} />
          <Route path={PATH.SETTING__CHANGE_LANGUAGE} element={<SettingChangeLanguage />} />
          <Route path={PATH.SETTING__CHANGE_CURRENCY} element={<SettingChangeCurrency />} />
          <Route path={PATH.SETTING__ADDRESS_BOOK} element={<SettingAddressBook />} />
          <Route path={PATH.SETTING__ADDRESS_BOOK__ADD} element={<SettingAddressBookAdd />}>
            <Route path=":id" element={<SettingAddressBookAdd />} />
          </Route>
          <Route path={PATH.SETTING__CONNECTED_SITES} element={<SettingConnectedSites />} />
          <Route path={PATH.SETTING__LEDGER} element={<SettingLedger />} />
          <Route path={PATH.SETTING__PROVIDER} element={<SettingProvider />} />

          <Route path={PATH.ACCOUNT__MANAGEMENT} element={<AccountManagement />} />
          <Route path={PATH.ACCOUNT__CREATE} element={<AccountCreate />} />
          <Route path={PATH.ACCOUNT__CREATE__NEW__MNEMONIC__STEP1} element={<AccountCreateNewMnemonicStep1 />} />
          <Route path={PATH.ACCOUNT__CREATE__NEW__MNEMONIC__STEP2} element={<AccountCreateNewMnemonicStep2 />} />
          <Route path={PATH.ACCOUNT__CREATE__NEW__MNEMONIC__STEP3} element={<AccountCreateNewMnemonicStep3 />} />
          <Route path={PATH.ACCOUNT__CREATE__NEW__LEDGER} element={<AccountCreateNewLedger />} />
          <Route path={PATH.ACCOUNT__CREATE__IMPORT__MNEMONIC} element={<AccountCreateImportMnemonic />} />
          <Route path={PATH.ACCOUNT__CREATE__IMPORT__PRIVATE_KEY} element={<AccountCreateImportPrivateKey />} />

          <Route path={PATH.CHAIN__MANAGEMENT} element={<ChainManagement />} />
          <Route path={PATH.CHAIN__MANAGEMENT__USE} element={<ChainManagementUse />} />

          <Route path={PATH.CHAIN__COSMOS__CHAIN__ADD} element={<ChainCosmosChainAdd />} />
          <Route path={PATH.CHAIN__COSMOS__TOKEN__ADD__CW20} element={<ChainCosmosTokenAddCW20 />} />
          <Route path={PATH.CHAIN__COSMOS__TOKEN__ADD__CW20__SEARCH} element={<ChainCosmosTokenAddCW20Search />} />
          <Route path={PATH.CHAIN__COSMOS__NFT__ADD__CW721} element={<ChainCosmosNFTAddCW721 />} />
          <Route path={PATH.CHAIN__COSMOS__NFT__ADD__CW721__SEARCH} element={<ChainCosmosNFTAddCW721Search />} />

          <Route path={PATH.CHAIN__ETHEREUM__TOKEN__ADD__ERC20__SEARCH} element={<ChainEthereumTokenAddERC20Search />} />
          <Route path={PATH.CHAIN__ETHEREUM__TOKEN__ADD__ERC20} element={<ChainEthereumTokenAddERC20 />} />
          <Route path={PATH.CHAIN__ETHEREUM__NFT__ADD} element={<ChainEthereumNFTAdd />} />
          <Route path={PATH.CHAIN__ETHEREUM__NETWORK__ADD} element={<ChainEthereumNetworkAdd />} />

          <Route path={PATH.CHAIN__APTOS__COIN__ADD} element={<ChainAptosCoinAdd />} />

          <Route path={PATH.POPUP__REQUEST_ACCOUNT} element={<PopupRequestAccount />} />

          <Route path={PATH.POPUP__ETHEREUM__ADD_NETWORK} element={<PopupEthereumAddNetwork />} />
          <Route path={PATH.POPUP__ETHEREUM__ADD_TOKENS} element={<PopupEthereumAddTokens />} />
          <Route path={PATH.POPUP__ETHEREUM__SWITCH_NETWORK} element={<PopupEthereumSwitchNetwork />} />
          <Route path={PATH.POPUP__ETHEREUM__SIGN} element={<PopupEthereumSign />} />
          <Route path={PATH.POPUP__ETHEREUM__SIGN_TYPED_DATA} element={<PopupEthereumSignTypedData />} />
          <Route path={PATH.POPUP__ETHEREUM__PERSONAL_SIGN} element={<PopupEthereumPersonalSign />} />
          <Route path={PATH.POPUP__ETHEREUM__TRANSACTION} element={<PopupEthereumTransaction />} />

          <Route path={PATH.POPUP__COSMOS__ADD_CHAIN} element={<PopupCosmosAddChain />} />
          <Route path={PATH.POPUP__COSMOS__ADD_TOKENS} element={<PopupCosmosAddTokens />} />
          <Route path={PATH.POPUP__COSMOS__ADD_NFTS} element={<PopupCosmosAddNFTs />} />
          <Route path={PATH.POPUP__COSMOS__SIGN__AMINO} element={<PopupCosmosSignAmino />} />
          <Route path={PATH.POPUP__COSMOS__SIGN__DIRECT} element={<PopupCosmosSignDirect />} />
          <Route path={PATH.POPUP__COSMOS__SIGN__MESSAGE} element={<PopupCosmosSignMessage />} />

          <Route path={PATH.POPUP__APTOS__TRANSACTION} element={<PopupAptosTransaction />} />
          <Route path={PATH.POPUP__APTOS__SIGN_MESSAGE} element={<PopupAptosSignMessage />} />

          <Route path={PATH.POPUP__SUI__TRANSACTION} element={<PopupSuiTransaction />} />
          <Route path={PATH.POPUP__SUI__SIGN_MESSAGE} element={<PopupSuiSignMessage />} />

          <Route path={PATH.POPUP__TX_RECEIPT} element={<PopupTxReceipt />}>
            <Route path=":txhash" element={<PopupTxReceipt />} />
            <Route path=":txhash/:chainId" element={<PopupTxReceipt />} />
          </Route>
        </>
      )}
      <Route path={PATH.HOME} element={<Home />} />
      <Route path={PATH.ACCOUNT__INITIALIZE__COMPLETE} element={<AccountInitializeComplete />} />
      <Route path="*" element={<Home />} />
    </BaseRoutes>
  );
}
