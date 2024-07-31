import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import secp256k1 from 'secp256k1';
import sortKeys from 'sort-keys';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { Tab, TabPanel, Tabs } from '~/Popup/components/common/Tab';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useLedgerTransport } from '~/Popup/hooks/useLedgerTransport';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { cosmosURL, getMsgSignData, getPublicKeyType, signAmino } from '~/Popup/utils/cosmos';
import CosmosApp from '~/Popup/utils/ledger/cosmos';
import { responseToWeb } from '~/Popup/utils/message';
import { broadcast, protoTx, protoTxBytes } from '~/Popup/utils/proto';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { Queue } from '~/types/extensionStorage';
import type { CosSignMessage, CosSignMessageResponse } from '~/types/message/cosmos';

import TxMessage from './components/TxMessage';
import { BottomButtonContainer, BottomContainer, Container, ContentsContainer, TabContainer } from './styled';
import Tx from '../components/Tx';

type EntryProps = {
  queue: Queue<CosSignMessage>;
  chain: CosmosChain;
};

export default function Entry({ queue, chain }: EntryProps) {
  const [value, setValue] = useState(0);
  const { deQueue } = useCurrentQueue();
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { enqueueSnackbar } = useSnackbar();

  const { closeTransport, createTransport } = useLedgerTransport();

  const { setLoadingLedgerSigning } = useLoading();

  const { t } = useTranslation();

  const { message, messageId, origin, channel } = queue;

  const {
    params: { message: txMessage, signer },
  } = message;

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const tx = useMemo(() => getMsgSignData(signer, txMessage), [signer, txMessage]);

  const msg = useMemo(() => tx.msgs[0], [tx.msgs]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    void (async () => {
      if (signer !== address) {
        responseToWeb({
          response: {
            error: {
              code: RPC_ERROR.INVALID_PARAMS,
              message: 'Invalid signer',
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
      <PopupHeader account={{ ...currentAccount, address }} chain={{ name: chain.chainName, imageURL: chain.imageURL }} origin={origin} />
      <ContentsContainer>
        <TabContainer>
          <Tabs value={value} onChange={handleChange} variant="fullWidth">
            <Tab label={t('pages.Popup.Cosmos.Sign.Message.entry.detailTab')} />
            <Tab label={t('pages.Popup.Cosmos.Sign.Message.entry.dataTab')} />
          </Tabs>
        </TabContainer>
        <TabPanel value={value} index={0}>
          <TxMessage msg={msg} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Tx tx={tx} />
        </TabPanel>
      </ContentsContainer>
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
            {t('pages.Popup.Cosmos.Sign.Message.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              try {
                if (!keyPair) {
                  throw new Error('key pair does not exist');
                }

                const signature = await (async () => {
                  if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
                    if (!keyPair.privateKey) {
                      throw new Error('key does not exist');
                    }

                    return signAmino(tx, keyPair.privateKey, chain);
                  }

                  if (currentAccount.type === 'LEDGER') {
                    setLoadingLedgerSigning(true);
                    const transport = await createTransport();

                    const cosmosApp = new CosmosApp(transport);

                    const coinType = chain.bip44.coinType.replaceAll("'", '');

                    const path = [44, Number(coinType), 0, 0, Number(currentAccount.bip44.addressIndex)];

                    const { compressed_pk } = await cosmosApp.getPublicKey(path);

                    const ledgerAddress = getAddress(chain, Buffer.from(compressed_pk));

                    if (!isEqualsIgnoringCase(address, ledgerAddress)) {
                      throw new Error('Account address and Ledger address are not the same.');
                    }

                    const result = await cosmosApp.sign(path, Buffer.from(JSON.stringify(sortKeys(tx, { deep: true }))));

                    if (!result.signature) {
                      throw new Error(result.error_message);
                    }

                    return secp256k1.signatureImport(result.signature);
                  }

                  throw new Error('Unknown type account');
                })();
                const base64Signature = Buffer.from(signature).toString('base64');

                const base64PublicKey = Buffer.from(keyPair.publicKey).toString('base64');

                const publicKeyType = getPublicKeyType(chain);

                const pubKey = { type: publicKeyType, value: base64PublicKey };

                if (channel) {
                  try {
                    const url = cosmosURL(chain).postBroadcast();
                    const pTx = protoTx(tx, [base64Signature], pubKey);
                    const pTxBytes = pTx ? protoTxBytes({ ...pTx }) : undefined;

                    const response = await broadcast(url, pTxBytes);

                    const { code } = response.tx_response;

                    if (code === 0) {
                      enqueueSnackbar('success');
                    } else {
                      throw new Error(response.tx_response.raw_log as string);
                    }
                  } catch (e) {
                    enqueueSnackbar(
                      (e as { message?: string }).message ? (e as { message?: string }).message : t('pages.Popup.Cosmos.Sign.Message.entry.failedTransfer'),
                      {
                        variant: 'error',
                        autoHideDuration: 3000,
                      },
                    );
                  } finally {
                    setTimeout(
                      () => {
                        void deQueue();
                      },
                      currentAccount.type === 'LEDGER' && channel ? 1000 : 0,
                    );
                  }
                } else {
                  const result: CosSignMessageResponse = {
                    signature: base64Signature,
                    pub_key: pubKey,
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
              } catch (e) {
                enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
                setLoadingLedgerSigning(false);
              } finally {
                await closeTransport();
              }
            }}
          >
            {t('pages.Popup.Cosmos.Sign.Message.entry.signButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToTab />
    </Container>
  );
}
