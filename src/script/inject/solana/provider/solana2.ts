import bs58 from 'bs58';
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
import type { SendOptions, TransactionSignature } from '@solana/web3.js';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import type { IdentifierString, Wallet, WalletAccount, WalletIcon } from '@wallet-standard/base';
import { bytesEqual, registerWallet } from '@wallet-standard/core';
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
import type { SolanaConnectResponse, SolanaSignMessageResponse } from '@/types/message/inject/solana';
import { deserializeTransaction } from '@/utils/solana/transaction';

import { solanaRequestApp } from '../request';

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
  // note 원래는 이게 맞는데 signIn이 구현이 안되어서 그럼
  //   signIn(input?: SolanaSignInInput): Promise<SolanaSignInOutput>;
  signIn(input?: SolanaSignInInput): void;
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

export class GhostWallet implements Wallet {
  //   private static instance: GhostWallet;

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

  get accounts() {
    return this.#account ? [this.#account] : [];
  }

  constructor(ghost: Ghost) {
    if (new.target === GhostWallet) {
      Object.freeze(this);
    }

    this.#ghost = ghost;

    ghost.on('connect', this.#connected, this);
    ghost.on('disconnect', this.#disconnected, this);
    ghost.on('accountChanged', this.#reconnected, this);

    this.#connected();
  }

  #on: StandardEventsOnMethod = (event, listener) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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

export function initialize(): void {
  const ghost: Ghost = {
    publicKey: null,
    connect: async (option) => {
      console.log('🚀 ~ connect: ~ option:', option);

      const response = (await solanaRequestApp({ method: 'solana_connect', params: undefined })) as SolanaConnectResponse;
      const { publicKey: hexPublicKey } = response;

      const publicKey = new PublicKey(Buffer.from(hexPublicKey as unknown as string, 'hex'));
      return { publicKey } as SolanaConnectResponse;
    },
    disconnect: async () => {
      await solanaRequestApp({ method: 'solana_disconnect', params: undefined });
      // note 이벤트 emit은 어떻게?
    },
    signAndSendTransaction: async (transaction, option) => {
      console.log('🚀 ~ signAndSendTransaction: ~ option:', option);

      const serializedTxs = (() => {
        if (isVersionedTransaction(transaction)) {
          return Buffer.from(transaction.serialize()).toString('hex');
        } else {
          return Buffer.from(transaction.serialize({ requireAllSignatures: false, verifySignatures: false })).toString('hex');
        }
      })();

      const response = (await solanaRequestApp({ method: 'solana_signAndSendTransaction', params: [serializedTxs] })) as unknown as string;

      return {
        signature: response,
      };
    },
    signTransaction: async <T extends Transaction | VersionedTransaction>(transaction: T) => {
      const serializedTxs = (() => {
        if (isVersionedTransaction(transaction)) {
          return Buffer.from(transaction.serialize()).toString('hex');
        } else {
          return Buffer.from(transaction.serialize({ requireAllSignatures: false, verifySignatures: false })).toString('hex');
        }
      })();

      const response = (await solanaRequestApp({ method: 'solana_signTransaction', params: [serializedTxs] })) as unknown as string[];

      const unserializedTxs = response
        .map((hexResponse) => deserializeTransaction(hexResponse))
        .map((tx) => {
          if (tx instanceof Transaction) {
            return {
              ...tx,
              message: tx.compileMessage(),
            };
          }

          return tx;
        });

      return unserializedTxs[0] as T;
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(transactions: T[]) => {
      const serializedTxs = transactions.map((tx) => {
        if (isVersionedTransaction(tx)) {
          return Buffer.from(tx.serialize()).toString('hex');
        } else {
          return Buffer.from(tx.serialize({ requireAllSignatures: false, verifySignatures: false })).toString('hex');
        }
      });

      const response = (await solanaRequestApp({ method: 'solana_signAllTransactions', params: [serializedTxs] })) as unknown as string[];

      const unserializedTxs = response
        .map((hexResponse) => deserializeTransaction(hexResponse))
        .map((tx) => {
          if (tx instanceof Transaction) {
            return {
              message: tx.compileMessage(),
              signatures: tx.signatures,
            };
          }

          return {
            message: tx.message,
            signatures: tx.signatures,
          };
        });

      return unserializedTxs as T[];
    },
    signMessage: async (message) => {
      const messageHex = Buffer.from(message).toString('hex');

      const response = (await solanaRequestApp({
        method: 'solana_signMessage',
        params: { message: messageHex, display: 'utf8' },
      })) as SolanaSignMessageResponse;

      const { signature: hexSignature } = response;

      const signature = new Uint8Array(Buffer.from(hexSignature as unknown as string, 'hex'));

      return {
        signature,
      };
    },
    signIn: async (input) => {
      console.log('🚀 ~ signIn: ~ input:', input);
    },
  };

  registerWallet(new GhostWallet(ghost));
}

// Ghost 구현 클래스
export class GhostWalletProvider implements GhostEventEmitter, Ghost {
  private _publicKey: PublicKey | null = null;
  private _isConnected = false;

  constructor() {
    super();
  }
  off<E extends keyof GhostEvent>(event: E, listener: GhostEvent[E], context?: any): void {
    throw new Error('Method not implemented.');
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  // 이벤트 리스너 등록
  on(event: 'connect', listener: () => void, context?: any): void;
  on(event: 'disconnect', listener: () => void, context?: any): void;
  on(event: 'accountChanged', listener: (publicKey: PublicKey | null) => void, context?: any): void;
  on(event: string, listener: (...args: any[]) => void, context?: any): void {
    if (context) {
      super.on(event, listener.bind(context));
    } else {
      super.on(event, listener);
    }
  }

  // 연결
  async connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }> {
    try {
      // 실제 구현에서는 여기서 지갑 연결 로직을 수행
      // 예시: 사용자 승인 요청, 키 페어 생성/로드 등

      if (options?.onlyIfTrusted && !this._isConnected) {
        throw new Error('Wallet not trusted');
      }

      // 임시로 랜덤 키 생성 (실제로는 사용자의 키를 사용)
      const mockPublicKey = new PublicKey('11111111111111111111111111111112');

      this._publicKey = mockPublicKey;
      this._isConnected = true;

      this.emit('connect');
      this.emit('accountChanged', this._publicKey);

      return { publicKey: this._publicKey };
    } catch (error) {
      throw new Error(`Failed to connect: ${error}`);
    }
  }

  // 연결 해제
  async disconnect(): Promise<void> {
    this._publicKey = null;
    this._isConnected = false;

    this.emit('disconnect');
    this.emit('accountChanged', null);
  }

  // 트랜잭션 서명 및 전송
  async signAndSendTransaction(
    transaction: VersionedTransaction,
    options?: {
      preflightCommitment?: string;
      minContextSlot?: number;
      maxRetries?: number;
      skipPreflight?: boolean;
    },
  ): Promise<{ signature: string }> {
    if (!this._isConnected || !this._publicKey) {
      throw new Error('Wallet not connected');
    }

    // 실제 구현에서는 여기서 트랜잭션 서명 및 전송 로직 수행
    // 예시: 사용자 승인 요청, 트랜잭션 서명, 네트워크 전송 등

    // 임시 시그니처 생성
    const mockSignature = 'mock_signature_' + Math.random().toString(36).substr(2, 9);

    return { signature: mockSignature };
  }

  // 트랜잭션 서명
  async signTransaction(transaction: VersionedTransaction): Promise<VersionedTransaction> {
    if (!this._isConnected || !this._publicKey) {
      throw new Error('Wallet not connected');
    }

    // 실제 구현에서는 여기서 트랜잭션 서명 로직 수행
    // 예시: 사용자 승인 요청, 개인키로 서명 등

    // 임시로 원본 트랜잭션 반환 (실제로는 서명된 트랜잭션)
    return transaction;
  }

  // 여러 트랜잭션 서명
  async signAllTransactions(transactions: VersionedTransaction[]): Promise<VersionedTransaction[]> {
    if (!this._isConnected || !this._publicKey) {
      throw new Error('Wallet not connected');
    }

    // 각 트랜잭션을 순차적으로 서명
    const signedTransactions: VersionedTransaction[] = [];

    for (const transaction of transactions) {
      const signedTransaction = await this.signTransaction(transaction);
      signedTransactions.push(signedTransaction);
    }

    return signedTransactions;
  }

  // 메시지 서명
  async signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
    if (!this._isConnected || !this._publicKey) {
      throw new Error('Wallet not connected');
    }

    // 실제 구현에서는 여기서 메시지 서명 로직 수행
    // 예시: 사용자 승인 요청, 개인키로 메시지 서명 등

    // 임시 시그니처 생성 (64바이트)
    const mockSignature = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
      mockSignature[i] = Math.floor(Math.random() * 256);
    }

    return { signature: mockSignature };
  }

  // Sign In
  async signIn(input?: SolanaSignInInput): Promise<SolanaSignInOutput> {
    if (!this._isConnected || !this._publicKey) {
      throw new Error('Wallet not connected');
    }

    // 기본 Sign In 응답 구성
    const signInData: SolanaSignInOutput = {
      account: {
        address: this._publicKey.toBase58(),
        publicKey: this._publicKey.toBytes(),
        chains: ['solana:mainnet', 'solana:testnet', 'solana:devnet'],
        features: [],
      },
      signature: new Uint8Array(64), // 임시 시그니처
    };

    // 임시 시그니처 생성
    for (let i = 0; i < 64; i++) {
      signInData.signature[i] = Math.floor(Math.random() * 256);
    }

    return signInData;
  }
}

// Ghost 인스턴스 생성 함수
export function createGhost(): Ghost {
  return new GhostWalletProvider();
}

// 전역 객체에 Ghost 추가 (브라우저 환경에서)
export function injectGhost(): void {
  if (typeof window !== 'undefined') {
    (window as any).ghost = createGhost();
  }
}
