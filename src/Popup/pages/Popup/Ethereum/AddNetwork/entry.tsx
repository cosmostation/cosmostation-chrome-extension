import { Typography } from '@mui/material';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import Button from '~/Popup/components/common/Button';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Header from '~/Popup/pages/Popup/Ethereum/components/Header';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/extensionStorage';
import type { EthcAddNetwork, EthcAddNetworkResponse } from '~/types/message/ethereum';

import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentContainer,
  Info2ColumnsContainer,
  Info2ColumnsLeftContainer,
  Info2ColumnsRightContainer,
  InfoContainer,
  InfoText1Container,
  InfoText2Container,
  QuestionContainer,
  WarningContainer,
  WarningIconContainer,
  WarningTextContainer,
} from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

type EntryProps = {
  queue: Queue<EthcAddNetwork>;
};

export default function Entry({ queue }: EntryProps) {
  const { deQueue } = useCurrentQueue();
  const { addEthereumNetwork } = useCurrentEthereumNetwork();

  const { t } = useTranslation();

  const { message, messageId, origin } = queue;

  const params = message.params[0];

  return (
    <Container>
      <Header origin={origin} />
      <ContentContainer>
        <QuestionContainer>
          <Typography variant="h2">{t('pages.Popup.Ethereum.AddNetwork.entry.question')}</Typography>
        </QuestionContainer>
        <WarningContainer>
          <WarningIconContainer>
            <Info16Icon />
          </WarningIconContainer>
          <WarningTextContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.AddNetwork.entry.warning')}</Typography>
          </WarningTextContainer>
        </WarningContainer>
        <InfoContainer>
          <Info2ColumnsContainer>
            <Info2ColumnsLeftContainer>
              <Typography variant="h5">{t('pages.Popup.Ethereum.AddNetwork.entry.networkName')}</Typography>
            </Info2ColumnsLeftContainer>
            <Info2ColumnsRightContainer>
              <Typography variant="h5">{params.networkName}</Typography>
            </Info2ColumnsRightContainer>
          </Info2ColumnsContainer>

          <Info2ColumnsContainer sx={{ marginTop: '1.2rem' }}>
            <Info2ColumnsLeftContainer>
              <Typography variant="h5">{t('pages.Popup.Ethereum.AddNetwork.entry.chainId')}</Typography>
            </Info2ColumnsLeftContainer>
            <Info2ColumnsRightContainer>
              <Typography variant="h5">{params.chainId}</Typography>
            </Info2ColumnsRightContainer>
          </Info2ColumnsContainer>

          <Info2ColumnsContainer sx={{ marginTop: '1.2rem' }}>
            <Info2ColumnsLeftContainer>
              <Typography variant="h5">{t('pages.Popup.Ethereum.AddNetwork.entry.displayDenom')}</Typography>
            </Info2ColumnsLeftContainer>
            <Info2ColumnsRightContainer>
              <Typography variant="h5">{params.displayDenom}</Typography>
            </Info2ColumnsRightContainer>
          </Info2ColumnsContainer>

          <InfoText2Container sx={{ marginTop: '1.6rem' }}>
            <Typography variant="h5">{t('pages.Popup.Ethereum.AddNetwork.entry.networkURL')}</Typography>
          </InfoText2Container>

          <InfoText1Container sx={{ marginTop: '0.8rem' }}>
            <Typography variant="h5">{params.rpcURL}</Typography>
          </InfoText1Container>

          {params.explorerURL && (
            <>
              <InfoText2Container sx={{ marginTop: '1.6rem' }}>
                <Typography variant="h5">{t('pages.Popup.Ethereum.AddNetwork.entry.explorerURL')}</Typography>
              </InfoText2Container>

              <InfoText1Container sx={{ marginTop: '0.8rem' }}>
                <Typography variant="h5">{params.explorerURL}</Typography>
              </InfoText1Container>
            </>
          )}
        </InfoContainer>
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
            {t('pages.Popup.Ethereum.AddNetwork.entry.cancelButton')}
          </OutlineButton>
          <Button
            onClick={async () => {
              await addEthereumNetwork(params);

              const result: EthcAddNetworkResponse = null;

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
            {t('pages.Popup.Ethereum.AddNetwork.entry.confirmButton')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
