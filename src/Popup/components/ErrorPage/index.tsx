import { useMemo } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { APTOS } from '~/constants/chain/aptos/aptos';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { SUI } from '~/constants/chain/sui/sui';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { generateMailtoReportLink } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { AptosNetwork, Chain, EthereumNetwork, SuiNetwork } from '~/types/chain';
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
  chain?: Chain;
  network?: EthereumNetwork | AptosNetwork | SuiNetwork;
  queue?: Queue;
};

export default function ErrorPage({ chain, network, queue, ...rest }: EntryProps & FallbackProps) {
  const { deQueue } = useCurrentQueue();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const { pathname } = useLocation();

  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts();

  const { chainName, chainImageURL } = useMemo(() => {
    if (chain) {
      if (chain.line === COSMOS.line) {
        return {
          chainName: chain?.chainName,
          chainImageURL: chain?.imageURL,
        };
      }

      if ([ETHEREUM.line, SUI.line, APTOS.line].includes(chain.line)) {
        return {
          chainName: network?.networkName || chain?.chainName,
          chainImageURL: network?.imageURL || chain?.imageURL,
        };
      }
    }
    return {};
  }, [chain, network?.imageURL, network?.networkName]);

  const isDisplayPopupHeader = useMemo(() => !!queue, [queue]);

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain?.id || ''] || '',
    [accounts.data, chain?.id, currentAccount.id],
  );

  return (
    <Container>
      {isDisplayPopupHeader && (
        <PopupHeader
          account={address ? { ...currentAccount, address } : undefined}
          chain={!!chainName && !!chainImageURL ? { name: chainName, imageURL: chainImageURL } : undefined}
          origin={queue?.origin || '-'}
          className={!address && (!chainName || !chainImageURL) ? 'address-only' : undefined}
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
            <Description2Container>{t('components.ErrorPage.index.description2')}</Description2Container>
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
