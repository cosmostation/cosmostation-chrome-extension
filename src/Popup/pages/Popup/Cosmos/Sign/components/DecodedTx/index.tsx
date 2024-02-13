import { Typography } from '@mui/material';

import InformContatiner from '~/Popup/components/common/InformContainer';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { Container, ContentContainer } from './styled';

type ContainerProps = {
  tx: Record<string | number, unknown>;
};

export default function DecodedTx({ tx }: ContainerProps) {
  const { t } = useTranslation();

  return (
    <Container>
      <InformContatiner varient="info">
        <Typography variant="h6">{t('pages.Popup.Cosmos.Sign.components.DecodedTx.index.warning')}</Typography>
      </InformContatiner>
      <ContentContainer>
        <Typography variant="h6">{JSON.stringify(tx, null, 4)}</Typography>
      </ContentContainer>
    </Container>
  );
}
