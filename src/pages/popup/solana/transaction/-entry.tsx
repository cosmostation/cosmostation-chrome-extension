import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Connection, Keypair, Transaction, VersionedTransaction } from '@solana/web3.js';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import Tooltip from '@/components/common/Tooltip';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { SOLANA_NATIVE_COIN } from '@/constants/solana';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentSolanaNetwork } from '@/hooks/solana/useCurrentSolanaNetwork';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import BaseTxInfo from '@/pages/popup/-components/BaseTxInfo';
import DappInfo from '@/pages/popup/-components/DappInfo';
import RawTx from '@/pages/popup/-components/RawTx';
import type {
  SolanaSignAllTransactions,
  SolanaSignAndSendAllTransactions,
  SolanaSignAndSendTransaction,
  SolanaSignTransaction,
} from '@/types/message/inject/solana';
import { getCoinId, isSameChain } from '@/utils/queryParamGenerator';
import { deserializeTransaction, parseInstructionsFromTx } from '@/utils/solana/transaction';
import { isEqualsIgnoringCase } from '@/utils/string';
import { getSiteTitle } from '@/utils/website';

import TxMessage from './-components/TxMessage';
import {
  Divider,
  DividerContainer,
  LineDivider,
  RawTxContainer,
  SticktFooterInnerBody,
  StickyTabContainer,
  StyledTabPanel,
  TxBaseInfoContainer,
} from './-styled';

type EntryProps = {
  request: SolanaSignTransaction | SolanaSignAllTransactions | SolanaSignAndSendTransaction | SolanaSignAndSendAllTransactions;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();
  const { deQueue } = useCurrentRequestQueue();

  const { currentSolanaNetwork } = useCurrentSolanaNetwork();

  const { currentAccount, incrementTxCountForOrigin } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const nativeAccountAsset = useMemo(
    () =>
      currentSolanaNetwork &&
      accountAllAssets?.solanaAccountAssets.find(
        (item) => isSameChain(item.chain, currentSolanaNetwork) && isEqualsIgnoringCase(item.asset.id, SOLANA_NATIVE_COIN),
      ),
    [accountAllAssets?.solanaAccountAssets, currentSolanaNetwork],
  );

  const nativeAccountAssetCoinId = useMemo(() => (nativeAccountAsset ? getCoinId(nativeAccountAsset.asset) : ''), [nativeAccountAsset]);

  const { params, origin, method } = request;

  const { siteIconURL } = useSiteIconURL(origin);
  const siteTitle = getSiteTitle(origin);

  const [isProcessing, setIsProcessing] = useState(false);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Detail', 'Data'];

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const keyPair = useMemo(
    () => currentSolanaNetwork && getKeypair(currentSolanaNetwork, currentAccount, currentPassword),
    [currentAccount, currentSolanaNetwork, currentPassword],
  );
  const address = useMemo(
    () => (currentSolanaNetwork && keyPair?.publicKey ? getAddress(currentSolanaNetwork, keyPair.publicKey) : ''),
    [currentSolanaNetwork, keyPair?.publicKey],
  );

  const unserializedTxs = useMemo(() => {
    return params.map((hexTx) => {
      return deserializeTransaction(hexTx as unknown as string);
    });
  }, [params]);

  const instructions = useMemo(() => {
    return unserializedTxs.map((tx) => {
      return parseInstructionsFromTx(tx);
    });
  }, [unserializedTxs]);

  useEffect(() => {
    console.log('address', address);
    console.log('instructions', instructions);
  });

  const isDiabled = useMemo(() => !false, []);

  const errorMessage = useMemo(() => {
    return '';
  }, []);

  const handleOnSign = useCallback(async () => {
    try {
      setIsProcessing(true);

      const txs = params.map((hexTx) => {
        return deserializeTransaction(hexTx as unknown as string);
      });

      if (!keyPair) {
        throw new Error('key pair does not exist');
      }

      if (!nativeAccountAsset) {
        throw new Error('accountAsset does not exist');
      }

      const privateKey = keyPair.privateKey;
      const privateKeyBuffer = Buffer.from(privateKey, 'hex');

      const signer = Keypair.fromSeed(privateKeyBuffer);

      const rpcURLs = nativeAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

      if (method === 'solana_signTransaction' || method === 'solana_signAllTransactions') {
        for (const tx of txs) {
          if (tx instanceof Transaction) {
            tx.sign(signer);
          } else if (tx instanceof VersionedTransaction) {
            tx.sign([signer]);
          }
        }

        const result = txs.map((tx) => {
          if (tx instanceof Transaction) {
            return tx.serialize().toString('hex');
          } else if (tx instanceof VersionedTransaction) {
            return Buffer.from(tx.serialize()).toString('hex');
          }
          return undefined;
        });

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
        for (const tx of txs) {
          if (tx instanceof Transaction) {
            tx.sign(signer);
          } else if (tx instanceof VersionedTransaction) {
            tx.sign([signer]);
          }
        }

        const connection = new Connection(rpcURLs[0], 'confirmed');

        const responseAll = await Promise.all(
          txs.map(async (tx) => {
            try {
              return connection.sendRawTransaction(tx.serialize());
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
            <BaseTxInfo feeCoinId={nativeAccountAssetCoinId} feeBaseAmount={'1'} disableFee />
          </TxBaseInfoContainer>
          <DividerContainer>
            <Divider />
          </DividerContainer>
          <LineDivider />
          <StickyTabContainer>
            <FilledTabs value={tabValue} onChange={handleChange} variant="fullWidth">
              {tabLabels.map((item) => (
                <FilledTab key={item} label={item} />
              ))}
            </FilledTabs>
          </StickyTabContainer>
          <StyledTabPanel value={tabValue} index={0}>
            <TxMessage tx={'tx'} />
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <RawTxContainer>
              <RawTx tx={{}} />
            </RawTxContainer>
          </StyledTabPanel>
        </EdgeAligner>
      </BaseBody>

      <SticktFooterInnerBody>
        <SplitButtonsLayout
          cancelButton={
            <Button
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
                <Button isProgress={isProcessing} disabled={isDiabled || !!errorMessage} onClick={handleOnSign}>
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
