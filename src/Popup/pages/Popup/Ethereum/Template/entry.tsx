import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import Header from '~/Popup/pages/Popup/Ethereum/components/Header';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/chromeStorage';
import type { EthcAddNetwork } from '~/types/ethereum/message';

import { BottomButtonContainer, BottomContainer, Container, ContentContainer } from './styled';

type EntryProps = {
  queue: Queue<EthcAddNetwork>;
};

export default function Entry({ queue }: EntryProps) {
  const { deQueue } = useCurrentQueue();

  const { message, messageId, origin } = queue;

  return (
    <Container>
      <ContentContainer>
        <Header chainName="Ethereum Mainnet" origin="https://app.uniswap.org" />
      </ContentContainer>
      <BottomContainer>
        <BottomButtonContainer>
          <OutlineButton
            onClick={async () => {
              responseToWeb({
                response: {
                  error: {
                    code: RPC_ERROR.USER_REJECTED_REQUEST,
                    message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                  },
                },
                message,
                messageId,
                origin,
              });

              await deQueue();
            }}
          >
            Cancel
          </OutlineButton>
          <Button
            onClick={async () => {
              await deQueue();
            }}
          >
            Confirm
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
