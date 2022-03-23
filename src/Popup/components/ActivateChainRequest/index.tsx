import { Typography } from '@mui/material';

import { CHAINS } from '~/constants/chain';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import logoImg from '~/images/etc/logo.png';
import BaseLayout from '~/Popup/components/BaseLayout';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { responseToWeb } from '~/Popup/utils/message';

import { BottomContainer, ChainImageContainer, Container, DescriptionContainer, LogoContainer, StyledDivider, TitleContainer } from './styled';

type AccessRequestProps = {
  children: JSX.Element;
};

export default function ActivateChainRequest({ children }: AccessRequestProps) {
  const { currentQueue, deQueue } = useCurrentQueue();
  const { currentAllowedChains, addAllowedChainId } = useCurrentAllowedChains();

  const allowedChains = currentAllowedChains.map((item) => item.chainName);

  if (currentQueue?.message.method === 'ten_requestAccounts' && !allowedChains.includes(currentQueue?.message.params.chainName)) {
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
              코스모스테이션에
              <br />
              블록체인 {message.params.chainName} 을(를) 활성화 하시겠습니까?
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
