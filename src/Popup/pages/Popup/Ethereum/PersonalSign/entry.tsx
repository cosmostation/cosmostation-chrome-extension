import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import EthereumApp from '@ledgerhq/hw-app-eth';
import { Typography } from '@mui/material';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useLedgerTransport } from '~/Popup/hooks/useLedgerTransport';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Ethereum/components/Header';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { personalSign, toUTF8 } from '~/Popup/utils/ethereum';
import { responseToWeb } from '~/Popup/utils/message';
import { isEqualsIgnoringCase, toHex } from '~/Popup/utils/string';
import type { Queue } from '~/types/extensionStorage';
import type { PersonalSign, PersonalSignResponse } from '~/types/message/ethereum';

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
  queue: Queue<PersonalSign>;
};

export default function Entry({ queue }: EntryProps) {
  const { deQueue } = useCurrentQueue();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { enqueueSnackbar } = useSnackbar();
  const chain = ETHEREUM;

  const { closeTransport, createTransport } = useLedgerTransport();

  const { setLoadingLedgerSigning } = useLoading();

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { t } = useTranslation();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);

  const { message, messageId, origin } = queue;
  const { params } = message;

  const dataToHex = toHex(params[0]);
  const hexToUTF8 = toUTF8(dataToHex);

  useEffect(() => {
    void (async () => {
      const address = getAddress(chain, keyPair?.publicKey);

      if (address.toLowerCase() !== params[1].toLowerCase()) {
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
      <Header network={currentEthereumNetwork} origin={origin} />
      <ContentContainer>
        <TitleContainer>
          <Typography variant="h2">{t('pages.Popup.Ethereum.PersonalSign.entry.signatureRequest')}</Typography>
        </TitleContainer>
        <WarningContainer>
          <WarningIconContainer>
            <Info16Icon />
          </WarningIconContainer>
          <WarningTextContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.PersonalSign.entry.warningText')}</Typography>
          </WarningTextContainer>
        </WarningContainer>
        <MessageContainer>
          <MessageTitleContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.PersonalSign.entry.message')}</Typography>
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
            {t('pages.Popup.Ethereum.PersonalSign.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              try {
                const signedHex = await (async () => {
                  if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
                    if (!keyPair?.privateKey) {
                      throw new Error('Unknown Error');
                    }

                    return personalSign(`0x${dataToHex}`, keyPair.privateKey);
                  }

                  if (currentAccount.type === 'LEDGER') {
                    setLoadingLedgerSigning(true);
                    const transport = await createTransport();

                    const ethereumApp = new EthereumApp(transport);

                    const path = `${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}/${currentAccount.bip44.addressIndex}`;
                    const { publicKey } = await ethereumApp.getAddress(path);

                    const accountAddress = currentAccount.ethereumPublicKey ? getAddress(chain, Buffer.from(currentAccount.ethereumPublicKey, 'hex')) : '';
                    const ledgerAddress = getAddress(chain, Buffer.from(publicKey, 'hex'));

                    if (!isEqualsIgnoringCase(accountAddress, ledgerAddress)) {
                      throw new Error('Account address and Ledger address are not the same.');
                    }

                    const result = await ethereumApp.signPersonalMessage(path, dataToHex);

                    const v = (result.v - 27).toString(16);

                    return `0x${result.r}${result.s}${v.length < 2 ? `0${v}` : v}`;
                  }

                  throw new Error('Unknown type account');
                })();

                const result: PersonalSignResponse = signedHex;

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
              } finally {
                await closeTransport();
                setLoadingLedgerSigning(false);
              }
            }}
          >
            {t('pages.Popup.Ethereum.PersonalSign.entry.signButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToTab />
    </Container>
  );
}
