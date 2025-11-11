import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SendOptions } from '@solana/web3.js';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import Tooltip from '@/components/common/Tooltip';
import { POPUP_DISMISS_DELAY_MS } from '@/constants/common';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { SOLANA_NATIVE_COIN } from '@/constants/solana';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useAnalyzeTokenChanges } from '@/hooks/solana/useAnalyzeTokenChanges';
import { useCurrentSolanaNetwork } from '@/hooks/solana/useCurrentSolanaNetwork';
import { useMultipleTransactionPreview } from '@/hooks/solana/useMultipleTransactionPreview';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import BaseTxInfo from '@/pages/popup/-components/BaseTxInfo';
import DappInfo from '@/pages/popup/-components/DappInfo';
import type {
  SolanaSignAllTransactions,
  SolanaSignAndSendAllTransactions,
  SolanaSignAndSendTransaction,
  SolanaSignTransaction,
} from '@/types/message/inject/solana';
import type { SolanaRpcSendTransactionResponse } from '@/types/solana/api';
import { wait } from '@/utils/fetch/wait';
import { plus } from '@/utils/numbers';
import { getCoinId, getCoinIdWithManual } from '@/utils/queryParamGenerator';
import { requestRPC } from '@/utils/solana/rpc';
import { deserializeTransaction, parseInstructionsFromTx, serializeTransaction, signTransaction } from '@/utils/solana/transaction';
import { getSiteTitle } from '@/utils/website';

import TxMessage from './-components/TxMessage';
import { Divider, DividerContainer, LineDivider, SticktFooterInnerBody, TxBaseInfoContainer } from './-styled';

type EntryProps = {
  request: SolanaSignTransaction | SolanaSignAllTransactions | SolanaSignAndSendTransaction | SolanaSignAndSendAllTransactions;
};

export default function Entry({ request }: EntryProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const { t } = useTranslation();
  const { deQueue } = useCurrentRequestQueue();

  const { currentSolanaNetwork } = useCurrentSolanaNetwork();

  const { currentAccount, incrementTxCountForOrigin } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { getSolanaAccountAsset } = useGetAccountAsset({
    coinId: getCoinIdWithManual({ id: SOLANA_NATIVE_COIN, chainType: currentSolanaNetwork?.chainType || 'solana', chainId: currentSolanaNetwork?.id || '' }),
  });

  const nativeAccountAsset = getSolanaAccountAsset();

  const nativeAccountAssetCoinId = useMemo(() => (nativeAccountAsset ? getCoinId(nativeAccountAsset.asset) : ''), [nativeAccountAsset]);

  const { params, origin, method } = request;

  const { siteIconURL } = useSiteIconURL(origin);
  const siteTitle = getSiteTitle(origin);

  const [isProcessing, setIsProcessing] = useState(false);

  const keyPair = useMemo(
    () => currentSolanaNetwork && getKeypair(currentSolanaNetwork, currentAccount, currentPassword),
    [currentAccount, currentSolanaNetwork, currentPassword],
  );
  const address = useMemo(
    () => (currentSolanaNetwork && keyPair?.publicKey ? getAddress(currentSolanaNetwork, keyPair.publicKey) : ''),
    [currentSolanaNetwork, keyPair?.publicKey],
  );

  const unserializedTxs = useMemo(() => {
    return params.map(({ serializedTx }) => {
      return deserializeTransaction(serializedTx);
    });
  }, [params]);

  const { data: expectedTokenChanges } = useAnalyzeTokenChanges({
    transaction: unserializedTxs[currentStep],
    userAddress: nativeAccountAsset?.address.address || '',
  });

  const { data: transactionPreview, isFetching: isFetchingTransactionPreview } = useMultipleTransactionPreview({
    coinId: nativeAccountAssetCoinId,
    transactions: unserializedTxs,
  });

  const baseFee = useMemo(() => {
    if (transactionPreview && transactionPreview.length > 0) {
      return transactionPreview.reduce((acc, cur) => {
        if (cur) {
          return plus(acc, cur.estimatedValue || 0);
        }
        return acc;
      }, '0');
    }

    return '0';
  }, [transactionPreview]);

  const instructions = useMemo(() => {
    return unserializedTxs.map((tx) => {
      return parseInstructionsFromTx(tx);
    });
  }, [unserializedTxs]);

  const errorMessage = useMemo(() => {
    if (isFetchingTransactionPreview) {
      return t('pages.popup.solana.transaction.entry.calculatingFee');
    }
    return '';
  }, [isFetchingTransactionPreview, t]);

  const handleOnSign = useCallback(async () => {
    try {
      setIsProcessing(true);

      if (!keyPair) {
        throw new Error('key pair does not exist');
      }

      if (!nativeAccountAsset) {
        throw new Error('accountAsset does not exist');
      }

      const privateKey = keyPair.privateKey;
      const privateKeyBuffer = Buffer.from(privateKey, 'hex');

      if (method === 'solana_signTransaction' || method === 'solana_signAllTransactions') {
        const txs = params.map(({ serializedTx }) => {
          return deserializeTransaction(serializedTx);
        });

        const signedTxs = txs.map((tx) => {
          return signTransaction(tx, privateKeyBuffer);
        });

        const result = signedTxs.map((tx) => {
          try {
            return serializeTransaction(tx);
          } catch {
            return undefined;
          }
        });

        await wait(POPUP_DISMISS_DELAY_MS);
        await incrementTxCountForOrigin(origin);

        sendMessage({
          target: 'CONTENT',
          method: 'responseApp',
          origin: origin,
          requestId: request.requestId,
          tabId: request.tabId,
          params: {
            id: request.requestId,
            result,
          },
        });
      }

      if (method === 'solana_signAndSendTransaction' || method === 'solana_signAndSendAllTransactions') {
        const txs = params.map((param) => {
          const { serializedTx, ...options } = param;

          return { tx: deserializeTransaction(serializedTx), options };
        });

        const signedTxs = txs.map(({ tx, options }) => {
          return { signedTx: signTransaction(tx, privateKeyBuffer), options };
        });

        const responseAll = await Promise.all(
          signedTxs.map(async ({ signedTx, options }) => {
            try {
              const sendOptions: SendOptions = options;

              const { result: signature } = await requestRPC<SolanaRpcSendTransactionResponse>('sendTransaction', [
                Buffer.from(signedTx.serialize()).toString('base64'),
                {
                  encoding: 'base64',
                  ...sendOptions,
                },
              ]);

              return signature;
            } catch {
              return undefined;
            }
          }),
        );

        if (method === 'solana_signAndSendTransaction') {
          const result = {
            publicKey: address,
            signature: responseAll[0],
          };

          await wait(POPUP_DISMISS_DELAY_MS);
          await incrementTxCountForOrigin(origin);
          sendMessage({
            target: 'CONTENT',
            method: 'responseApp',
            origin: request.origin,
            requestId: request.requestId,
            tabId: request.tabId,
            params: {
              id: request.requestId,
              result,
            },
          });
        }

        if (method === 'solana_signAndSendAllTransactions') {
          const result = {
            publicKey: address,
            signatures: responseAll,
          };
          await wait(POPUP_DISMISS_DELAY_MS);
          await incrementTxCountForOrigin(origin);
          sendMessage({
            target: 'CONTENT',
            method: 'responseApp',
            origin: request.origin,
            requestId: request.requestId,
            tabId: request.tabId,
            params: {
              id: request.requestId,
              result,
            },
          });
        }
      }
    } catch {
      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.requestId,
          error: {
            code: RPC_ERROR.INVALID_INPUT,
            message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_INPUT]}`,
          },
        },
      });
    } finally {
      setIsProcessing(false);

      await deQueue();
    }
  }, [address, deQueue, incrementTxCountForOrigin, keyPair, method, nativeAccountAsset, origin, params, request.origin, request.requestId, request.tabId]);

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <DappInfo image={siteIconURL} name={siteTitle} url={origin} />
          <Divider />
          <TxBaseInfoContainer>
            <BaseTxInfo feeCoinId={nativeAccountAssetCoinId} feeBaseAmount={baseFee} disableFee isLoadingFee={isFetchingTransactionPreview} />
          </TxBaseInfoContainer>
          <DividerContainer>
            <Divider />
          </DividerContainer>
          <LineDivider />
          <TxMessage msgs={instructions} tokenChanges={expectedTokenChanges} currentStep={currentStep} onPageChange={(page) => setCurrentStep(page)} />
        </EdgeAligner>
      </BaseBody>

      <SticktFooterInnerBody>
        <SplitButtonsLayout
          cancelButton={
            <Button
              disabled={isProcessing}
              onClick={async () => {
                sendMessage({
                  target: 'CONTENT',
                  method: 'responseApp',
                  origin: request.origin,
                  requestId: request.requestId,
                  tabId: request.tabId,
                  params: {
                    id: request.requestId,
                    error: {
                      code: RPC_ERROR.USER_REJECTED_REQUEST,
                      message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                    },
                  },
                });

                await deQueue();
              }}
              variant="dark"
            >
              {t('pages.popup.solana.transaction.entry.reject')}
            </Button>
          }
          confirmButton={
            <Tooltip title={errorMessage} varient="error" placement="top">
              <div>
                <Button isProgress={isProcessing} disabled={!!errorMessage} onClick={handleOnSign}>
                  {t('pages.popup.solana.transaction.entry.sign')}
                </Button>
              </div>
            </Tooltip>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
