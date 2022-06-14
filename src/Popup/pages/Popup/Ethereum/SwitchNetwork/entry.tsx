import { Typography } from '@mui/material';

import { ETHEREUM_NETWORKS } from '~/constants/chain';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Ethereum/components/Header';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/chromeStorage';
import type { EthcSwitchNetwork, EthcSwitchNetworkResponse } from '~/types/ethereum/message';

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

import Switch60Icon from '~/images/icons/Switch60.svg';

type EntryProps = {
  queue: Queue<EthcSwitchNetwork>;
};

export default function Entry({ queue }: EntryProps) {
  const { chromeStorage } = useChromeStorage();
  const { deQueue } = useCurrentQueue();

  const { currentEthereumNetwork, setCurrentEthereumNetwork } = useCurrentEthereumNetwork();

  const { t } = useTranslation();

  const { message, messageId, origin } = queue;

  const allEthereumNetworks = [...ETHEREUM_NETWORKS, ...chromeStorage.additionalEthereumNetworks];

  const requestNetwork = allEthereumNetworks.find((item) => item.chainId === message.params[0]);

  return (
    <Container>
      <Header network={currentEthereumNetwork} origin={origin} />
      <ContentContainer>
        <SwitchIconContainer>
          <Switch60Icon />
        </SwitchIconContainer>
        <QuestionContainer>
          <Typography variant="h2">{t('pages.Popup.Ethereum.SwitchNetwork.entry.question')}</Typography>
        </QuestionContainer>
        <DescriptionContainer>
          <Typography variant="h5">{t('pages.Popup.Ethereum.SwitchNetwork.entry.description')}</Typography>
        </DescriptionContainer>
        <StyledDivider />
        <ChainInfoContainer>
          <Typography variant="h4">{requestNetwork?.networkName}</Typography>
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
            {t('pages.Popup.Ethereum.SwitchNetwork.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              if (requestNetwork) {
                await setCurrentEthereumNetwork(requestNetwork);
              }

              const result: EthcSwitchNetworkResponse = null;

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
            {t('pages.Popup.Ethereum.SwitchNetwork.entry.switchButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
