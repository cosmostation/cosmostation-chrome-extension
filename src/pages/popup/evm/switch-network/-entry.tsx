import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import InformationPanel from '@/components/InformationPanel';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentEVMNetwork } from '@/hooks/evm/useCurrentEvmNetwork';
import { sendMessage } from '@/libs/extension';
import type { EthcSwitchNetwork, EthcSwitchNetworkResponse } from '@/types/message/inject/evm';
import { getSiteTitle } from '@/utils/website';

import {
  ContentsContainer,
  Divider,
  InformationContainer,
  LineDivider,
  NetworkContainer,
  NetworkImage,
  RightArrowIconContainer,
  SwitchNetworkContainer,
} from './-styled';
import DappInfo from '../../-components/DappInfo';
import RequestMethodTitle from '../../-components/RequestMethodTitle';

import RightArrow from '@/assets/images/icons/RightArrow14.svg';

type EntryProps = {
  request: EthcSwitchNetwork;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();

  const { ethereumNetworks, currentEVMNetwork, setCurrentEVMNetwork } = useCurrentEVMNetwork();

  const [isProcessing, setIsProcessing] = useState(false);

  const { siteIconURL } = useSiteIconURL(request.origin);
  const siteTitle = getSiteTitle(request.origin);

  const requestNetwork = ethereumNetworks.find((item) => item.chainId === request.params[0]);

  const handleOnClickSwitch = async () => {
    try {
      setIsProcessing(true);

      if (requestNetwork) {
        await setCurrentEVMNetwork(requestNetwork);
      }

      const result: EthcSwitchNetworkResponse = null;

      sendMessage({
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
          <LineDivider />
          <RequestMethodTitle title={t('pages.popup.evm.switch-network.entry.switchNetwork')} />
        </EdgeAligner>
        <Divider />
        <ContentsContainer>
          <SwitchNetworkContainer>
            {currentEVMNetwork && requestNetwork && (
              <NetworkContainer>
                <NetworkImage
                  src={currentEVMNetwork?.image}
                  sx={{
                    marginBottom: '0.6rem',
                  }}
                />
                <Base1300Text
                  variant="b2_B"
                  sx={{
                    marginBottom: '0.2rem',
                  }}
                >
                  {currentEVMNetwork?.name}
                </Base1300Text>
                <Base1000Text variant="b3_R">{currentEVMNetwork?.chainId}</Base1000Text>
              </NetworkContainer>
            )}

            {currentEVMNetwork && requestNetwork && (
              <RightArrowIconContainer>
                <RightArrow />
              </RightArrowIconContainer>
            )}
            {currentEVMNetwork && requestNetwork && (
              <NetworkContainer>
                <NetworkImage
                  src={requestNetwork?.image}
                  sx={{
                    marginBottom: '0.6rem',
                  }}
                />
                <Base1300Text
                  variant="b2_B"
                  sx={{
                    marginBottom: '0.2rem',
                  }}
                >
                  {requestNetwork?.name}
                </Base1300Text>
                <Base1000Text variant="b3_R">{requestNetwork?.chainId}</Base1000Text>
              </NetworkContainer>
            )}
          </SwitchNetworkContainer>
        </ContentsContainer>
      </BaseBody>
      <BaseFooter>
        <InformationContainer>
          <InformationPanel
            varitant="info"
            title={<Typography variant="b3_M">{t('pages.popup.evm.switch-network.entry.infoTitle')}</Typography>}
            body={<Typography variant="b4_R_Multiline">{t('pages.popup.evm.switch-network.entry.infoDescription')}</Typography>}
          />
        </InformationContainer>
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
              {t('pages.popup.evm.switch-network.entry.reject')}
            </Button>
          }
          confirmButton={
            <Button isProgress={isProcessing} onClick={handleOnClickSwitch}>
              {t('pages.popup.evm.switch-network.entry.switchNetwork')}
            </Button>
          }
        />
      </BaseFooter>
    </>
  );
}
