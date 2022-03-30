import { Typography } from '@mui/material';

import { CHAINS } from '~/constants/chain';
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
import { upperCaseFirst } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';

import { AccentSpan, BottomContainer, ChainImageContainer, Container, DescriptionContainer, LogoContainer, StyledDivider, TitleContainer } from './styled';

type AccessRequestProps = {
  children: JSX.Element;
};

export default function ActivateChainRequest({ children }: AccessRequestProps) {
  const { currentQueue, deQueue } = useCurrentQueue();
  const { currentAllowedChains, addAllowedChainId } = useCurrentAllowedChains();
  const { currentTendermintAdditionalChains } = useCurrentAdditionalChains();

  const { t } = useTranslation();

  const allowedChains = currentAllowedChains.map((item) => item.chainName);
  const currentTendermintAdditionalChainNames = currentTendermintAdditionalChains.map((item) => item.chainName);

  if (
    currentQueue?.message.method === 'ten_requestAccounts' &&
    !allowedChains.includes(currentQueue?.message.params.chainName) &&
    !currentTendermintAdditionalChainNames.includes(currentQueue?.message.params.chainName)
  ) {
    const { message } = currentQueue;

    const chain = CHAINS.find((item) => item.chainName === message.params.chainName);
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
            <Image src={chain?.imageURL} />
          </ChainImageContainer>

          <DescriptionContainer>
            <Typography variant="h4">
              {t('components.ActivateChainRequest.index.description1')}
              <br />
              {t('components.ActivateChainRequest.index.description2')} <AccentSpan>{upperCaseFirst(message.params.chainName)}</AccentSpan>{' '}
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
                const chainId = chain?.id;
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
