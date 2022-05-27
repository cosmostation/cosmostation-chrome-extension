/* eslint-disable no-console */
import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import Web3 from 'web3';
import type { TransactionConfig } from 'web3-core';
import { Typography } from '@mui/material';

import { ETHEREUM_CHAINS } from '~/constants/chain';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { requestRPC } from '~/Popup/background/ethereum';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useFeeSWR } from '~/Popup/hooks/SWR/ethereum/useFeeSWR';
import { useTransactionCountSWR } from '~/Popup/hooks/SWR/ethereum/useTransactionCountSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Ethereum/components/Header';
import { getAddress, getKeyPair, toHex } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/chromeStorage';
import type { EthSignTransaction } from '~/types/ethereum/message';
import type { ResponseRPC } from '~/types/ethereum/rpc';

import { BottomButtonContainer, BottomContainer, Container, ContentContainer, TitleContainer } from './styled';

type EntryProps = {
  queue: Queue<EthSignTransaction>;
};

export default function Entry({ queue }: EntryProps) {
  const chain = ETHEREUM_CHAINS[0];
  const { deQueue } = useCurrentQueue();

  const { enqueueSnackbar } = useSnackbar();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const currentFee = useFeeSWR(chain);

  const { currentNetwork } = useCurrentNetwork(chain);

  const { t } = useTranslation();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);
  const transactionCount = useTransactionCountSWR(chain, [address, 'latest']);

  const { message, messageId, origin } = queue;
  const { params } = message;

  const originEthereumTx = params[0];

  const nonce =
    originEthereumTx.nonce !== undefined
      ? parseInt(toHex(originEthereumTx.nonce), 16)
      : transactionCount.data?.result
      ? parseInt(transactionCount.data.result, 16)
      : undefined;
  const chainId = originEthereumTx.chainId !== undefined ? parseInt(toHex(originEthereumTx.chainId), 16) : undefined;
  const data = originEthereumTx.data || '0x';

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
        <TitleContainer>
          <Typography variant="h2">{t('pages.Popup.Ethereum.SignTransaction.entry.signatureRequest')}</Typography>
        </TitleContainer>
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

                const fee =
                  currentFee.type === 'EIP-1559'
                    ? {
                        gasPrice: undefined,
                        maxPriorityFeePerGas:
                          (currentFee.currentFee?.tiny.maxPriorityFeePerGas && `0x${BigInt(currentFee.currentFee.tiny.maxPriorityFeePerGas).toString(16)}`) ||
                          undefined,
                        maxFeePerGas:
                          (currentFee.currentFee?.tiny.maxBaseFeePerGas && `0x${BigInt(currentFee.currentFee.tiny.maxBaseFeePerGas).toString(16)}`) ||
                          undefined,
                      }
                    : {
                        gasPrice: (currentFee.currentGasPrice && `0x${BigInt(currentFee.currentGasPrice).toString(16)}`) || undefined,
                        maxPriorityFeePerGas: undefined,
                        maxFeePerGas: undefined,
                      };

                // const fee = {
                //   gasPrice: (currentFee.currentGasPrice && `0x${BigInt(currentFee.currentGasPrice).toString(16)}`) || undefined,
                //   maxPriorityFeePerGas: undefined,
                //   maxFeePerGas: undefined,
                // };

                const ethereumTx: TransactionConfig = {
                  ...originEthereumTx,
                  nonce,
                  chainId,
                  data,
                  ...fee,
                };

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const signed = await account.signTransaction(ethereumTx);
                console.log(signed);

                const response = await requestRPC<ResponseRPC<string>>(chain, 'eth_sendRawTransaction', [signed.rawTransaction]);

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
