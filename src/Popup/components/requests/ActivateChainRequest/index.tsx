import { Typography } from '@mui/material';

import { CHAINS } from '~/constants/chain';
import { APTOS } from '~/constants/chain/aptos/aptos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { APTOS_POPUP_METHOD_TYPE } from '~/constants/message/aptos';
import { COSMOS_POPUP_METHOD_TYPE } from '~/constants/message/cosmos';
import { ETHEREUM_POPUP_METHOD_TYPE } from '~/constants/message/ethereum';
import logoImg from '~/images/etc/logo.png';
import BaseLayout from '~/Popup/components/BaseLayout';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/extensionStorage';
import type { RequestMessage } from '~/types/message';

import {
  AccentSpan,
  BottomContainer,
  ChainImageContainer,
  Container,
  ContentsContainer,
  DescriptionContainer,
  LogoContainer,
  StyledDivider,
  TitleContainer,
} from './styled';

type AccessRequestProps = {
  children: JSX.Element;
};

export default function ActivateChainRequest({ children }: AccessRequestProps) {
  const { currentQueue, deQueue } = useCurrentQueue();
  const { currentAllowedChains, addAllowedChainId } = useCurrentAllowedChains();
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();

  const { t } = useTranslation();

  const allowedChains = currentAllowedChains.map((item) => item.chainName);
  const currentCosmosAdditionalChainNames = currentCosmosAdditionalChains.map((item) => item.chainName);

  const ethereumPopupMethods = Object.values(ETHEREUM_POPUP_METHOD_TYPE) as string[];
  const aptosPopupMethods = Object.values(APTOS_POPUP_METHOD_TYPE) as string[];

  const chain = (() => {
    if (
      isCosmos(currentQueue) &&
      !!currentQueue?.message?.params?.chainName &&
      !allowedChains.includes(currentQueue.message.params.chainName) &&
      !currentCosmosAdditionalChainNames.includes(currentQueue.message.params.chainName)
    ) {
      return CHAINS.find((item) => item.chainName === currentQueue.message.params.chainName);
    }

    if (ethereumPopupMethods.includes(currentQueue?.message?.method || '') && !allowedChains.includes(ETHEREUM.chainName)) {
      return ETHEREUM;
    }

    if (aptosPopupMethods.includes(currentQueue?.message?.method || '') && !allowedChains.includes(APTOS.chainName)) {
      return APTOS;
    }

    return undefined;
  })();

  if (chain && currentQueue) {
    return (
      <BaseLayout>
        <Container>
          <PopupHeader origin={currentQueue.origin} />
          <ContentsContainer>
            <LogoContainer>
              <Image src={logoImg} />
            </LogoContainer>
            <TitleContainer>
              <Typography variant="h2">Activate chain request</Typography>
            </TitleContainer>
            <StyledDivider />

            <ChainImageContainer>
              <Image src={chain.imageURL} />
            </ChainImageContainer>

            <DescriptionContainer>
              <Typography variant="h4">
                {t('components.requests.ActivateChainRequest.index.description1')}
                <br />
                {t('components.requests.ActivateChainRequest.index.description2')} <AccentSpan>{chain.chainName}</AccentSpan>{' '}
                {t('components.requests.ActivateChainRequest.index.description3')}
              </Typography>
            </DescriptionContainer>
          </ContentsContainer>

          <BottomContainer>
            <OutlineButton
              onClick={async () => {
                responseToWeb({
                  response: {
                    error: {
                      code: RPC_ERROR.USER_REJECTED_REQUEST,
                      message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                    },
                  },
                  message: currentQueue.message,
                  messageId: currentQueue.messageId,
                  origin: currentQueue.origin,
                });

                await deQueue();
              }}
            >
              Cancel
            </OutlineButton>
            <Button
              onClick={async () => {
                await addAllowedChainId(chain);
              }}
            >
              Confirm
            </Button>
          </BottomContainer>
        </Container>
      </BaseLayout>
    );
  }
  return children;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Message = { method: any; params: { chainName?: string }; id?: number | string };

function isCosmos(queue: Queue<RequestMessage> | null): queue is Queue<Message> {
  const cosmosPopupMethods = Object.values(COSMOS_POPUP_METHOD_TYPE) as string[];

  return cosmosPopupMethods.includes(queue?.message?.method || '');
}
