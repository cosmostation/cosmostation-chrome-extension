import { useEffect } from 'react';
import { Typography } from '@mui/material';

import { ETHEREUM_CHAINS } from '~/constants/chain';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Ethereum/components/Header';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { sign, toHex, toUTF8 } from '~/Popup/utils/ethereum';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/chromeStorage';
import type { EthSign, EthSignResponse } from '~/types/ethereum/message';

import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentContainer,
  MessageContainer,
  MessageContentContainer,
  MessageTitleContainer,
  TitleContainer,
  WarningContainer,
  WarningIconContainer,
  WarningTextContainer,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

type EntryProps = {
  queue: Queue<EthSign>;
};

export default function Entry({ queue }: EntryProps) {
  const { deQueue } = useCurrentQueue();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const chain = ETHEREUM_CHAINS[0];

  const { currentNetwork } = useCurrentNetwork();

  const { t } = useTranslation();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);

  const { message, messageId, origin } = queue;
  const { params } = message;

  const dataToHex = toHex(params[1]);
  const hexToUTF8 = toUTF8(dataToHex);

  useEffect(() => {
    void (async () => {
      const address = getAddress(chain, keyPair?.publicKey);

      if (address.toLowerCase() !== params[0].toLowerCase()) {
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
          <Typography variant="h2">Signature request</Typography>
        </TitleContainer>
        <WarningContainer>
          <WarningIconContainer>
            <Info16Icon />
          </WarningIconContainer>
          <WarningTextContainer>
            <Typography variant="h5">
              {`Signing this message can be dangerous. This signature could potentially perform any operation on your account's behalf, including granting
              complete control of your account and all of its assets to the requesting site. Only sign this message if you know what you're doing or completely
              trust the requesting site.`}
            </Typography>
          </WarningTextContainer>
        </WarningContainer>
        <MessageContainer>
          <MessageTitleContainer>
            <Typography variant="h5">Message</Typography>
          </MessageTitleContainer>
          <MessageContentContainer>
            <Typography variant="h6">{hexToUTF8}</Typography>
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
            {t('pages.Popup.Ethereum.Sign.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              const result: EthSignResponse = sign(dataToHex, keyPair!.privateKey);

              responseToWeb({
                response: {
                  result,
                },
                message,
                messageId,
                origin,
              });

              await deQueue();
            }}
          >
            {t('pages.Popup.Ethereum.Sign.entry.signButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}