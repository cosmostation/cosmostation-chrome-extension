import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Account, Ed25519PrivateKey, PrivateKey, PrivateKeyVariants, Serializer } from '@aptos-labs/ts-sdk';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import Tooltip from '@/components/common/Tooltip';
import { APTOS_COIN_TYPE } from '@/constants/aptos/coin';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useCurrentAptosNetwork } from '@/hooks/aptos/useCurrentAptosNetwork';
import { useEstimateGasPrice } from '@/hooks/aptos/useEstimateGasPrice';
import { useSimulateTx } from '@/hooks/aptos/useSimulateTx';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import BaseTxInfo from '@/pages/popup/-components/BaseTxInfo';
import DappInfo from '@/pages/popup/-components/DappInfo';
import type { AptosSimulationPayload } from '@/types/aptos/tx';
import type { ResponseAppMessage } from '@/types/message/content';
import type { AptosSignTransaction } from '@/types/message/inject/aptos';
import { signTxSequentially } from '@/utils/aptos/sign';
import { getOriginalTx } from '@/utils/aptos/tx';
import { ceil, gt, times } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';
import { getSiteTitle } from '@/utils/website';

import TxMessage from './-components/TxMessage';
import {
  Divider,
  DividerContainer,
  LineDivider,
  RawTxContainer,
  RawTxMessage,
  SticktFooterInnerBody,
  StickyTabContainer,
  StyledTabPanel,
  TxBaseInfoContainer,
} from './-styled';

type EntryProps = {
  request: AptosSignTransaction;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();
  const { deQueue } = useCurrentRequestQueue();

  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { currentAccount, incrementTxCountForOrigin } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const nativeAccountAsset = useMemo(
    () => accountAllAssets?.aptosAccountAssets.find((item) => isEqualsIgnoringCase(item.asset.id, APTOS_COIN_TYPE)),
    [accountAllAssets?.aptosAccountAssets],
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
    () => currentAptosNetwork && getKeypair(currentAptosNetwork, currentAccount, currentPassword),
    [currentAccount, currentAptosNetwork, currentPassword],
  );

  const aptosAccount = useMemo(() => {
    if (!keyPair?.privateKey) return undefined;

    const pk = PrivateKey.formatPrivateKey(keyPair.privateKey, PrivateKeyVariants.Ed25519);

    return Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(pk) });
  }, [keyPair?.privateKey]);

  const parsedTx = useMemo(() => getOriginalTx(params.serializedTxHex), [params]);
  const displayParsedTx = useMemo(
    () => ({
      gas_unit_price: parsedTx.rawTransaction.gas_unit_price.toString(),
      max_gas_amount: parsedTx.rawTransaction.max_gas_amount.toString(),
      chain_id: parsedTx.rawTransaction.chain_id,
      expiration_timestamp_secs: parsedTx.rawTransaction.expiration_timestamp_secs.toString(),
      payload: parsedTx.rawTransaction.payload,
      sender: parsedTx.rawTransaction.sender.toStringLong(),
      sequence_number: parsedTx.rawTransaction.sequence_number.toString(),
    }),
    [parsedTx.rawTransaction],
  );

  const simulationPayload = useMemo<AptosSimulationPayload>(() => {
    return {
      signerPublicKey: aptosAccount?.publicKey,
      transaction: parsedTx,
      options: {
        estimateGasUnitPrice: true,
        estimateMaxGasAmount: true,
        estimatePrioritizedGasUnitPrice: true,
      },
    };
  }, [aptosAccount?.publicKey, parsedTx]);

  const simulateTransaction = useSimulateTx({ coinId: nativeAccountAssetCoinId, payload: simulationPayload });
  const estimateGasPrice = useEstimateGasPrice({ coinId: nativeAccountAssetCoinId });

  const currentGasPrice = useMemo(() => {
    if (!estimateGasPrice.data) {
      return null;
    }

    const averageGasPrice = estimateGasPrice.data.gas_estimate || estimateGasPrice.data.prioritized_gas_estimate;

    if (typeof averageGasPrice !== 'number') {
      return null;
    }

    return averageGasPrice;
  }, [estimateGasPrice.data]);

  const estimatedGasAmount = useMemo(() => simulateTransaction.data?.[0]?.gas_used || '0', [simulateTransaction.data]);

  const estimatedFeeAmount = useMemo(() => {
    const tx = parsedTx.rawTransaction;
    const defaultFeeAmount = ceil(times(tx.gas_unit_price.toString() || '0', tx.max_gas_amount.toString()));

    const inAppCalculatedFeeAmount = times(currentGasPrice || '0', estimatedGasAmount, 0);

    return gt(inAppCalculatedFeeAmount, '0') ? inAppCalculatedFeeAmount : defaultFeeAmount;
  }, [currentGasPrice, estimatedGasAmount, parsedTx.rawTransaction]);

  const errorMessage = useMemo(() => {
    if (gt(estimatedFeeAmount, nativeAccountAsset?.balance || '0')) {
      return t('pages.popup.aptos.transaction.entry.insufficientBalance');
    }
    if (!simulateTransaction.data?.[0]?.success) {
      return t('pages.popup.aptos.transaction.entry.failedToSimulate');
    }
    return '';
  }, [estimatedFeeAmount, nativeAccountAsset?.balance, simulateTransaction.data, t]);

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

      if (!aptosAccount) {
        throw new Error('Failed to create aptos account');
      }

      const rpcURLs = nativeAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

      if (!rpcURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signTxSequentially(aptosAccount, parsedTx, rpcURLs, {
        asFeePayer: params.asFeePayer,
      });

      const serializer = new Serializer();
      serializer.serialize(response);
      const serializedAccountAuthenticator = Buffer.from(serializer.toUint8Array()).toString('hex');

      await incrementTxCountForOrigin(request.origin);

      sendMessage<ResponseAppMessage<AptosSignTransaction>>({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.requestId,
          result: serializedAccountAuthenticator,
        },
      });
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
    aptosAccount,
    deQueue,
    incrementTxCountForOrigin,
    keyPair,
    nativeAccountAsset,
    params.asFeePayer,
    parsedTx,
    request.origin,
    request.requestId,
    request.tabId,
  ]);

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <DappInfo image={siteIconURL} name={siteTitle} url={origin} />
          <Divider />
          <TxBaseInfoContainer>
            <BaseTxInfo feeCoinId={nativeAccountAssetCoinId} feeBaseAmount={estimatedFeeAmount} disableFee />
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
            <TxMessage displayTxString={JSON.stringify(displayParsedTx, null, 4)} />
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <RawTxContainer>
              <RawTxMessage>
                <Base1300Text variant="b3_M">{JSON.stringify(displayParsedTx, null, 4)}</Base1300Text>
              </RawTxMessage>
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
              {t('pages.popup.aptos.transaction.entry.reject')}
            </Button>
          }
          confirmButton={
            <Tooltip title={errorMessage} varient="error" placement="top">
              <div>
                <Button isProgress={isProcessing} disabled={!!errorMessage} onClick={handleOnSign}>
                  {t('pages.popup.aptos.transaction.entry.sign')}
                </Button>
              </div>
            </Tooltip>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
