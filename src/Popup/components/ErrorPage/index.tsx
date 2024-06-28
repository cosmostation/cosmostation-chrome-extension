import { useMemo } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { responseToWeb } from '~/Popup/utils/message';
import type { Chain } from '~/types/chain';
import type { Queue } from '~/types/extensionStorage';

import {
  BottomButtonContainer,
  BottomContainer,
  Container,
  ContentsContainer,
  Description2Container,
  DescriptionContainer,
  ReportButton,
  ReportContainer,
  TitleContainer,
} from './styled';
import Button from '../common/Button';
import PopupHeader from '../PopupHeader';

import Error80Icon from '~/images/icons/Error80.svg';

type EntryProps = {
  queue?: Queue;
  chain: Chain;
};

export default function ErrorPage({ queue, chain, ...rest }: EntryProps & FallbackProps) {
  const { deQueue } = useCurrentQueue();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const { pathname } = useLocation();

  const { extensionStorage } = useExtensionStorage();

  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts();

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '-',
    [accounts.data, chain.id, currentAccount.id],
  );

  return (
    <Container>
      <PopupHeader account={{ ...currentAccount, address }} chain={{ name: chain.chainName, imageURL: chain.imageURL }} origin={queue?.origin || '-'} />
      <ContentsContainer>
        <Error80Icon />
        <TitleContainer>
          <Typography variant="h2">{t('components.ErrorPage.index.error')}</Typography>
        </TitleContainer>
        <DescriptionContainer>
          <Typography variant="h5">{t('components.ErrorPage.index.description1')}</Typography>
          <Description2Container data-theme-type={extensionStorage.theme}>{t('components.ErrorPage.index.description2')}</Description2Container>
        </DescriptionContainer>
      </ContentsContainer>
      <BottomContainer>
        <ReportContainer>
          <Typography variant="h6">{t('components.ErrorPage.index.feedback')}</Typography>
          <ReportButton
            type="button"
            onClick={() => {
              try {
                const extensionManifest = chrome.runtime.getManifest();

                const emailSubject = encodeURIComponent(`Cosmostation Extension Issue Report - Version ${extensionManifest.version}`);

                const { error } = rest;

                const emailBody = encodeURIComponent(`
Hello Cosmostation Support Team,

I would like to report an issue encountered in the app.

Error Description:
Please describe the error you encountered here.
-

Error Details:
- App Version: ${extensionManifest.version}
- Name: ${error.name}
- Message: ${error.message}
- User Action: ${queue?.message.method || ''}
- Origin: ${queue?.origin || ''}
- Channel: ${queue?.channel || ''}
- Path: ${pathname}

Additional Information:
Please provide any additional information that may help us understand the issue better.
-

Thank you for your assistance.

Best regards,
Cosmostation Extension User
              `);

                window.location.href = `mailto:support@cosmostation.io?subject=${emailSubject}&body=${emailBody}`;
              } catch (e) {
                enqueueSnackbar(t('components.ErrorPage.index.emailSendFailure'), { variant: 'error' });
              }
            }}
          >
            <Typography variant="h6">
              <u>{t('components.ErrorPage.index.sendReportEmail')}</u>
            </Typography>
          </ReportButton>
        </ReportContainer>
        <BottomButtonContainer>
          <Button
            onClick={async () => {
              if (queue) {
                const { message, messageId, origin } = queue;
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
              }

              await deQueue();
            }}
          >
            {t('components.ErrorPage.index.confirm')}
          </Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}
