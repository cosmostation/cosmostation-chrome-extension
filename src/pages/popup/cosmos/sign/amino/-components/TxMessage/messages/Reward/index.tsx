import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import PaginationControls from '@/components/PaginationControls';
import {
  AddressContainer,
  Container,
  DetailWrapper,
  Divider,
  LabelContainer,
  MsgTitle,
  MsgTitleContainer,
} from '@/pages/popup/-components/CommonTxMessageStyle';
import type { Msg, MsgReward } from '@/types/cosmos/amino';

type RewardProps = {
  msg: Msg<MsgReward>;
  currentStep: number;
  totalSteps: number;
  onPageChange?: (page: number) => void;
};

export default function Reward({ msg, currentStep, totalSteps, onPageChange }: RewardProps) {
  const { t } = useTranslation();

  const { value } = msg;

  const isMultipleMsgs = totalSteps > 1;

  return (
    <Container>
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{'# Reward Claim'}</MsgTitle>
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
            {t('pages.popup.cosmos.sign.amino.components.TxMessage.messages.Reward.index.delegator')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{value.delegator_address}</Base1300Text>
          </AddressContainer>
        </LabelContainer>
        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.cosmos.sign.amino.components.TxMessage.messages.Reward.index.validator')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{value.validator_address}</Base1300Text>
          </AddressContainer>
        </LabelContainer>
      </DetailWrapper>
    </Container>
  );
}
