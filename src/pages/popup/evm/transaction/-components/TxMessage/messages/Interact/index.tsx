import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useParseFunctionName } from '@/hooks/evm/useParseFunctionName';
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

import type { TxMessageProps } from '../../index';

type InteractProps = TxMessageProps;

export default function Interact({ tx }: InteractProps) {
  const { t } = useTranslation();
  const { data: parsedFunctionName } = useParseFunctionName({ txDataSignautre: tx.data ? tx.data?.slice(0, 10) : '' });

  const { to, data } = tx;

  return (
    <Container>
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{'# Contract Interaction'}</MsgTitle>
      </MsgTitleContainer>
      <Divider />

      <DetailWrapper>
        {parsedFunctionName && (
          <LabelContainer>
            <Base1000Text
              variant="b3_R"
              sx={{
                marginBottom: '0.4rem',
              }}
            >
              {t('pages.popup.evm.transaction.components.TxMessage.messages.Interact.index.function')}
            </Base1000Text>
            <AddressContainer>
              <Base1300Text variant="b3_M">{parsedFunctionName}</Base1300Text>
            </AddressContainer>
          </LabelContainer>
        )}

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.evm.transaction.components.TxMessage.messages.Interact.index.contractAddress')}
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
            {t('pages.popup.evm.transaction.components.TxMessage.messages.Interact.index.data')}
          </Base1000Text>
          <MemoContainer>
            <Base1300Text variant="b3_M">{data}</Base1300Text>
          </MemoContainer>
        </LabelContainer>
      </DetailWrapper>
    </Container>
  );
}
