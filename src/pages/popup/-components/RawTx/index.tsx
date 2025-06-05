import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import CopyButton from '@/components/CopyButton';
import { safeStringify } from '@/utils/string';

import { Container, Header, HeaderTitle, TxDataContainer } from './styled';

type ContainerProps = {
  tx: Record<string | number, unknown>;
};

export default function RawTx({ tx }: ContainerProps) {
  const { t } = useTranslation();

  const jsonString = safeStringify(tx);

  return (
    <Container>
      <Header>
        <HeaderTitle>
          <Typography variant="h2_B">{t('pages.popup.components.RawTx.title')}</Typography>
          <CopyButton
            varient="dark"
            iconSize={{
              width: 1.6,
              height: 1.6,
            }}
            copyString={jsonString}
          />
        </HeaderTitle>
      </Header>
      <TxDataContainer>
        <Base1000Text variant="b3_M_Multiline">{jsonString}</Base1000Text>
      </TxDataContainer>
    </Container>
  );
}
