import { useSnackbar } from 'notistack';
import nacl from 'tweetnacl';
import { Typography } from '@mui/material';

import { APTOS } from '~/constants/chain/aptos/aptos';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Aptos/components/Header';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/extensionStorage';
import type { AptosSignMessage, AptosSignMessageResponse } from '~/types/message/aptos';

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

type EntryProps = {
  queue: Queue<AptosSignMessage>;
};

export default function Entry({ queue }: EntryProps) {
  const chain = APTOS;
  const { deQueue } = useCurrentQueue();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { enqueueSnackbar } = useSnackbar();

  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { t } = useTranslation();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const { chainId } = currentAptosNetwork;

  const prefix = 'APTOS';

  const { message, messageId, origin } = queue;

  const params = message.params[0];

  const isAddress = !!params.address;
  const isApplication = !!params.application;
  const isChainId = !!params.chainId;

  const messageAddress = isAddress ? `\naddress: ${address}` : '';
  const messageApplication = isApplication ? `\napplication: ${origin}` : '';
  const messageChainId = isChainId ? `\nchainId: ${chainId}` : '';

  const fullMessage = `${prefix}${messageAddress}${messageApplication}${messageChainId}\nmessage: ${params.message}\nnonce: ${params.nonce}`;

  return (
    <Container>
      <Header network={currentAptosNetwork} origin={origin} />
      <ContentContainer>
        <TitleContainer>
          <Typography variant="h2">{t('pages.Popup.Aptos.Sign.entry.signatureRequest')}</Typography>
        </TitleContainer>
        <MessageContainer>
          <MessageTitleContainer>
            <Typography variant="h5">{t('pages.Popup.Aptos.Sign.entry.message')}</Typography>
          </MessageTitleContainer>
          <MessageContentContainer>
            <Typography variant="h6">{params.message}</Typography>
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
            {t('pages.Popup.Aptos.Sign.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              try {
                const signKeyPair = nacl.sign.keyPair.fromSeed(keyPair!.privateKey!);

                const msg = Buffer.from(fullMessage, 'utf8');

                const signature = nacl.sign(msg, signKeyPair.secretKey);

                const result: AptosSignMessageResponse = {
                  address,
                  application: origin,
                  chainId,
                  fullMessage,
                  message: params.message,
                  nonce: params.nonce,
                  prefix,
                  signature: `0x${Buffer.from(signature).toString('hex')}`,
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
              } catch (e) {
                enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
              }
            }}
          >
            {t('pages.Popup.Aptos.Sign.entry.signButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToTab />
    </Container>
  );
}
