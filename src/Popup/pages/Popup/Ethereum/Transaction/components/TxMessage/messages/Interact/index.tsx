import { Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import { shorterAddress } from '~/Popup/utils/string';

import { AddressContainer, ContentContainer, LabelContainer, ValueContainer } from './styled';
import Container from '../../components/Container';
import CopyButton from '../../components/CopyButton';
import type { TxMessageProps } from '../../index';

type TransferFromProps = TxMessageProps;

export default function TransferFrom({ tx }: TransferFromProps) {
  const { t } = useTranslation();

  const { to, data } = tx;

  return (
    <Container title="Contract Interaction">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.contractAddress')}</Typography>
            <CopyButton text={to} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(to, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.8rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.data')}</Typography>
            <CopyButton text={data} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{data}</Typography>
          </ValueContainer>
        </AddressContainer>
      </ContentContainer>
    </Container>
  );
}
