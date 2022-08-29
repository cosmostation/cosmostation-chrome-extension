import { useState } from 'react';
import { Typography } from '@mui/material';

import { COSMOS_CHAINS } from '~/constants/chain';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import warningImg from '~/images/etc/warning.gif';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentAutoSigns } from '~/Popup/hooks/useCurrent/useCurrentAutoSigns';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useInterval } from '~/Popup/hooks/useInterval';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { responseToWeb } from '~/Popup/utils/message';
import { timeToString } from '~/Popup/utils/string';
import type { Queue } from '~/types/chromeStorage';
import type { CosSetAutoSign, CosSetAutoSignResponse } from '~/types/message/cosmos';

import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentsContainer,
  InfoContainer,
  InfoContentContainer,
  InfoTitleContainer,
  QuestionTextContainer,
  WarningContainer,
  WarningImageContainer,
  WarningRedTextContainer,
  WarningWhiteTextContainer,
} from './styled';

type EntryProps = {
  queue: Queue<CosSetAutoSign>;
};

const currentTime = new Date().getTime();

export default function Entry({ queue }: EntryProps) {
  const { deQueue } = useCurrentQueue();
  const { currentAccount } = useCurrentAccount();
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();

  const { addAutoSign } = useCurrentAutoSigns();

  const cosmosChains = [...COSMOS_CHAINS, ...currentCosmosAdditionalChains];

  const { t } = useTranslation();

  const { message, messageId, origin } = queue;

  const { params } = message;

  const duration = params.duration * 1000;

  const startTime = currentTime;
  const endTime = startTime + duration;

  const chain = cosmosChains.find((item) => item.chainName === params.chainName);

  const [count, setCount] = useState(3);

  useInterval(() => {
    if (count > 0) {
      setCount((prev) => prev - 1);
    }
  }, 500);

  if (!chain) {
    return null;
  }

  return (
    <Container>
      <PopupHeader origin={origin} account={currentAccount} chain={{ name: chain.chainName, imageURL: chain.imageURL }} />
      <ContentsContainer>
        <QuestionTextContainer>
          <Typography variant="h2">{t('pages.Popup.Cosmos.AutoSign.entry.question')}</Typography>
        </QuestionTextContainer>

        <WarningContainer>
          <WarningImageContainer>
            <Image src={warningImg} />
          </WarningImageContainer>
          <WarningRedTextContainer sx={{ marginTop: '0.4rem' }}>
            <Typography variant="h2">{t('pages.Popup.Cosmos.AutoSign.entry.warning')}</Typography>
          </WarningRedTextContainer>
          <WarningWhiteTextContainer sx={{ marginTop: '0.4rem' }}>
            <Typography variant="h5">{t('pages.Popup.Cosmos.AutoSign.entry.description1')}</Typography>
          </WarningWhiteTextContainer>
          <WarningWhiteTextContainer sx={{ marginTop: '1.6rem' }}>
            <Typography variant="h5">{t('pages.Popup.Cosmos.AutoSign.entry.description2')}</Typography>
          </WarningWhiteTextContainer>
        </WarningContainer>

        <InfoContainer>
          <InfoTitleContainer>
            <Typography variant="h5">End Time</Typography>
          </InfoTitleContainer>
          <InfoContentContainer>
            <Typography variant="h4">~ {timeToString(endTime)}</Typography>
          </InfoContentContainer>
        </InfoContainer>
      </ContentsContainer>

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
              await addAutoSign({ accountId: currentAccount.id, chainId: chain.id, duration, origin, startTime });

              const result: CosSetAutoSignResponse = null;

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
            disabled={!!count}
          >
            {count > 0 ? count : 'Confirm'}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
