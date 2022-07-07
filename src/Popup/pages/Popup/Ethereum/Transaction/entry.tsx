import { useEffect, useMemo, useState } from 'react';
import type BigNumber from 'bignumber.js';
import { useSnackbar } from 'notistack';
import Web3 from 'web3';
import { Typography } from '@mui/material';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import Number from '~/Popup/components/common/Number';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Tooltip from '~/Popup/components/common/Tooltip';
import GasSettingDialog from '~/Popup/components/GasSettingDialog';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useDetermintTxTypeSWR } from '~/Popup/hooks/SWR/ethereum/useDetermintTxTypeSWR';
import { useFeeSWR } from '~/Popup/hooks/SWR/ethereum/useFeeSWR';
import { useTokensSWR } from '~/Popup/hooks/SWR/ethereum/useTokensSWR';
import { useTransactionCountSWR } from '~/Popup/hooks/SWR/ethereum/useTransactionCountSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useInterval } from '~/Popup/hooks/useInterval';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Ethereum/components/Header';
import { gt, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getAddress, getKeyPair, toHex } from '~/Popup/utils/common';
import { requestRPC } from '~/Popup/utils/ethereum';
import { responseToWeb } from '~/Popup/utils/message';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { Queue } from '~/types/chromeStorage';
import type { EthSendTransaction, EthSendTransactionResponse, EthSignTransaction, EthSignTransactionResponse } from '~/types/ethereum/message';
import type { ResponseRPC } from '~/types/ethereum/rpc';

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
  const tokens = useTokensSWR();
  const { chromeStorage } = useChromeStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const balance = useBalanceSWR();

  const { enqueueSnackbar } = useSnackbar();

  const { currency } = chromeStorage;
  const { deQueue } = useCurrentQueue();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const currentFee = useFeeSWR({ refreshInterval: 0 });

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { displayDenom, coinGeckoId, decimals } = currentEthereumNetwork;

  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [isOpenGasDialog, setIsOpenGasDialog] = useState(false);
  const [isOpenGasPriceDialog, setIsOpenGasPriceDialog] = useState(false);

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);
  const transactionCount = useTransactionCountSWR([address, 'latest']);

  const { message, messageId, origin } = queue;
  const { params } = message;

  const originEthereumTx = params[0];

  const txType = useDetermintTxTypeSWR(originEthereumTx);

  const isCustomFee = !!(originEthereumTx.gasPrice || (originEthereumTx.maxFeePerGas && originEthereumTx.maxPriorityFeePerGas));

  const [feeMode, setFeeMode] = useState<'tiny' | 'low' | 'average' | 'custom'>(isCustomFee ? 'custom' : 'low');
  const [gas, setGas] = useState(originEthereumTx.gas ? BigInt(toHex(originEthereumTx.gas, { addPrefix: true, isStringNumber: true })).toString(10) : '21000');

  const [gasPrice, setGasPrice] = useState(BigInt(toHex(originEthereumTx.gasPrice || '0', { addPrefix: true, isStringNumber: true })).toString(10));
  const [maxFeePerGas, setMaxFeePerGas] = useState(BigInt(toHex(originEthereumTx.maxFeePerGas || '0', { addPrefix: true, isStringNumber: true })).toString(10));
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState(
    BigInt(toHex(originEthereumTx.maxPriorityFeePerGas || '0', { addPrefix: true, isStringNumber: true })).toString(10),
  );

  const ethereumTx = useMemo(() => {
    const nonce =
      originEthereumTx.nonce !== undefined
        ? parseInt(toHex(originEthereumTx.nonce), 16)
        : transactionCount.data?.result
        ? parseInt(transactionCount.data.result, 16)
        : undefined;
    const chainId = originEthereumTx.chainId !== undefined ? parseInt(toHex(originEthereumTx.chainId), 16) : undefined;

    const mixedEthereumTx = { ...originEthereumTx, nonce, chainId, gas: toHex(gas, { addPrefix: true, isStringNumber: true }) };

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
        maxFeePerGas: toHex(times(currentFee.currentFee[feeMode].maxBaseFeePerGas, '1.2', 0), { addPrefix: true, isStringNumber: true }),
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
  }, [originEthereumTx, feeMode, transactionCount, currentFee, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas]);

  const baseFee = useMemo(() => {
    if (ethereumTx.maxFeePerGas) {
      return times(BigInt(ethereumTx.maxFeePerGas).toString(10), BigInt(ethereumTx.gas).toString(10), 0);
    }

    if (ethereumTx.gasPrice) {
      return times(BigInt(ethereumTx.gasPrice).toString(10), BigInt(ethereumTx.gas).toString(10), 0);
    }

    return '0';
  }, [ethereumTx]);

  const price = (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0;

  const displayFee = toDisplayDenomAmount(baseFee, decimals);

  const displayValue = times(displayFee, price);

  const token = useMemo(
    () => (txType.data?.type === 'transfer' ? tokens.data.find((item) => isEqualsIgnoringCase(ethereumTx.to, item.address)) : null),
    [tokens, ethereumTx, txType],
  );

  const sendDisplayAmount = useMemo(() => {
    if (txType.data?.type === 'simpleSend') {
      try {
        return toDisplayDenomAmount(BigInt(toHex(ethereumTx.value || '0x0', { addPrefix: true, isStringNumber: true })).toString(10), decimals);
      } catch {
        return '0';
      }
    }

    if (txType.data?.type === 'transfer') {
      const amount = (txType?.data?.erc20?.args?.[1] as BigNumber | undefined)?.toString(10) || '';

      try {
        return toDisplayDenomAmount(BigInt(amount).toString(10), token?.decimals || 0);
      } catch {
        return '0';
      }
    }

    return '0';
  }, [decimals, ethereumTx, txType, token]);

  const sendDisplayDenom = useMemo(() => {
    if (txType.data?.type === 'simpleSend') {
      return currentEthereumNetwork.displayDenom;
    }

    if (txType.data?.type === 'transfer') {
      return token?.displayDenom || '';
    }

    return '';
  }, [currentEthereumNetwork, txType, token]);

  const totalDisplayAmount = useMemo(() => {
    if (txType.data?.type === 'simpleSend') {
      return plus(sendDisplayAmount, displayFee);
    }

    return displayFee;
  }, [txType, displayFee, sendDisplayAmount]);

  const totalBaseAmount = toBaseDenomAmount(totalDisplayAmount, decimals);

  const baseBalance = BigInt(balance.data?.result || '0').toString(10);
  const errorMessage = useMemo(() => {
    if (gt(totalBaseAmount, baseBalance)) {
      return t('pages.Popup.Ethereum.SignTransaction.entry.insufficientAmount');
    }
    return '';
  }, [baseBalance, t, totalBaseAmount]);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

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
      if (feeMode !== 'custom') {
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
                        {displayValue}
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
                        {t('pages.Popup.Ethereum.SignTransaction.entry.tiny')}
                      </FeeButton>
                      <FeeButton type="button" onClick={() => setFeeMode('low')} data-is-active={feeMode === 'low' ? 1 : 0}>
                        {t('pages.Popup.Ethereum.SignTransaction.entry.low')}
                      </FeeButton>
                      <FeeButton type="button" onClick={() => setFeeMode('average')} data-is-active={feeMode === 'average' ? 1 : 0}>
                        {t('pages.Popup.Ethereum.SignTransaction.entry.average')}
                      </FeeButton>
                    </>
                  )}

                  {currentFee.type === 'BASIC' && (
                    <FeeButton type="button" onClick={() => setFeeMode('low')} data-is-active={feeMode === 'low' ? 1 : 0}>
                      {t('pages.Popup.Ethereum.SignTransaction.entry.current')}
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
                  <Typography variant="h7">{['transfer', 'simpleSend'].includes(txType.data?.type || '') ? 'Amount + Max fee' : 'Max fee'}</Typography>
                </TotalRightContainer>
              </TotalContainer>

              <TotalAmountContainer>
                {txType.data?.type === 'transfer' ? (
                  <>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={token?.decimals ? 8 : 0}>
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
                ) : txType.data?.type === 'simpleSend' ? (
                  <>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                      {plus(displayFee, sendDisplayAmount, currentEthereumNetwork.decimals)}
                    </Number>
                    &nbsp;
                    <Typography variant="h5n">{displayDenom}</Typography>
                  </>
                ) : (
                  <>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                      {displayFee}
                    </Number>
                    &nbsp;
                    <Typography variant="h5n">{displayDenom}</Typography>
                  </>
                )}
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
                  onClick={async () => {
                    try {
                      const provider = new Web3.providers.HttpProvider(currentEthereumNetwork.rpcURL, {
                        headers: [
                          {
                            name: 'Cosmostation',
                            value: `extension/${String(process.env.VERSION)}`,
                          },
                        ],
                      });
                      const web3 = new Web3(provider);

                      const account = web3.eth.accounts.privateKeyToAccount(keyPair!.privateKey.toString('hex'));

                      const signed = await account.signTransaction(ethereumTx);

                      if (message.method === 'eth_signTransaction') {
                        const result: EthSignTransactionResponse = {
                          raw: signed.rawTransaction!,
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
                        const response = await requestRPC<ResponseRPC<string>>('eth_sendRawTransaction', [signed.rawTransaction]);

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
                          enqueueSnackbar('success');
                        }

                        await deQueue();
                      }
                    } catch (e) {
                      enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
                    }
                  }}
                >
                  {t('pages.Popup.Ethereum.SignTransaction.entry.signButton')}
                </Button>
              </div>
            </Tooltip>
          </BottomButtonContainer>
        </BottomContainer>
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
