import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import {
  AddressContainer,
  Container,
  DetailWrapper,
  Divider,
  LabelContainer,
  MemoContainer,
  MsgTitle,
  MsgTitleContainer,
} from '@/pages/popup/-components/CommonTxMessageStyle';
import { capitalize } from '@/utils/string';

import type { TxMessageProps } from '../../index';

type OneInchSwapProps = TxMessageProps;

export default function OneInchSwap({ tx, determineTxType }: OneInchSwapProps) {
  const { t } = useTranslation();

  const { to, data } = tx;

  return (
    <Container>
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{`# ${capitalize(determineTxType?.txDescription?.name || 'swap')} (1inch)`}</MsgTitle>
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
            {t('pages.popup.evm.transaction.components.TxMessage.messages.OneInchSwap.index.contractAddress')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{to}</Base1300Text>
          </AddressContainer>
        </LabelContainer>

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.evm.transaction.components.TxMessage.messages.OneInchSwap.index.data')}
          </Base1000Text>
          <MemoContainer>
            <Base1300Text variant="b3_M">{data}</Base1300Text>
          </MemoContainer>
        </LabelContainer>
      </DetailWrapper>
    </Container>
  );
}
