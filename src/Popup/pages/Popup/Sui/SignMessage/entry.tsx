import { useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';
import { Connection, Ed25519Keypair, fromB64, JsonRpcProvider, RawSigner } from '@mysten/sui.js';

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
import { getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
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

  // TODO param으로 들어온 주소랑 이 주소랑 다르면 에러를 뱉어야하나?
  // const address = getAddress(chain, keyPair?.publicKey);

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

  const aa = useMemo(() => fromB64(params.message), [params.message]);

  const decodedMessage = useMemo(() => new TextDecoder().decode(fromB64(params.message)), [params.message]);

  return (
    <Container>
      <Header network={currentSuiNetwork} origin={origin} />
      <ContentContainer>
        <TitleContainer>
          {/* NOTE APTOS -> SUI */}
          <Typography variant="h2">{t('pages.Popup.Aptos.Sign.entry.signatureRequest')}</Typography>
        </TitleContainer>
        <MessageContainer>
          <MessageTitleContainer>
            <Typography variant="h5">{t('pages.Popup.Aptos.Sign.entry.message')}</Typography>
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
            {t('pages.Popup.Aptos.Sign.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              try {
                // NOTE 니모닉 분기 처리 필요 없을듯
                if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
                  const keypair = Ed25519Keypair.fromSecretKey(keyPair!.privateKey!);

                  const rawSigner = new RawSigner(keypair, provider);

                  const response = await rawSigner.signMessage({ message: aa });

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
            {t('pages.Popup.Aptos.Sign.entry.signButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToTab />
    </Container>
  );
}
