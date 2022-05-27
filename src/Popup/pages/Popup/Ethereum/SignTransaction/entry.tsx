/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import Web3 from 'web3';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { requestRPC } from '~/Popup/background/ethereum';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import { useDetermintTxTypeSWR } from '~/Popup/hooks/SWR/ethereum/useDetermintTxTypeSWR';
import { useFeeSWR } from '~/Popup/hooks/SWR/ethereum/useFeeSWR';
import { useTransactionCountSWR } from '~/Popup/hooks/SWR/ethereum/useTransactionCountSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Ethereum/components/Header';
import { getAddress, getKeyPair, toHex } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/chromeStorage';
import type { EthSignTransaction } from '~/types/ethereum/message';
import type { ResponseRPC } from '~/types/ethereum/rpc';

import Tx from './components/Tx';
import { BottomButtonContainer, BottomContainer, Container, ContentContainer, StyledTabPanel } from './styled';

type EntryProps = {
  queue: Queue<EthSignTransaction>;
};

export default function Entry({ queue }: EntryProps) {
  const chain = ETHEREUM;
  const { deQueue } = useCurrentQueue();

  const { enqueueSnackbar } = useSnackbar();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const currentFee = useFeeSWR();

  const { currentNetwork } = useCurrentEthereumNetwork();

  const { t } = useTranslation();

  const [value, setValue] = useState(0);

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);
  const transactionCount = useTransactionCountSWR([address, 'latest']);

  const { message, messageId, origin } = queue;
  const { params } = message;

  const originEthereumTx = params[0];

  const isCustomFee = !!(originEthereumTx.gasPrice || (originEthereumTx.maxFeePerGas && originEthereumTx.maxPriorityFeePerGas));

  const [feeMode, setFeeMode] = useState<'tiny' | 'low' | 'average' | 'custom'>(isCustomFee ? 'custom' : 'low');

  const ethereumTx = useMemo(() => {
    const nonce =
      originEthereumTx.nonce !== undefined
        ? parseInt(toHex(originEthereumTx.nonce), 16)
        : transactionCount.data?.result
        ? parseInt(transactionCount.data.result, 16)
        : undefined;
    const chainId = originEthereumTx.chainId !== undefined ? parseInt(toHex(originEthereumTx.chainId), 16) : undefined;

    const mixedEthereumTx = { ...originEthereumTx, nonce, chainId };

    if (feeMode !== 'custom' && currentFee.type === 'BASIC' && currentFee.currentGasPrice) {
      return {
        ...mixedEthereumTx,
        gasPrice: `0x${BigInt(currentFee.currentGasPrice).toString(16)}`,
        maxPriorityFeePerGas: undefined,
        maxFeePerGas: undefined,
      };
    }

    if (feeMode !== 'custom' && currentFee.type === 'EIP-1559' && currentFee.currentFee) {
      return {
        ...mixedEthereumTx,
        gasPrice: undefined,
        maxPriorityFeePerGas: `0x${BigInt(currentFee.currentFee[feeMode].maxPriorityFeePerGas).toString(16)}`,
        maxFeePerGas: `0x${BigInt(currentFee.currentFee[feeMode].maxBaseFeePerGas).toString(16)}`,
      };
    }

    return mixedEthereumTx;
  }, [originEthereumTx, feeMode, transactionCount, currentFee]);

  const txType = useDetermintTxTypeSWR(chain, ethereumTx);

  console.log(txType);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <Header chain={chain} network={currentNetwork} origin={origin} />
      <ContentContainer>
        <Tabs value={value} onChange={handleChange} variant="fullWidth">
          <Tab label="Detail" />
          <Tab label="Data" />
        </Tabs>
        <StyledTabPanel value={value} index={0}>
          11
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
            onClick={async () => {
              try {
                const web3 = new Web3(currentNetwork.rpcURL);

                const account = web3.eth.accounts.privateKeyToAccount(keyPair!.privateKey.toString('hex'));

                const signed = await account.signTransaction(ethereumTx);
                console.log(signed);

                const response = await requestRPC<ResponseRPC<string>>('eth_sendRawTransaction', [signed.rawTransaction]);

                if (response.error) {
                  enqueueSnackbar(`${response.error.message} (${response.error.code})`, { variant: 'error' });
                }

                console.log(response);

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
  );
}
