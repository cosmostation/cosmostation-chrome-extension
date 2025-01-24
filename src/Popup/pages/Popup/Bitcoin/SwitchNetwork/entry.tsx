import { Typography } from '@mui/material';

import { Network } from '~/constants/bitcoin';
import { SIGNET_TAPROOT } from '~/constants/chain/bitcoin/signetTaproot';
import { BITCOIN_TAPROOT } from '~/constants/chain/bitcoin/taproot';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useCurrentBitcoinNetwork } from '~/Popup/hooks/useCurrent/useCurrentBitcoinNetwork';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/extensionStorage';
import type { BitSwitchNetwork } from '~/types/message/bitcoin';

import {
  BottomButtonContainer,
  BottomContainer,
  ChainInfoContainer,
  Container,
  ContentContainer,
  DescriptionContainer,
  QuestionContainer,
  StyledDivider,
  SwitchIconContainer,
} from './styled';
import Header from '../components/Header';

import Switch60Icon from '~/images/icons/Switch60.svg';

type EntryProps = {
  queue: Queue<BitSwitchNetwork>;
};

export default function Entry({ queue }: EntryProps) {
  const { deQueue } = useCurrentQueue();

  const { bitcoinNetworks, currentBitcoinNetwork, setCurrentBitcoinNetwork } = useCurrentBitcoinNetwork();

  const { t } = useTranslation();

  const { message, messageId, origin } = queue;

  const requestNetwork = bitcoinNetworks.find((item) => {
    const requestedNetworkType = message.params[0];

    if (requestedNetworkType === 'mainnet') {
      return item.id === BITCOIN_TAPROOT.id;
    }

    return item.id === SIGNET_TAPROOT.id;
  });

  return (
    <Container>
      <Header network={currentBitcoinNetwork} origin={origin} />
      <ContentContainer>
        <SwitchIconContainer>
          <Switch60Icon />
        </SwitchIconContainer>
        <QuestionContainer>
          <Typography variant="h2">{t('pages.Popup.Bitcoin.SwitchNetwork.entry.question')}</Typography>
        </QuestionContainer>
        <DescriptionContainer>
          <Typography variant="h5">{t('pages.Popup.Bitcoin.SwitchNetwork.entry.description')}</Typography>
        </DescriptionContainer>
        <StyledDivider />
        <ChainInfoContainer>
          <Typography variant="h4">{requestNetwork?.chainName}</Typography>
        </ChainInfoContainer>
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
            {t('pages.Popup.Bitcoin.SwitchNetwork.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              if (requestNetwork) {
                await setCurrentBitcoinNetwork(requestNetwork);
              }

              const currentNetwork: Network = requestNetwork?.isSignet ? Network.SIGNET : Network.MAINNET;

              const result = currentNetwork;

              responseToWeb({
                response: {
                  result,
                },
                message,
                messageId,
                origin,
              });
              await deQueue();
            }}
          >
            {t('pages.Popup.Bitcoin.SwitchNetwork.entry.switchButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
