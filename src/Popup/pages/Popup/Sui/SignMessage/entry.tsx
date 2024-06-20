import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';
import Sui from '@mysten/ledgerjs-hw-app-sui';
import { bcs } from '@mysten/sui/bcs';
import { messageWithIntent, toSerializedSignature } from '@mysten/sui/cryptography';
import { Ed25519Keypair, Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';

import { SUI } from '~/constants/chain/sui/sui';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useLedgerTransport } from '~/Popup/hooks/useLedgerTransport';
import { useLoading } from '~/Popup/hooks/useLoading';
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

  const { setLoadingLedgerSigning } = useLoading();
  const { closeTransport, createTransport } = useLedgerTransport();

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { t } = useTranslation();

  const [isProgress, setIsProgress] = useState(false);

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);

  const address = useMemo(() => getAddress(chain, keyPair?.publicKey), [chain, keyPair?.publicKey]);

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
            isProgress={isProgress}
            onClick={async () => {
              try {
                setIsProgress(true);

                if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
                  const keypair = Ed25519Keypair.fromSecretKey(keyPair!.privateKey!);

                  const response = await keypair.signPersonalMessage(encodedMessage);

                  const result = {
                    signature: response.signature,
                    messageBytes: response.bytes,
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
                  if (!keyPair?.publicKey) {
                    throw new Error('key does not exist');
                  }

                  setLoadingLedgerSigning(true);
                  const transport = await createTransport();
                  const suiApp = new Sui(transport);

                  const path = `${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}/${currentAccount.bip44.addressIndex}'`;

                  const intentMessage = messageWithIntent('PersonalMessage', bcs.vector(bcs.u8()).serialize(encodedMessage).toBytes());

                  const { signature } = await suiApp.signTransaction(path, intentMessage);

                  const publicKey = new Ed25519PublicKey(keyPair.publicKey);

                  const serializedSignature = toSerializedSignature({ signature, signatureScheme: 'ED25519', publicKey });

                  const result = {
                    signature: serializedSignature,
                    messageBytes: params.message,
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
              } finally {
                await closeTransport();
                setLoadingLedgerSigning(false);
                setIsProgress(false);
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
