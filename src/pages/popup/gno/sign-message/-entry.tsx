import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import { POPUP_DISMISS_DELAY_MS } from '@/constants/common';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentGnoNetwork } from '@/hooks/gno/useCurrentGnoNetwork';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import { LabelContainer, MemoContainer } from '@/pages/popup/-components/CommonTxMessageStyle';
import DappInfo from '@/pages/popup/-components/DappInfo';
import NetworkInfo from '@/pages/popup/-components/NetworkInfo';
import RequestMethodTitle from '@/pages/popup/-components/RequestMethodTitle';
import type { ResponseAppMessage } from '@/types/message/content';
import type { GnoSignMessage } from '@/types/message/inject/gno';
import { wait } from '@/utils/fetch/wait';
import { signMessage } from '@/utils/gno/sign';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { getSiteTitle } from '@/utils/website';

import { ContentsContainer, Divider, LineDivider, SticktFooterInnerBody } from './-styled';

type EntryProps = {
  request: GnoSignMessage;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();
  const { currentGnoNetwork } = useCurrentGnoNetwork();

  const currentGnoChainId = useMemo(() => currentGnoNetwork && getUniqueChainId(currentGnoNetwork), [currentGnoNetwork]);

  const { currentAccount, incrementTxCountForOrigin } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [isProcessing, setIsProcessing] = useState(false);

  const { siteIconURL } = useSiteIconURL(request.origin);
  const siteTitle = getSiteTitle(request.origin);

  const keyPair = useMemo(
    () => currentGnoNetwork && getKeypair(currentGnoNetwork, currentAccount, currentPassword),
    [currentAccount, currentGnoNetwork, currentPassword],
  );
  const { params } = request;

  const message = params[0];

  const handleOnClickSign = async () => {
    try {
      setIsProcessing(true);

      if (!keyPair) {
        throw new Error('key pair does not exist');
      }

      const signature = await (async () => {
        if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
          if (!keyPair?.privateKey) {
            throw new Error('Unknown Error');
          }

          return signMessage(message, Buffer.from(keyPair.privateKey, 'hex'));
        }

        throw new Error('Unknown type account');
      })();

      const result = {
        signature: Buffer.from(signature).toString('base64'),
        publicKey: Buffer.from(keyPair.publicKey, 'hex').toString('base64'),
      };

      await wait(POPUP_DISMISS_DELAY_MS);

      await incrementTxCountForOrigin(request.origin);
      sendMessage<ResponseAppMessage<GnoSignMessage>>({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.requestId,
          result: {
            code: 0,
            status: 'success',
            message: '',
            data: result,
          },
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
          {currentGnoChainId && <NetworkInfo chainId={currentGnoChainId} />}
          <LineDivider />
          <RequestMethodTitle title={t('pages.popup.gno.sign-message.entry.signatureRequest')} />
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
              {t('pages.popup.gno.sign-message.entry.message')}
            </Base1000Text>
            <MemoContainer>
              <Base1300Text variant="b3_M">{message}</Base1300Text>
            </MemoContainer>
          </LabelContainer>
        </ContentsContainer>
      </BaseBody>

      <SticktFooterInnerBody>
        <SplitButtonsLayout
          cancelButton={
            <Button
              disabled={isProcessing}
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
              {t('pages.popup.gno.sign-message.entry.reject')}
            </Button>
          }
          confirmButton={
            <Button isProgress={isProcessing} onClick={handleOnClickSign}>
              {t('pages.popup.gno.sign-message.entry.sign')}
            </Button>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
