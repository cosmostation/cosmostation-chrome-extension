import { Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';

import { AddressContainer, ContentContainer, LabelContainer, ValueContainer } from './styled';
import Container from '../../components/Container';
import CopyButton from '../../components/CopyButton';
import type { TxMessageProps } from '../../index';

type DeployProps = TxMessageProps;

export default function Deploy({ tx }: DeployProps) {
  const { t } = useTranslation();

  const { data } = tx;

  return (
    <Container title="Contract Deployment">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Deploy.index.data')}</Typography>
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
