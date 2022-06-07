import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';

import { AddressContainer, ContentContainer, CopyButton, LabelContainer, ValueContainer } from './styled';
import Container from '../../components/Container';
import type { TxMessageProps } from '../../index';

import Copy16Icon from '~/images/icons/Copy16.svg';

type DeployProps = TxMessageProps;

export default function Deploy({ tx }: DeployProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { data } = tx;

  return (
    <Container title="Contract Deployment">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Deploy.index.data')}</Typography>
            <CopyButton
              type="button"
              onClick={() => {
                if (data && copy(data)) {
                  enqueueSnackbar(t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Deploy.index.copied'));
                }
              }}
            >
              <Copy16Icon />
            </CopyButton>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{data}</Typography>
          </ValueContainer>
        </AddressContainer>
      </ContentContainer>
    </Container>
  );
}
