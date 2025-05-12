import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { Route as Initial } from '@/pages/account/initial';
import { Route as AptosSignMessage } from '@/pages/popup/aptos/sign-message';
import { Route as AptosTransaction } from '@/pages/popup/aptos/transaction';
import { Route as BitcoinSend } from '@/pages/popup/bitcoin/send';
import { Route as BitcoinSignMessage } from '@/pages/popup/bitcoin/sign-message';
import { Route as BitcoinSignPsbt } from '@/pages/popup/bitcoin/sign-psbt';
import { Route as BitcoinSignPsbts } from '@/pages/popup/bitcoin/sign-psbts';
import { Route as BitcoinSwitchChain } from '@/pages/popup/bitcoin/switch-network';
import { Route as CosmosAddChain } from '@/pages/popup/cosmos/add-chain';
import { Route as CosmosAddNFTs } from '@/pages/popup/cosmos/add-nfts';
import { Route as CosmosAddToken } from '@/pages/popup/cosmos/add-token';
import { Route as CosmosSignAmino } from '@/pages/popup/cosmos/sign/amino';
import { Route as CosmosSignDirect } from '@/pages/popup/cosmos/sign/direct';
import { Route as CosmosSignMessage } from '@/pages/popup/cosmos/sign/message';
import { Route as EVMAddChain } from '@/pages/popup/evm/add-chain';
import { Route as EVMAddToken } from '@/pages/popup/evm/add-token';
import { Route as EVMSign } from '@/pages/popup/evm/sign/eth-sign';
import { Route as EVMPersonalSign } from '@/pages/popup/evm/sign/personal-sign';
import { Route as EVMSignTypedData } from '@/pages/popup/evm/sign/sign-typed-data';
import { Route as EVMSwitchChain } from '@/pages/popup/evm/switch-network';
import { Route as EVMTransaction } from '@/pages/popup/evm/transaction';
import { Route as IotaSignMessage } from '@/pages/popup/iota/sign-message';
import { Route as IotaTransaction } from '@/pages/popup/iota/transaction';
import { Route as RequestAccount } from '@/pages/popup/request-account';
import { Route as SuiSignMessage } from '@/pages/popup/sui/sign-message';
import { Route as SuiTransaction } from '@/pages/popup/sui/transaction';
import type { AptosRequest } from '@/types/message/inject/aptos';
import type { BitcoinRequest } from '@/types/message/inject/bitcoin';
import type { CosmosRequest } from '@/types/message/inject/cosmos';
import type { EvmRequest } from '@/types/message/inject/evm';
import type { IotaRequest } from '@/types/message/inject/iota';
import type { SuiRequest } from '@/types/message/inject/sui';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

type NavigationGateProps = {
  children: JSX.Element;
};

export default function NavigationGate({ children }: NavigationGateProps) {
  const navigate = useNavigate();

  const { userAccounts, requestQueue } = useExtensionStorageStore((state) => state);

  useEffect(() => {
    void (async () => {
      if (userAccounts.length === 0) {
        navigate({
          to: Initial.to,
        });
        return;
      }

      if (requestQueue.length > 0) {
        if (requestQueue[0].chainType === 'cosmos') {
          navigate({
            to: getNavigationPathForCosmosRequest(requestQueue[0]),
          });
        }
        if (requestQueue[0].chainType === 'evm') {
          navigate({
            to: getNavigationPathForEvmRequest(requestQueue[0]),
          });
        }
        if (requestQueue[0].chainType === 'sui') {
          navigate({
            to: getNavigationPathForSuiRequest(requestQueue[0]),
          });
        }
        if (requestQueue[0].chainType === 'bitcoin') {
          navigate({
            to: getNavigationPathForBitcoinRequest(requestQueue[0]),
          });
        }
        if (requestQueue[0].chainType === 'aptos') {
          navigate({
            to: getNavigationPathForAptosRequest(requestQueue[0]),
          });
        }
        if (requestQueue[0].chainType === 'iota') {
          navigate({
            to: getNavigationPathForIotaRequest(requestQueue[0]),
          });
        }
      }
    })();
  }, [userAccounts.length, navigate, requestQueue]);

  return <>{children}</>;
}

const getNavigationPathForCosmosRequest = (requestQueue: CosmosRequest) => {
  switch (requestQueue.method) {
    case 'cos_requestAccount':
      return RequestAccount.to;
    case 'cos_requestAccountsSettled':
      return RequestAccount.to;
    case 'cos_addChain':
      return CosmosAddChain.to;
    case 'cos_signAmino':
      return CosmosSignAmino.to;
    case 'cos_signDirect':
      return CosmosSignDirect.to;
    case 'cos_addTokensCW20Internal':
      return CosmosAddToken.to;
    case 'cos_addNFTsCW721':
      return CosmosAddNFTs.to;
    case 'cos_signMessage':
      return CosmosSignMessage.to;

    default:
      return '/';
  }
};

const getNavigationPathForEvmRequest = (requestQueue: EvmRequest) => {
  switch (requestQueue.method) {
    case 'eth_requestAccounts':
      return RequestAccount.to;
    case 'wallet_requestPermissions':
      return RequestAccount.to;
    case 'ethc_switchNetwork':
      return EVMSwitchChain.to;
    case 'eth_signTransaction':
      return EVMTransaction.to;
    case 'eth_sendTransaction':
      return EVMTransaction.to;
    case 'eth_sign':
      return EVMSign.to;
    case 'personal_sign':
      return EVMPersonalSign.to;
    case 'eth_signTypedData_v3':
      return EVMSignTypedData.to;
    case 'eth_signTypedData_v4':
      return EVMSignTypedData.to;
    case 'ethc_addNetwork':
      return EVMAddChain.to;
    case 'ethc_addTokens':
      return EVMAddToken.to;

    default:
      return '/';
  }
};

const getNavigationPathForSuiRequest = (requestQueue: SuiRequest) => {
  switch (requestQueue.method) {
    case 'sui_connect':
      return RequestAccount.to;
    case 'sui_getAccount':
      return RequestAccount.to;
    case 'sui_signTransaction':
      return SuiTransaction.to;
    case 'sui_signAndExecuteTransaction':
      return SuiTransaction.to;
    case 'sui_signTransactionBlock':
      return SuiTransaction.to;
    case 'sui_signAndExecuteTransactionBlock':
      return SuiTransaction.to;
    case 'sui_signMessage':
      return SuiSignMessage.to;
    case 'sui_signPersonalMessage':
      return SuiSignMessage.to;

    default:
      return '/';
  }
};

const getNavigationPathForBitcoinRequest = (requestQueue: BitcoinRequest) => {
  switch (requestQueue.method) {
    case 'bit_requestAccount':
      return RequestAccount.to;
    case 'bitc_switchNetwork':
      return BitcoinSwitchChain.to;
    case 'bit_sendBitcoin':
      return BitcoinSend.to;
    case 'bit_signPsbt':
      return BitcoinSignPsbt.to;
    case 'bit_signPsbts':
      return BitcoinSignPsbts.to;
    case 'bit_signMessage':
      return BitcoinSignMessage.to;

    default:
      return '/';
  }
};

const getNavigationPathForAptosRequest = (requestQueue: AptosRequest) => {
  switch (requestQueue.method) {
    case 'aptos_connect':
      return RequestAccount.to;
    case 'aptos_account':
      return RequestAccount.to;
    case 'aptos_signTransaction':
      return AptosTransaction.to;
    case 'aptos_signMessage':
      return AptosSignMessage.to;

    default:
      return '/';
  }
};

const getNavigationPathForIotaRequest = (requestQueue: IotaRequest) => {
  switch (requestQueue.method) {
    case 'iota_connect':
      return RequestAccount.to;
    case 'iota_getAccount':
      return RequestAccount.to;
    case 'iota_signTransaction':
      return IotaTransaction.to;
    case 'iota_signAndExecuteTransaction':
      return IotaTransaction.to;
    case 'iota_signPersonalMessage':
      return IotaSignMessage.to;

    default:
      return '/';
  }
};
