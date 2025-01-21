import { useMemo, useState } from 'react';
import { Signer } from 'bip322-js';
import * as bitcoinMessage from 'bitcoinjs-message';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentBitcoinNetwork } from '~/Popup/hooks/useCurrent/useCurrentBitcoinNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getKeyPair } from '~/Popup/utils/common';
import { ecpairFromPrivateKey } from '~/Popup/utils/crypto';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/extensionStorage';
import type { BitSignMessage, BitSignMessageResposne } from '~/types/message/bitcoin';

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
  queue: Queue<BitSignMessage>;
};

export default function Entry({ queue }: EntryProps) {
  const { currentBitcoinNetwork } = useCurrentBitcoinNetwork();

  const { deQueue } = useCurrentQueue();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const [isProgress, setIsProgress] = useState(false);

  const keyPair = getKeyPair(currentAccount, currentBitcoinNetwork, currentPassword);

  const accounts = useAccounts();

  const currentAddress = useMemo(
    () => accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentBitcoinNetwork.id] || '',
    [accounts?.data, currentAccount.id, currentBitcoinNetwork.id],
  );

  const { message, messageId, origin } = queue;

  const { params } = message;

  const messageToSign = params.message;
  const signType = params.type;

  return (
    <Container>
      <Header network={currentBitcoinNetwork} origin={origin} />
      <ContentContainer>
        <TitleContainer>
          <Typography variant="h2">{t('pages.Popup.Sui.SignMessage.entry.signatureRequest')}</Typography>
        </TitleContainer>
        <MessageContainer>
          <MessageTitleContainer>
            <Typography variant="h5">{t('pages.Popup.Sui.SignMessage.entry.message')}</Typography>
          </MessageTitleContainer>
          <MessageContentContainer>
            <Typography variant="h6">{messageToSign}</Typography>
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

                if (!keyPair?.privateKey) {
                  throw new Error('Failed to sign message');
                }

                if (signType === 'ecdsa') {
                  const ecPairInterface = ecpairFromPrivateKey(keyPair.privateKey);

                  const signedMessage = bitcoinMessage.sign(messageToSign, ecPairInterface.privateKey!, ecPairInterface.compressed);

                  const result: BitSignMessageResposne = signedMessage.toString('base64');

                  if (!result) {
                    throw new Error('Failed to sign message');
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

                if (signType === 'bip322-simple') {
                  const ecPairInterface = ecpairFromPrivateKey(keyPair.privateKey);

                  const base58PrvKeyString = ecPairInterface.toWIF();

                  const messageSignature = Signer.sign(base58PrvKeyString, currentAddress, messageToSign);

                  const result: BitSignMessageResposne = typeof messageSignature === 'string' ? messageSignature : messageSignature.toString('base64');

                  if (!result) {
                    throw new Error('Failed to sign message');
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
              } catch (e) {
                enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
              } finally {
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
