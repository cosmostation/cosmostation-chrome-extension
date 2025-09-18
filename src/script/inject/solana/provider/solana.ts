/* eslint-disable @typescript-eslint/no-empty-function */
import bs58 from 'bs58';
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransactionMethod,
  SolanaSignAndSendTransactionOutput,
  SolanaSignInFeature,
  SolanaSignInMethod,
  SolanaSignInOutput,
  SolanaSignMessageFeature,
  SolanaSignMessageInput,
  SolanaSignMessageMethod,
  SolanaSignMessageOutput,
  SolanaSignTransactionFeature,
  SolanaSignTransactionMethod,
  SolanaSignTransactionOutput,
} from '@solana/wallet-standard-features';
import { SolanaSignAndSendTransaction, SolanaSignIn, SolanaSignMessage, SolanaSignTransaction } from '@solana/wallet-standard-features';
import { createSignInMessageText } from '@solana/wallet-standard-util';
import type { Transaction } from '@solana/web3.js';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import type { IdentifierArray, IdentifierString, Wallet, WalletAccount } from '@wallet-standard/base';
import {
  StandardConnect,
  type StandardConnectFeature,
  type StandardConnectMethod,
  StandardDisconnect,
  type StandardDisconnectFeature,
  type StandardDisconnectMethod,
  StandardEvents,
  type StandardEventsFeature,
  type StandardEventsListeners,
  type StandardEventsNames,
  type StandardEventsOnMethod,
} from '@wallet-standard/features';

import { COSMOSTATION_ENCODED_LOGO_IMAGE, COSMOSTATION_WALLET_NAME } from '@/constants/common';
import type { EventDetail } from '@/types/message';
import type { BaseRequest } from '@/types/message/inject';
import type {
  SolanaConnectResponse,
  SolanaInternalSignAndSendTransactionParam,
  SolanaInternalSignMessageResponse,
  SolanaSignAllTransactionsResponse,
  SolanaSignAndSendAllTransactionsResponse,
  SolanaSignAndSendTransactionParam,
  SolanaSignAndSendTransactionResponse,
  SolanaSignMessage as SolanaInternalSignMessage,
  SolanaSignMessageResponse,
  SolanaSignTransactionParam,
  SolanaSignTransactionResponse,
} from '@/types/message/inject/solana';
import { deserializeTransaction } from '@/utils/solana/transaction';
import { isVersionedTransaction } from '@/utils/solana/util';

import { solanaRequestApp } from '../request';

interface RequestParams {
  method: string;
  params: unknown;
}

const SOLANA_MAINNET_CHAIN = 'solana:mainnet';

const SOLANA_CHAINS = [SOLANA_MAINNET_CHAIN] as const;

type SolanaChain = (typeof SOLANA_CHAINS)[number];

function isSolanaChain(chain: IdentifierString): chain is SolanaChain {
  return SOLANA_CHAINS.includes(chain as SolanaChain);
}

const request = async ({ method, params }: RequestParams) => {
  const solanaMethod = `solana_${method}` as BaseRequest['method'];

  if (solanaMethod === 'solana_connect') {
    const response = (await solanaRequestApp({ method: 'solana_connect', params: undefined })) as SolanaConnectResponse;
    const { publicKey: hexPublicKey } = response;

    const publicKey = new PublicKey(Buffer.from(hexPublicKey as unknown as string, 'hex'));

    return { publicKey } as SolanaConnectResponse;
  } else if (solanaMethod === 'solana_signMessage') {
    const { message } = params as SolanaInternalSignMessage['params'];
    const messageHex = Buffer.from(message).toString('hex');

    const response = (await solanaRequestApp({ method: solanaMethod, params: { message: messageHex } })) as SolanaInternalSignMessageResponse;

    const { publicKey: hexPublicKey, signature: hexSignature } = response;

    const publicKey = new PublicKey(Buffer.from(hexPublicKey, 'hex'));
    const signature = new Uint8Array(Buffer.from(hexSignature, 'hex'));

    return { publicKey, signature };
  } else if (solanaMethod === 'solana_signTransaction' || solanaMethod === 'solana_signAllTransactions') {
    const requestParams = params as SolanaSignTransactionParam[];

    const serializedTxs = requestParams.map(({ tx }) => {
      if ('version' in tx) {
        return { serializedTx: Buffer.from(tx.serialize()).toString('hex') };
      } else {
        return { serializedTx: Buffer.from(tx.serialize({ requireAllSignatures: false, verifySignatures: false })).toString('hex') };
      }
    });

    const hexResponses = (await solanaRequestApp({ method: solanaMethod, params: serializedTxs })) as unknown as string[];

    const unserializedTxs = hexResponses
      .map((hexResponse) => deserializeTransaction(hexResponse))
      .map((tx) => {
        return { tx };
      });

    if (solanaMethod === 'solana_signTransaction') {
      return unserializedTxs[0];
    }

    if (solanaMethod === 'solana_signAllTransactions') {
      return unserializedTxs;
    }
  } else if (solanaMethod === 'solana_signAndSendTransaction' || solanaMethod === 'solana_signAndSendAllTransactions') {
    const requestParams = params as SolanaSignAndSendTransactionParam[];

    const resolvedParams: SolanaInternalSignAndSendTransactionParam[] = requestParams.map(({ tx, ...remainder }) => {
      if ('version' in tx) {
        return { serializedTx: Buffer.from(tx.serialize()).toString('hex'), ...remainder };
      } else {
        return { serializedTx: Buffer.from(tx.serialize({ requireAllSignatures: false, verifySignatures: false })).toString('hex'), ...remainder };
      }
    });

    const response = await solanaRequestApp({ method: solanaMethod, params: resolvedParams });

    if (solanaMethod === 'solana_signAndSendTransaction') {
      return response as unknown as SolanaSignAndSendTransactionResponse;
    }

    if (solanaMethod === 'solana_signAndSendAllTransactions') {
      return response as unknown as SolanaSignAndSendAllTransactionsResponse;
    }
  } else {
    return await solanaRequestApp({ method: solanaMethod, params });
  }
};

export class CosmostationSolana implements Wallet {
  private static instance: CosmostationSolana;

  readonly url: string = 'https://www.cosmostation.io/';
  readonly version = '1.0.0';
  readonly name: string = COSMOSTATION_WALLET_NAME;
  readonly icon = COSMOSTATION_ENCODED_LOGO_IMAGE;
  readonly chains = [SOLANA_MAINNET_CHAIN] as IdentifierArray;
  readonly #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } = {};

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SolanaSignAndSendTransactionFeature &
    SolanaSignTransactionFeature &
    SolanaSignInFeature &
    SolanaSignMessageFeature {
    return {
      [StandardConnect]: { version: '1.0.0', connect: this.#connect },
      [StandardDisconnect]: { version: '1.0.0', disconnect: this.#disconnect },
      [StandardEvents]: { version: '1.0.0', on: this.#on },
      [SolanaSignAndSendTransaction]: { version: '1.0.0', supportedTransactionVersions: ['legacy', 0], signAndSendTransaction: this.#signAndSendTransaction },
      [SolanaSignTransaction]: { version: '1.0.0', supportedTransactionVersions: ['legacy', 0], signTransaction: this.#signTransaction },
      [SolanaSignMessage]: { version: '1.0.0', signMessage: this.#signMessage },
      [SolanaSignIn]: { version: '1.0.0', signIn: this.#signIn },
    };
  }
  accounts: readonly WalletAccount[] = [];

  #account: WalletAccount | null = null;

  private accountChangeEventHandler: (event: CustomEvent<EventDetail>) => void = () => {};
  private disconnectEventHandler: (event: CustomEvent<EventDetail>) => void = () => {};

  public static getInstance() {
    if (!CosmostationSolana.instance) {
      CosmostationSolana.instance = new CosmostationSolana();
    }
    return CosmostationSolana.instance;
  }

  #on: StandardEventsOnMethod = (event, listener) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);

    if (event === 'change' && this.#listeners[event]?.length === 1) {
      this.accountChangeEventHandler = (windowEvent: CustomEvent<EventDetail>) => {
        if (windowEvent.detail.chainType === 'solana') {
          this.#handleAccountChange(windowEvent.detail.data.result as string);
        }
      };

      this.disconnectEventHandler = (windowEvent: CustomEvent<EventDetail>) => {
        if (windowEvent.detail.chainType === 'solana') {
          this.#handleDisconnect();
        }
      };

      window.addEventListener('accountChanged', this.accountChangeEventHandler as EventListener);
      window.addEventListener('disconnect', this.disconnectEventHandler as EventListener);
    }

    return (): void => this.#off(event, listener);
  };

  #handleAccountChange(newAddress: string | null) {
    if (!newAddress) {
      this.#account = null;
      this.accounts = [];
    } else {
      const publicKey = new PublicKey(newAddress);
      const newAccount: WalletAccount = {
        publicKey: new Uint8Array(publicKey.toBytes()),
        address: publicKey.toBase58(),
        chains: [SOLANA_MAINNET_CHAIN] as IdentifierArray,
        features: [StandardConnect, StandardDisconnect, StandardEvents, SolanaSignAndSendTransaction, SolanaSignTransaction, SolanaSignMessage, SolanaSignIn],
      };

      this.#account = newAccount;
      this.accounts = [newAccount];
    }

    this.#emit('change', { accounts: this.accounts });
  }
  #handleDisconnect() {
    this.#account = null;
    this.accounts = [];

    this.#emit('change', { accounts: this.accounts });
  }

  #off<E extends StandardEventsNames>(event: E, listener: StandardEventsListeners[E]): void {
    this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);

    if (event === 'change' && this.#listeners[event]?.length === 0) {
      if (this.accountChangeEventHandler) {
        window.removeEventListener('accountChanged', this.accountChangeEventHandler as EventListener);
        this.accountChangeEventHandler = () => {};
      }

      if (this.disconnectEventHandler) {
        window.removeEventListener('disconnect', this.disconnectEventHandler as EventListener);
        this.disconnectEventHandler = () => {};
      }
    }
  }

  #connect: StandardConnectMethod = async () => {
    try {
      if (!this.#account) {
        const response = (await request({ method: 'connect', params: undefined })) as SolanaConnectResponse;

        const { publicKey } = response;

        const accountData = {
          publicKey: new Uint8Array(publicKey.toBytes()),
          address: publicKey.toBase58(),
          chains: [SOLANA_MAINNET_CHAIN] as IdentifierArray,
          features: [
            StandardConnect,
            StandardDisconnect,
            StandardEvents,
            SolanaSignAndSendTransaction,
            SolanaSignTransaction,
            SolanaSignMessage,
            SolanaSignIn,
          ] as IdentifierArray,
        };

        this.#account = accountData;

        this.accounts = [accountData];

        const customEvent = new CustomEvent('connect', { detail: { accounts: this.accounts } });
        window.dispatchEvent(customEvent);

        return { accounts: this.accounts };
      }

      return { accounts: this.accounts };
    } catch {
      return { accounts: [] };
    }
  };

  #disconnect: StandardDisconnectMethod = async (): Promise<void> => {
    if (this.#account) {
      this.#account = null;

      this.accounts = [];

      const customEvent = new CustomEvent('disconnect', { detail: { accounts: this.accounts } });
      window.dispatchEvent(customEvent);
      void request({ method: 'disconnect', params: undefined });
    }
  };

  #signMessage: SolanaSignMessageMethod = async (...inputs) => {
    const outputs: SolanaSignMessageOutput[] = [];

    if (inputs.length === 1) {
      const { message, account } = inputs[0]!;

      if (account.address !== this.#account?.address) throw new Error('invalid account');

      const response = (await request({ method: 'signMessage', params: { message } })) as SolanaSignMessageResponse;

      outputs.push({ signedMessage: message, signature: response.signature });
    } else if (inputs.length > 1) {
      for (const input of inputs) {
        outputs.push(...(await this.#signMessage(input)));
      }
    }

    return outputs;
  };

  #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
    if (!this.#account) throw new Error('not connected');

    const outputs: SolanaSignTransactionOutput[] = [];

    if (inputs.length === 1) {
      const { transaction, account, chain } = inputs[0]!;
      if (account.address !== this.#account.address) throw new Error('invalid account');
      if (chain && !isSolanaChain(chain)) throw new Error('invalid chain');

      const signedTransaction = (await request({
        method: 'signTransaction',
        params: [{ tx: VersionedTransaction.deserialize(transaction) }],
      })) as SolanaSignTransactionResponse;

      const serializedTransaction = isVersionedTransaction(signedTransaction.tx)
        ? signedTransaction.tx.serialize()
        : new Uint8Array((signedTransaction.tx as Transaction).serialize({ requireAllSignatures: false, verifySignatures: false }));

      outputs.push({ signedTransaction: serializedTransaction });
    } else if (inputs.length > 1) {
      for (const input of inputs) {
        const { account, chain } = input;
        if (account.address !== this.#account.address) throw new Error('invalid account');
        if (chain && !isSolanaChain(chain)) throw new Error('invalid chain');
      }

      const params = inputs.map(({ transaction }) => {
        return { tx: VersionedTransaction.deserialize(transaction) };
      });

      const signedTransactions = (await request({
        method: 'signAllTransactions',
        params,
      })) as SolanaSignAllTransactionsResponse;

      for (const { tx } of signedTransactions) {
        const serializedTransaction = isVersionedTransaction(tx)
          ? tx.serialize()
          : new Uint8Array((tx as Transaction).serialize({ requireAllSignatures: false, verifySignatures: false }));

        outputs.push({ signedTransaction: serializedTransaction });
      }
    }

    return outputs;
  };

  #emit<E extends StandardEventsNames>(event: E, ...args: Parameters<StandardEventsListeners[E]>): void {
    // eslint-disable-next-line prefer-spread
    this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
  }

  #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
    if (!this.#account) throw new Error('not connected');

    const outputs: SolanaSignAndSendTransactionOutput[] = [];

    if (inputs.length === 1) {
      const { transaction, account, chain, options } = inputs[0]!;

      const { minContextSlot, preflightCommitment, skipPreflight, maxRetries } = options || {};

      if (account.address !== this.#account.address) throw new Error('invalid account');
      if (!isSolanaChain(chain)) throw new Error('invalid chain');

      const params = [{ tx: VersionedTransaction.deserialize(transaction), minContextSlot, preflightCommitment, skipPreflight, maxRetries }];
      const response = (await request({ method: 'signAndSendTransaction', params: params })) as SolanaSignAndSendTransactionResponse;

      outputs.push({ signature: bs58.decode(response.signature) });
    } else if (inputs.length > 1) {
      for (const input of inputs) {
        const { account, chain } = input;
        if (account.address !== this.#account.address) throw new Error('invalid account');
        if (chain && !isSolanaChain(chain)) throw new Error('invalid chain');
      }

      const params = inputs.map(({ transaction, options }) => {
        const { minContextSlot, preflightCommitment, skipPreflight, maxRetries } = options || {};

        return { tx: VersionedTransaction.deserialize(transaction), minContextSlot, preflightCommitment, skipPreflight, maxRetries };
      });

      const responses = (await request({
        method: 'signAndSendAllTransactions',
        params,
      })) as SolanaSignAndSendAllTransactionsResponse;

      for (const signature of responses.signatures) {
        outputs.push({ signature: bs58.decode(signature) });
      }
    }

    return outputs;
  };

  #signIn: SolanaSignInMethod = async (...inputs) => {
    try {
      const outputs: SolanaSignInOutput[] = [];

      if (inputs.length === 1) {
        const activeAddress = this.#account?.address;

        if (!activeAddress || !this.#account) {
          throw new Error('No account Error');
        }

        const { domain, address = activeAddress } = inputs[0];

        const resolvedDomain = (() => {
          if (domain) return domain;

          if (typeof window !== 'undefined') {
            const uri = window?.location?.href;

            return uri ? new URL(uri).host : window?.location?.hostname || 'UNKNOWN';
          }
          return 'UNKNOWN';
        })();

        const signInMessage = createSignInMessageText({
          ...inputs[0],
          domain: resolvedDomain,
          address,
        });

        const messageBytes = new TextEncoder().encode(signInMessage);

        const signMessageInput: SolanaSignMessageInput[] = [{ message: messageBytes, account: this.#account }];
        const signResult = await this.#signMessage(...signMessageInput);

        const signature = signResult[0].signature;

        if (!signature || !signature.length) {
          throw new Error('Failed to sign message');
        }

        const walletAccount: WalletAccount = {
          address: activeAddress,
          publicKey: new Uint8Array(new PublicKey(activeAddress).toBytes()),
          label: COSMOSTATION_WALLET_NAME,
          chains: [SOLANA_MAINNET_CHAIN] as IdentifierArray,
          features: [StandardConnect, StandardDisconnect, StandardEvents, SolanaSignAndSendTransaction, SolanaSignTransaction, SolanaSignMessage, SolanaSignIn],
        };

        this.#account = walletAccount;
        this.#emit('change', { accounts: this.accounts });

        outputs.push({ account: walletAccount, signedMessage: new Uint8Array(Buffer.from(signInMessage, 'utf8')), signature: signature });
      } else if (inputs.length > 1) {
        for (const input of inputs) {
          outputs.push(...(await this.#signIn(input)));
        }
      }

      return outputs;
    } catch (e) {
      console.error('Error signing in:', e);
      throw e;
    }
  };

  request = request;
}
