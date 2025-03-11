import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentEVMNetwork } from '@/hooks/evm/useCurrentEvmNetwork';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import { LabelContainer, MemoContainer } from '@/pages/popup/-components/CommonTxMessageStyle';
import DappInfo from '@/pages/popup/-components/DappInfo';
import NetworkInfo from '@/pages/popup/-components/NetworkInfo';
import RequestMethodTitle from '@/pages/popup/-components/RequestMethodTitle';
import type { ResponseAppMessage } from '@/types/message/content';
import type { EthSign } from '@/types/message/inject/evm';
import { signMessage } from '@/utils/ethereum/sign';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { toHex, toUTF8 } from '@/utils/string';
import { getSiteTitle } from '@/utils/website';

import { ContentsContainer, Divider, LineDivider, SticktFooterInnerBody } from './-styled';

type EntryProps = {
  request: EthSign;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();
  const { currentEVMNetwork } = useCurrentEVMNetwork();

  const currentEVMChainId = useMemo(() => currentEVMNetwork && getUniqueChainId(currentEVMNetwork), [currentEVMNetwork]);

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [isProcessing, setIsProcessing] = useState(false);

  const { siteIconURL } = useSiteIconURL(request.origin);
  const siteTitle = getSiteTitle(request.origin);

  const keyPair = useMemo(
    () => currentEVMNetwork && getKeypair(currentEVMNetwork, currentAccount, currentPassword),
    [currentAccount, currentEVMNetwork, currentPassword],
  );
  const address = useMemo(
    () => currentEVMNetwork && keyPair?.publicKey && getAddress(currentEVMNetwork, keyPair.publicKey),
    [currentEVMNetwork, keyPair?.publicKey],
  );
  const { params } = request;

  const dataToHex = toHex(params[1]);
  const hexToUTF8 = toUTF8(dataToHex);

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

          return signMessage(dataToHex, keyPair.privateKey);
        }

        throw new Error('Unknown type account');
      })();

      const result = signature;

      sendMessage<ResponseAppMessage<EthSign>>({
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
        if (address.toLowerCase() !== params[0].toLowerCase()) {
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
          {currentEVMChainId && <NetworkInfo chainId={currentEVMChainId} />}
          <LineDivider />
          <RequestMethodTitle title={t('pages.popup.evm.sign.eth-sign.entry.signatureRequest')} />
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
              {t('pages.popup.evm.sign.eth-sign.entry.message')}
            </Base1000Text>
            <MemoContainer>
              <Base1300Text variant="b3_M">{hexToUTF8}</Base1300Text>
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
              {t('pages.popup.evm.sign.eth-sign.entry.reject')}
            </Button>
          }
          confirmButton={
            <Button isProgress={isProcessing} onClick={handleOnClickSign}>
              {t('pages.popup.evm.sign.eth-sign.entry.sign')}
            </Button>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
