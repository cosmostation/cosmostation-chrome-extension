import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import { shorterAddress } from '~/Popup/utils/string';

import { AddressContainer, ContentContainer, CopyButton, LabelContainer, ValueContainer } from './styled';
import Container from '../../components/Container';
import type { TxMessageProps } from '../../index';

import Copy16Icon from '~/images/icons/Copy16.svg';

type TransferFromProps = TxMessageProps;

export default function TransferFrom({ tx }: TransferFromProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { to, data } = tx;

  return (
    <Container title="Contract Interaction">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.contractAddress')}</Typography>

            <CopyButton
              type="button"
              onClick={() => {
                if (to && copy(to)) {
                  enqueueSnackbar(t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.copied'));
                }
              }}
            >
              <Copy16Icon />
            </CopyButton>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(to, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.8rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.data')}</Typography>

            <CopyButton
              type="button"
              onClick={() => {
                if (data && copy(data)) {
                  enqueueSnackbar(t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.copied'));
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
