import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Serializer } from '@aptos-labs/ts-sdk';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useCurrentAptosNetwork } from '@/hooks/aptos/useCurrentAptosNetwork';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import type { ResponseAppMessage } from '@/types/message/content';
import type { AptosSignMessage, AptosSignMessageResponse } from '@/types/message/inject/aptos';
import { signMessage } from '@/utils/aptos/sign';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { getSiteTitle } from '@/utils/website';

import { ContentsContainer, Divider, LineDivider, SticktFooterInnerBody } from './-styled';
import { LabelContainer, MemoContainer } from '../../-components/CommonTxMessageStyle';
import DappInfo from '../../-components/DappInfo';
import NetworkInfo from '../../-components/NetworkInfo';
import RequestMethodTitle from '../../-components/RequestMethodTitle';

type EntryProps = {
  request: AptosSignMessage;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { currentAptosNetwork } = useCurrentAptosNetwork();
  const currentAptosChainId = useMemo(() => currentAptosNetwork && getUniqueChainId(currentAptosNetwork), [currentAptosNetwork]);

  const [isProcessing, setIsProcessing] = useState(false);

  const { siteIconURL } = useSiteIconURL(request.origin);
  const siteTitle = getSiteTitle(request.origin);

  const keyPair = useMemo(
    () => currentAptosNetwork && getKeypair(currentAptosNetwork, currentAccount, currentPassword),
    [currentAccount, currentAptosNetwork, currentPassword],
  );

  const address = useMemo(
    () => currentAptosNetwork && keyPair?.publicKey && getAddress(currentAptosNetwork, keyPair.publicKey),
    [currentAptosNetwork, keyPair?.publicKey],
  );

  const prefix = 'APTOS';

  const formattedChainId = useMemo(() => {
    if (currentAptosNetwork?.chainId) {
      if (typeof currentAptosNetwork?.chainId === 'string') {
        return parseInt(currentAptosNetwork.chainId, 16);
      }
      return currentAptosNetwork.chainId;
    }
    return 1;
  }, [currentAptosNetwork?.chainId]);

  const { params, origin } = request;

  const isAddress = !!params.address;
  const isApplication = !!params.application;
  const isChainId = !!params.chainId;

  const messageAddress = isAddress ? `\naddress: ${address}` : '';
  const messageApplication = isApplication ? `\napplication: ${origin}` : '';
  const messageChainId = isChainId ? `\nchainId: ${formattedChainId}` : '';

  const fullMessage = `${prefix}${messageAddress}${messageApplication}${messageChainId}\nmessage: ${params.message}\nnonce: ${params.nonce}`;

  const handleOnClickSign = async () => {
    try {
      setIsProcessing(true);

      if (!keyPair?.privateKey) {
        throw new Error('Invalid keypair');
      }

      const response = signMessage(keyPair.privateKey, fullMessage);

      if (!response) {
        throw new Error('Failed to sign message');
      }

      const serializer = new Serializer();
      serializer.serialize(response);
      const serializedSignature = Buffer.from(serializer.toUint8Array()).toString('hex');

      const result: AptosSignMessageResponse = {
        address: address || '',
        application: origin,
        chainId: formattedChainId,
        fullMessage,
        message: params.message,
        nonce: params.nonce,
        prefix,
        signature: serializedSignature,
      };

      sendMessage<ResponseAppMessage<AptosSignMessage>>({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.requestId,
          result,
        },
      });
    } catch {
      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.requestId,
          error: {
            code: RPC_ERROR.INVALID_INPUT,
            message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_INPUT]}`,
          },
        },
      });
    } finally {
      setIsProcessing(false);

      await deQueue();
    }
  };

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <DappInfo image={siteIconURL} name={siteTitle} url={currentRequestQueue?.origin} />
          <Divider />
          {currentAptosChainId && <NetworkInfo chainId={currentAptosChainId} />}
          <LineDivider />
          <RequestMethodTitle title={t('pages.popup.aptos.sign-message.entry.signatureRequest')} />
        </EdgeAligner>
        <Divider
          sx={{
            marginBottom: '1.62rem',
          }}
        />
        <ContentsContainer>
          <LabelContainer>
            <Base1000Text
              variant="b3_R"
              sx={{
                marginBottom: '0.4rem',
              }}
            >
              {t('pages.popup.aptos.sign-message.entry.message')}
            </Base1000Text>
            <MemoContainer>
              <Base1300Text variant="b3_M">{params.message}</Base1300Text>
            </MemoContainer>
          </LabelContainer>
        </ContentsContainer>
      </BaseBody>

      <SticktFooterInnerBody>
        <SplitButtonsLayout
          cancelButton={
            <Button
              onClick={async () => {
                sendMessage({
                  target: 'CONTENT',
                  method: 'responseApp',
                  origin: request.origin,
                  requestId: request.requestId,
                  tabId: request.tabId,
                  params: {
                    id: request.requestId,
                    error: {
                      code: RPC_ERROR.USER_REJECTED_REQUEST,
                      message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                    },
                  },
                });

                await deQueue();
              }}
              variant="dark"
            >
              {t('pages.popup.aptos.sign-message.entry.reject')}
            </Button>
          }
          confirmButton={
            <Button isProgress={isProcessing} onClick={handleOnClickSign}>
              {t('pages.popup.aptos.sign-message.entry.sign')}
            </Button>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
