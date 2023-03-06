import { Typography } from '@mui/material';

import Tooltip from '~/Popup/components/common/Tooltip';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { shorterAddress } from '~/Popup/utils/string';
import type { Msg, MsgCommission } from '~/types/cosmos/amino';

import { AddressContainer, ContentContainer, LabelContainer, ValueContainer } from './styled';
import Container from '../../components/Container';

type CommissionProps = { msg: Msg<MsgCommission>; isMultipleMsgs: boolean };

export default function Commission({ msg, isMultipleMsgs }: CommissionProps) {
  const { t } = useTranslation();

  return (
    <Container title={t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Commission.index.title')} isMultipleMsgs={isMultipleMsgs}>
      <ContentContainer>
        <AddressContainer sx={{ marginTop: '0.4rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Commission.index.validatorAddress')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Tooltip title={msg.value.validator_address} arrow placement="top">
              <Typography variant="h5">{shorterAddress(msg.value.validator_address, 32)}</Typography>
            </Tooltip>
          </ValueContainer>
        </AddressContainer>
      </ContentContainer>
    </Container>
  );
}
