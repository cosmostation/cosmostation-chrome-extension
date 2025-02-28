import { useTranslation } from 'react-i18next';
import YAML from 'js-yaml';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import PaginationControls from '@/components/PaginationControls';
import { Container, DetailWrapper, Divider, LabelContainer, MemoContainer, MsgTitle, MsgTitleContainer } from '@/pages/popup/-components/CommonTxMessageStyle';
import type { Msg, MsgCustom } from '@/types/cosmos/amino';

type CustomProps = {
  msg: Msg<MsgCustom>;
  currentStep: number;
  totalSteps: number;
  onPageChange?: (page: number) => void;
};

export default function Custom({ msg, currentStep, totalSteps, onPageChange }: CustomProps) {
  const { t } = useTranslation();

  const isMultipleMsgs = totalSteps > 1;

  const { type, value } = msg;
  const doc = YAML.dump({ type, value }, { indent: 4 });

  return (
    <Container>
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{'# Custom'}</MsgTitle>
        {isMultipleMsgs && onPageChange && <PaginationControls currentPage={currentStep} totalPages={totalSteps} onPageChange={onPageChange} />}
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
            {t('pages.popup.cosmos.sign.amino.components.TxMessage.messages.Custom.index.data')}
          </Base1000Text>
          <MemoContainer>
            <Base1300Text variant="b3_M">{doc}</Base1300Text>
          </MemoContainer>
        </LabelContainer>
      </DetailWrapper>
    </Container>
  );
}
