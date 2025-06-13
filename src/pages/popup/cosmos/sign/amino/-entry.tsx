import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import Tooltip from '@/components/common/Tooltip';
import FeeSettingBottomSheet from '@/components/Fee/CosmosFee/components/FeeSettingBottomSheet';
import { PUBLIC_KEY_TYPE } from '@/constants/cosmos';
import { COSMOS_DEFAULT_GAS, DEFAULT_GAS_MULTIPLY } from '@/constants/cosmos/gas';
import { COSMOS_MEMO_MAX_BYTES } from '@/constants/cosmos/tx';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useAdditionalFee } from '@/hooks/cosmos/useAdditionalFee';
import { useFees } from '@/hooks/cosmos/useFees';
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
import type { CosmosChain } from '@/types/chain';
import type { CosSignAmino, CosSignAminoResponse } from '@/types/message/inject/cosmos';
import { getCosmosFeeStepNames } from '@/utils/cosmos/fee';
import { getPublicKeyType, signAmino } from '@/utils/cosmos/msg';
import { protoTx, protoTxBytes } from '@/utils/cosmos/proto';
import { ceil, divide, gt, gte, times } from '@/utils/numbers';
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
  request: CosSignAmino;
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

  const keyPair = useMemo(() => getKeypair(chain, currentAccount, currentPassword), [chain, currentAccount, currentPassword]);

  const [inputMemo, setInputMemo] = useState(doc.memo);
  const signingMemo = useMemo(() => (isEditMemo ? inputMemo : doc.memo), [doc.memo, inputMemo, isEditMemo]);

  const { feeAssets, defaultGasRateKey, isFeemarketActive } = useFees({ coinId: accountAssetCoinId });

  const inputFee = useMemo(
    () =>
      doc.fee.amount?.find((item) => feeAssets.map((feeCoin) => feeCoin.asset.id).includes(item.denom)) ||
      doc.fee.amount?.[0] || {
        denom: chain.mainAssetDenom,
        amount: '0',
      },
    [chain.mainAssetDenom, doc.fee.amount, feeAssets],
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

  const assetForSimulation = useMemo(() => {
    return alternativeFeeAsset?.asset.id === dappFromFeeAsset?.asset.id ? dappFromFeeAsset : alternativeFeeAsset;
  }, [alternativeFeeAsset, dappFromFeeAsset]);

  const memoizedProtoTx = useMemo(() => {
    if (isEditFee && assetForSimulation?.asset.id) {
      const pTx = protoTx(
        { ...doc, fee: { amount: [{ denom: assetForSimulation.asset.id, amount: '1' }], gas: COSMOS_DEFAULT_GAS } },
        [Buffer.from(new Uint8Array(64)).toString('base64')],
        { type: accountAsset?.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: '' },
      );

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [accountAsset?.address.accountType.pubkeyType, assetForSimulation?.asset.id, doc, isEditFee]);

  const isPossibleSimulating =
    !!accountAssetCoinId &&
    !!memoizedProtoTx?.tx_bytes &&
    !!accountAsset?.chain.lcdUrls.map((item) => item.url).length &&
    accountAsset?.chain.feeInfo.isSimulable;

  const simulate = useSimulate({ coinId: accountAssetCoinId, txBytes: memoizedProtoTx?.tx_bytes });

  const dappFromGas = doc.fee.gas;
  const dappFromGasRate = useMemo(() => divide(inputFee.amount, dappFromGas), [dappFromGas, inputFee.amount]);

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

  const signingFee = useMemo(
    () =>
      isFeeUpdateAllowed
        ? { ...doc.fee, amount: [{ denom: selectedFeeOption.denom || chain.mainAssetDenom, amount: currentFee }], gas: selectedFeeOption.gas || '0' }
        : doc.fee,
    [chain.mainAssetDenom, currentFee, doc.fee, isFeeUpdateAllowed, selectedFeeOption.denom, selectedFeeOption.gas],
  );

  const tx = useMemo(() => ({ ...doc, memo: signingMemo, fee: signingFee }), [doc, signingFee, signingMemo]);

  const inputMemoErrorMessage = useMemo(() => {
    if (signingMemo) {
      if (gt(getUtf8BytesLength(signingMemo), COSMOS_MEMO_MAX_BYTES)) {
        return t('pages.popup.cosmos.sign.amino.entry.memoOverflow');
      }
    }
    return '';
  }, [signingMemo, t]);

  const errorMessage = useMemo(() => {
    if (!gte(alternativeFeeAsset?.balance || '0', baseFee) && isCheckBalance && !doc.fee.granter && !doc.fee.payer) {
      return t('pages.popup.cosmos.sign.amino.entry.insufficientFeeAmount');
    }

    if (isEditFee && isPossibleSimulating && !simulate.isFetched) {
      return t('pages.popup.cosmos.sign.amino.entry.notSimulated');
    }

    if (inputMemoErrorMessage) {
      return inputMemoErrorMessage;
    }

    return '';
  }, [
    alternativeFeeAsset?.balance,
    baseFee,
    isCheckBalance,
    doc.fee.granter,
    doc.fee.payer,
    isEditFee,
    isPossibleSimulating,
    simulate.isFetched,
    inputMemoErrorMessage,
    t,
  ]);

  const additionalFee = useAdditionalFee({ chain, msgs: tx.msgs, currentStep: txMessagePage });

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

          const privateKeyBuffer = Buffer.from(keyPair.privateKey, 'hex');

          return signAmino(tx, privateKeyBuffer, chain);
        }

        throw new Error('Unknown type account');
      })();
      const base64Signature = Buffer.from(signature).toString('base64');

      const base64PublicKey = Buffer.from(keyPair.publicKey, 'hex').toString('base64');

      const publicKeyType = accountAsset.address.accountType.pubkeyType
        ? getPublicKeyType(accountAsset.address.accountType.pubkeyType)
        : PUBLIC_KEY_TYPE.SECP256K1;

      const pubKey = { type: publicKeyType, value: base64PublicKey };

      const result: CosSignAminoResponse = {
        signature: base64Signature,
        pub_key: pubKey,
        signed_doc: tx,
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
            </FilledTabs>
          </StickyTabContainer>
          <StyledTabPanel value={tabValue} index={0}>
            <TxMessage
              chain={chain}
              msgs={doc.msgs}
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
              {t('pages.popup.cosmos.sign.amino.entry.reject')}
            </Button>
          }
          confirmButton={
            <Tooltip title={errorMessage} varient="error" placement="top">
              <div>
                <Button isProgress={isProcessing} disabled={!!errorMessage} onClick={handleOnSign}>
                  {t('pages.popup.cosmos.sign.amino.entry.sign')}
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
