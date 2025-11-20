import type { Commitment, ConnectionConfig } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';

interface SolanaRpcClientConfig {
  rpcUrl: string;
  commitment?: Commitment;
  timeout?: number;
  disableRetryOnRateLimit?: boolean;
  confirmTransactionInitialTimeout?: number;
  httpHeaders?: Record<string, string>;
}

const DEFAULT_CONFIG: SolanaRpcClientConfig = {
  rpcUrl: 'https://solana-rpc.publicnode.com',
  commitment: 'confirmed',
  timeout: 5000,
  disableRetryOnRateLimit: true,
};

function areConfigsEqual(config1: SolanaRpcClientConfig, config2: SolanaRpcClientConfig): boolean {
  const keys1 = Object.keys(config1) as (keyof SolanaRpcClientConfig)[];
  const keys2 = Object.keys(config2) as (keyof SolanaRpcClientConfig)[];

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (key === 'httpHeaders') {
      const headers1 = config1.httpHeaders || {};
      const headers2 = config2.httpHeaders || {};
      const headerKeys1 = Object.keys(headers1);
      const headerKeys2 = Object.keys(headers2);

      if (headerKeys1.length !== headerKeys2.length) return false;

      for (const headerKey of headerKeys1) {
        if (headers1[headerKey] !== headers2[headerKey]) return false;
      }
    } else if (config1[key] !== config2[key]) {
      return false;
    }
  }

  return true;
}

export class SolanaRpcClient {
  private static instance: SolanaRpcClient;
  private connection: Connection;
  private config: SolanaRpcClientConfig;

  private constructor(config?: SolanaRpcClientConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.connection = this.createConnection();
  }

  static getInstance(config?: SolanaRpcClientConfig): SolanaRpcClient {
    const newConfig = { ...DEFAULT_CONFIG, ...config };

    if (!SolanaRpcClient.instance || SolanaRpcClient.isConfigChanged(newConfig)) {
      SolanaRpcClient.instance = new SolanaRpcClient(config);
    }
    return SolanaRpcClient.instance;
  }

  static isConfigChanged(newConfig: SolanaRpcClientConfig): boolean {
    if (!SolanaRpcClient.instance) {
      return false;
    }

    const currentConfig = SolanaRpcClient.instance.config;
    return !areConfigsEqual(newConfig, currentConfig);
  }

  static resetInstance(config?: SolanaRpcClientConfig): SolanaRpcClient {
    SolanaRpcClient.instance = new SolanaRpcClient(config);
    return SolanaRpcClient.instance;
  }

  private createConnection(): Connection {
    const finalConfig = this.config;

    const connectionConfig: ConnectionConfig = {
      commitment: finalConfig.commitment,
      disableRetryOnRateLimit: finalConfig.disableRetryOnRateLimit,
      confirmTransactionInitialTimeout: finalConfig.confirmTransactionInitialTimeout,
      httpHeaders: finalConfig.httpHeaders,
    };

    if (typeof window !== 'undefined') {
      const originalFetch = globalThis.fetch;
      connectionConfig.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout ?? 5000);

        try {
          const response = await originalFetch(input, {
            ...init,
            signal: controller.signal ?? 5000,
          });
          return response;
        } finally {
          clearTimeout(timeoutId);
        }
      };
    }
    return new Connection(finalConfig.rpcUrl, connectionConfig);
  }

  getConnection() {
    return this.connection;
  }

  getConfig() {
    return { ...this.config };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.connection.getVersion();
      return true;
    } catch (error) {
      console.error('Connection health check failed:', error);
      return false;
    }
  }
}

export function initializeSolanaService(config?: SolanaRpcClientConfig): SolanaRpcClient {
  return SolanaRpcClient.getInstance(config);
}
