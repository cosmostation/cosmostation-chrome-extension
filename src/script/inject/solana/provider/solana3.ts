import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransactionMethod,
  SolanaSignAndSendTransactionOutput,
  SolanaSignInFeature,
  SolanaSignInInput,
  SolanaSignInMethod,
  SolanaSignInOutput,
  SolanaSignMessageFeature,
  SolanaSignMessageMethod,
  SolanaSignMessageOutput,
  SolanaSignTransactionFeature,
  SolanaSignTransactionMethod,
  SolanaSignTransactionOutput,
} from '@solana/wallet-standard-features';
import { SolanaSignAndSendTransaction, SolanaSignIn, SolanaSignMessage, SolanaSignTransaction } from '@solana/wallet-standard-features';
import type { PublicKey, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import { VersionedTransaction } from '@solana/web3.js';
import type { IdentifierString, Wallet, WalletAccount, WalletIcon } from '@wallet-standard/base';
import { bytesEqual } from '@wallet-standard/core';
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

export const SOLANA_MAINNET_CHAIN = 'solana:mainnet';

/** Array of all Solana clusters */
export const SOLANA_CHAINS = [SOLANA_MAINNET_CHAIN] as const;

export type SolanaChain = (typeof SOLANA_CHAINS)[number];

export function isSolanaChain(chain: IdentifierString): chain is SolanaChain {
  return SOLANA_CHAINS.includes(chain as SolanaChain);
}

export function isVersionedTransaction(transaction: Transaction | VersionedTransaction): transaction is VersionedTransaction {
  return 'version' in transaction;
}

// note 예시의 window.ts쪽

export interface GhostEvent {
  connect(...args: unknown[]): unknown;
  disconnect(...args: unknown[]): unknown;
  accountChanged(...args: unknown[]): unknown;
}

export interface GhostEventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on<E extends keyof GhostEvent>(event: E, listener: GhostEvent[E], context?: any): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off<E extends keyof GhostEvent>(event: E, listener: GhostEvent[E], context?: any): void;
}

export interface Ghost extends GhostEventEmitter {
  publicKey: PublicKey | null;
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signAndSendTransaction<T extends Transaction | VersionedTransaction>(transaction: T, options?: SendOptions): Promise<{ signature: TransactionSignature }>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  signIn(input?: SolanaSignInInput): Promise<SolanaSignInOutput>;
}

///// note 실제코드 시작점

// note 여기에 커넥트는 굳이 구현안해도되나?

const features = [SolanaSignAndSendTransaction, SolanaSignTransaction, SolanaSignMessage] as const;

export class GhostWalletAccount implements WalletAccount {
  readonly #address: WalletAccount['address'];
  readonly #publicKey: WalletAccount['publicKey'];
  readonly #chains: WalletAccount['chains'];
  readonly #features: WalletAccount['features'];
  readonly #label: WalletAccount['label'];
  readonly #icon: WalletAccount['icon'];

  get address() {
    return this.#address;
  }

  get publicKey() {
    return this.#publicKey.slice();
  }

  get chains() {
    return this.#chains.slice();
  }

  get features() {
    return this.#features.slice();
  }

  get label() {
    return this.#label;
  }

  get icon() {
    return this.#icon;
  }

  constructor({ address, publicKey, label, icon }: Omit<WalletAccount, 'chains' | 'features'>) {
    if (new.target === GhostWalletAccount) {
      Object.freeze(this);
    }

    this.#address = address;
    this.#publicKey = publicKey;
    this.#chains = SOLANA_CHAINS;
    this.#features = features;
    this.#label = label;
    this.#icon = icon;
  }
}

export class CosmostationSolana implements Wallet {
  private static instance: CosmostationSolana;

  readonly #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } = {};
  readonly #version = '1.0.0' as const;
  readonly #name = COSMOSTATION_WALLET_NAME;
  readonly #icon: WalletIcon = COSMOSTATION_ENCODED_LOGO_IMAGE;
  #account: GhostWalletAccount | null = null;
  readonly #ghost: Ghost;

  get version() {
    return this.#version;
  }

  get name() {
    return this.#name;
  }

  get icon() {
    return this.#icon;
  }

  get chains() {
    return SOLANA_CHAINS.slice();
  }

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SolanaSignAndSendTransactionFeature &
    SolanaSignTransactionFeature &
    SolanaSignMessageFeature &
    SolanaSignInFeature {
    //  & GhostFeature
    return {
      [StandardConnect]: {
        version: '1.0.0',
        connect: this.#connect,
      },
      [StandardDisconnect]: {
        version: '1.0.0',
        disconnect: this.#disconnect,
      },
      [StandardEvents]: {
        version: '1.0.0',
        on: this.#on,
      },
      [SolanaSignAndSendTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signAndSendTransaction: this.#signAndSendTransaction,
      },
      [SolanaSignTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signTransaction: this.#signTransaction,
      },
      [SolanaSignMessage]: {
        version: '1.0.0',
        signMessage: this.#signMessage,
      },
      [SolanaSignIn]: {
        version: '1.0.0',
        signIn: this.#signIn,
      },
      //   [GhostNamespace]: {
      //     ghost: this.#ghost,
      //   },
    };
  }

  public static getInstance(): CosmostationSolana {
    if (!CosmostationSolana.instance) {
      CosmostationSolana.instance = new CosmostationSolana();
    }
    return CosmostationSolana.instance;
  }

  get accounts() {
    return this.#account ? [this.#account] : [];
  }

  #on: StandardEventsOnMethod = (event, listener) => {
    this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
    return (): void => this.#off(event, listener);
  };

  #emit<E extends StandardEventsNames>(event: E, ...args: Parameters<StandardEventsListeners[E]>): void {
    // eslint-disable-next-line prefer-spread
    this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
  }

  #off<E extends StandardEventsNames>(event: E, listener: StandardEventsListeners[E]): void {
    this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
  }

  #connected = () => {
    const address = this.#ghost.publicKey?.toBase58();
    if (address) {
      const publicKey = this.#ghost.publicKey!.toBytes();

      const account = this.#account;
      if (!account || account.address !== address || !bytesEqual(account.publicKey, publicKey)) {
        this.#account = new GhostWalletAccount({ address, publicKey });
        this.#emit('change', { accounts: this.accounts });
      }
    }
  };

  #disconnected = () => {
    if (this.#account) {
      this.#account = null;
      this.#emit('change', { accounts: this.accounts });
    }
  };

  #reconnected = () => {
    if (this.#ghost.publicKey) {
      this.#connected();
    } else {
      this.#disconnected();
    }
  };

  #connect: StandardConnectMethod = async ({ silent } = {}) => {
    if (!this.#account) {
      await this.#ghost.connect(silent ? { onlyIfTrusted: true } : undefined);
    }

    this.#connected();

    return { accounts: this.accounts };
  };

  #disconnect: StandardDisconnectMethod = async () => {
    await this.#ghost.disconnect();
  };

  #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
    if (!this.#account) throw new Error('not connected');

    const outputs: SolanaSignAndSendTransactionOutput[] = [];

    if (inputs.length === 1) {
      const { transaction, account, chain, options } = inputs[0]!;
      const { minContextSlot, preflightCommitment, skipPreflight, maxRetries } = options || {};
      if (account !== this.#account) throw new Error('invalid account');
      if (!isSolanaChain(chain)) throw new Error('invalid chain');

      const { signature } = await this.#ghost.signAndSendTransaction(VersionedTransaction.deserialize(transaction), {
        preflightCommitment,
        minContextSlot,
        maxRetries,
        skipPreflight,
      });

      outputs.push({ signature: bs58.decode(signature) });
    } else if (inputs.length > 1) {
      for (const input of inputs) {
        outputs.push(...(await this.#signAndSendTransaction(input)));
      }
    }

    return outputs;
  };

  #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
    if (!this.#account) throw new Error('not connected');

    const outputs: SolanaSignTransactionOutput[] = [];

    if (inputs.length === 1) {
      const { transaction, account, chain } = inputs[0]!;
      if (account !== this.#account) throw new Error('invalid account');
      if (chain && !isSolanaChain(chain)) throw new Error('invalid chain');

      // note ghost의 signStansaction은 어디에 구현하냐?
      const signedTransaction = await this.#ghost.signTransaction(VersionedTransaction.deserialize(transaction));

      const serializedTransaction = isVersionedTransaction(signedTransaction)
        ? signedTransaction.serialize()
        : new Uint8Array(
            (signedTransaction as Transaction).serialize({
              requireAllSignatures: false,
              verifySignatures: false,
            }),
          );

      outputs.push({ signedTransaction: serializedTransaction });
    } else if (inputs.length > 1) {
      let chain: SolanaChain | undefined = undefined;
      for (const input of inputs) {
        if (input.account !== this.#account) throw new Error('invalid account');
        if (input.chain) {
          if (!isSolanaChain(input.chain)) throw new Error('invalid chain');
          if (chain) {
            if (input.chain !== chain) throw new Error('conflicting chain');
          } else {
            chain = input.chain;
          }
        }
      }

      const transactions = inputs.map(({ transaction }) => VersionedTransaction.deserialize(transaction));

      const signedTransactions = await this.#ghost.signAllTransactions(transactions);

      outputs.push(
        ...signedTransactions.map((signedTransaction) => {
          const serializedTransaction = isVersionedTransaction(signedTransaction)
            ? signedTransaction.serialize()
            : new Uint8Array(
                (signedTransaction as Transaction).serialize({
                  requireAllSignatures: false,
                  verifySignatures: false,
                }),
              );

          return { signedTransaction: serializedTransaction };
        }),
      );
    }

    return outputs;
  };

  #signMessage: SolanaSignMessageMethod = async (...inputs) => {
    if (!this.#account) throw new Error('not connected');

    const outputs: SolanaSignMessageOutput[] = [];

    if (inputs.length === 1) {
      const { message, account } = inputs[0]!;
      if (account !== this.#account) throw new Error('invalid account');

      const { signature } = await this.#ghost.signMessage(message);

      outputs.push({ signedMessage: message, signature });
    } else if (inputs.length > 1) {
      for (const input of inputs) {
        outputs.push(...(await this.#signMessage(input)));
      }
    }

    return outputs;
  };

  #signIn: SolanaSignInMethod = async (...inputs) => {
    const outputs: SolanaSignInOutput[] = [];

    if (inputs.length > 1) {
      for (const input of inputs) {
        outputs.push(await this.#ghost.signIn(input));
      }
    } else {
      return [await this.#ghost.signIn(inputs[0])];
    }

    return outputs;
  };
}
