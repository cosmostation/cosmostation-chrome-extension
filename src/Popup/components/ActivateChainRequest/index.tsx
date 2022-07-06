import { Typography } from '@mui/material';

import { CHAINS } from '~/constants/chain';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import logoImg from '~/images/etc/logo.png';
import BaseLayout from '~/Popup/components/BaseLayout';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/chromeStorage';
import type { RequestMessage } from '~/types/message';

import { AccentSpan, BottomContainer, ChainImageContainer, Container, DescriptionContainer, LogoContainer, StyledDivider, TitleContainer } from './styled';

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

  const chain = (() => {
    if (
      isCosmos(currentQueue) &&
      !!currentQueue?.message?.params?.chainName &&
      !allowedChains.includes(currentQueue.message.params.chainName) &&
      !currentCosmosAdditionalChainNames.includes(currentQueue.message.params.chainName)
    ) {
      return CHAINS.find((item) => item.chainName === currentQueue.message.params.chainName);
    }

    if (
      (currentQueue?.message?.method?.startsWith('eth_') || currentQueue?.message?.method?.startsWith('ethc_')) &&
      !allowedChains.includes(ETHEREUM.chainName)
    ) {
      return ETHEREUM;
    }

    return undefined;
  })();

  if (chain && currentQueue) {
    return (
      <BaseLayout>
        <Container>
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
              {t('components.ActivateChainRequest.index.description1')}
              <br />
              {t('components.ActivateChainRequest.index.description2')} <AccentSpan>{chain.chainName}</AccentSpan>{' '}
              {t('components.ActivateChainRequest.index.description3')}
            </Typography>
          </DescriptionContainer>

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
                const chainId = chain.id;
                if (chainId) await addAllowedChainId(chainId);
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
  return !!queue?.message?.method?.startsWith('ten_');
}
