import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import {
  AddressContainer,
  Container,
  DetailWrapper,
  Divider,
  LabelContainer,
  MsgTitle,
  MsgTitleContainer,
} from '@/pages/popup/-components/CommonTxMessageStyle';

import type { TxMessageProps } from '../../../..';

type ERC1155SafeTransferFromProps = TxMessageProps;

export default function ERC1155SafeTransferFrom({ tx, determineTxType }: ERC1155SafeTransferFromProps) {
  const { t } = useTranslation();

  const { to } = tx;

  const contractAddress = to;
  const fromAddress = useMemo(() => (determineTxType?.txDescription?.args?.[0] as undefined | string) || '', [determineTxType?.txDescription?.args]);
  const toAddress = useMemo(() => (determineTxType?.txDescription?.args?.[1] as undefined | string) || '', [determineTxType?.txDescription?.args]);

  return (
    <Container>
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{'# SafeTransferFrom (ERC1155)'}</MsgTitle>
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
            {t('pages.popup.evm.transaction.components.TxMessage.messages.NFT.ERC1155.SafeTransferFrom.index.contractAddress')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{contractAddress}</Base1300Text>
          </AddressContainer>
        </LabelContainer>

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.evm.transaction.components.TxMessage.messages.NFT.ERC1155.SafeTransferFrom.index.from')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{fromAddress}</Base1300Text>
          </AddressContainer>
        </LabelContainer>
        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.evm.transaction.components.TxMessage.messages.NFT.ERC1155.SafeTransferFrom.index.to')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{toAddress}</Base1300Text>
          </AddressContainer>
        </LabelContainer>
      </DetailWrapper>
    </Container>
  );
}
