/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import Web3 from 'web3';
import { Typography } from '@mui/material';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { requestRPC } from '~/Popup/background/ethereum';
import Button from '~/Popup/components/common/Button';
import Number from '~/Popup/components/common/Number';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import GasSettingDialog from '~/Popup/components/GasSettingDialog';
import { useDetermintTxTypeSWR } from '~/Popup/hooks/SWR/ethereum/useDetermintTxTypeSWR';
import { useFeeSWR } from '~/Popup/hooks/SWR/ethereum/useFeeSWR';
import { useTransactionCountSWR } from '~/Popup/hooks/SWR/ethereum/useTransactionCountSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Ethereum/components/Header';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getAddress, getKeyPair, toHex } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/chromeStorage';
import type { EthSignTransaction } from '~/types/ethereum/message';
import type { ResponseRPC } from '~/types/ethereum/rpc';

import Tx from './components/Tx';
import TxMessage from './components/TxMessage';
import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentContainer,
  FeeButton,
  FeeContainer,
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
  StyledTabPanel,
} from './styled';

type EntryProps = {
  queue: Queue<EthSignTransaction>;
};

export default function Entry({ queue }: EntryProps) {
  const chain = ETHEREUM;
  const { chromeStorage } = useChromeStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const { currency } = chromeStorage;
  const { deQueue } = useCurrentQueue();

  const { enqueueSnackbar } = useSnackbar();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const currentFee = useFeeSWR({ refreshInterval: 0 });

  const { currentNetwork } = useCurrentEthereumNetwork();

  const { displayDenom, coinGeckoId } = currentNetwork;

  const { t } = useTranslation();

  const [value, setValue] = useState(0);
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [isOpenGasDialog, setIsOpenGasDialog] = useState(false);

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
        maxFeePerGas: toHex(currentFee.currentFee[feeMode].maxBaseFeePerGas, { addPrefix: true, isStringNumber: true }),
      };
    }

    return mixedEthereumTx;
  }, [originEthereumTx, feeMode, transactionCount, currentFee, gas]);

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

  const displayFee = toDisplayDenomAmount(baseFee, currentNetwork.decimals);

  const displayValue = times(displayFee, price);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    void (async () => {
      if (address.toLowerCase() !== params[0].from) {
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

    const interval = setInterval(() => {
      void (async () => {
        if (feeMode !== 'custom') {
          setIsLoadingFee(true);
          await currentFee.mutate();
          setIsLoadingFee(false);
        }
      })();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Container>
        <Header chain={chain} network={currentNetwork} origin={origin} />
        <ContentContainer>
          <Tabs value={value} onChange={handleChange} variant="fullWidth">
            <Tab label="Detail" />
            <Tab label="Data" />
          </Tabs>
          <StyledTabPanel value={value} index={0}>
            <TxMessage determineTxType={txType.data} tx={ethereumTx} />

            <FeeContainer>
              <FeeInfoContainer>
                <FeeLeftContainer>
                  <Typography variant="h5">{t('components.Fee.index.fee')}</Typography>
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
                    <Typography variant="h6">{t('components.Fee.index.gasSettings')}</Typography>
                  </FeeGasButton>
                </FeeEditLeftContainer>
                <FeeEditRightContainer>
                  <FeeButton type="button" onClick={() => setFeeMode('tiny')} data-is-active={feeMode === 'tiny' ? 1 : 0}>
                    {t('components.Fee.index.tiny')}
                  </FeeButton>
                  <FeeButton type="button" onClick={() => setFeeMode('low')} data-is-active={feeMode === 'low' ? 1 : 0}>
                    {t('components.Fee.index.low')}
                  </FeeButton>
                  <FeeButton type="button" onClick={() => setFeeMode('average')} data-is-active={feeMode === 'average' ? 1 : 0}>
                    {t('components.Fee.index.average')}
                  </FeeButton>
                  {/* <FeeButton type="button" onClick={() => setFeeMode('average')} data-is-active={feeMode === 'average' ? 1 : 0}>
                      {t('components.Fee.index.average')}
                    </FeeButton> */}
                </FeeEditRightContainer>
              </FeeEditContainer>
            </FeeContainer>
          </StyledTabPanel>
          <StyledTabPanel value={value} index={1}>
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
            <Button
              disabled={isLoadingFee}
              onClick={async () => {
                try {
                  const web3 = new Web3(currentNetwork.rpcURL);

                  const account = web3.eth.accounts.privateKeyToAccount(keyPair!.privateKey.toString('hex'));

                  const signed = await account.signTransaction(ethereumTx);
                  console.log(signed);

                  // const response = await requestRPC<ResponseRPC<string>>('eth_sendRawTransaction', [signed.rawTransaction]);

                  // if (response.error) {
                  //   enqueueSnackbar(`${response.error.message} (${response.error.code})`, { variant: 'error' });
                  // }

                  // console.log(response);

                  // const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction!);
                  // console.log(receipt);
                } catch (e) {
                  enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
                }
              }}
            >
              {t('pages.Popup.Ethereum.SignTransaction.entry.signButton')}
            </Button>
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
      />
    </>
  );
}
