import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { bcs } from '@mysten/sui/bcs';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction as SuiTransaction } from '@mysten/sui/transactions';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import Tooltip from '@/components/common/Tooltip';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { SUI_COIN_TYPE } from '@/constants/sui';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentSuiNetwork } from '@/hooks/sui/useCurrentSuiNetwork';
import { useDryRunTransaction } from '@/hooks/sui/useDryRunTransaction';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import { StyledTabPanel } from '@/pages/-styled';
import BaseTxInfo from '@/pages/popup/-components/BaseTxInfo';
import DappInfo from '@/pages/popup/-components/DappInfo';
import RawTx from '@/pages/popup/-components/RawTx';
import type { SuiSignAndExecuteTransaction, SuiSignAndExecuteTransactionBlock, SuiSignTransaction, SuiSignTransactionBlock } from '@/types/message/inject/sui';
import { gt, minus, plus } from '@/utils/numbers';
import { getCoinId, isSameChain } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';
import { signAndExecuteTxSequentially, signTxSequentially } from '@/utils/sui/sign';
import { getSiteTitle } from '@/utils/website';

import TxMessage from './-components/TxMessage';
import { Divider, DividerContainer, LineDivider, RawTxContainer, SticktFooterInnerBody, StickyTabContainer, TxBaseInfoContainer } from './-styled';

type EntryProps = {
  request: SuiSignAndExecuteTransactionBlock | SuiSignTransactionBlock | SuiSignAndExecuteTransaction | SuiSignTransaction;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();
  const { deQueue } = useCurrentRequestQueue();

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const nativeAccountAsset = useMemo(
    () =>
      currentSuiNetwork &&
      accountAllAssets?.suiAccountAssets.find((item) => isSameChain(item.chain, currentSuiNetwork) && isEqualsIgnoringCase(item.asset.id, SUI_COIN_TYPE)),
    [accountAllAssets?.suiAccountAssets, currentSuiNetwork],
  );

  const nativeAccountAssetCoinId = useMemo(() => (nativeAccountAsset ? getCoinId(nativeAccountAsset.asset) : ''), [nativeAccountAsset]);

  const { params, origin } = request;

  const { siteIconURL } = useSiteIconURL(origin);
  const siteTitle = getSiteTitle(origin);

  const [isProcessing, setIsProcessing] = useState(false);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Detail', 'Data'];

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const keyPair = useMemo(
    () => currentSuiNetwork && getKeypair(currentSuiNetwork, currentAccount, currentPassword),
    [currentAccount, currentSuiNetwork, currentPassword],
  );
  const address = useMemo(
    () => (currentSuiNetwork && keyPair?.publicKey ? getAddress(currentSuiNetwork, keyPair.publicKey) : ''),
    [currentSuiNetwork, keyPair?.publicKey],
  );

  const parsedTx = useMemo(() => {
    const txBlock = SuiTransaction.from(params[0].transactionBlockSerialized);
    txBlock.setSenderIfNotSet(address);

    return txBlock;
  }, [address, params]);

  const transactionBlockResponseOptions = useMemo(() => {
    if (request.method === 'sui_signAndExecuteTransactionBlock' || request.method === 'sui_signAndExecuteTransaction') {
      const inputOptions = 'options' in params[0] ? params[0].options : undefined;

      return {
        showInput: true,
        showEffects: true,
        showEvents: true,
        ...inputOptions,
      };
    }

    return undefined;
  }, [params, request.method]);

  const { data: dryRunTransaction, error: dryRunTransactionError } = useDryRunTransaction({
    coinId: nativeAccountAssetCoinId,
    transaction: parsedTx,
  });

  const expectedBaseFee = useMemo(() => {
    if (dryRunTransaction?.result?.effects.gasUsed) {
      const storageCost = minus(dryRunTransaction.result.effects.gasUsed.storageCost, dryRunTransaction.result.effects.gasUsed.storageRebate);

      const cost = plus(dryRunTransaction.result.effects.gasUsed.computationCost, gt(storageCost, 0) ? storageCost : 0);

      return String(cost);
    }

    return '0';
  }, [dryRunTransaction?.result?.effects.gasUsed]);

  const isDiabled = useMemo(() => !(dryRunTransaction?.result?.effects.status.status === 'success'), [dryRunTransaction?.result?.effects.status.status]);

  const errorMessage = useMemo(() => {
    if (dryRunTransactionError?.message) {
      const idx = dryRunTransactionError.message.lastIndexOf(':');

      return dryRunTransactionError.message.substring(idx === -1 ? 0 : idx + 1).trim();
    }

    if (dryRunTransaction?.result?.effects.status.error) {
      return dryRunTransaction?.result.effects.status.error;
    }

    if (dryRunTransaction === null) {
      return 'Unknown Error';
    }

    if (dryRunTransaction?.result?.effects.status.status !== 'success') {
      return t('pages.popup.sui.transaction.entry.failedToDryRun');
    }

    return '';
  }, [dryRunTransaction, dryRunTransactionError?.message, t]);

  const handleOnSign = useCallback(async () => {
    try {
      setIsProcessing(true);

      if (!keyPair) {
        throw new Error('key pair does not exist');
      }

      if (!nativeAccountAsset) {
        throw new Error('accountAsset does not exist');
      }

      if (!parsedTx) {
        throw new Error('Failed to calculate final transaction');
      }
      const privateKey = keyPair.privateKey;
      const privateKeyBuffer = Buffer.from(privateKey, 'hex');

      const signer = Ed25519Keypair.fromSecretKey(privateKeyBuffer);

      const rpcURLs = nativeAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

      if (request.method === 'sui_signTransactionBlock' || request.method === 'sui_signTransaction') {
        const response = await signTxSequentially(signer, parsedTx, rpcURLs);

        const result = (() => {
          if (request.method === 'sui_signTransactionBlock') {
            return {
              transactionBlockBytes: response.bytes,
              signature: response.signature,
            };
          }

          if (request.method === 'sui_signTransaction') {
            return {
              bytes: response.bytes,
              signature: response.signature,
            };
          }
          return undefined;
        })();

        if (!result) {
          throw new Error('Failed to sign transaction');
        }

        sendMessage({
          target: 'CONTENT',
          method: 'responseApp',
          origin: request.origin,
          requestId: request.requestId,
          tabId: request.tabId,
          params: {
            id: request.id,
            result,
          },
        });
      }

      if (request.method === 'sui_signAndExecuteTransactionBlock' || request.method === 'sui_signAndExecuteTransaction') {
        const response = await signAndExecuteTxSequentially(signer, parsedTx, rpcURLs, transactionBlockResponseOptions);

        const result = (() => {
          if (request.method === 'sui_signAndExecuteTransactionBlock') {
            return {
              ...response,
            };
          }

          if (request.method === 'sui_signAndExecuteTransaction') {
            const [
              {
                txSignatures: [transactionSignature],
                intentMessage: { value: bcsTransaction },
              },
            ] = bcs.SenderSignedData.parse(Buffer.from(response.rawTransaction!, 'base64'));

            const bytes = bcs.TransactionData.serialize(bcsTransaction).toBase64();

            return {
              digest: response.digest,
              effects: Buffer.from(new Uint8Array(response.rawEffects!)).toString('base64'),
              bytes,
              signature: transactionSignature,
            };
          }

          return undefined;
        })();

        if (!result) {
          throw new Error('Failed to sign and execute transaction');
        }

        sendMessage({
          target: 'CONTENT',
          method: 'responseApp',
          origin: request.origin,
          requestId: request.requestId,
          tabId: request.tabId,
          params: {
            id: request.id,
            result,
          },
        });
      }
    } catch {
      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.id,
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
  }, [
    deQueue,
    keyPair,
    nativeAccountAsset,
    parsedTx,
    request.id,
    request.method,
    request.origin,
    request.requestId,
    request.tabId,
    transactionBlockResponseOptions,
  ]);

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <DappInfo image={siteIconURL} name={siteTitle} url={origin} />
          <Divider />
          <TxBaseInfoContainer>
            <BaseTxInfo feeCoinId={nativeAccountAssetCoinId} feeBaseAmount={expectedBaseFee} disableFee />
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
            <TxMessage tx={parsedTx} />
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <RawTxContainer>
              <RawTx tx={parsedTx.getData()} />
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
                    id: request.id,
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
              {t('pages.popup.sui.transaction.entry.reject')}
            </Button>
          }
          confirmButton={
            <Tooltip title={errorMessage} varient="error" placement="top">
              <Button isProgress={isProcessing} disabled={isDiabled} onClick={handleOnSign}>
                {t('pages.popup.sui.transaction.entry.sign')}
              </Button>
            </Tooltip>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
