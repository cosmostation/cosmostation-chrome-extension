import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Long from 'long';
import { decodeTxMessages } from '@gnolang/gno-js-client';
import { JSONRPCProvider, TransactionEndpoint, Tx, Wallet } from '@gnolang/tm2-js-client';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import Tooltip from '@/components/common/Tooltip';
import FeeSettingBottomSheet from '@/components/Fee/GnoFee/components/FeeSettingBottomSheet';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { GNO_MEMO_MAX_BYTES } from '@/constants/gno';
import { DEFAULT_GAS_MULTIPLY, GNO_DEFAULT_GAS } from '@/constants/gno/gas';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentGnoNetwork } from '@/hooks/gno/useCurrentGnoNetwork';
import { useFees } from '@/hooks/gno/useFees';
import { useSimulate } from '@/hooks/gno/useSimulate';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import BaseTxInfo from '@/pages/popup/-components/BaseTxInfo';
import DappInfo from '@/pages/popup/-components/DappInfo';
import MemoInput from '@/pages/popup/-components/MemoInput';
import RawTx from '@/pages/popup/-components/RawTx';
import type {
  GnoSignAndSendTransaction,
  GnoSignAndSendTransactionResponse,
  GnoSignTransaction,
  GnoSignTransactionData,
  GnoSignTransactionResponse,
} from '@/types/message/inject/gno';
import { getGnoFeeStepNames } from '@/utils/gno/fee';
import { encodeMessageValue } from '@/utils/gno/transaction';
import { ceil, gt, gte, times } from '@/utils/numbers';
import { getCoinId, isMatchingCoinId, isSameChain } from '@/utils/queryParamGenerator';
import { getUtf8BytesLength } from '@/utils/string';
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
  request: GnoSignAndSendTransaction | GnoSignTransaction;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();
  const { deQueue } = useCurrentRequestQueue();

  const { currentGnoNetwork } = useCurrentGnoNetwork();

  const { currentAccount, incrementTxCountForOrigin } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const accountAsset = useMemo(
    () => currentGnoNetwork && accountAllAssets?.gnoAccountAssets.find((item) => isSameChain(item.chain, currentGnoNetwork)),
    [accountAllAssets?.gnoAccountAssets, currentGnoNetwork],
  );

  const accountAssetCoinId = useMemo(() => (accountAsset ? getCoinId(accountAsset.asset) : ''), [accountAsset]);

  const { feeAssets } = useFees({ coinId: accountAssetCoinId });

  const { params, origin, method } = request;

  const { siteIconURL } = useSiteIconURL(origin);
  const siteTitle = getSiteTitle(origin);

  const [isProcessing, setIsProcessing] = useState(false);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Summary', 'View Details'];

  const [txMessagePage, setTxMessagePage] = useState(0);

  const [isOpenFeeCustomBottomSheet, setIsOpenFeeCustomBottomSheet] = useState(false);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const inputTx = params[0];

  const keyPair = useMemo(
    () => currentGnoNetwork && getKeypair(currentGnoNetwork, currentAccount, currentPassword),
    [currentAccount, currentGnoNetwork, currentPassword],
  );

  const [inputMemo, setInputMemo] = useState(inputTx.memo || '');
  const signingMemo = useMemo(() => inputMemo, [inputMemo]);

  const [customFeeStepKey, setCustomFeeStepKey] = useState<number | undefined>(undefined);

  const currentFeeStepKey = useMemo(() => {
    if (customFeeStepKey) return customFeeStepKey;

    return 0;
  }, [customFeeStepKey]);

  const [customFeeCoinId, setCustomFeeCoinId] = useState('');

  const alternativeFeeAsset = useMemo(() => {
    if (customFeeCoinId) {
      return feeAssets.find((item) => isMatchingCoinId(item.asset, customFeeCoinId));
    }

    if (feeAssets.length === 0) {
      return undefined;
    }

    const extensionSelected = feeAssets[0];

    return extensionSelected;
  }, [customFeeCoinId, feeAssets]);

  const alternativeFeeCoinId = useMemo(() => (alternativeFeeAsset?.asset ? getCoinId(alternativeFeeAsset.asset) : ''), [alternativeFeeAsset?.asset]);

  const txMessages = useMemo(() => {
    const messages = inputTx.messages.map((message) => encodeMessageValue(message));
    return messages;
  }, [inputTx.messages]);

  const { data: estimatedGas, isFetched: isSimulated, isFetching } = useSimulate({ coinId: accountAssetCoinId, messages: txMessages, memo: inputMemo });

  const isCalculatingFee = useMemo(() => isFetching, [isFetching]);

  const [customGasAmount, setCustomGasAmount] = useState<string | undefined>();
  const [customGasRate, setCustomGasRate] = useState('');

  const alternativeGas = useMemo(() => {
    const gasCoefficient = currentGnoNetwork?.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;
    const simulatedGas = estimatedGas ? times(estimatedGas, gasCoefficient, 0) : undefined;

    const baseEstimateGas = simulatedGas || String(currentGnoNetwork?.feeInfo.defaultGasLimit) || GNO_DEFAULT_GAS;

    return baseEstimateGas;
  }, [currentGnoNetwork?.feeInfo.defaultGasLimit, currentGnoNetwork?.feeInfo.gasCoefficient, estimatedGas]);

  const alternativeGasRate = useMemo(() => alternativeFeeAsset?.gasRate, [alternativeFeeAsset?.gasRate]);

  const feeOptions = useMemo(() => {
    const customOption = {
      gas: customGasAmount,
      gasRate: customGasRate,
      coinId: alternativeFeeCoinId,
      decimals: alternativeFeeAsset?.asset.decimals || 0,
      balance: alternativeFeeAsset?.balance || '0',
      denom: alternativeFeeAsset?.asset.id,
      coinGeckoId: alternativeFeeAsset?.asset.coinGeckoId,
      symbol: alternativeFeeAsset?.asset.symbol || '',
      title: 'Custom',
    };

    const feeStepNames = getGnoFeeStepNames(alternativeGasRate);

    const alternativeFeeOptions = alternativeGasRate
      ? alternativeGasRate.map((item, i) => ({
          gas: alternativeGas,
          gasRate: item,
          coinId: alternativeFeeCoinId,
          decimals: alternativeFeeAsset?.asset.decimals || 0,
          balance: alternativeFeeAsset?.balance || '0',
          denom: alternativeFeeAsset?.asset.id,
          coinGeckoId: alternativeFeeAsset?.asset.coinGeckoId,
          symbol: alternativeFeeAsset?.asset.symbol || '',
          title: feeStepNames[i],
        }))
      : [];

    return [...alternativeFeeOptions, customOption];
  }, [
    alternativeFeeAsset?.asset.coinGeckoId,
    alternativeFeeAsset?.asset.decimals,
    alternativeFeeAsset?.asset.id,
    alternativeFeeAsset?.asset.symbol,
    alternativeFeeAsset?.balance,
    alternativeFeeCoinId,
    alternativeGas,
    alternativeGasRate,
    customGasAmount,
    customGasRate,
  ]);

  const selectedFeeOption = useMemo(() => {
    return feeOptions[currentFeeStepKey];
  }, [currentFeeStepKey, feeOptions]);

  const currentGas = selectedFeeOption.gas || '0';

  const currentFeeAmount = useMemo(() => times(currentGas, selectedFeeOption.gasRate || '0'), [currentGas, selectedFeeOption.gasRate]);

  const currentCeilFeeAmount = useMemo(() => ceil(currentFeeAmount), [currentFeeAmount]);

  const tx = useMemo(() => {
    if (!txMessages) return undefined;

    const tx: Tx = {
      messages: txMessages,
      fee: { gas_fee: `${currentCeilFeeAmount}${selectedFeeOption.denom}`, gas_wanted: new Long(Number(currentGas)) },
      signatures: [],
      memo: inputMemo,
    };

    return tx;
  }, [currentCeilFeeAmount, currentGas, inputMemo, selectedFeeOption.denom, txMessages]);

  const inputMemoErrorMessage = useMemo(() => {
    if (signingMemo) {
      if (gt(getUtf8BytesLength(signingMemo), GNO_MEMO_MAX_BYTES)) {
        return t('pages.popup.gno.transaction.entry.memoOverflow');
      }
    }
    return '';
  }, [signingMemo, t]);

  const errorMessage = useMemo(() => {
    if (!gte(alternativeFeeAsset?.balance || '0', currentCeilFeeAmount)) {
      return t('pages.popup.gno.transaction.entry.insufficientFeeAmount');
    }

    if (isCalculatingFee) {
      return t('pages.popup.gno.transaction.entry.calculatingFee');
    }

    if (!isSimulated) {
      return t('pages.popup.gno.transaction.entry.notSimulated');
    }

    if (inputMemoErrorMessage) {
      return inputMemoErrorMessage;
    }

    return '';
  }, [alternativeFeeAsset?.balance, currentCeilFeeAmount, inputMemoErrorMessage, isCalculatingFee, isSimulated, t]);

  const handleOnSign = async () => {
    try {
      setIsProcessing(true);

      if (!keyPair) {
        throw new Error('key pair does not exist');
      }

      if (!accountAsset) {
        throw new Error('accountAsset does not exist');
      }

      if (!selectedFeeOption || !selectedFeeOption.denom) {
        throw new Error('Failed to get current fee asset');
      }

      if (!currentGnoNetwork) {
        throw new Error('currentGnoNetwork does not exist');
      }

      if (!tx) {
        throw new Error('tx does not exist');
      }

      const privateKey = keyPair.privateKey;

      const rpcURLs = currentGnoNetwork.rpcUrls.map((item) => item.url);

      const provider = new JSONRPCProvider(rpcURLs[0]);

      const wallet = await Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'), { addressPrefix: currentGnoNetwork.accountPrefix });
      wallet.connect(provider);

      const signedTx = await wallet.signTransaction(tx, decodeTxMessages);

      const encodedTransaction = Buffer.from(Tx.encode(signedTx).finish()).toString('base64');

      if (method === 'gno_signTransaction') {
        const messages = decodeTxMessages(signedTx.messages);
        const signatures = signedTx.signatures.map((item) => {
          const pubKeyValue = item.pub_key?.value ? Buffer.from(item.pub_key.value).toString('base64') : '';
          const pubKeyTypeUrl = item.pub_key?.type_url;

          return {
            pubKey: {
              typeUrl: pubKeyTypeUrl,
              value: pubKeyValue,
            },
            signature: Buffer.from(item.signature).toString('base64'),
          };
        });

        const returnData: GnoSignTransactionData = {
          signed: { ...signedTx, messages, signatures },
          encodedTransaction,
        };

        const result: GnoSignTransactionResponse = {
          code: 0,
          status: 'success',
          message: '',
          data: returnData,
        };

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

      if (method === 'gno_signAndSendTransaction') {
        const response = await wallet.sendTransaction(signedTx, TransactionEndpoint.BROADCAST_TX_SYNC);

        const result: GnoSignAndSendTransactionResponse = {
          code: 0,
          status: 'success',
          message: '',
          data: {
            hash: response.hash,
          },
        };

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

      await incrementTxCountForOrigin(request.origin);
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
  };

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <DappInfo image={siteIconURL} name={siteTitle} url={origin} />
          <Divider />
          <TxBaseInfoContainer>
            <BaseTxInfo
              feeCoinId={selectedFeeOption.coinId}
              feeBaseAmount={currentFeeAmount}
              disableFee={false}
              isLoadingFee={isCalculatingFee}
              onClickFee={() => {
                setIsOpenFeeCustomBottomSheet(true);
              }}
            />
          </TxBaseInfoContainer>
          <DividerContainer>
            <Divider />
          </DividerContainer>

          <MemoInput
            memo={inputMemo}
            isEditMemo={true}
            onChangeMemo={(memo) => {
              setInputMemo(memo);
            }}
          />
          <LineDivider />
          <StickyTabContainer>
            <FilledTabs value={tabValue} onChange={handleChange} variant="fullWidth">
              {tabLabels.map((item) => (
                <FilledTab key={item} label={item} />
              ))}
            </FilledTabs>
          </StickyTabContainer>
          <StyledTabPanel value={tabValue} index={0}>
            <TxMessage
              msgs={inputTx.messages}
              currentStep={txMessagePage}
              onPageChange={(page) => {
                setTxMessagePage(page);
              }}
            />
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <RawTxContainer>
              <RawTx tx={tx ? { ...tx, messages: decodeTxMessages(tx.messages) } : {}} />
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
              {t('pages.popup.gno.transaction.entry.reject')}
            </Button>
          }
          confirmButton={
            <Tooltip title={errorMessage} varient="error" placement="top">
              <div>
                <Button isProgress={isProcessing} disabled={!!errorMessage} onClick={handleOnSign}>
                  {t('pages.popup.gno.transaction.entry.sign')}
                </Button>
              </div>
            </Tooltip>
          }
        />
      </SticktFooterInnerBody>
      <FeeSettingBottomSheet
        feeOptionDatas={feeOptions}
        availableFeeAssets={feeAssets}
        selectedCustomFeeCoinId={alternativeFeeCoinId}
        currentSelectedFeeOptionKey={currentFeeStepKey}
        open={isOpenFeeCustomBottomSheet}
        onClose={() => setIsOpenFeeCustomBottomSheet(false)}
        onChangeGas={(gas) => {
          setCustomGasAmount(gas);
        }}
        onChangeGasRate={(gasRate) => {
          setCustomGasRate(gasRate);
        }}
        onChangeFeeCoinId={(feeCoinId) => {
          setCustomFeeCoinId(feeCoinId);
        }}
        onSelectOption={(val) => {
          setCustomFeeStepKey(val);
        }}
      />
    </>
  );
}
