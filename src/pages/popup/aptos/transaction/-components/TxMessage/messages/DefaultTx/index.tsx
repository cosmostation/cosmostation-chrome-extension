import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { Container, DetailWrapper, Divider, LabelContainer, MemoContainer, MsgTitle, MsgTitleContainer } from '@/pages/popup/-components/CommonTxMessageStyle';

import type { TxMessageProps } from '../..';

type DefaultTxProps = TxMessageProps;

export default function DefaultTx({ displayTxString }: DefaultTxProps) {
  const { t } = useTranslation();

  return (
    <Container>
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{'# Transaction'}</MsgTitle>
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
            {t('pages.popup.sui.sign.transaction.components.TxMessage.messages.DefaultTx.index.data')}
          </Base1000Text>
          <MemoContainer>
            <Base1300Text variant="b3_M">{displayTxString}</Base1300Text>
          </MemoContainer>
        </LabelContainer>
      </DetailWrapper>
    </Container>
  );
}
