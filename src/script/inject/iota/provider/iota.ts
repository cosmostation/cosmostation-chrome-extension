/* eslint-disable @typescript-eslint/no-empty-function */
import type {
  IdentifierArray,
  IotaSignAndExecuteTransactionInput,
  IotaSignAndExecuteTransactionMethod,
  IotaSignAndExecuteTransactionOutput,
  IotaSignPersonalMessageMethod,
  IotaSignPersonalMessageOutput,
  IotaSignTransactionInput,
  IotaSignTransactionMethod,
  SignedTransaction,
  Wallet,
  WalletAccount,
} from '@iota/wallet-standard';

import { COSMOSTATION_WALLET_NAME } from '@/constants/common';
import type { ApprovedIotaPermissionType } from '@/types/extension';
import type { EventDetail, IotaListenerType } from '@/types/message';
import type {
  IotaRequestAccountResponse,
  IotaRequestChainResponse,
  IotaRequestDisconnectResponse,
  IotaRequestGetPermissionResponse,
  IotaSignAndExecuteTransactionSerializedInput,
  IotaSignTransactionSerializedInput,
} from '@/types/message/inject/iota';

import { iotaRequestApp } from '../request';

const getAccounts = async () => {
  const account = (await iotaRequestApp({ method: 'iota_getAccount', params: undefined })) as IotaRequestAccountResponse;
  return [account.address];
};

const getPublicKey = async () => {
  const account = (await iotaRequestApp({ method: 'iota_getAccount', params: undefined })) as IotaRequestAccountResponse;
  return account.publicKey;
};

const getChain = async () => {
  const chain = (await iotaRequestApp({ method: 'iota_getChain', params: undefined })) as IotaRequestChainResponse;
  return chain;
};

const requestPermissions = async (permissions: ApprovedIotaPermissionType[] = ['suggestTransactions', 'viewAccount']) => {
  try {
    await iotaRequestApp({ method: 'iota_connect', params: permissions });
    return true;
  } catch {
    return false;
  }
};

const connect = requestPermissions;

const disconnect = () => iotaRequestApp({ method: 'iota_disconnect', params: undefined }) as Promise<IotaRequestDisconnectResponse>;

const hasPermissions = async (permissions: ApprovedIotaPermissionType[] = ['suggestTransactions', 'viewAccount']) => {
  try {
    const currentPermissions = (await iotaRequestApp({ method: 'iota_getPermissions', params: undefined })) as IotaRequestGetPermissionResponse;

    return permissions.every((permission) => currentPermissions.includes(permission));
  } catch {
    return false;
  }
};

const signTransaction: IotaSignTransactionMethod = async (data: Omit<IotaSignTransactionInput, 'chain' | 'account'>) => {
  const inputParam: IotaSignTransactionSerializedInput = {
    transactionBlockSerialized: await data.transaction.toJSON(),
    signal: data.signal,
  };

  return iotaRequestApp({
    method: 'iota_signTransaction',
    params: [inputParam],
  }) as Promise<SignedTransaction>;
};

const signAndExecuteTransaction: IotaSignAndExecuteTransactionMethod = async (data: Omit<IotaSignAndExecuteTransactionInput, 'chain' | 'account'>) => {
  const inputParam: IotaSignAndExecuteTransactionSerializedInput = {
    transactionBlockSerialized: await data.transaction.toJSON(),
    signal: data.signal,
    options: {
      showRawEffects: true,
      showRawInput: true,
    },
  };

  return iotaRequestApp({
    method: 'iota_signAndExecuteTransaction',
    params: [inputParam],
  }) as Promise<IotaSignAndExecuteTransactionOutput>;
};

const signPersonalMessage: IotaSignPersonalMessageMethod = async ({ message, account }) =>
  iotaRequestApp({
    method: 'iota_signPersonalMessage',
    params: {
      message: Buffer.from(message).toString('base64'),
      accountAddress: account?.address,
    },
  }) as Promise<IotaSignPersonalMessageOutput>;

class IotaStandard implements Wallet {
  version: '1.0.0';

  readonly name: string = COSMOSTATION_WALLET_NAME;

  icon: `data:image/svg+xml;base64,${string}` | `data:image/webp;base64,${string}` | `data:image/png;base64,${string}` | `data:image/gif;base64,${string}`;

  chains: IdentifierArray = [];

  features: Readonly<Record<`${string}:${string}`, unknown>> = {};

  accounts: readonly WalletAccount[] = [];

  hasPermissions = hasPermissions;

  private networkChangeEventHandler: (event: CustomEvent<EventDetail>) => void = () => {};
  private accountChangeEventHandler: (event: CustomEvent<EventDetail>) => void = () => {};

  on(eventName: IotaListenerType, eventHandler: (data: unknown) => void) {
    if (eventName === 'networkChange') {
      this.networkChangeEventHandler = (event: CustomEvent<EventDetail>) => {
        if (event.detail.chainType === 'iota') {
          eventHandler(event.detail.data.result);
        }
      };

      window.addEventListener('networkChange', this.networkChangeEventHandler as EventListener);
    }
    if (eventName === 'accountChange') {
      this.accountChangeEventHandler = (event: CustomEvent<EventDetail>) => {
        if (event.detail.chainType === 'iota') {
          if (!event.detail.data.result) {
            eventHandler('');
          } else {
            eventHandler(event.detail.data.result as string);
          }
        }
      };

      window.addEventListener('accountChange', this.accountChangeEventHandler as EventListener);
    }
  }

  constructor() {
    this.version = '1.0.0';
    this.icon =
      'data:image/png;base64,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';
    this.chains = ['iota:mainnet'];
    this.features = {
      'standard:connect': {
        version: '1.0.0',
        connect: async () => {
          const isConnect = await connect();

          if (isConnect) {
            const address = await getAccounts();
            const publicKey = await getPublicKey();
            const currentChain = await getChain();

            if (address.length > 0 && publicKey && currentChain) {
              this.accounts = [
                {
                  address: address[0],
                  publicKey: new Uint8Array(Buffer.from(publicKey.substring(2), 'hex')),
                  chains: [`iota:${currentChain}`],
                  features: ['iota:signTransaction', 'iota:signPersonalMessage', 'iota:signAndExecuteTransaction'],
                },
              ];

              return { accounts: this.accounts };
            }
          }
          return { accounts: [] };
        },
      },

      'standard:disconnect': {
        version: '1.0.0',
        disconnect,
      },

      'standard:events': {
        version: '1.0.0',
        on: this.on.bind(this),
      },

      'iota:signTransaction': {
        version: '2.0.0',
        signTransaction,
      },

      'iota:signAndExecuteTransaction': {
        version: '2.0.0',
        signAndExecuteTransaction,
      },

      'iota:signPersonalMessage': {
        version: '2.0.0',
        signPersonalMessage,
      },
    };
    void (async () => {
      try {
        const address = await getAccounts();
        const publicKey = await getPublicKey();
        const currentChain = await getChain();

        if (address.length > 0 && publicKey && currentChain) {
          this.accounts = [
            {
              address: address[0],
              publicKey: new Uint8Array(Buffer.from(publicKey.substring(2), 'hex')),
              chains: [`iota:${currentChain}`],
              features: ['iota:signTransaction', 'iota:signPersonalMessage', 'iota:signAndExecuteTransaction'],
            },
          ];
        }

        // eslint-disable-next-line no-empty
      } catch {}
    })();
  }
}

export class CosmostationIota implements IotaProvider {
  private static instance: IotaProvider;

  private networkChangeEventHandler: (event: CustomEvent<EventDetail>) => void = () => {};
  private accountChangeEventHandler: (event: CustomEvent<EventDetail>) => void = () => {};

  public static getInstance(): IotaProvider {
    if (!CosmostationIota.instance) {
      CosmostationIota.instance = new CosmostationIota();
    }
    return CosmostationIota.instance;
  }

  request = iotaRequestApp;
  on(eventName: IotaListenerType, eventHandler: (data: unknown) => void) {
    if (eventName === 'networkChange') {
      this.networkChangeEventHandler = (event: CustomEvent<EventDetail>) => {
        if (event.detail.chainType === 'iota') {
          eventHandler(event.detail.data.result);
        }
      };

      window.addEventListener('networkChange', this.networkChangeEventHandler as EventListener);
    }

    if (eventName === 'accountChange') {
      this.accountChangeEventHandler = (event: CustomEvent<EventDetail>) => {
        if (event.detail.chainType === 'iota') {
          if (!event.detail.data.result) {
            eventHandler('');
          } else {
            eventHandler(event.detail.data.result as string);
          }
        }
      };

      window.addEventListener('accountChange', this.accountChangeEventHandler as EventListener);
    }
  }
  off(eventName: IotaListenerType) {
    if (eventName === 'networkChange') {
      window.removeEventListener('networkChange', this.networkChangeEventHandler as EventListener);
    }

    if (eventName === 'accountChange') {
      window.removeEventListener('accountChange', this.accountChangeEventHandler as EventListener);
    }
  }
  connect = connect;
  disconnect = disconnect;
  getAccounts = getAccounts;
  getPublicKey = getPublicKey;
  getChain = getChain;
  hasPermissions = hasPermissions;
  requestPermissions = requestPermissions;
  signTransaction = signTransaction;
  signAndExecuteTransaction = signAndExecuteTransaction;
  signPersonalMessage = signPersonalMessage;
}

export { IotaStandard };
