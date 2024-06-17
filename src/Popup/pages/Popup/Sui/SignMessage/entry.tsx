import { useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';
import { Connection, Ed25519Keypair, JsonRpcProvider, RawSigner } from '@mysten/sui.js';

import { SUI } from '~/constants/chain/sui/sui';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { Queue } from '~/types/extensionStorage';
import type { SuiSignMessage } from '~/types/message/sui';

import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentContainer,
  MessageContainer,
  MessageContentContainer,
  MessageTitleContainer,
  TitleContainer,
} from './styled';
import Header from '../components/Header';

type EntryProps = {
  queue: Queue<SuiSignMessage>;
};

export default function Entry({ queue }: EntryProps) {
  const chain = SUI;
  const { deQueue } = useCurrentQueue();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { enqueueSnackbar } = useSnackbar();

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { t } = useTranslation();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);

  const address = useMemo(() => getAddress(chain, keyPair?.publicKey), [chain, keyPair?.publicKey]);

  const provider = useMemo(
    () =>
      new JsonRpcProvider(
        new Connection({
          fullnode: currentSuiNetwork.rpcURL,
        }),
      ),
    [currentSuiNetwork.rpcURL],
  );

  const { message, messageId, origin } = queue;

  const { params } = message;

  const encodedMessage = useMemo(() => Buffer.from(params.message, 'base64'), [params.message]);

  const decodedMessage = useMemo(() => encodedMessage.toString('utf8'), [encodedMessage]);

  useEffect(() => {
    void (async () => {
      if (!isEqualsIgnoringCase(address, params.accountAddress)) {
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
      <Header network={currentSuiNetwork} origin={origin} />
      <ContentContainer>
        <TitleContainer>
          <Typography variant="h2">{t('pages.Popup.Sui.SignMessage.entry.signatureRequest')}</Typography>
        </TitleContainer>
        <MessageContainer>
          <MessageTitleContainer>
            <Typography variant="h5">{t('pages.Popup.Sui.SignMessage.entry.message')}</Typography>
          </MessageTitleContainer>
          <MessageContentContainer>
            <Typography variant="h6">{decodedMessage}</Typography>
          </MessageContentContainer>
        </MessageContainer>
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
            {t('pages.Popup.Sui.SignMessage.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              try {
                if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
                  const keypair = Ed25519Keypair.fromSecretKey(keyPair!.privateKey!);

                  const rawSigner = new RawSigner(keypair, provider);

                  const response = await rawSigner.signMessage({ message: encodedMessage });

                  const result = {
                    signature: response.signature,
                    messageBytes: response.messageBytes,
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

                if (currentAccount.type === 'LEDGER') {
                  throw new Error('not support');
                }
              } catch (e) {
                enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
              }
            }}
          >
            {t('pages.Popup.Sui.SignMessage.entry.signButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToTab />
    </Container>
  );
}
