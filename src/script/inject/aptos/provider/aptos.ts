import type { AccountAuthenticator, AnyRawTransaction } from '@aptos-labs/ts-sdk';
import { AccountAuthenticatorEd25519, Deserializer, Ed25519PublicKey, Ed25519Signature, Network, Serializer, SigningScheme } from '@aptos-labs/ts-sdk';
import type {
  AptosConnectMethod,
  AptosDisconnectMethod,
  AptosFeatures,
  AptosGetAccountMethod,
  AptosGetNetworkMethod,
  AptosOnAccountChangeInput,
  AptosOnAccountChangeMethod,
  AptosOnNetworkChangeInput,
  AptosOnNetworkChangeMethod,
  AptosSignMessageInput,
  AptosSignMessageMethod,
  AptosSignMessageOutput,
  AptosSignTransactionMethod,
  AptosWallet as AptosWalletInterface,
  AptosWalletAccount as AptosWalletAccountInterface,
  IdentifierArray,
  NetworkInfo,
  UserResponse,
} from '@aptos-labs/wallet-standard';
import { AccountInfo, APTOS_CHAINS, UserResponseStatus } from '@aptos-labs/wallet-standard';

import { COSMOSTATION_ENCODED_LOGO_IMAGE, COSMOSTATION_WALLET_NAME } from '@/constants/common';
import type { EventDetail } from '@/types/message';
import type { AptosConnectResponse, AptosNetworkResponse, AptosSignMessageResponse, AptosSignTransactionResponse } from '@/types/message/inject/aptos';

import { aptosRequestApp } from '../request';

export class CosmostationWalletAccount implements AptosWalletAccountInterface {
  address: string;
  publicKey: Uint8Array;
  chains: IdentifierArray = APTOS_CHAINS.filter((chain) => chain === 'aptos:mainnet');
  features: IdentifierArray = [];
  signingScheme: SigningScheme;
  label?: string;
  icon?:
    | `data:image/svg+xml;base64,${string}`
    | `data:image/webp;base64,${string}`
    | `data:image/png;base64,${string}`
    | `data:image/gif;base64,${string}`
    | undefined;

  accountInfo: AccountInfo;

  constructor(account: { address: string; publicKey: string; signingScheme: SigningScheme }) {
    this.address = account.address;
    this.publicKey = new Uint8Array(Buffer.from(account.publicKey, 'hex'));
    this.chains = APTOS_CHAINS.filter((chain) => chain === 'aptos:mainnet');
    this.signingScheme = account.signingScheme;
    this.accountInfo = new AccountInfo({
      address: this.address,
      publicKey: new Ed25519PublicKey(this.publicKey),
    });
  }
}

export class CosmostationAptos implements AptosWalletInterface {
  private static instance: CosmostationAptos;

  readonly url: string = 'https://www.cosmostation.io/';
  readonly version = '1.0.0';
  readonly name: string = COSMOSTATION_WALLET_NAME;
  readonly icon = COSMOSTATION_ENCODED_LOGO_IMAGE;
  chains = APTOS_CHAINS.filter((chain) => chain === 'aptos:mainnet');

  accounts: CosmostationWalletAccount[] = [];

  get features(): AptosFeatures {
    return {
      'aptos:connect': {
        version: '1.0.0',
        connect: this.connect,
      },
      'aptos:network': {
        version: '1.0.0',
        network: this.network,
      },
      'aptos:disconnect': {
        version: '1.0.0',
        disconnect: this.disconnect,
      },
      'aptos:signTransaction': {
        version: '1.0.0',
        signTransaction: this.signTransaction,
      },
      'aptos:signMessage': {
        version: '1.0.0',
        signMessage: this.signMessage,
      },
      'aptos:onAccountChange': {
        version: '1.0.0',
        onAccountChange: this.onAccountChange,
      },
      'aptos:onNetworkChange': {
        version: '1.0.0',
        onNetworkChange: this.onNetworkChange,
      },
      'aptos:account': {
        version: '1.0.0',
        account: this.account,
      },
    };
  }

  public static getInstance(): CosmostationAptos {
    if (!CosmostationAptos.instance) {
      CosmostationAptos.instance = new CosmostationAptos();
    }
    return CosmostationAptos.instance;
  }

  account: AptosGetAccountMethod = async (): Promise<AccountInfo> => {
    try {
      const response = (await aptosRequestApp({ method: 'aptos_connect', params: undefined })) as AptosConnectResponse;
      const formattedPublicKey = new Ed25519PublicKey(response.publicKey);

      const account = new AccountInfo({
        address: response.address,
        publicKey: formattedPublicKey,
      });

      this.accounts = [
        new CosmostationWalletAccount({
          address: response.address,
          publicKey: response.publicKey,
          signingScheme: SigningScheme.Ed25519,
        }),
      ];

      return account;
    } catch {
      return {} as unknown as AccountInfo;
    }
  };

  connect: AptosConnectMethod = async (): Promise<UserResponse<AccountInfo>> => {
    try {
      const response = (await aptosRequestApp({ method: 'aptos_connect', params: undefined })) as AptosConnectResponse;

      const formattedPublicKey = new Ed25519PublicKey(response.publicKey);

      const account = new AccountInfo({
        address: response.address,
        publicKey: formattedPublicKey,
      });

      return {
        status: UserResponseStatus.APPROVED,
        args: account,
      };
    } catch {
      return {
        status: UserResponseStatus.REJECTED,
      };
    }
  };

  network: AptosGetNetworkMethod = async (): Promise<NetworkInfo> => {
    const response = (await aptosRequestApp({ method: 'aptos_network', params: undefined })) as AptosNetworkResponse;

    const networkName = (() => {
      if (response === 'mainnet') {
        return Network.MAINNET;
      } else if (response === 'testnet') {
        return Network.TESTNET;
      } else if (response === 'devnet') {
        return Network.DEVNET;
      }

      return Network.MAINNET;
    })();

    const chainId = (() => {
      if (response === 'mainnet') {
        return 1;
      } else if (response === 'testnet') {
        return 2;
      } else if (response === 'devnet') {
        return 34;
      }

      return 1;
    })();

    return {
      name: networkName,
      chainId: chainId,
    };
  };

  disconnect: AptosDisconnectMethod = async (): Promise<void> => {
    void aptosRequestApp({ method: 'aptos_disconnect', params: undefined });
  };

  signTransaction: AptosSignTransactionMethod = async (transaction: AnyRawTransaction, asFeePayer?: boolean): Promise<UserResponse<AccountAuthenticator>> => {
    if (transaction.secondarySignerAddresses) {
      throw new Error('Not supported yet');
    }

    const serializer = new Serializer();
    serializer.serialize(transaction);
    const txBytes = Buffer.from(serializer.toUint8Array()).toString('hex');

    const response = (await aptosRequestApp({
      method: 'aptos_signTransaction',
      params: {
        serializedTxHex: txBytes,
        asFeePayer: asFeePayer,
      },
    })) as AptosSignTransactionResponse;

    const deserializer3 = new Deserializer(Uint8Array.from(Buffer.from(response, 'hex')));
    const accountAuthenticator = AccountAuthenticatorEd25519.deserialize(deserializer3);

    return {
      status: UserResponseStatus.APPROVED,
      args: accountAuthenticator,
    };
  };

  signMessage: AptosSignMessageMethod = async (input: AptosSignMessageInput): Promise<UserResponse<AptosSignMessageOutput>> => {
    const response = (await aptosRequestApp({ method: 'aptos_signMessage', params: input })) as AptosSignMessageResponse;

    const deserializer = new Deserializer(Uint8Array.from(Buffer.from(response.signature, 'hex')));
    const signature = Ed25519Signature.deserialize(deserializer);

    return Promise.resolve({
      status: UserResponseStatus.APPROVED,
      args: {
        address: response.address,
        application: input.application && !!response.application ? response.application : undefined,
        chainId: input.chainId && !!response.chainId ? response.chainId : undefined,
        fullMessage: response.fullMessage,
        message: input.message,
        nonce: input.nonce,
        prefix: 'APTOS',
        signature: signature,
      },
    });
  };

  onAccountChange: AptosOnAccountChangeMethod = async (input: AptosOnAccountChangeInput): Promise<void> => {
    const handler = async (event: Event) => {
      const customEvent = event as CustomEvent<EventDetail>;
      if (customEvent.detail.chainType === 'aptos') {
        const response = (await aptosRequestApp({ method: 'aptos_connect', params: undefined })) as AptosConnectResponse;

        const formattedPublicKey = new Ed25519PublicKey(response.publicKey);

        const accountInfo = new AccountInfo({
          address: response.address,
          publicKey: formattedPublicKey,
        });

        input(accountInfo);
      }
    };

    window.addEventListener('accountChange', handler as EventListener);
    return Promise.resolve();
  };

  onNetworkChange: AptosOnNetworkChangeMethod = async (input: AptosOnNetworkChangeInput): Promise<void> => {
    const handler = (event: CustomEvent<EventDetail>) => {
      if (event.detail.chainType === 'aptos') {
        const networkInfo = (() => {
          const chainName = event.detail.data.result as string;

          const networkName = (() => {
            if (chainName === 'mainnet') {
              return Network.MAINNET;
            } else if (chainName === 'testnet') {
              return Network.TESTNET;
            } else if (chainName === 'devnet') {
              return Network.DEVNET;
            }

            return Network.MAINNET;
          })();

          const chainId = (() => {
            if (chainName === 'mainnet') {
              return 1;
            } else if (chainName === 'testnet') {
              return 2;
            } else if (chainName === 'devnet') {
              return 34;
            }

            return 1;
          })();

          return {
            name: networkName,
            chainId: chainId,
            url: 'https://fullnode.devnet.aptoslabs.com/v1',
          };
        })();

        input(networkInfo);
      }
    };

    window.addEventListener('networkChange', handler as EventListener);

    return Promise.resolve();
  };
}
