import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { Container, DetailWrapper, Divider, LabelContainer, MemoContainer, MsgTitle, MsgTitleContainer } from '@/pages/popup/-components/CommonTxMessageStyle';

import type { TxMessageProps } from '../../index';

type DeployProps = TxMessageProps;

export default function Deploy({ tx }: DeployProps) {
  const { t } = useTranslation();

  const { data } = tx;

  return (
    <Container>
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{'# Contract Deployment'}</MsgTitle>
      </MsgTitleContainer>
      <Divider />
      <DetailWrapper>
        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.evm.transaction.components.TxMessage.messages.Deploy.index.data')}
          </Base1000Text>
          <MemoContainer>
            <Base1300Text variant="b3_M">{data}</Base1300Text>
          </MemoContainer>
        </LabelContainer>
      </DetailWrapper>
    </Container>
  );
}
