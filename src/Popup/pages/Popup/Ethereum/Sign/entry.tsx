import { useEffect } from 'react';
import { Typography } from '@mui/material';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Ethereum/components/Header';
import { getAddress, getKeyPair, toHex } from '~/Popup/utils/common';
import { sign, toUTF8 } from '~/Popup/utils/ethereum';
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
  const chain = ETHEREUM;

  const { currentNetwork } = useCurrentEthereumNetwork();

  const { t } = useTranslation();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);

  const { message, messageId, origin } = queue;
  const { params } = message;

  const dataToHex = toHex(params[1], { addPrefix: true });
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
          <Typography variant="h2">{t('pages.Popup.Ethereum.Sign.entry.signatureRequest')}</Typography>
        </TitleContainer>
        <WarningContainer>
          <WarningIconContainer>
            <Info16Icon />
          </WarningIconContainer>
          <WarningTextContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.Sign.entry.warningText')}</Typography>
          </WarningTextContainer>
        </WarningContainer>
        <MessageContainer>
          <MessageTitleContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.Sign.entry.message')}</Typography>
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
