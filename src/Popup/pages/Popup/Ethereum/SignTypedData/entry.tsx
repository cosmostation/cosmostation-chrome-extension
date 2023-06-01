import { useEffect } from 'react';
import YAML from 'js-yaml';
import { useSnackbar } from 'notistack';
import EthereumApp from '@ledgerhq/hw-app-eth';
import type { MessageTypes } from '@metamask/eth-sig-util';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
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
import { signTypedData } from '~/Popup/utils/ethereum';
import { responseToWeb } from '~/Popup/utils/message';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { Queue } from '~/types/extensionStorage';
import type { CustomTypedMessage, EthSignTypedData, EthSignTypedDataResponse } from '~/types/message/ethereum';

import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentContainer,
  MessageContainer,
  MessageContentContainer,
  MessageTitleContainer,
  NameContainer,
  TitleContainer,
} from './styled';

type EntryProps = {
  queue: Queue<EthSignTypedData>;
};

export default function Entry({ queue }: EntryProps) {
  const chain = ETHEREUM;

  const { deQueue } = useCurrentQueue();

  const { setLoadingLedgerSigning } = useLoading();

  const { closeTransport, createTransport } = useLedgerTransport();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { enqueueSnackbar } = useSnackbar();

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { t } = useTranslation();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);

  const { message, messageId, origin } = queue;
  const { params } = message;

  const param2 = JSON.parse(params[1]) as CustomTypedMessage<MessageTypes>;
  const doc = YAML.dump(param2.message, { indent: 4 });

  const name = param2.domain?.name;

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
      <Header network={currentEthereumNetwork} origin={origin} />
      <ContentContainer>
        <TitleContainer>
          <Typography variant="h2">{t('pages.Popup.Ethereum.SignTypedData.entry.signatureRequest')}</Typography>
        </TitleContainer>

        {name && (
          <NameContainer>
            <Typography variant="h3">{name}</Typography>
          </NameContainer>
        )}
        <MessageContainer>
          <MessageTitleContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTypedData.entry.message')}</Typography>
          </MessageTitleContainer>
          <MessageContentContainer>
            <Typography variant="h6">{doc}</Typography>
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
            {t('pages.Popup.Ethereum.SignTypedData.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              try {
                const signedTypedData = await (async () => {
                  if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
                    const version = message.method === 'eth_signTypedData_v3' ? SignTypedDataVersion.V3 : SignTypedDataVersion.V4;
                    if (!keyPair?.privateKey) {
                      throw new Error('Unknown Error');
                    }

                    return signTypedData(keyPair.privateKey, param2, version);
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

                    const domainSeparatorHex = TypedDataUtils.hashStruct('EIP712Domain', param2.domain, param2.types, SignTypedDataVersion.V4).toString('hex');

                    const hashStructMessageHex = TypedDataUtils.hashStruct(param2.primaryType, param2.message, param2.types, SignTypedDataVersion.V4).toString(
                      'hex',
                    );

                    const result = await ethereumApp.signEIP712HashedMessage(path, domainSeparatorHex, hashStructMessageHex);

                    const v = (result.v - 27).toString(16);

                    return `0x${result.r}${result.s}${v.length < 2 ? `0${v}` : v}`;
                  }

                  throw new Error('Unknown type account');
                })();

                const result: EthSignTypedDataResponse = signedTypedData;

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
            {t('pages.Popup.Ethereum.SignTypedData.entry.signButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
      <LedgerToTab />
    </Container>
  );
}
