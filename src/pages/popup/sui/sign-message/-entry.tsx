import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentSuiNetwork } from '@/hooks/sui/useCurrentSuiNetwork';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import type { SuiSignMessage, SuiSignPersonalMessage } from '@/types/message/inject/sui';
import { getSiteTitle } from '@/utils/website';

import { ContentsContainer, Divider, LineDivider, SticktFooterInnerBody } from './-styled';
import { LabelContainer, MemoContainer } from '../../-components/CommonTxMessageStyle';
import DappInfo from '../../-components/DappInfo';
import RequestMethodTitle from '../../-components/RequestMethodTitle';

type EntryProps = {
  request: SuiSignMessage | SuiSignPersonalMessage;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const [isProcessing, setIsProcessing] = useState(false);

  const { siteIconURL } = useSiteIconURL(request.origin);
  const siteTitle = getSiteTitle(request.origin);

  const keyPair = useMemo(
    () => currentSuiNetwork && getKeypair(currentSuiNetwork, currentAccount, currentPassword),
    [currentAccount, currentSuiNetwork, currentPassword],
  );

  const encodedMessage = useMemo(() => Buffer.from(request.params.message, 'base64'), [request.params.message]);

  const decodedMessage = useMemo(() => encodedMessage.toString('utf8'), [encodedMessage]);

  const handleOnClickSign = async () => {
    try {
      setIsProcessing(true);

      if (!keyPair?.privateKey) {
        throw new Error('Invalid keypair');
      }

      const privateKeyBuffer = Buffer.from(keyPair.privateKey, 'hex');

      const keypair = Ed25519Keypair.fromSecretKey(privateKeyBuffer);

      const response = await keypair.signPersonalMessage(encodedMessage);

      const result = (() => {
        if (request.method === 'sui_signMessage') {
          return {
            messageBytes: response.bytes,
            signature: response.signature,
          };
        }

        if (request.method === 'sui_signPersonalMessage') {
          return {
            bytes: response.bytes,
            signature: response.signature,
          };
        }

        return undefined;
      })();

      if (!result) {
        throw new Error('Failed to sign message');
      }

      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.id,
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
          id: request.id,
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
          <LineDivider />
          <RequestMethodTitle title={t('pages.popup.sui.sign-message.entry.signatureRequest')} />
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
              {t('pages.popup.sui.sign-message.entry.message')}
            </Base1000Text>
            <MemoContainer>
              <Base1300Text variant="b3_M">{decodedMessage}</Base1300Text>
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
                    id: request.id,
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
              {t('pages.popup.sui.sign-message.entry.reject')}
            </Button>
          }
          confirmButton={
            <Button isProgress={isProcessing} onClick={handleOnClickSign}>
              {t('pages.popup.sui.sign-message.entry.sign')}
            </Button>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
