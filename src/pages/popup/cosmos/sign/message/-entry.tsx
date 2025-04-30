import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import { PUBLIC_KEY_TYPE } from '@/constants/cosmos';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import { LabelContainer, MemoContainer } from '@/pages/popup/-components/CommonTxMessageStyle';
import DappInfo from '@/pages/popup/-components/DappInfo';
import NetworkInfo from '@/pages/popup/-components/NetworkInfo';
import RequestMethodTitle from '@/pages/popup/-components/RequestMethodTitle';
import type { CosmosChain } from '@/types/chain';
import type { ResponseAppMessage } from '@/types/message/content';
import type { CosSignMessage } from '@/types/message/inject/cosmos';
import { getMsgSignData, getPublicKeyType, signAmino } from '@/utils/cosmos/msg';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { getSiteTitle } from '@/utils/website';

import { ContentsContainer, Divider, LineDivider, SticktFooterInnerBody } from './-styled';

type EntryProps = {
  request: CosSignMessage;
  chain: CosmosChain;
};

export default function Entry({ request, chain }: EntryProps) {
  const { t } = useTranslation();

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [isProcessing, setIsProcessing] = useState(false);

  const { siteIconURL } = useSiteIconURL(request.origin);
  const siteTitle = getSiteTitle(request.origin);

  const keyPair = useMemo(() => getKeypair(chain, currentAccount, currentPassword), [currentAccount, chain, currentPassword]);

  const address = useMemo(() => getAddress(chain, keyPair?.publicKey), [chain, keyPair?.publicKey]);

  const { params } = request;
  const { signer, message: txMessage } = params;

  const tx = useMemo(() => getMsgSignData(signer, txMessage), [signer, txMessage]);

  const msg = useMemo(() => tx.msgs[0], [tx.msgs]);

  const { value } = msg;
  const { data } = value;

  const decodedMessage = Buffer.from(data, 'base64').toString('utf8');

  const handleOnClickSign = async () => {
    try {
      setIsProcessing(true);

      if (!keyPair) {
        throw new Error('key pair does not exist');
      }

      if (!chain) {
        throw new Error('accountAsset does not exist');
      }

      const signature = await (async () => {
        if (currentAccount.type === 'MNEMONIC' || currentAccount.type === 'PRIVATE_KEY') {
          if (!keyPair.privateKey) {
            throw new Error('key does not exist');
          }

          const privateKeyBuffer = Buffer.from(keyPair.privateKey, 'hex');

          return signAmino(tx, privateKeyBuffer, chain);
        }

        throw new Error('Unknown type account');
      })();
      const base64Signature = Buffer.from(signature).toString('base64');

      const base64PublicKey = Buffer.from(keyPair.publicKey, 'hex').toString('base64');

      const publicKeyType = chain.accountTypes[0].pubkeyType ? getPublicKeyType(chain.accountTypes[0].pubkeyType) : PUBLIC_KEY_TYPE.SECP256K1;

      const pubKey = { type: publicKeyType, value: base64PublicKey };

      const result = {
        signature: base64Signature,
        pub_key: pubKey,
      };

      sendMessage<ResponseAppMessage<CosSignMessage>>({
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

  useEffect(() => {
    void (async () => {
      if (address) {
        if (signer !== address) {
          sendMessage({
            target: 'CONTENT',
            method: 'responseApp',
            origin: request.origin,
            requestId: request.requestId,
            tabId: request.tabId,
            params: {
              id: request.requestId,
              error: {
                code: RPC_ERROR.INVALID_PARAMS,
                message: 'Invalid signer',
              },
            },
          });

          await deQueue();
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <DappInfo image={siteIconURL} name={siteTitle} url={currentRequestQueue?.origin} />
          <Divider />
          <NetworkInfo chainId={getUniqueChainId(chain)} />
          <LineDivider />
          <RequestMethodTitle title={t('pages.popup.cosmos.sign.message.entry.signatureRequest')} />
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
              {t('pages.popup.cosmos.sign.message.entry.message')}
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
              {t('pages.popup.cosmos.sign.message.entry.reject')}
            </Button>
          }
          confirmButton={
            <Button isProgress={isProcessing} onClick={handleOnClickSign}>
              {t('pages.popup.cosmos.sign.message.entry.sign')}
            </Button>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
