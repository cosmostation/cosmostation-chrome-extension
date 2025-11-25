import { isError, isHexString } from 'ethers/utils';

import type { EthersTxResult, EthersTxStatus } from '@/hooks/evm/useTxInfo';

import { ethersProvider } from './ethers';
import { devLogger } from '../devLogger';

interface WaitForTransactionParams {
  rpcURLs: string[];
  chainId?: number;
  txHash?: string;
}

async function isRpcHealthy(url: string, chainId?: number): Promise<boolean> {
  const provider = ethersProvider(url, chainId, {
    staticNetwork: true,
    batchMaxCount: 1,
  });

  try {
    let timeoutId: NodeJS.Timeout | undefined = undefined;
    const blockNumberPromise = provider.getBlockNumber();
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Timeout')), 3000);
    });

    try {
      await Promise.race([blockNumberPromise, timeoutPromise]);
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }

    return true;
  } catch {
    return false;
  } finally {
    try {
      provider.destroy();
      // eslint-disable-next-line no-empty
    } catch {}
  }
}

async function getMostReliableRpcURL(rpcURLs?: string[]) {
  if (!Array.isArray(rpcURLs) || rpcURLs.length === 0) {
    return undefined;
  }

  for (const url of rpcURLs) {
    if (typeof url === 'string' && url.trim().length > 0) {
      try {
        const isHealthy = await isRpcHealthy(url);
        if (isHealthy) {
          return url;
        }
      } catch (error) {
        devLogger.error(`Error checking health for ${url}:`, error);
      }
    }
  }

  return undefined;
}

export async function waitForTransaction({ txHash, rpcURLs, chainId }: WaitForTransactionParams): Promise<EthersTxResult> {
  if (!txHash || !isHexString(txHash, 32)) {
    return {
      status: 'invalid',
      error: 'Invalid transaction hash',
    };
  }

  const mostReliableRpcURL = await getMostReliableRpcURL(rpcURLs);

  if (!mostReliableRpcURL) {
    return {
      status: 'invalid',
      error: 'No provider available',
    };
  }

  const fallbackConfig = {
    staticNetwork: true,
    batchMaxCount: 1,
  };

  const provider = ethersProvider(mostReliableRpcURL, chainId, fallbackConfig);

  try {
    const confirmationsNeeded = 1;
    const timeout = 60000;

    const receipt = await provider.waitForTransaction(txHash, confirmationsNeeded, timeout);

    if (!receipt) {
      return {
        status: 'timeout',
        error: 'Transaction timeout',
      };
    }

    const status: EthersTxStatus = receipt.status === 1 ? 'success' : 'failed';

    return {
      status,
      receipt,
      blockHash: receipt.blockHash,
      error: status === 'failed' ? 'Transaction failed' : undefined,
    };
  } catch (error) {
    if (isError(error, 'TIMEOUT')) {
      return {
        status: 'timeout',
        error: 'Transaction timeout',
      };
    }

    if (isError(error, 'NETWORK_ERROR')) {
      return {
        status: 'timeout',
        error: 'Network connection failed',
      };
    }

    if (isError(error, 'SERVER_ERROR')) {
      return {
        status: 'timeout',
        error: 'RPC server error',
      };
    }

    if (isError(error, 'TRANSACTION_REPLACED')) {
      return {
        status: 'failed',
        error: 'Transaction was replaced or cancelled',
      };
    }

    return {
      status: 'not_found',
      error: 'Transaction not found',
    };
  } finally {
    if (provider) {
      setTimeout(() => {
        provider.destroy();
      }, 1000);
    }
  }
}
