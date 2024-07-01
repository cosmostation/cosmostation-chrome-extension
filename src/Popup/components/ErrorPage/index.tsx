import { useMemo } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { generateMailtoReportLink } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { Chain } from '~/types/chain';
import type { Queue } from '~/types/extensionStorage';

import {
  BottomContainer,
  Container,
  ContentsContainer,
  Description2Container,
  DescriptionContainer,
  ReportButton,
  ReportContainer,
  TitleContainer,
  WrapperContainer,
} from './styled';
import Button from '../common/Button';
import PopupHeader from '../PopupHeader';

import Error80Icon from '~/images/icons/Error80.svg';

type EntryProps = {
  queue?: Queue;
  chain?: Chain;
};

export default function ErrorPage({ queue, chain, ...rest }: EntryProps & FallbackProps) {
  const { deQueue } = useCurrentQueue();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const { pathname } = useLocation();

  const { extensionStorage } = useExtensionStorage();

  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts();

  const { currentChain } = useCurrentChain();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { currentAptosNetwork } = useCurrentAptosNetwork();
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const selectedChain = useMemo(() => chain || currentChain, [chain, currentChain]);

  const chainName = useMemo(() => {
    if (selectedChain.line === 'COSMOS') {
      return selectedChain.chainName;
    }
    if (selectedChain.line === 'ETHEREUM') {
      return currentEthereumNetwork.networkName;
    }
    if (selectedChain.line === 'SUI') {
      return `${selectedChain.chainName} (${currentSuiNetwork.networkName})`;
    }
    if (selectedChain.line === 'APTOS') {
      return `${selectedChain.chainName} (${currentAptosNetwork.networkName})`;
    }

    return '';
  }, [currentAptosNetwork.networkName, currentEthereumNetwork.networkName, currentSuiNetwork.networkName, selectedChain.chainName, selectedChain.line]);

  const chainImageURL = useMemo(() => {
    if (selectedChain.line === 'COSMOS') {
      return selectedChain.imageURL;
    }
    if (selectedChain.line === 'ETHEREUM') {
      return currentEthereumNetwork.imageURL;
    }
    if (selectedChain.line === 'SUI') {
      return currentSuiNetwork.imageURL;
    }
    if (selectedChain.line === 'APTOS') {
      return currentAptosNetwork.imageURL;
    }

    return '';
  }, [currentAptosNetwork.imageURL, currentEthereumNetwork.imageURL, currentSuiNetwork.imageURL, selectedChain.imageURL, selectedChain.line]);

  const isDisplayPopupHeader = useMemo(() => !!queue, [queue]);

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[selectedChain.id] || '-',
    [selectedChain.id, accounts.data, currentAccount.id],
  );

  return (
    <Container>
      {isDisplayPopupHeader && (
        <PopupHeader
          account={{ ...currentAccount, address }}
          chain={!!chainName && !!chainImageURL ? { name: chainName, imageURL: chainImageURL } : undefined}
          origin={queue?.origin || '-'}
        />
      )}
      <WrapperContainer>
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
                  const { error } = rest;
                  const reportEmailLink = generateMailtoReportLink({ error, pathname, chainName, queue });

                  window.location.href = reportEmailLink;
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
        </BottomContainer>
      </WrapperContainer>
    </Container>
  );
}
