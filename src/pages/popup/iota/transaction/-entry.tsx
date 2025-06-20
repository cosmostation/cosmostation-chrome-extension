import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { bcs } from '@iota/iota-sdk/bcs';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { Transaction as IotaTransaction } from '@iota/iota-sdk/transactions';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import Tooltip from '@/components/common/Tooltip';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { IOTA_COIN_TYPE } from '@/constants/iota';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentIotaNetwork } from '@/hooks/iota/useCurrentIotaNetwork';
import { useDryRunTransaction } from '@/hooks/iota/useDryRunTransaction';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import BaseTxInfo from '@/pages/popup/-components/BaseTxInfo';
import DappInfo from '@/pages/popup/-components/DappInfo';
import RawTx from '@/pages/popup/-components/RawTx';
import type { IotaSignAndExecuteTransaction, IotaSignTransaction } from '@/types/message/inject/iota';
import { signAndExecuteTxSequentially, signTxSequentially } from '@/utils/iota/sign';
import { gt, minus, plus } from '@/utils/numbers';
import { getCoinId, isSameChain } from '@/utils/queryParamGenerator';
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
  request: IotaSignAndExecuteTransaction | IotaSignTransaction;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();
  const { deQueue } = useCurrentRequestQueue();

  const { currentIotaNetwork } = useCurrentIotaNetwork();

  const { currentAccount, incrementTxCountForOrigin } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const nativeAccountAsset = useMemo(
    () =>
      currentIotaNetwork &&
      accountAllAssets?.iotaAccountAssets.find((item) => isSameChain(item.chain, currentIotaNetwork) && isEqualsIgnoringCase(item.asset.id, IOTA_COIN_TYPE)),
    [accountAllAssets?.iotaAccountAssets, currentIotaNetwork],
  );

  const nativeAccountAssetCoinId = useMemo(() => (nativeAccountAsset ? getCoinId(nativeAccountAsset.asset) : ''), [nativeAccountAsset]);

  const { params, origin } = request;

  const { siteIconURL } = useSiteIconURL(origin);
  const siteTitle = getSiteTitle(origin);

  const [isProcessing, setIsProcessing] = useState(false);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Summary', 'View Details'];

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const keyPair = useMemo(
    () => currentIotaNetwork && getKeypair(currentIotaNetwork, currentAccount, currentPassword),
    [currentAccount, currentIotaNetwork, currentPassword],
  );
  const address = useMemo(
    () => (currentIotaNetwork && keyPair?.publicKey ? getAddress(currentIotaNetwork, keyPair.publicKey) : ''),
    [currentIotaNetwork, keyPair?.publicKey],
  );

  const parsedTx = useMemo(() => {
    const txBlock = IotaTransaction.from(params[0].transactionBlockSerialized);
    txBlock.setSenderIfNotSet(address);

    return txBlock;
  }, [address, params]);

  const transactionBlockResponseOptions = useMemo(() => {
    if (request.method === 'iota_signAndExecuteTransaction') {
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
      return t('pages.popup.iota.transaction.entry.failedToDryRun');
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

      if (request.method === 'iota_signTransaction') {
        const response = await signTxSequentially(signer, parsedTx, rpcURLs);

        const result = (() => {
          if (request.method === 'iota_signTransaction') {
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

        await incrementTxCountForOrigin(request.origin);

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

      if (request.method === 'iota_signAndExecuteTransaction') {
        const response = await signAndExecuteTxSequentially(signer, parsedTx, rpcURLs, transactionBlockResponseOptions);

        const result = (() => {
          if (request.method === 'iota_signAndExecuteTransaction') {
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

        await incrementTxCountForOrigin(request.origin);

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
  }, [
    deQueue,
    incrementTxCountForOrigin,
    keyPair,
    nativeAccountAsset,
    parsedTx,
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
              {t('pages.popup.iota.transaction.entry.reject')}
            </Button>
          }
          confirmButton={
            <Tooltip title={errorMessage} varient="error" placement="top">
              <div>
                <Button isProgress={isProcessing} disabled={isDiabled || !!errorMessage} onClick={handleOnSign}>
                  {t('pages.popup.iota.transaction.entry.sign')}
                </Button>
              </div>
            </Tooltip>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
