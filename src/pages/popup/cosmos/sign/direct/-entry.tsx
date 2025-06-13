import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import Tooltip from '@/components/common/Tooltip';
import FeeSettingBottomSheet from '@/components/Fee/CosmosFee/components/FeeSettingBottomSheet';
import InformationPanel from '@/components/InformationPanel';
import { PUBLIC_KEY_TYPE } from '@/constants/cosmos';
import { COSMOS_DEFAULT_GAS, DEFAULT_GAS_MULTIPLY } from '@/constants/cosmos/gas';
import { COSMOS_MEMO_MAX_BYTES } from '@/constants/cosmos/tx';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useAdditionalFee } from '@/hooks/cosmos/useAdditionalFee';
import { useFees } from '@/hooks/cosmos/useFees';
import { useProtoBuilderDecoder } from '@/hooks/cosmos/useProtoBuilderDecoder';
import { useSimulate } from '@/hooks/cosmos/useSimulate';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import BaseTxInfo from '@/pages/popup/-components/BaseTxInfo';
import DappInfo from '@/pages/popup/-components/DappInfo';
import MemoInput from '@/pages/popup/-components/MemoInput';
import RawTx from '@/pages/popup/-components/RawTx';
import { cosmos } from '@/proto/cosmos-sdk-v0.47.4.js';
import type { CosmosChain } from '@/types/chain';
import type { Msg } from '@/types/cosmos/direct';
import type { CosSignDirect, CosSignDirectResponse } from '@/types/message/inject/cosmos';
import { getCosmosFeeStepNames } from '@/utils/cosmos/fee';
import { getPublicKeyType, signDirect } from '@/utils/cosmos/msg';
import { decodeProtobufMessage, protoTxBytes } from '@/utils/cosmos/proto';
import { toUint8Array } from '@/utils/crypto';
import { ceil, divide, equal, gt, gte, times } from '@/utils/numbers';
import { getCoinId, isMatchingCoinId, isSameChain } from '@/utils/queryParamGenerator';
import { getUtf8BytesLength } from '@/utils/string';
import { getSiteTitle } from '@/utils/website';

import TxMessage from './-components/TxMessage';
import { InformationContainer, StickyTabContainer, StyledTabPanel } from './-styled';
import { Divider, DividerContainer, LineDivider, RawTxContainer, SticktFooterInnerBody, TxBaseInfoContainer } from '../amino/-styled';

type EntryProps = {
  request: CosSignDirect;
  chain: CosmosChain;
};

export default function Entry({ request, chain }: EntryProps) {
  const { t } = useTranslation();
  const { deQueue } = useCurrentRequestQueue();

  const { currentAccount, incrementTxCountForOrigin } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const accountAsset = useMemo(
    () => accountAllAssets?.allCosmosAccountAssets.find((item) => isSameChain(item.chain, chain)),
    [accountAllAssets?.allCosmosAccountAssets, chain],
  );

  const accountAssetCoinId = useMemo(() => (accountAsset ? getCoinId(accountAsset.asset) : ''), [accountAsset]);

  const { params, origin } = request;

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

  const { doc, isEditFee = true, isEditMemo = true, isCheckBalance = true } = params;

  const auth_info_bytes = useMemo(() => toUint8Array(doc.auth_info_bytes), [doc.auth_info_bytes]);
  const body_bytes = useMemo(() => toUint8Array(doc.body_bytes), [doc.body_bytes]);

  const decodedBodyBytes = useMemo(() => cosmos.tx.v1beta1.TxBody.decode(body_bytes), [body_bytes]);
  const decodedAuthInfoBytes = useMemo(() => cosmos.tx.v1beta1.AuthInfo.decode(auth_info_bytes), [auth_info_bytes]);

  const keyPair = useMemo(() => getKeypair(chain, currentAccount, currentPassword), [chain, currentAccount, currentPassword]);

  const [inputMemo, setInputMemo] = useState(decodedBodyBytes.memo);
  const signingMemo = useMemo(() => (isEditMemo ? inputMemo : decodedBodyBytes.memo), [decodedBodyBytes.memo, inputMemo, isEditMemo]);

  const { feeAssets, defaultGasRateKey, isFeemarketActive } = useFees({ coinId: accountAssetCoinId });

  const { fee, signer_infos } = decodedAuthInfoBytes;

  const inputFee = useMemo(
    () =>
      fee?.amount?.find((item) => feeAssets.map((feeCoin) => feeCoin.asset.id).includes(item?.denom || '')) ||
      fee?.amount?.[0] || {
        denom: chain.mainAssetDenom,
        amount: '0',
      },
    [chain.mainAssetDenom, fee?.amount, feeAssets],
  );

  const [customFeeStepKey, setCustomFeeStepKey] = useState<number | undefined>(undefined);

  const currentFeeStepKey = useMemo(() => {
    if (customFeeStepKey) return customFeeStepKey;

    return isEditFee ? defaultGasRateKey + 1 : 0;
  }, [customFeeStepKey, defaultGasRateKey, isEditFee]);

  const dappFromFeeAsset = useMemo(() => feeAssets.find((item) => item.asset.id === inputFee.denom), [feeAssets, inputFee.denom]);

  const [customFeeCoinId, setCustomFeeCoinId] = useState('');

  const alternativeFeeAsset = useMemo(() => {
    if (customFeeCoinId) {
      return feeAssets.find((item) => isMatchingCoinId(item.asset, customFeeCoinId));
    }

    if (feeAssets.length === 0) {
      return undefined;
    }

    const extensionSelected = feeAssets[0];

    if (dappFromFeeAsset) {
      const dappSelectedFeeCoinId = getCoinId(dappFromFeeAsset.asset);
      const extensionSelectedFeeCoinId = getCoinId(extensionSelected.asset);

      if (dappSelectedFeeCoinId !== extensionSelectedFeeCoinId) {
        return feeAssets.find((item) => getCoinId(item.asset) === dappSelectedFeeCoinId) || extensionSelected;
      }
    }

    return extensionSelected;
  }, [customFeeCoinId, dappFromFeeAsset, feeAssets]);

  const alternativeFeeCoinId = useMemo(() => (alternativeFeeAsset?.asset ? getCoinId(alternativeFeeAsset.asset) : ''), [alternativeFeeAsset?.asset]);

  const memoizedProtoTx = useMemo(() => {
    if (isEditFee) {
      const signatures = signer_infos.map(() => Buffer.from(new Uint8Array(64)).toString('base64'));

      return protoTxBytes({
        signatures,
        txBodyBytes: body_bytes,
        authInfoBytes: auth_info_bytes,
      });
    }
    return null;
  }, [auth_info_bytes, body_bytes, isEditFee, signer_infos]);

  const isPossibleSimulating =
    !!accountAssetCoinId &&
    !!memoizedProtoTx?.tx_bytes &&
    !!accountAsset?.chain.lcdUrls.map((item) => item.url).length &&
    accountAsset?.chain.feeInfo.isSimulable;

  const simulate = useSimulate({ coinId: accountAssetCoinId, txBytes: memoizedProtoTx?.tx_bytes });

  const dappFromGas = useMemo(() => (fee?.gas_limit ? String(fee.gas_limit) : '0'), [fee?.gas_limit]);
  const dappFromGasRate = useMemo(() => (equal(dappFromGas, '0') ? '0' : divide(inputFee.amount || '0', dappFromGas)), [dappFromGas, inputFee.amount]);

  const [customGasAmount, setCustomGasAmount] = useState<string | undefined>();
  const [customGasRate, setCustomGasRate] = useState('');

  const alternativeGas = useMemo(() => {
    const gasCoefficient = accountAsset?.chain.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;
    const simulatedGas = simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasCoefficient, 0) : undefined;

    const baseEstimateGas = simulatedGas || String(accountAsset?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS;

    return baseEstimateGas;
  }, [accountAsset?.chain.feeInfo.defaultGasLimit, accountAsset?.chain.feeInfo.gasCoefficient, simulate.data?.gas_info?.gas_used]);

  const alternativeGasRate = useMemo(() => alternativeFeeAsset?.gasRate, [alternativeFeeAsset?.gasRate]);

  const feeOptions = useMemo(() => {
    const dappFromOption = {
      gas: dappFromGas,
      gasRate: dappFromGasRate,
      coinId: dappFromFeeAsset?.asset ? getCoinId(dappFromFeeAsset?.asset) : '',
      decimals: dappFromFeeAsset?.asset.decimals || 0,
      denom: dappFromFeeAsset?.asset.id,
      coinGeckoId: dappFromFeeAsset?.asset.coinGeckoId,
      symbol: dappFromFeeAsset?.asset.symbol || '',
      title: 'Suggested (Dapp)',
    };

    const customOption = {
      gas: customGasAmount,
      gasRate: customGasRate,
      coinId: alternativeFeeCoinId,
      decimals: alternativeFeeAsset?.asset.decimals || 0,
      denom: alternativeFeeAsset?.asset.id,
      coinGeckoId: alternativeFeeAsset?.asset.coinGeckoId,
      symbol: alternativeFeeAsset?.asset.symbol || '',
      title: 'Custom',
    };

    const feeStepNames = getCosmosFeeStepNames(isFeemarketActive || false, alternativeGasRate);

    const alternativeFeeOptions = alternativeGasRate
      ? alternativeGasRate.map((item, i) => ({
          gas: alternativeGas,
          gasRate: item,
          coinId: alternativeFeeCoinId,
          decimals: alternativeFeeAsset?.asset.decimals || 0,
          denom: alternativeFeeAsset?.asset.id,
          coinGeckoId: alternativeFeeAsset?.asset.coinGeckoId,
          symbol: alternativeFeeAsset?.asset.symbol || '',
          title: feeStepNames[i],
        }))
      : [];

    return [dappFromOption, ...alternativeFeeOptions, customOption];
  }, [
    alternativeFeeAsset?.asset.coinGeckoId,
    alternativeFeeAsset?.asset.decimals,
    alternativeFeeAsset?.asset.id,
    alternativeFeeAsset?.asset.symbol,
    alternativeFeeCoinId,
    alternativeGas,
    alternativeGasRate,
    customGasAmount,
    customGasRate,
    dappFromFeeAsset?.asset,
    dappFromGas,
    dappFromGasRate,
    isFeemarketActive,
  ]);

  const selectedFeeOption = useMemo(() => {
    return feeOptions[currentFeeStepKey];
  }, [currentFeeStepKey, feeOptions]);

  const isFeeCustomed = useMemo(() => currentFeeStepKey !== 0, [currentFeeStepKey]);

  const isFeeUpdateAllowed = useMemo(() => isEditFee || isFeeCustomed, [isFeeCustomed, isEditFee]);

  const baseFee = useMemo(() => times(selectedFeeOption.gas || '0', selectedFeeOption.gasRate || '0'), [selectedFeeOption.gas, selectedFeeOption.gasRate]);

  const currentFee = useMemo(() => {
    return ceil(baseFee);
  }, [baseFee]);

  const encodedBodyBytes = useMemo(() => cosmos.tx.v1beta1.TxBody.encode({ ...decodedBodyBytes, memo: signingMemo }).finish(), [decodedBodyBytes, signingMemo]);
  const encodedAuthInfoBytes = useMemo(
    () =>
      cosmos.tx.v1beta1.AuthInfo.encode({
        ...decodedAuthInfoBytes,
        fee: {
          ...fee,
          amount: [{ denom: selectedFeeOption.denom || chain.mainAssetDenom, amount: currentFee }],
          gas_limit: Number(selectedFeeOption.gas || '0'),
        },
      }).finish(),
    [chain.mainAssetDenom, currentFee, decodedAuthInfoBytes, fee, selectedFeeOption.denom, selectedFeeOption.gas],
  );

  const bodyBytes = useMemo(() => (isEditMemo ? encodedBodyBytes : body_bytes), [body_bytes, encodedBodyBytes, isEditMemo]);
  const authInfoBytes = useMemo(
    () => (isFeeUpdateAllowed ? encodedAuthInfoBytes : auth_info_bytes),
    [auth_info_bytes, encodedAuthInfoBytes, isFeeUpdateAllowed],
  );

  const decodedChangedBodyBytes = useMemo(() => cosmos.tx.v1beta1.TxBody.decode(bodyBytes), [bodyBytes]);
  const decodedChangedAuthInfoBytes = useMemo(() => cosmos.tx.v1beta1.AuthInfo.decode(authInfoBytes), [authInfoBytes]);

  const decodedTxData = useProtoBuilderDecoder({
    authInfoBytes: Buffer.from(authInfoBytes).toString('hex'),
    txBodyBytes: Buffer.from(bodyBytes).toString('hex'),
  });

  const { messages } = decodedChangedBodyBytes;
  const msgs = useMemo(() => messages.map((item) => decodeProtobufMessage(item)), [messages]);

  const tx = useMemo(
    () => ({
      ...doc,
      body_bytes: { ...decodedChangedBodyBytes, messages: msgs },
      auth_info_bytes: decodedChangedAuthInfoBytes,
    }),
    [decodedChangedAuthInfoBytes, decodedChangedBodyBytes, doc, msgs],
  );

  const additionalFee = useAdditionalFee({ chain, msgs: decodedTxData.data?.body.messages as Msg[], currentStep: txMessagePage });

  const decodedByProtoBuilderTx = useMemo(
    () =>
      decodedTxData.data && {
        ...doc,
        body_bytes: decodedTxData.data?.body,
        auth_info_bytes: decodedTxData.data?.auth_info,
      },
    [decodedTxData.data, doc],
  );

  const inputMemoErrorMessage = useMemo(() => {
    if (signingMemo) {
      if (gt(getUtf8BytesLength(signingMemo), COSMOS_MEMO_MAX_BYTES)) {
        return t('pages.popup.cosmos.sign.direct.entry.memoOverflow');
      }
    }
    return '';
  }, [signingMemo, t]);

  const errorMessage = useMemo(() => {
    if (!gte(alternativeFeeAsset?.balance || '0', baseFee) && isCheckBalance && !fee?.granter && !fee?.payer) {
      return t('pages.popup.cosmos.sign.direct.entry.insufficientFeeAmount');
    }

    if (isEditFee && isPossibleSimulating && !simulate.isFetched) {
      return t('pages.popup.cosmos.sign.direct.entry.notSimulated');
    }

    if (inputMemoErrorMessage) {
      return inputMemoErrorMessage;
    }

    return '';
  }, [
    alternativeFeeAsset?.balance,
    baseFee,
    fee?.granter,
    fee?.payer,
    inputMemoErrorMessage,
    isCheckBalance,
    isEditFee,
    isPossibleSimulating,
    simulate.isFetched,
    t,
  ]);

  const handleOnSign = async () => {
    try {
      setIsProcessing(true);

      if (!keyPair) {
        throw new Error('key pair does not exist');
      }

      if (!accountAsset) {
        throw new Error('accountAsset does not exist');
      }

      const signature = await (async () => {
        if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
          if (!keyPair.privateKey) {
            throw new Error('key does not exist');
          }

          const signedDoc = { ...doc, body_bytes: [...Array.from(bodyBytes)], auth_info_bytes: [...Array.from(authInfoBytes)] };

          const privateKeyBuffer = Buffer.from(keyPair.privateKey, 'hex');

          return signDirect(signedDoc, privateKeyBuffer, chain);
        }

        throw new Error('Unknown type account');
      })();
      const base64Signature = Buffer.from(signature).toString('base64');

      const base64PublicKey = Buffer.from(keyPair.publicKey, 'hex').toString('base64');

      const publicKeyType = accountAsset.address.accountType.pubkeyType
        ? getPublicKeyType(accountAsset.address.accountType.pubkeyType)
        : PUBLIC_KEY_TYPE.SECP256K1;

      const pubKey = { type: publicKeyType, value: base64PublicKey };

      const signedDocArray = {
        ...doc,
        body_bytes: [...Array.from(bodyBytes)],
        auth_info_bytes: [...Array.from(authInfoBytes)],
      };

      const result: CosSignDirectResponse = {
        signature: base64Signature,
        pub_key: pubKey,
        signed_doc: signedDocArray,
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
              feeBaseAmount={currentFee}
              disableFee={!isEditFee}
              additionalFees={additionalFee}
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
            isEditMemo={isEditMemo}
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
              {decodedByProtoBuilderTx && <FilledTab label="Decoded" />}
            </FilledTabs>
          </StickyTabContainer>
          <StyledTabPanel value={tabValue} index={0}>
            <TxMessage
              chain={chain}
              msgs={msgs}
              currentStep={txMessagePage}
              onPageChange={(page) => {
                setTxMessagePage(page);
              }}
            />
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <RawTxContainer>
              <RawTx tx={tx} />
            </RawTxContainer>
          </StyledTabPanel>

          {decodedByProtoBuilderTx && (
            <StyledTabPanel value={tabValue} index={2}>
              <RawTxContainer>
                <InformationContainer>
                  <InformationPanel
                    varitant="info"
                    title={<Typography variant="b3_M">{t('pages.popup.cosmos.sign.direct.entry.decodedTxInfoTitle')}</Typography>}
                    body={<Typography variant="b4_R_Multiline">{t('pages.popup.cosmos.sign.direct.entry.decodedTxInfoDescription')}</Typography>}
                  />
                </InformationContainer>
                <RawTx tx={decodedByProtoBuilderTx} />
              </RawTxContainer>
            </StyledTabPanel>
          )}
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
              {t('pages.popup.cosmos.sign.direct.entry.reject')}
            </Button>
          }
          confirmButton={
            <Tooltip title={errorMessage} varient="error" placement="top">
              <div>
                <Button isProgress={isProcessing} disabled={!!errorMessage} onClick={handleOnSign}>
                  {t('pages.popup.cosmos.sign.direct.entry.sign')}
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
