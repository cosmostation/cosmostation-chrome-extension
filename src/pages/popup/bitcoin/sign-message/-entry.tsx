import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Signer } from 'bip322-js';
import * as bitcoinMessage from 'bitcoinjs-message';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useCurrentBitcoinNetwork } from '@/hooks/bitcoin/useCurrentBitcoinNetwork';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import { LabelContainer, MemoContainer } from '@/pages/popup/-components/CommonTxMessageStyle';
import DappInfo from '@/pages/popup/-components/DappInfo';
import RequestMethodTitle from '@/pages/popup/-components/RequestMethodTitle';
import type { ResponseAppMessage } from '@/types/message/content';
import type { BitSignMessage, BitSignMessageResposne } from '@/types/message/inject/bitcoin';
import { ecpairInstanceFromPrivateKey } from '@/utils/bitcoin/tx';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { getSiteTitle } from '@/utils/website';

import { ContentsContainer, Divider, LineDivider, SticktFooterInnerBody } from './-styled';
import NetworkInfo from '../../-components/NetworkInfo';

type EntryProps = {
  request: BitSignMessage;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();
  const { currentBitcoinNetwork } = useCurrentBitcoinNetwork();

  const currentBitcoinChainId = useMemo(() => currentBitcoinNetwork && getUniqueChainId(currentBitcoinNetwork), [currentBitcoinNetwork]);

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [isProcessing, setIsProcessing] = useState(false);

  const { siteIconURL } = useSiteIconURL(request.origin);
  const siteTitle = getSiteTitle(request.origin);

  const keyPair = useMemo(
    () => currentBitcoinNetwork && getKeypair(currentBitcoinNetwork, currentAccount, currentPassword),
    [currentAccount, currentBitcoinNetwork, currentPassword],
  );

  const address = useMemo(() => currentBitcoinNetwork && getAddress(currentBitcoinNetwork, keyPair?.publicKey), [currentBitcoinNetwork, keyPair?.publicKey]);

  const { params } = request;
  const { message: messageToSign, type: signType } = params;

  const handleOnClickSign = async () => {
    try {
      setIsProcessing(true);

      if (!keyPair) {
        throw new Error('key pair does not exist');
      }

      const ecpairInsatance = ecpairInstanceFromPrivateKey(keyPair.privateKey);
      if (!ecpairInsatance || !ecpairInsatance.privateKey) {
        throw new Error('Failed to create ecpair instance');
      }

      const result = (() => {
        if (signType === 'ecdsa') {
          const privateKeyBuffer = Buffer.from(keyPair.privateKey, 'hex');

          const signedMessage = bitcoinMessage.sign(messageToSign, privateKeyBuffer, ecpairInsatance.compressed);

          const result: BitSignMessageResposne = signedMessage.toString('base64');

          if (!result) {
            throw new Error('Failed to sign message');
          }

          return result;
        }

        if (signType === 'bip322-simple') {
          const base58PrvKeyString = ecpairInsatance.toWIF();

          const messageSignature = Signer.sign(base58PrvKeyString, address, messageToSign);

          const result: BitSignMessageResposne = typeof messageSignature === 'string' ? messageSignature : messageSignature.toString('base64');

          if (!result) {
            throw new Error('Failed to sign message');
          }

          return result;
        }
      })();

      if (!result) {
        throw new Error('Failed to sign message');
      }

      sendMessage<ResponseAppMessage<BitSignMessage>>({
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
          {currentBitcoinChainId && <NetworkInfo chainId={currentBitcoinChainId} />}
          <LineDivider />
          <RequestMethodTitle title={t('pages.popup.bitcoin.sign-message.entry.signatureRequest')} />
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
              {t('pages.popup.bitcoin.sign-message.entry.message')}
            </Base1000Text>
            <MemoContainer>
              <Base1300Text variant="b3_M">{messageToSign}</Base1300Text>
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
              {t('pages.popup.bitcoin.sign-message.entry.reject')}
            </Button>
          }
          confirmButton={
            <Button isProgress={isProcessing} onClick={handleOnClickSign}>
              {t('pages.popup.bitcoin.sign-message.entry.sign')}
            </Button>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
