import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';
import Sui from '@mysten/ledgerjs-hw-app-sui';
import { bcs } from '@mysten/sui/bcs';
import { SuiClient } from '@mysten/sui/client';
import { messageWithIntent, toSerializedSignature } from '@mysten/sui/cryptography';
import { Ed25519Keypair, Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';

import { SUI } from '~/constants/chain/sui/sui';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { SUI_COIN } from '~/constants/sui';
import Button from '~/Popup/components/common/Button';
import Number from '~/Popup/components/common/Number';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Tooltip from '~/Popup/components/common/Tooltip';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useDryRunTransactionBlockSWR } from '~/Popup/hooks/SWR/sui/useDryRunTransactionBlockSWR';
import { useGetCoinMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinMetadataSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useLedgerTransport } from '~/Popup/hooks/useLedgerTransport';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Sui/components/Header';
import { gt, minus, plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/extensionStorage';
import type { SuiSignAndExecuteTransaction, SuiSignAndExecuteTransactionBlock, SuiSignTransaction, SuiSignTransactionBlock } from '~/types/message/sui';
import type { Path } from '~/types/route';

import Tx from './components/Tx';
import TxMessage from './components/TxMessage';
import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentContainer,
  FeeContainer,
  FeeInfoContainer,
  FeeLeftContainer,
  FeeRightAmountContainer,
  FeeRightColumnContainer,
  FeeRightContainer,
  FeeRightValueContainer,
  StyledTabPanel,
  WarningContainer,
  WarningIconContainer,
  WarningTextContainer,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

type EntryProps = {
  queue: Queue<SuiSignAndExecuteTransactionBlock | SuiSignTransactionBlock | SuiSignAndExecuteTransaction | SuiSignTransaction>;
};

export default function Entry({ queue }: EntryProps) {
  const chain = SUI;

  const { message, messageId, origin } = queue;
  const { params } = message;

  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { enqueueSnackbar } = useSnackbar();

  const { currency } = extensionStorage;
  const { setLoadingLedgerSigning } = useLoading();

  const { closeTransport, createTransport } = useLedgerTransport();

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { coinGeckoId } = currentSuiNetwork;

  const price = useMemo(() => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0, [coinGeckoId, coinGeckoPrice.data, currency]);

  const { deQueue } = useCurrentQueue();

  const [errorMessage, setErrorMessage] = useState('');

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const [isProgress, setIsProgress] = useState(false);

  const accounts = useAccounts(true);

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '',
    [accounts.data, chain.id, currentAccount.id],
  );
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);

  const keyPair = useMemo(() => getKeyPair(currentAccount, chain, currentPassword), [chain, currentAccount, currentPassword]);

  const client = useMemo(() => new SuiClient({ url: currentSuiNetwork.rpcURL }), [currentSuiNetwork.rpcURL]);

  const transaction = useMemo(() => {
    const txBlock = Transaction.from(params[0].transactionBlockSerialized);
    txBlock.setSenderIfNotSet(address);

    return txBlock;
  }, [address, params]);

  const transactionBlockResponseOptions = useMemo(() => {
    if (message.method === 'sui_signAndExecuteTransactionBlock' || message.method === 'sui_signAndExecuteTransaction') {
      const inputOptions = 'options' in params[0] ? params[0].options : undefined;

      return {
        showInput: true,
        showEffects: true,
        showEvents: true,
        ...inputOptions,
      };
    }

    return undefined;
  }, [message.method, params]);

  const { data: dryRunTransaction, error: dryRunTransactionError } = useDryRunTransactionBlockSWR({ transaction });

  const { data: coinMetadata } = useGetCoinMetadataSWR({ coinType: SUI_COIN });

  const decimals = useMemo(
    () => coinMetadata?.result?.decimals || currentSuiNetwork.decimals || 0,
    [coinMetadata?.result?.decimals, currentSuiNetwork.decimals],
  );

  const symbol = useMemo(() => coinMetadata?.result?.symbol || 'SUI', [coinMetadata?.result?.symbol]);

  const expectedBaseFee = useMemo(() => {
    if (dryRunTransaction?.result?.effects.gasUsed) {
      const storageCost = minus(dryRunTransaction.result.effects.gasUsed.storageCost, dryRunTransaction.result.effects.gasUsed.storageRebate);

      const cost = plus(dryRunTransaction.result.effects.gasUsed.computationCost, gt(storageCost, 0) ? storageCost : 0);

      return String(cost);
    }

    return '0';
  }, [dryRunTransaction?.result?.effects.gasUsed]);

  const expectedDisplayFee = useMemo(() => toDisplayDenomAmount(expectedBaseFee, decimals), [decimals, expectedBaseFee]);

  const expectedDisplayFeePrice = useMemo(() => times(expectedDisplayFee, price), [expectedDisplayFee, price]);

  const handleChange = useCallback((_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const baseBudgetFee = useMemo(() => transaction.getData().gasData.budget || '0', [transaction.getData().gasData.budget]);

  const displayBudgetFee = useMemo(() => toDisplayDenomAmount(baseBudgetFee, decimals), [baseBudgetFee, decimals]);

  const displayBudgetFeePrice = useMemo(() => times(displayBudgetFee, price), [displayBudgetFee, price]);

  const isDiabled = useMemo(() => !(dryRunTransaction?.result?.effects.status.status === 'success'), [dryRunTransaction?.result?.effects.status.status]);

  useEffect(() => {
    if (dryRunTransactionError?.message) {
      const idx = dryRunTransactionError.message.lastIndexOf(':');

      setErrorMessage(dryRunTransactionError.message.substring(idx === -1 ? 0 : idx + 1).trim());
    }

    if (dryRunTransaction?.result?.effects.status.error) {
      setErrorMessage(dryRunTransaction?.result.effects.status.error);
    }

    if (dryRunTransaction === null) {
      setErrorMessage('Unknown Error');
    }

    if (dryRunTransaction?.result?.effects.status.status === 'success') {
      setErrorMessage('');
    }
  }, [dryRunTransaction, dryRunTransactionError?.message]);

  return (
    <Container>
      <Header network={currentSuiNetwork} origin={origin} />
      <ContentContainer>
        <Tabs value={tabValue} onChange={handleChange} variant="fullWidth">
          <Tab label="Detail" />
          <Tab label="Data" />
        </Tabs>
        <StyledTabPanel value={tabValue} index={0}>
          <TxMessage transaction={transaction} />
          <FeeContainer>
            <FeeInfoContainer>
              <FeeLeftContainer>
                <Typography variant="h5">{t('pages.Popup.Sui.Transaction.entry.expectedFee')}</Typography>
              </FeeLeftContainer>
              <FeeRightContainer>
                <FeeRightColumnContainer>
                  <FeeRightAmountContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                      {expectedDisplayFee}
                    </Number>
                    &nbsp;
                    <Typography variant="h5n">{symbol}</Typography>
                  </FeeRightAmountContainer>
                  <FeeRightValueContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                      {expectedDisplayFeePrice}
                    </Number>
                  </FeeRightValueContainer>
                </FeeRightColumnContainer>
              </FeeRightContainer>
            </FeeInfoContainer>
            <FeeInfoContainer>
              <FeeLeftContainer>
                <Typography variant="h5">{t('pages.Popup.Sui.Transaction.entry.maxFee')}</Typography>
              </FeeLeftContainer>
              <FeeRightContainer>
                <FeeRightColumnContainer>
                  <FeeRightAmountContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                      {displayBudgetFee}
                    </Number>
                    &nbsp;
                    <Typography variant="h5n">{symbol}</Typography>
                  </FeeRightAmountContainer>
                  <FeeRightValueContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                      {displayBudgetFeePrice}
                    </Number>
                  </FeeRightValueContainer>
                </FeeRightColumnContainer>
              </FeeRightContainer>
            </FeeInfoContainer>
          </FeeContainer>
        </StyledTabPanel>
        <StyledTabPanel value={tabValue} index={1}>
          <Tx transaction={transaction} />
        </StyledTabPanel>
      </ContentContainer>
      <BottomContainer>
        {errorMessage && (
          <WarningContainer>
            <WarningIconContainer>
              <Info16Icon />
            </WarningIconContainer>
            <WarningTextContainer>
              <Typography variant="h5">{errorMessage}</Typography>
            </WarningTextContainer>
          </WarningContainer>
        )}
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
            {t('pages.Popup.Sui.Transaction.entry.cancelButton')}
          </OutlineButton>
          <Tooltip title={errorMessage} varient="error" placement="top">
            <div>
              <Button
                disabled={isDiabled}
                isProgress={isProgress}
                onClick={async () => {
                  try {
                    setIsProgress(true);

                    if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
                      if (!keyPair?.privateKey) {
                        throw new Error('key does not exist');
                      }

                      const keypair = Ed25519Keypair.fromSecretKey(keyPair.privateKey);

                      if (message.method === 'sui_signTransactionBlock' || message.method === 'sui_signTransaction') {
                        const encoded = await transaction.build({
                          client,
                        });

                        const response = await keypair.signTransaction(encoded);

                        const result = (() => {
                          if (message.method === 'sui_signTransactionBlock') {
                            return {
                              transactionBlockBytes: response.bytes,
                              signature: response.signature,
                            };
                          }

                          if (message.method === 'sui_signTransaction') {
                            return {
                              bytes: response.bytes,
                              signature: response.signature,
                            };
                          }

                          return undefined;
                        })();

                        if (!result) {
                          throw new Error('Failed to sign transaction');
                        }

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

                      if (message.method === 'sui_signAndExecuteTransactionBlock' || message.method === 'sui_signAndExecuteTransaction') {
                        const response = await client.signAndExecuteTransaction({
                          signer: keypair,
                          transaction,
                          options: transactionBlockResponseOptions,
                        });

                        const result = (() => {
                          if (message.method === 'sui_signAndExecuteTransactionBlock') {
                            return {
                              ...response,
                            };
                          }

                          if (message.method === 'sui_signAndExecuteTransaction') {
                            const [
                              {
                                txSignatures: [transactionSignature],
                                intentMessage: { value: bcsTransaction },
                              },
                            ] = bcs.SenderSignedData.parse(Buffer.from(response.rawTransaction!, 'base64'));

                            const bytes = bcs.TransactionData.serialize(bcsTransaction).toBase64();

                            return {
                              digest: response.digest,
                              effects: Buffer.from(new Uint8Array(response.rawEffects!)).toString('base64'),
                              bytes,
                              signature: transactionSignature,
                            };
                          }

                          return undefined;
                        })();

                        if (!result) {
                          throw new Error('Failed to sign and execute transaction');
                        }

                        responseToWeb({
                          response: {
                            result,
                          },
                          message,
                          messageId,
                          origin,
                        });

                        if (queue.channel === 'inApp' && response.digest) {
                          await deQueue(`/popup/tx-receipt/${response.digest}` as unknown as Path);
                        } else {
                          await deQueue();
                        }
                      }
                    }

                    if (currentAccount.type === 'LEDGER') {
                      setLoadingLedgerSigning(true);
                      const transport = await createTransport();
                      const suiApp = new Sui(transport);

                      const path = `${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}/${currentAccount.bip44.addressIndex}'`;

                      const transactionBlockBytes = await transaction.build({ client });

                      const intentMessage = messageWithIntent('TransactionData', transactionBlockBytes);

                      const { signature } = await suiApp.signTransaction(path, intentMessage);

                      if (!keyPair?.publicKey) {
                        throw new Error('public key is not found');
                      }

                      const publicKey = new Ed25519PublicKey(keyPair.publicKey);

                      const serializedSignature = toSerializedSignature({ signature, signatureScheme: 'ED25519', publicKey });

                      if (message.method === 'sui_signTransactionBlock' || message.method === 'sui_signTransaction') {
                        const result = (() => {
                          if (message.method === 'sui_signTransactionBlock') {
                            return {
                              transactionBlockBytes: Buffer.from(transactionBlockBytes).toString('base64'),
                              signature: serializedSignature,
                            };
                          }

                          if (message.method === 'sui_signTransaction') {
                            return {
                              bytes: Buffer.from(transactionBlockBytes).toString('base64'),
                              signature: serializedSignature,
                            };
                          }

                          return undefined;
                        })();

                        if (!result) {
                          throw new Error('Failed to sign transaction');
                        }

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

                      if (message.method === 'sui_signAndExecuteTransactionBlock' || message.method === 'sui_signAndExecuteTransaction') {
                        const response = await client.executeTransactionBlock({
                          transactionBlock: transactionBlockBytes,
                          signature: serializedSignature,
                        });

                        const txBlock = await client.getTransactionBlock({
                          digest: response.digest,
                          options: transactionBlockResponseOptions,
                        });

                        const result = (() => {
                          if (message.method === 'sui_signAndExecuteTransactionBlock') {
                            return {
                              ...txBlock,
                            };
                          }

                          if (message.method === 'sui_signAndExecuteTransaction') {
                            const [
                              {
                                txSignatures: [transactionSignature],
                                intentMessage: { value: bcsTransaction },
                              },
                            ] = bcs.SenderSignedData.parse(Buffer.from(txBlock.rawTransaction!, 'base64'));

                            const bytes = bcs.TransactionData.serialize(bcsTransaction).toBase64();

                            return {
                              digest: txBlock.digest,
                              effects: Buffer.from(new Uint8Array(txBlock.rawEffects!)).toString('base64'),
                              bytes,
                              signature: transactionSignature,
                            };
                          }

                          return undefined;
                        })();

                        if (!result) {
                          throw new Error('Failed to sign and execute transaction');
                        }

                        responseToWeb({
                          response: {
                            result: txBlock,
                          },
                          message,
                          messageId,
                          origin,
                        });

                        await deQueue();
                      }
                    }
                  } catch (e) {
                    enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
                  } finally {
                    await closeTransport();
                    setLoadingLedgerSigning(false);
                    setIsProgress(false);
                  }
                }}
              >
                {t('pages.Popup.Sui.Transaction.entry.signButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToTab />
    </Container>
  );
}
