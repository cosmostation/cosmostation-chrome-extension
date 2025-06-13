import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import Tooltip from '@/components/common/Tooltip';
import type { BasicFeeOption, EIP1559FeeOption } from '@/components/Fee/EVMFee/components/FeeSettingBottomSheet';
import FeeSettingBottomSheet from '@/components/Fee/EVMFee/components/FeeSettingBottomSheet';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { DEFAULT_GAS_MULTIPLY, EVM_DEFAULT_GAS } from '@/constants/evm/fee';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentEVMNetwork } from '@/hooks/evm/useCurrentEvmNetwork';
import { useDetermineTxType } from '@/hooks/evm/useDetermineTxType';
import { useFee } from '@/hooks/evm/useFee';
import { useTransactionCount } from '@/hooks/evm/useTransactionCount';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import BaseTxInfo from '@/pages/popup/-components/BaseTxInfo';
import DappInfo from '@/pages/popup/-components/DappInfo';
import RawTx from '@/pages/popup/-components/RawTx';
import type { ResponseAppMessage } from '@/types/message/content';
import type { EthSendTransaction, EthSendTransactionResponse, EthSignTransaction, EthSignTransactionResponse } from '@/types/message/inject/evm';
import { signAndExecuteTxSequentially, signTxSequentially } from '@/utils/ethereum/sign';
import { ceil, gt, plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, isSameChain } from '@/utils/queryParamGenerator';
import { hexOrDecimalToDecimal, isEqualsIgnoringCase, toHex } from '@/utils/string';
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
  request: EthSignTransaction | EthSendTransaction;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();
  const { deQueue } = useCurrentRequestQueue();

  const { currentEVMNetwork } = useCurrentEVMNetwork();

  const { currentAccount, incrementTxCountForOrigin } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const nativeAccountAsset = useMemo(
    () =>
      currentEVMNetwork &&
      [...(accountAllAssets?.evmAccountAssets || []), ...(accountAllAssets?.evmAccountCustomAssets || [])].find(
        (item) => isSameChain(item.chain, currentEVMNetwork) && isEqualsIgnoringCase(item.asset.id, NATIVE_EVM_COIN_ADDRESS),
      ),
    [accountAllAssets?.evmAccountAssets, accountAllAssets?.evmAccountCustomAssets, currentEVMNetwork],
  );

  const accountAssetCoinId = useMemo(() => (nativeAccountAsset ? getCoinId(nativeAccountAsset.asset) : ''), [nativeAccountAsset]);

  const { params, origin } = request;

  const { siteIconURL } = useSiteIconURL(origin);
  const siteTitle = getSiteTitle(origin);

  const [isProcessing, setIsProcessing] = useState(false);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Summary', 'View Details'];

  const [isOpenFeeCustomBottomSheet, setIsOpenFeeCustomBottomSheet] = useState(false);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const keyPair = useMemo(
    () => currentEVMNetwork && getKeypair(currentEVMNetwork, currentAccount, currentPassword),
    [currentAccount, currentEVMNetwork, currentPassword],
  );
  const address = useMemo(
    () => currentEVMNetwork && keyPair?.publicKey && getAddress(currentEVMNetwork, keyPair.publicKey),
    [currentEVMNetwork, keyPair?.publicKey],
  );
  const transactionCount = useTransactionCount({
    bodyParam: [address || '', 'latest'],
  });

  const originEthereumTx = useMemo(() => params[0], [params]);

  const txType = useDetermineTxType({
    tx: originEthereumTx,
  });

  const fee = useFee({ coinId: accountAssetCoinId });

  const [customGasAmount, setCustomGasAmount] = useState<string | undefined>();

  const [customGasPrice, setCustomGasPrice] = useState('');

  const [customMaxBaseFeeAmount, setCustomMaxBaseFeeAmount] = useState('');
  const [customPriorityFeeAmount, setCustomPriorityFeeAmount] = useState('');

  const dappFromGas = originEthereumTx.gas ? hexOrDecimalToDecimal(originEthereumTx.gas) : '0';

  const alternativeGas = useMemo(() => {
    const gasCoefficient = nativeAccountAsset?.chain.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;

    const baseEstimateGas = dappFromGas && gt(dappFromGas, '0') ? times(dappFromGas, gasCoefficient) : EVM_DEFAULT_GAS;

    return ceil(baseEstimateGas);
  }, [nativeAccountAsset?.chain.feeInfo.gasCoefficient, dappFromGas]);

  const [customFeeStepKey, setCustomFeeStepKey] = useState<number | undefined>(undefined);

  const currentFeeStepKey = useMemo(() => {
    if (customFeeStepKey) return customFeeStepKey;

    const isDappFeePositive = (() => {
      if (originEthereumTx.gasPrice) {
        const gasPrice = originEthereumTx.gasPrice ? hexOrDecimalToDecimal(originEthereumTx.gasPrice) : '0';
        const dappSuggestedFee = times(gasPrice, dappFromGas);
        return gt(dappSuggestedFee, '0');
      }
      if (originEthereumTx.maxFeePerGas) {
        const maxBaseFeePerGas = originEthereumTx.maxFeePerGas ? hexOrDecimalToDecimal(originEthereumTx.maxFeePerGas) : '0';
        const dappSuggestedFee = times(maxBaseFeePerGas, dappFromGas);
        return gt(dappSuggestedFee, '0');
      }
      return false;
    })();

    const isDappFromOptionActive = !!originEthereumTx.gasPrice || !!originEthereumTx.maxFeePerGas;

    return isDappFeePositive ? 0 : isDappFromOptionActive ? 2 : 1;
  }, [customFeeStepKey, dappFromGas, originEthereumTx.gasPrice, originEthereumTx.maxFeePerGas]);

  const feeOptions = useMemo(() => {
    const defaultFeeOption = {
      coinId: nativeAccountAsset?.asset ? getCoinId(nativeAccountAsset.asset) : '',
      decimals: nativeAccountAsset?.asset.decimals || 0,
      denom: nativeAccountAsset?.asset.id,
      coinGeckoId: nativeAccountAsset?.asset.coinGeckoId,
      symbol: nativeAccountAsset?.asset.symbol || '',
    };

    const dappFromOption = (() => {
      if (originEthereumTx.gasPrice) {
        return {
          ...defaultFeeOption,
          type: 'BASIC',
          gas: dappFromGas,
          gasPrice: originEthereumTx.gasPrice ? hexOrDecimalToDecimal(originEthereumTx.gasPrice) : '0',
          title: 'Suggested (Dapp)',
        } as BasicFeeOption;
      }
      if (originEthereumTx.maxFeePerGas) {
        return {
          ...defaultFeeOption,
          type: 'EIP-1559',
          gas: dappFromGas,
          maxBaseFeePerGas: originEthereumTx.maxFeePerGas ? hexOrDecimalToDecimal(originEthereumTx.maxFeePerGas) : '0',
          maxPriorityFeePerGas: originEthereumTx.maxPriorityFeePerGas ? hexOrDecimalToDecimal(originEthereumTx.maxPriorityFeePerGas) : '0',
          title: 'Suggested (Dapp)',
        } as EIP1559FeeOption;
      }

      return undefined;
    })();

    const customOption = (() => {
      if (fee.type === 'BASIC') {
        return {
          ...defaultFeeOption,
          type: 'BASIC',
          gas: customGasAmount,
          gasPrice: customGasPrice,
          title: 'Custom',
        } as BasicFeeOption;
      }

      if (fee.type === 'EIP-1559') {
        return {
          ...defaultFeeOption,
          type: 'EIP-1559',
          gas: customGasAmount,
          maxBaseFeePerGas: customMaxBaseFeeAmount,
          maxPriorityFeePerGas: customPriorityFeeAmount,
          title: 'Custom',
        } as EIP1559FeeOption;
      }
    })();

    const alternativeFeeOptions = (() => {
      const feeStepNames = ['Low', 'Average', 'High'];

      if (fee.type === 'BASIC') {
        const baseGasPrice = fee.currentGasPrice || '0';

        const gasPrices = [baseGasPrice, times(baseGasPrice, '1.2'), times(baseGasPrice, '2')];

        return gasPrices.map(
          (item, i) =>
            ({
              ...defaultFeeOption,
              type: 'BASIC',
              gas: alternativeGas,
              gasPrice: item,
              title: feeStepNames[i] || 'Fee',
            }) as BasicFeeOption,
        );
      }

      if (fee.type === 'EIP-1559') {
        const eipFeeList = fee.currentFee || [];

        return eipFeeList.map(
          (item, i) =>
            ({
              ...defaultFeeOption,
              type: 'EIP-1559',
              gas: alternativeGas,
              maxBaseFeePerGas: item.maxBaseFeePerGas,
              maxPriorityFeePerGas: item.maxPriorityFeePerGas,
              title: feeStepNames[i] || 'Fee',
            }) as EIP1559FeeOption,
        );
      }

      return [];
    })();

    return [dappFromOption, ...alternativeFeeOptions, customOption].filter((item) => !!item);
  }, [
    nativeAccountAsset?.asset,
    alternativeGas,
    customGasAmount,
    customGasPrice,
    customMaxBaseFeeAmount,
    customPriorityFeeAmount,
    dappFromGas,
    fee.currentFee,
    fee.currentGasPrice,
    fee.type,
    originEthereumTx.gasPrice,
    originEthereumTx.maxFeePerGas,
    originEthereumTx.maxPriorityFeePerGas,
  ]);

  const currentFeeOption = useMemo(() => feeOptions[currentFeeStepKey], [feeOptions, currentFeeStepKey]);

  const ethereumTx = useMemo(() => {
    const nonce =
      originEthereumTx.nonce !== undefined
        ? parseInt(toHex(originEthereumTx.nonce), 16)
        : transactionCount.data?.result
          ? parseInt(transactionCount.data.result, 16)
          : undefined;

    const r = originEthereumTx.r ? toHex(originEthereumTx.r, { addPrefix: true }) : undefined;
    const s = originEthereumTx.s ? toHex(originEthereumTx.r, { addPrefix: true }) : undefined;
    const v = originEthereumTx.v ? toHex(originEthereumTx.r, { addPrefix: true }) : undefined;

    const mixedEthereumTx = {
      ...originEthereumTx,
      nonce,
      r,
      s,
      v,
      gas: toHex(currentFeeOption?.gas, { addPrefix: true, isStringNumber: true }),
      chainId: currentEVMNetwork?.chainId,
      gasPrice: currentFeeOption?.type === 'BASIC' ? toHex(currentFeeOption.gasPrice, { addPrefix: true, isStringNumber: true }) : undefined,
      maxPriorityFeePerGas:
        currentFeeOption?.type === 'EIP-1559' ? toHex(currentFeeOption.maxPriorityFeePerGas, { addPrefix: true, isStringNumber: true }) : undefined,
      maxFeePerGas: currentFeeOption?.type === 'EIP-1559' ? toHex(currentFeeOption.maxBaseFeePerGas, { addPrefix: true, isStringNumber: true }) : undefined,
    };

    return mixedEthereumTx;
  }, [currentEVMNetwork?.chainId, currentFeeOption, originEthereumTx, transactionCount.data?.result]);

  const currentBaseFee = useMemo(() => {
    if (ethereumTx.maxFeePerGas) {
      return times(BigInt(ethereumTx.maxFeePerGas).toString(10), BigInt(ethereumTx.gas).toString(10), 0);
    }

    if (ethereumTx.gasPrice) {
      return times(BigInt(ethereumTx.gasPrice).toString(10), BigInt(ethereumTx.gas).toString(10), 0);
    }

    return '0';
  }, [ethereumTx.gas, ethereumTx.gasPrice, ethereumTx.maxFeePerGas]);

  const currentDisplayFee = useMemo(() => {
    return toDisplayDenomAmount(currentBaseFee, nativeAccountAsset?.asset.decimals || 0);
  }, [nativeAccountAsset?.asset.decimals, currentBaseFee]);

  const nativeCoinTransferBaseAmount = useMemo(() => hexOrDecimalToDecimal(ethereumTx.value || '0x0'), [ethereumTx.value]);

  const nativeCoinTransferDisplayAmount = useMemo(
    () => toDisplayDenomAmount(nativeCoinTransferBaseAmount, nativeAccountAsset?.asset.decimals || 0),
    [nativeAccountAsset?.asset.decimals, nativeCoinTransferBaseAmount],
  );

  const isSpendNativeCoin = useMemo(() => gt(nativeCoinTransferDisplayAmount, '0'), [nativeCoinTransferDisplayAmount]);

  const totalSpendNativeCoinDisplayAmount = useMemo(() => {
    if (isSpendNativeCoin) {
      return plus(nativeCoinTransferDisplayAmount, currentDisplayFee);
    }

    return currentDisplayFee;
  }, [currentDisplayFee, isSpendNativeCoin, nativeCoinTransferDisplayAmount]);

  const nativeCoinBaseBalance = nativeAccountAsset?.balance || '0';
  const nativeCoinDisplayBalance = useMemo(
    () => toDisplayDenomAmount(nativeCoinBaseBalance, nativeAccountAsset?.asset.decimals || 0),
    [nativeAccountAsset?.asset.decimals, nativeCoinBaseBalance],
  );

  const errorMessage = useMemo(() => {
    if (gt(totalSpendNativeCoinDisplayAmount, nativeCoinDisplayBalance)) {
      return t('pages.popup.evm.transaction.entry.insufficientBalance');
    }
    return '';
  }, [nativeCoinDisplayBalance, t, totalSpendNativeCoinDisplayAmount]);

  const handleOnSign = async () => {
    try {
      setIsProcessing(true);

      if (!keyPair) {
        throw new Error('key pair does not exist');
      }

      if (!nativeAccountAsset) {
        throw new Error('accountAsset does not exist');
      }

      if (!ethereumTx) {
        throw new Error('Failed to calculate final transaction');
      }
      const privateKey = keyPair.privateKey;

      const rpcURLs = nativeAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

      if (request.method === 'eth_signTransaction') {
        const response = await signTxSequentially(privateKey, ethereumTx, rpcURLs);

        const result: EthSignTransactionResponse = {
          raw: response,
          tx: ethereumTx,
        };

        await incrementTxCountForOrigin(request.origin);

        sendMessage<ResponseAppMessage<EthSignTransaction>>({
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
      if (request.method === 'eth_sendTransaction') {
        const response = await signAndExecuteTxSequentially(privateKey, ethereumTx, rpcURLs);

        const result: EthSendTransactionResponse = response.hash;

        sendMessage<ResponseAppMessage<EthSendTransaction>>({
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
  };

  useEffect(() => {
    void (async () => {
      const from = toHex(params[0].from, { addPrefix: true });

      if (address && !isEqualsIgnoringCase(address, from)) {
        sendMessage({
          target: 'CONTENT',
          method: 'responseApp',
          origin: request.origin,
          requestId: request.requestId,
          tabId: request.tabId,
          params: {
            id: request.requestId,
            error: {
              code: RPC_ERROR.INVALID_PARAMS,
              message: `Invalid address`,
            },
          },
        });

        await deQueue();
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <DappInfo image={siteIconURL} name={siteTitle} url={origin} />
          <Divider />
          <TxBaseInfoContainer>
            <BaseTxInfo
              feeCoinId={currentFeeOption?.coinId || ''}
              feeBaseAmount={currentBaseFee}
              onClickFee={() => {
                setIsOpenFeeCustomBottomSheet(true);
              }}
            />
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
            <TxMessage determineTxType={txType.data || undefined} tx={originEthereumTx} />
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <RawTxContainer>
              <RawTx tx={ethereumTx} />
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
              {t('pages.popup.evm.transaction.entry.reject')}
            </Button>
          }
          confirmButton={
            <Tooltip title={errorMessage} varient="error" placement="top">
              <div>
                <Button isProgress={isProcessing} disabled={!!errorMessage} onClick={handleOnSign}>
                  {t('pages.popup.evm.transaction.entry.sign')}
                </Button>
              </div>
            </Tooltip>
          }
        />
      </SticktFooterInnerBody>
      <FeeSettingBottomSheet
        feeOptionDatas={feeOptions}
        feeType={fee.type}
        currentSelectedFeeOptionKey={currentFeeStepKey}
        open={isOpenFeeCustomBottomSheet}
        onClose={() => setIsOpenFeeCustomBottomSheet(false)}
        onChangeGas={(gas) => {
          setCustomGasAmount(gas);
        }}
        onChangeGasPrice={(price) => {
          setCustomGasPrice(price);
        }}
        onChangeMaxBaseFee={(fee) => {
          setCustomMaxBaseFeeAmount(fee);
        }}
        onChangePriorityFee={(fee) => {
          setCustomPriorityFeeAmount(fee);
        }}
        onSelectOption={(val) => {
          setCustomFeeStepKey(val);
        }}
      />
    </>
  );
}
