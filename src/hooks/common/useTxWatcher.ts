import { isHexString } from 'ethers';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';

import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '@/constants/error';
import { TRANSACTION_RESULT as IOTA_TX_RESULT } from '@/constants/iota';
import { TRANSACTION_RESULT as SUI_TX_RESULT } from '@/constants/sui';
import { sendMessage } from '@/libs/extension';
import type { TxInfoResponse } from '@/types/cosmos/txInfo';
import type { GnoTxResponse } from '@/types/gno/rpc';
import type { IotaTxInfoResponse } from '@/types/iota/api';
import type { SuiTxInfoResponse } from '@/types/sui/api';
import { get, getWithFullResponse, isAxiosError, post } from '@/utils/axios';
import { gnoURL } from '@/utils/crypto/gno';
import { devLogger } from '@/utils/devLogger';
import { waitForTransaction } from '@/utils/ethereum/waitForTx';
import { buildRequestUrl } from '@/utils/fetch';
import { wait } from '@/utils/fetch/wait';
import { isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { SolanaRpcClient } from '@/utils/solana/connection';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore';

import type { UseFetchConfig } from './useFetch';
import { useFetch } from './useFetch';
import { useAccountHoldCosmosNFTs } from '../cosmos/nft/useAccountHoldCosmosNFTs';
import { useCurrentAddedEVMNFTsWithMetaData } from '../evm/nft/useCurrentAddedEVMNFTsWithMetaData';
import { useAccountHoldIotaNFTs } from '../iota/useAccountHoldIotaNFTs';
import { useAccountHoldSuiNFTs } from '../sui/useAccountHoldSuiNFTs';
import { useChainList } from '../useChainList';
import { useCurrentAccount } from '../useCurrentAccount';
import { useRefreshAccountAllAssets } from '../useRefreshAccountAllAssets';

const MAX_RETRY_COUNT = 5;
const TX_TIMEOUT_MS = 5 * 60 * 1000;
const BITCOIN_BALANCE_DELAY = 5 * 1000;

export function useTxWatcher(config?: UseFetchConfig) {
  const { txs, removeTx, updateTx } = useTxTrackerStore();

  const { refetch: refetchCosmosNFTs } = useAccountHoldCosmosNFTs();
  const { refetch: refetchSuiNFTs } = useAccountHoldSuiNFTs();
  const { refetch: refetchIotaNFTs } = useAccountHoldIotaNFTs();
  const { refetch: refetchEVMNFTs } = useCurrentAddedEVMNFTsWithMetaData();
  const { refreshAssets } = useRefreshAccountAllAssets();

  const { chainList } = useChainList();
  const { currentAccount } = useCurrentAccount();

  const startWatching = async () => {
    devLogger.log('[TxWatcher] start');
    const now = Date.now();

    for (const tx of txs) {
      const { chainType } = parseUniqueChainId(tx.chainId);

      if (now - tx.addedAt > TX_TIMEOUT_MS) {
        devLogger.error(`[TxWatcher] Tx timed out after ${TX_TIMEOUT_MS}ms: ${tx.txHash}. Removing from queue.`);
        removeTx(tx.txHash);
        continue;
      }

      if (tx.retryCount >= MAX_RETRY_COUNT) {
        devLogger.error(`[TxWatcher] Max retry count reached. Removing tx: ${tx.txHash} / ${tx.chainId}`);
        removeTx(tx.txHash);
        continue;
      }

      if (!tx.txHash) {
        devLogger.error(`[TxWatcher] Wrong Tx hash`);
        removeTx(tx.txHash);
        continue;
      }

      if (chainType === 'cosmos') {
        const targetChain = chainList.allCosmosChains.find((item) => isMatchingUniqueChainId(item, tx.chainId));
        if (!targetChain) {
          removeTx(tx.txHash);
          continue;
        }

        try {
          const requestUrls = targetChain.lcdUrls
            .map((item) => item.url)
            .filter(Boolean)
            .map((url) => buildRequestUrl(url, `/cosmos/tx/v1beta1/txs/${tx.txHash}`));

          const response = await Promise.any(requestUrls.map((rpcUrl) => getWithFullResponse<TxInfoResponse>(rpcUrl, { timeout: 5000 })));

          if (
            (response.status >= 400 && response.status < 500) ||
            response.data?.tx_response?.code === undefined ||
            response.data?.tx_response?.code === null
          ) {
            throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
          }

          const isTxSuccess = response.data.tx_response.code === 0;

          if (isTxSuccess) {
            if (tx.type === 'staking') {
              await sendMessage({
                target: 'SERVICE_WORKER',
                method: 'updateChainSpecificStakingBalance',
                params: [currentAccount.id, tx.chainId],
              });
            } else {
              await sendMessage({
                target: 'SERVICE_WORKER',
                method: 'updateChainSpecificBalance',
                params: [currentAccount.id, tx.chainId],
              });
            }

            refreshAssets();
            if (tx.type === 'nft') {
              refetchCosmosNFTs();
            }
          }

          removeTx(tx.txHash);
        } catch (error) {
          devLogger.error(`[TxWatcher] Retrying tx: ${tx.txHash}`, error);
          updateTx(tx.txHash, { retryCount: tx.retryCount + 1 });
        }
      }

      if (chainType === 'evm') {
        const targetChain = chainList.allEVMChains.find((item) => isMatchingUniqueChainId(item, tx.chainId));
        if (!targetChain) {
          removeTx(tx.txHash);
          continue;
        }

        const rpcUrls = targetChain.rpcUrls.map((item) => item.url).filter(Boolean);

        try {
          const receipt = await waitForTransaction({
            rpcURLs: rpcUrls,
            chainId: targetChain.chainId && isHexString(targetChain.chainId) ? parseInt(targetChain.chainId, 16) : undefined,
            txHash: tx.txHash,
          });

          const isTxSuccess = receipt?.status === 'success';

          if (!isTxSuccess) {
            throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
          }

          if (isTxSuccess) {
            await sendMessage({
              target: 'SERVICE_WORKER',
              method: 'updateChainSpecificBalance',
              params: [currentAccount.id, tx.chainId],
            });

            refreshAssets();

            if (tx.type === 'nft') {
              refetchEVMNFTs();
            }
          }

          removeTx(tx.txHash);
        } catch (error) {
          devLogger.error(`[TxWatcher] Retrying tx: ${tx.txHash}`, error);
          updateTx(tx.txHash, { retryCount: tx.retryCount + 1 });
        }
      }

      if (chainType === 'aptos') {
        const targetChain = chainList.aptosChains?.find((item) => isMatchingUniqueChainId(item, tx.chainId));
        if (!targetChain) {
          removeTx(tx.txHash);
          continue;
        }

        try {
          const requestUrls = targetChain.rpcUrls
            .map((item) => item.url)
            .filter(Boolean)
            .map((url) => `${url}/v1`);

          const response = await Promise.any(
            requestUrls.map(async (rpcUrl) => {
              const aptosClientConfig = new AptosConfig({ fullnode: rpcUrl });

              const aptosClient = new Aptos(aptosClientConfig);

              const response = await aptosClient.transaction.waitForTransaction({ transactionHash: tx.txHash });

              return response;
            }),
          );

          if (!response) {
            throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
          }

          const isTxSuccess = response.success;

          if (isTxSuccess) {
            await sendMessage({
              target: 'SERVICE_WORKER',
              method: 'updateChainSpecificBalance',
              params: [currentAccount.id, tx.chainId],
            });

            refreshAssets();
          }

          removeTx(tx.txHash);
        } catch (error) {
          devLogger.error(`[TxWatcher] Retrying tx: ${tx.txHash}`, error);
          updateTx(tx.txHash, { retryCount: tx.retryCount + 1 });
        }
      }

      if (chainType === 'sui') {
        const targetChain = chainList.suiChains?.find((item) => isMatchingUniqueChainId(item, tx.chainId));
        if (!targetChain) {
          removeTx(tx.txHash);
          continue;
        }

        try {
          const requestUrls = targetChain.rpcUrls.map((item) => item.url).filter(Boolean);
          const response = await Promise.any(
            requestUrls.map(async (rpcUrl) => {
              const requestBody = {
                jsonrpc: '2.0',
                method: 'sui_getTransactionBlock',
                params: [
                  tx.txHash,
                  {
                    showInput: false,
                    showRawInput: false,
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: false,
                    showBalanceChanges: false,
                  },
                ],
                id: tx.txHash,
              };

              const response = await post<SuiTxInfoResponse>(rpcUrl, requestBody, { timeout: 5000 });

              if (response.error) {
                throw new Error(response.error.message);
              }

              if (!response.result?.checkpoint) {
                throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
              }

              return response;
            }),
          );

          if (!response?.result?.effects?.status.status) {
            throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
          }

          const isTxSuccess = response.result.effects.status.status === SUI_TX_RESULT.SUCCESS;

          if (isTxSuccess) {
            if (tx.type === 'staking') {
              await sendMessage({
                target: 'SERVICE_WORKER',
                method: 'updateChainSpecificStakingBalance',
                params: [currentAccount.id, tx.chainId],
              });
            } else {
              await sendMessage({
                target: 'SERVICE_WORKER',
                method: 'updateChainSpecificBalance',
                params: [currentAccount.id, tx.chainId],
              });
            }

            refreshAssets();

            if (tx.type === 'nft') {
              refetchSuiNFTs();
            }
          }

          removeTx(tx.txHash);
        } catch (error) {
          devLogger.error(`[TxWatcher] Retrying tx: ${tx.txHash}`, error);
          updateTx(tx.txHash, { retryCount: tx.retryCount + 1 });
        }
      }

      if (chainType === 'bitcoin') {
        const targetChain = chainList.bitcoinChains?.find((item) => isMatchingUniqueChainId(item, tx.chainId));
        if (!targetChain) {
          removeTx(tx.txHash);
          continue;
        }

        try {
          await wait(BITCOIN_BALANCE_DELAY);

          await sendMessage({
            target: 'SERVICE_WORKER',
            method: 'updateChainSpecificBalance',
            params: [currentAccount.id, tx.chainId],
          });
          refreshAssets();

          removeTx(tx.txHash);
        } catch (error) {
          devLogger.error(`[TxWatcher] Retrying tx: ${tx.txHash}`, error);
          updateTx(tx.txHash, { retryCount: tx.retryCount + 1 });
        }
      }

      if (chainType === 'iota') {
        const targetChain = chainList.iotaChains?.find((item) => isMatchingUniqueChainId(item, tx.chainId));
        if (!targetChain) {
          removeTx(tx.txHash);
          continue;
        }

        try {
          const requestUrls = targetChain.rpcUrls.map((item) => item.url).filter(Boolean);
          const response = await Promise.any(
            requestUrls.map(async (rpcUrl) => {
              const requestBody = {
                jsonrpc: '2.0',
                method: 'iota_getTransactionBlock',
                params: [
                  tx.txHash,
                  {
                    showInput: false,
                    showRawInput: false,
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: false,
                    showBalanceChanges: false,
                  },
                ],
                id: tx.txHash,
              };

              const response = await post<IotaTxInfoResponse>(rpcUrl, requestBody, { timeout: 5000 });

              if (response.error) {
                throw new Error(response.error.message);
              }

              if (!response.result?.checkpoint) {
                throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
              }

              return response;
            }),
          );

          if (!response?.result?.effects?.status.status) {
            throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
          }

          const isTxSuccess = response.result.effects.status.status === IOTA_TX_RESULT.SUCCESS;

          if (isTxSuccess) {
            if (tx.type === 'staking') {
              await sendMessage({
                target: 'SERVICE_WORKER',
                method: 'updateChainSpecificStakingBalance',
                params: [currentAccount.id, tx.chainId],
              });
            } else {
              await sendMessage({
                target: 'SERVICE_WORKER',
                method: 'updateChainSpecificBalance',
                params: [currentAccount.id, tx.chainId],
              });
            }
            refreshAssets();

            if (tx.type === 'nft') {
              refetchIotaNFTs();
            }
          }

          removeTx(tx.txHash);
        } catch (error) {
          devLogger.error(`[TxWatcher] Retrying tx: ${tx.txHash}`, error);
          updateTx(tx.txHash, { retryCount: tx.retryCount + 1 });
        }
      }

      if (chainType === 'solana') {
        const targetChain = chainList.solanaChains?.find((item) => isMatchingUniqueChainId(item, tx.chainId));
        if (!targetChain) {
          removeTx(tx.txHash);
          continue;
        }

        try {
          const requestUrl = targetChain.rpcUrls.map((item) => item.url).filter(Boolean)[0];

          if (!requestUrl) throw new Error('No requestUrl');

          const connection = SolanaRpcClient.getInstance({ rpcUrl: requestUrl }).getConnection();
          const response = await connection.getTransaction(tx.txHash, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });

          if (!response || (response?.meta && response.meta.err)) {
            throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
          }

          const isTxSuccess = response?.meta && !response.meta.err;

          if (isTxSuccess) {
            await sendMessage({ target: 'SERVICE_WORKER', method: 'updateChainSpecificBalance', params: [currentAccount.id, tx.chainId] });
            refreshAssets();
          }

          removeTx(tx.txHash);
        } catch (error) {
          devLogger.error(`[TxWatcher] Retrying tx: ${tx.txHash}`, error);
          updateTx(tx.txHash, { retryCount: tx.retryCount + 1 });
        }
      }

      if (chainType === 'gno') {
        const targetChain = chainList.gnoChains?.find((item) => isMatchingUniqueChainId(item, tx.chainId));

        if (!targetChain) {
          removeTx(tx.txHash);
          continue;
        }

        try {
          const requestUrls = targetChain.rpcUrls
            .map((item) => item.url)
            .filter(Boolean)
            .map((chainEndpoint) => gnoURL(chainEndpoint).getTxInfo(tx.txHash));

          const response = await Promise.any(
            requestUrls.map(async (rpcUrl) => {
              const response = await get<GnoTxResponse>(rpcUrl, {
                timeout: 5000,
              });

              return response;
            }),
          );

          if (
            (isAxiosError(response.error) &&
              response.error?.response?.status &&
              response.error.response.status >= 400 &&
              response.error.response.status < 500) ||
            response.error?.message
          ) {
            throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
          }

          const isTxSuccess = (() => {
            if (response?.result?.tx_result?.ResponseBase?.Error !== undefined) {
              if (response.result.tx_result.ResponseBase.Error !== null) {
                return false;
              }

              return true;
            }
          })();

          if (isTxSuccess) {
            await sendMessage({
              target: 'SERVICE_WORKER',
              method: 'updateChainSpecificBalance',
              params: [currentAccount.id, tx.chainId],
            });
          }
          refreshAssets();

          removeTx(tx.txHash);
        } catch (error) {
          devLogger.error(`[TxWatcher] Retrying tx: ${tx.txHash}`, error);
          updateTx(tx.txHash, { retryCount: tx.retryCount + 1 });
        }
      }
    }
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useTxWatcher', currentAccount.id, ...txs.map((item) => item.txHash)],
    fetchFunction: startWatching,
    config: {
      staleTime: Infinity,
      retry: 6,
      retryDelay: 1000 * 5,
      enabled: txs.length > 0 && !!currentAccount.id,
      refetchInterval: () => {
        if (txs.length > 0) {
          return 1000 * 7;
        }

        return false;
      },
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
