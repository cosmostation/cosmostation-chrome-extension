import { Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import { shorterAddress } from '~/Popup/utils/string';
import type { Msg, MsgReward } from '~/types/cosmos/amino';

import { AddressContainer, ContentContainer, LabelContainer, ValueContainer } from './styled';
import Container from '../../components/Container';

type IBCSendProps = { msg: Msg<MsgReward>; isMultipleMsgs: boolean };

export default function IBCSend({ msg, isMultipleMsgs }: IBCSendProps) {
  const { t } = useTranslation();

  return (
    <Container title={t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Reward.index.title')} isMultipleMsgs={isMultipleMsgs}>
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Reward.index.delegatorAddress')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(msg.value.delegator_address, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.4rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Reward.index.validatorAddress')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(msg.value.validator_address, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>
      </ContentContainer>
    </Container>
  );
}
