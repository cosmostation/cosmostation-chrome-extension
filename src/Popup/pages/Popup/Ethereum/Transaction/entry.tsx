import { useCallback, useEffect, useMemo, useState } from 'react';
import type BigNumber from 'bignumber.js';
import { rlp } from 'ethereumjs-util';
import { useSnackbar } from 'notistack';
import Common, { Hardfork } from '@ethereumjs/common';
import { TransactionFactory } from '@ethereumjs/tx';
import EthereumApp, { ledgerService } from '@ledgerhq/hw-app-eth';
import { Typography } from '@mui/material';

import { ONEINCH_CONTRACT_ADDRESS } from '~/constants/1inch';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { ETHEREUM_TX_TYPE } from '~/constants/ethereum';
import Button from '~/Popup/components/common/Button';
import Number from '~/Popup/components/common/Number';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Tooltip from '~/Popup/components/common/Tooltip';
import GasSettingDialog from '~/Popup/components/GasSettingDialog';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useDetermineTxTypeSWR } from '~/Popup/hooks/SWR/ethereum/useDetermineTxTypeSWR';
import { useFeeSWR } from '~/Popup/hooks/SWR/ethereum/useFeeSWR';
import { useNetVersionSWR } from '~/Popup/hooks/SWR/ethereum/useNetVersionSWR';
import { useTokensSWR } from '~/Popup/hooks/SWR/ethereum/useTokensSWR';
import { useTransactionCountSWR } from '~/Popup/hooks/SWR/ethereum/useTransactionCountSWR';
import { useOneInchTokensSWR } from '~/Popup/hooks/SWR/integratedSwap/oneInch/SWR/useOneInchTokensSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useInterval } from '~/Popup/hooks/useInterval';
import { useLedgerTransport } from '~/Popup/hooks/useLedgerTransport';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Ethereum/components/Header';
import { gt, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { requestRPC } from '~/Popup/utils/ethereum';
import { responseToWeb } from '~/Popup/utils/message';
import { hexOrDecimalToDecimal, isEqualsIgnoringCase, toHex } from '~/Popup/utils/string';
import type { OneInchSwapTxData } from '~/types/1inch/contract';
import type { ResponseRPC } from '~/types/ethereum/rpc';
import type { Queue } from '~/types/extensionStorage';
import type { EthSendTransaction, EthSendTransactionResponse, EthSignTransaction, EthSignTransactionResponse } from '~/types/message/ethereum';
import type { Path } from '~/types/route';

import FeeEIP1559Dialog from './components/FeeEIP1559Dialog';
import GasPriceDialog from './components/GasPriceDialog';
import Tx from './components/Tx';
import TxMessage from './components/TxMessage';
import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentContainer,
  FeeButton,
  FeeContainer,
  FeeEditButton,
  FeeEditContainer,
  FeeEditLeftContainer,
  FeeEditRightContainer,
  FeeGasButton,
  FeeInfoContainer,
  FeeLeftContainer,
  FeeRightAmountContainer,
  FeeRightColumnContainer,
  FeeRightContainer,
  FeeRightValueContainer,
  StyledCircularProgress,
  StyledDivider,
  StyledTabPanel,
  TotalAmountContainer,
  TotalContainer,
  TotalLeftContainer,
  TotalRightContainer,
} from './styled';

import Setting16Icon from '~/images/icons/Setting16.svg';

type EntryProps = {
  queue: Queue<EthSignTransaction | EthSendTransaction>;
};

export default function Entry({ queue }: EntryProps) {
  const chain = ETHEREUM;
  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const [isProgress, setIsProgress] = useState(false);

  const { setLoadingLedgerSigning } = useLoading();

  const { closeTransport, createTransport } = useLedgerTransport();

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const tokens = useTokensSWR();
  const { currentEthereumTokens, addEthereumToken } = useCurrentEthereumTokens();

  const allTokens = useMemo(
    () => [
      ...tokens.data,
      ...currentEthereumTokens.map((token) => ({
        chainId: currentEthereumNetwork.chainId,
        displayDenom: token.displayDenom,
        decimals: token.decimals,
        address: token.address,
        name: token.name,
        imageURL: token.imageURL,
        coinGeckoId: token.coinGeckoId,
      })),
    ],
    [currentEthereumNetwork.chainId, currentEthereumTokens, tokens.data],
  );

  const balance = useBalanceSWR();

  const { enqueueSnackbar } = useSnackbar();

  const { currency } = extensionStorage;
  const { deQueue } = useCurrentQueue();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const currentFee = useFeeSWR({ refreshInterval: 0 });

  const netVersion = useNetVersionSWR();

  const { displayDenom, coinGeckoId, decimals } = currentEthereumNetwork;

  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [isOpenGasDialog, setIsOpenGasDialog] = useState(false);
  const [isOpenGasPriceDialog, setIsOpenGasPriceDialog] = useState(false);

  const keyPair = useMemo(() => getKeyPair(currentAccount, chain, currentPassword), [chain, currentAccount, currentPassword]);
  const address = useMemo(() => getAddress(chain, keyPair?.publicKey), [chain, keyPair?.publicKey]);
  const transactionCount = useTransactionCountSWR([address, 'latest']);

  const { message, messageId, origin } = queue;
  const { params } = message;

  const [isSigningLedger, setIsSigningLedger] = useState(false);

  const originEthereumTx = useMemo(() => params[0], [params]);

  const txType = useDetermineTxTypeSWR(originEthereumTx);

  const isCustomFee = useMemo(
    () => !!(originEthereumTx.gasPrice || (originEthereumTx.maxFeePerGas && originEthereumTx.maxPriorityFeePerGas)),
    [originEthereumTx.gasPrice, originEthereumTx.maxFeePerGas, originEthereumTx.maxPriorityFeePerGas],
  );

  const [feeMode, setFeeMode] = useState<'tiny' | 'low' | 'average' | 'custom'>(isCustomFee ? 'custom' : 'low');
  const [gas, setGas] = useState(originEthereumTx.gas ? hexOrDecimalToDecimal(originEthereumTx.gas) : '21000');

  const [gasPrice, setGasPrice] = useState(hexOrDecimalToDecimal(originEthereumTx.gasPrice || '0'));
  const [maxFeePerGas, setMaxFeePerGas] = useState(hexOrDecimalToDecimal(originEthereumTx.maxFeePerGas || '0'));
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState(hexOrDecimalToDecimal(originEthereumTx.maxPriorityFeePerGas || '0'));

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
      gas: toHex(gas, { addPrefix: true, isStringNumber: true }),
      chainId: currentEthereumNetwork.chainId,
    };

    if (feeMode !== 'custom' && currentFee.type === 'BASIC' && currentFee.currentGasPrice) {
      return {
        ...mixedEthereumTx,
        gasPrice: toHex(currentFee.currentGasPrice, { addPrefix: true, isStringNumber: true }),
        maxPriorityFeePerGas: undefined,
        maxFeePerGas: undefined,
      };
    }

    if (feeMode !== 'custom' && currentFee.type === 'EIP-1559' && currentFee.currentFee) {
      return {
        ...mixedEthereumTx,
        gasPrice: undefined,
        maxPriorityFeePerGas: toHex(currentFee.currentFee[feeMode].maxPriorityFeePerGas, { addPrefix: true, isStringNumber: true }),
        maxFeePerGas: toHex(currentFee.currentFee[feeMode].maxBaseFeePerGas, { addPrefix: true, isStringNumber: true }),
      };
    }

    if (feeMode === 'custom' && currentFee.type === 'BASIC') {
      return {
        ...mixedEthereumTx,
        gasPrice: toHex(gasPrice, { addPrefix: true, isStringNumber: true }),
        maxPriorityFeePerGas: undefined,
        maxFeePerGas: undefined,
      };
    }

    if (feeMode === 'custom' && currentFee.type === 'EIP-1559') {
      return {
        ...mixedEthereumTx,
        gasPrice: undefined,
        maxPriorityFeePerGas: toHex(maxPriorityFeePerGas, { addPrefix: true, isStringNumber: true }),
        maxFeePerGas: toHex(maxFeePerGas, { addPrefix: true, isStringNumber: true }),
      };
    }

    return mixedEthereumTx;
  }, [
    currentFee.currentFee,
    currentFee.currentGasPrice,
    currentFee.type,
    feeMode,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    originEthereumTx,
    transactionCount.data?.result,
    currentEthereumNetwork.chainId,
  ]);

  const oneInchTokens = useOneInchTokensSWR(queue.channel === 'inApp' ? String(parseInt(currentEthereumNetwork.chainId, 16)) : '');

  const oneInchSwapDstToken = useMemo(() => {
    if (txType.data?.type === 'swap' && oneInchTokens.data && isEqualsIgnoringCase(originEthereumTx.to, ONEINCH_CONTRACT_ADDRESS)) {
      const oneInchSwapTxData = txType.data.txDescription?.args as unknown as OneInchSwapTxData;
      return oneInchTokens.data.find((item) => isEqualsIgnoringCase(item.address, oneInchSwapTxData.desc.dstToken));
    }
    return undefined;
  }, [oneInchTokens.data, originEthereumTx.to, txType.data?.txDescription?.args, txType.data?.type]);

  const baseFee = useMemo(() => {
    if (ethereumTx.maxFeePerGas) {
      return times(BigInt(ethereumTx.maxFeePerGas).toString(10), BigInt(ethereumTx.gas).toString(10), 0);
    }

    if (ethereumTx.gasPrice) {
      return times(BigInt(ethereumTx.gasPrice).toString(10), BigInt(ethereumTx.gas).toString(10), 0);
    }

    return '0';
  }, [ethereumTx.gas, ethereumTx.gasPrice, ethereumTx.maxFeePerGas]);

  const price = useMemo(() => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0, [coinGeckoId, coinGeckoPrice.data, currency]);

  const displayFee = useMemo(() => toDisplayDenomAmount(baseFee, decimals), [baseFee, decimals]);

  const displayFeeValue = useMemo(() => times(displayFee, price), [displayFee, price]);

  const isERC20 = useMemo(() => {
    const erc20Types = [ETHEREUM_TX_TYPE.TOKEN_METHOD_APPROVE, ETHEREUM_TX_TYPE.TOKEN_METHOD_TRANSFER, ETHEREUM_TX_TYPE.TOKEN_METHOD_TRANSFER_FROM] as string[];
    return typeof txType.data?.type === 'string' && erc20Types.includes(txType.data?.type);
  }, [txType.data?.type]);

  const token = useMemo(
    () => (txType.data?.type === 'transfer' ? allTokens.find((item) => isEqualsIgnoringCase(ethereumTx.to, item.address)) : null),
    [allTokens, ethereumTx.to, txType.data?.type],
  );

  const nativeCoinTransferBaseAmount = useMemo(() => hexOrDecimalToDecimal(ethereumTx.value || '0x0'), [ethereumTx.value]);

  const nativeCoinTransferDisplayAmount = useMemo(() => toDisplayDenomAmount(nativeCoinTransferBaseAmount, decimals), [decimals, nativeCoinTransferBaseAmount]);

  const isSpendNativeCoin = useMemo(() => gt(nativeCoinTransferDisplayAmount, '0'), [nativeCoinTransferDisplayAmount]);

  const sendDisplayAmount = useMemo(() => {
    if (isSpendNativeCoin) {
      try {
        return nativeCoinTransferDisplayAmount;
      } catch {
        return '0';
      }
    }

    if (txType.data?.type === 'transfer') {
      const amount = (txType?.data?.txDescription?.args?.[1] as BigNumber | undefined)?.toString(10) || '';

      try {
        return toDisplayDenomAmount(BigInt(amount).toString(10), token?.decimals || 0);
      } catch {
        return '0';
      }
    }

    return '0';
  }, [isSpendNativeCoin, nativeCoinTransferDisplayAmount, token?.decimals, txType.data?.txDescription?.args, txType.data?.type]);

  const sendDisplayDenom = useMemo(() => {
    if (txType.data?.type === 'simpleSend') {
      return currentEthereumNetwork.displayDenom;
    }

    if (txType.data?.type === 'transfer') {
      return token?.displayDenom || '';
    }

    return '';
  }, [currentEthereumNetwork.displayDenom, token?.displayDenom, txType.data?.type]);

  const totalNativeCoinTransferDisplayAmount = useMemo(() => {
    if (isSpendNativeCoin) {
      return plus(sendDisplayAmount, displayFee);
    }

    return displayFee;
  }, [displayFee, isSpendNativeCoin, sendDisplayAmount]);

  const totalNativeCoinTransferBaseAmount = useMemo(
    () => toBaseDenomAmount(totalNativeCoinTransferDisplayAmount, decimals),
    [decimals, totalNativeCoinTransferDisplayAmount],
  );

  const baseBalance = useMemo(() => BigInt(balance.data?.result || '0').toString(10), [balance.data?.result]);
  const errorMessage = useMemo(() => {
    if (gt(totalNativeCoinTransferBaseAmount, baseBalance)) {
      return t('pages.Popup.Ethereum.SignTransaction.entry.insufficientAmount');
    }
    return '';
  }, [baseBalance, t, totalNativeCoinTransferBaseAmount]);

  const handleChange = useCallback((_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  }, []);

  useEffect(() => {
    void (async () => {
      const from = toHex(params[0].from, { addPrefix: true });

      if (address.toLowerCase() !== from.toLowerCase()) {
        responseToWeb({
          response: {
            error: {
              code: RPC_ERROR.INVALID_PARAMS,
              message: 'Invalid address',
            },
          },
          message,
          messageId,
          origin,
        });

        await deQueue();
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInterval(() => {
    void (async () => {
      if (feeMode !== 'custom' && !isSigningLedger) {
        setIsLoadingFee(true);
        await currentFee.mutate();
        setIsLoadingFee(false);
      }
    })();
  }, 10000);

  return (
    <>
      <Container>
        <Header network={currentEthereumNetwork} origin={origin} />
        <ContentContainer>
          <Tabs value={tabValue} onChange={handleChange} variant="fullWidth">
            <Tab label="Detail" />
            <Tab label="Data" />
          </Tabs>
          <StyledTabPanel value={tabValue} index={0}>
            <TxMessage determineTxType={txType.data} tx={originEthereumTx} />

            <FeeContainer>
              <FeeInfoContainer>
                <FeeLeftContainer>
                  <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.entry.fee')}</Typography>
                  {isLoadingFee && <StyledCircularProgress size="1.8rem" />}
                </FeeLeftContainer>
                <FeeRightContainer>
                  <FeeRightColumnContainer>
                    <FeeRightAmountContainer>
                      <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                        {displayFee}
                      </Number>
                      &nbsp;
                      <Typography variant="h5n">{displayDenom}</Typography>
                    </FeeRightAmountContainer>
                    <FeeRightValueContainer>
                      <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                        {displayFeeValue}
                      </Number>
                    </FeeRightValueContainer>
                  </FeeRightColumnContainer>
                </FeeRightContainer>
              </FeeInfoContainer>
              <FeeEditContainer>
                <FeeEditLeftContainer>
                  <FeeGasButton type="button" onClick={() => setIsOpenGasDialog(true)}>
                    <Typography variant="h6">{t('pages.Popup.Ethereum.SignTransaction.entry.gasSettings')}</Typography>
                  </FeeGasButton>
                </FeeEditLeftContainer>
                <FeeEditRightContainer>
                  {currentFee.type === 'EIP-1559' && (
                    <>
                      <FeeButton type="button" onClick={() => setFeeMode('tiny')} data-is-active={feeMode === 'tiny' ? 1 : 0}>
                        <Typography variant="h7">{t('pages.Popup.Ethereum.SignTransaction.entry.tiny')}</Typography>
                      </FeeButton>
                      <FeeButton type="button" onClick={() => setFeeMode('low')} data-is-active={feeMode === 'low' ? 1 : 0}>
                        <Typography variant="h7">{t('pages.Popup.Ethereum.SignTransaction.entry.low')}</Typography>
                      </FeeButton>
                      <FeeButton type="button" onClick={() => setFeeMode('average')} data-is-active={feeMode === 'average' ? 1 : 0}>
                        <Typography variant="h7">{t('pages.Popup.Ethereum.SignTransaction.entry.average')}</Typography>
                      </FeeButton>
                    </>
                  )}

                  {currentFee.type === 'BASIC' && (
                    <FeeButton type="button" onClick={() => setFeeMode('low')} data-is-active={feeMode === 'low' ? 1 : 0}>
                      <Typography variant="h7">{t('pages.Popup.Ethereum.SignTransaction.entry.current')}</Typography>
                    </FeeButton>
                  )}
                  <FeeEditButton type="button" onClick={() => setIsOpenGasPriceDialog(true)} data-is-active={feeMode === 'custom' ? 1 : 0}>
                    <Setting16Icon />
                  </FeeEditButton>
                </FeeEditRightContainer>
              </FeeEditContainer>
              <StyledDivider />
              <TotalContainer>
                <TotalLeftContainer>
                  <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.entry.total')}</Typography>
                </TotalLeftContainer>
                <TotalRightContainer>
                  <Typography variant="h7">{txType.data?.type === 'transfer' || isSpendNativeCoin ? 'Amount + Max fee' : 'Max fee'}</Typography>
                </TotalRightContainer>
              </TotalContainer>
              <TotalAmountContainer>
                {(() => {
                  if (txType.data?.type === 'transfer') {
                    return (
                      <>
                        <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={token?.decimals ? (token.decimals > 8 ? 8 : token.decimals) : 0}>
                          {sendDisplayAmount}
                        </Number>
                        &nbsp;
                        <Typography variant="h5n">{sendDisplayDenom}</Typography>&nbsp;<Typography variant="h5n">+</Typography>&nbsp;
                        <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={8}>
                          {displayFee}
                        </Number>
                        &nbsp;
                        <Typography variant="h5n">{displayDenom}</Typography>
                      </>
                    );
                  }

                  if (isSpendNativeCoin) {
                    return (
                      <>
                        <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                          {plus(displayFee, sendDisplayAmount, currentEthereumNetwork.decimals)}
                        </Number>
                        &nbsp;
                        <Typography variant="h5n">{displayDenom}</Typography>
                      </>
                    );
                  }
                  return (
                    <>
                      <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                        {displayFee}
                      </Number>
                      &nbsp;
                      <Typography variant="h5n">{displayDenom}</Typography>
                    </>
                  );
                })()}
              </TotalAmountContainer>
            </FeeContainer>
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <Tx tx={ethereumTx} />
          </StyledTabPanel>
        </ContentContainer>
        <BottomContainer>
          <BottomButtonContainer>
            <OutlineButton
              onClick={async () => {
                responseToWeb({
                  response: {
                    error: {
                      code: RPC_ERROR.USER_REJECTED_REQUEST,
                      message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                    },
                  },
                  message,
                  messageId,
                  origin,
                });

                await deQueue();
              }}
            >
              {t('pages.Popup.Ethereum.SignTransaction.entry.cancelButton')}
            </OutlineButton>
            <Tooltip title={errorMessage} varient="error" placement="top">
              <div>
                <Button
                  disabled={isLoadingFee || !!errorMessage}
                  isProgress={isProgress}
                  onClick={async () => {
                    try {
                      setIsProgress(true);

                      const signedRawTx = await (async () => {
                        const dataToSign = {
                          ...ethereumTx,
                          gasLimit: ethereumTx.gas,
                          gas: undefined,
                          from: undefined,
                          type: currentFee.type === 'EIP-1559' ? '0x02' : undefined,
                        };

                        const common = Common.custom({
                          networkId: parseInt(toHex(netVersion.data?.result || '1', { addPrefix: true, isStringNumber: true }), 16),
                          chainId: parseInt(dataToSign.chainId, 16),
                          defaultHardfork: currentFee.type === 'EIP-1559' ? Hardfork.London : Hardfork.Berlin,
                          name: currentEthereumNetwork.networkName,
                        });

                        const txToSign = TransactionFactory.fromTxData(dataToSign, { common });

                        if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
                          if (!keyPair?.privateKey) {
                            throw new Error('Unknown Error');
                          }

                          const signedTx = txToSign.sign(keyPair.privateKey);

                          return `0x${signedTx.serialize().toString('hex')}`;
                        }

                        if (currentAccount.type === 'LEDGER') {
                          setLoadingLedgerSigning(true);
                          setIsSigningLedger(true);
                          const transport = await createTransport();

                          const ethereumApp = new EthereumApp(transport);

                          const path = `${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}/${currentAccount.bip44.addressIndex}`;
                          const { publicKey } = await ethereumApp.getAddress(path);

                          const accountAddress = currentAccount.ethereumPublicKey
                            ? getAddress(chain, Buffer.from(currentAccount.ethereumPublicKey, 'hex'))
                            : '';
                          const ledgerAddress = getAddress(chain, Buffer.from(publicKey, 'hex'));

                          if (!isEqualsIgnoringCase(accountAddress, ledgerAddress)) {
                            throw new Error('Account address and Ledger address are not the same.');
                          }

                          const msgToSign = txToSign.getMessageToSign(false);

                          const tx = currentFee.type === 'EIP-1559' ? msgToSign.toString('hex') : rlp.encode(msgToSign).toString('hex');
                          const resolution = await ledgerService.resolveTransaction(tx, {}, { erc20: isERC20 });

                          const result = await ethereumApp.signTransaction(path, tx, resolution);

                          const signedTx = TransactionFactory.fromTxData(
                            { ...dataToSign, v: `0x${result.v}`, s: `0x${result.s}`, r: `0x${result.r}` },
                            { common },
                          );

                          return `0x${signedTx.serialize().toString('hex')}`;
                        }

                        throw new Error('Unknown type account');
                      })();

                      if (message.method === 'eth_signTransaction') {
                        const result: EthSignTransactionResponse = {
                          raw: signedRawTx,
                          tx: ethereumTx,
                        };

                        responseToWeb({
                          response: {
                            result,
                          },
                          message,
                          messageId,
                          origin,
                        });

                        await deQueue();
                      }

                      if (message.method === 'eth_sendTransaction') {
                        const response = await requestRPC<ResponseRPC<string>>('eth_sendRawTransaction', [signedRawTx]);

                        if (response.error) {
                          throw new Error(response.error.message);
                        }

                        const result: EthSendTransactionResponse = response.result!;

                        responseToWeb({
                          response: {
                            result,
                          },
                          message,
                          messageId,
                          origin,
                        });

                        if (queue.channel === 'inApp') {
                          if (result) {
                            await deQueue(`/popup/tx-receipt/${result}` as unknown as Path);
                          } else {
                            await deQueue();
                          }
                        } else {
                          await deQueue();
                        }
                      }
                      if (oneInchSwapDstToken && oneInchSwapDstToken.symbol !== currentEthereumNetwork.displayDenom) {
                        const newToken = {
                          address: oneInchSwapDstToken.address,
                          displayDenom: oneInchSwapDstToken.symbol,
                          decimals: oneInchSwapDstToken.decimals,
                          imageURL: oneInchSwapDstToken.logoURI,
                        };
                        await addEthereumToken({ ...newToken, tokenType: 'ERC20' });
                      }
                    } catch (e) {
                      enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
                    } finally {
                      await closeTransport();
                      setLoadingLedgerSigning(false);
                      setIsSigningLedger(false);
                      setIsProgress(false);
                    }
                  }}
                >
                  {t('pages.Popup.Ethereum.SignTransaction.entry.signButton')}
                </Button>
              </div>
            </Tooltip>
          </BottomButtonContainer>
        </BottomContainer>
        <LedgerToTab />
      </Container>
      <GasSettingDialog
        open={isOpenGasDialog}
        currentGas={gas}
        onClose={() => setIsOpenGasDialog(false)}
        onSubmitGas={(gasData) => {
          setGas(String(gasData.gas));
        }}
        min={21000}
        line="ETHEREUM"
      />
      <GasPriceDialog
        open={currentFee.type === 'BASIC' && isOpenGasPriceDialog}
        currentGasPrice={gasPrice}
        onClose={() => setIsOpenGasPriceDialog(false)}
        onSubmitGas={(gasData) => {
          setGasPrice(toBaseDenomAmount(gasData.gasPrice, 9));
          setFeeMode('custom');
        }}
      />
      <FeeEIP1559Dialog
        open={currentFee.type === 'EIP-1559' && isOpenGasPriceDialog}
        currentMaxFeePerGas={maxFeePerGas}
        currentMaxPriorityFeePerGas={maxPriorityFeePerGas}
        onClose={() => setIsOpenGasPriceDialog(false)}
        onSubmitGas={(data) => {
          setMaxFeePerGas(toBaseDenomAmount(data.maxFeePerGas, 9));
          setMaxPriorityFeePerGas(toBaseDenomAmount(data.maxPriorityFeePerGas, 9));
          setFeeMode('custom');
        }}
      />
    </>
  );
}
