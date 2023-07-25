import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import { shorterAddress } from '~/Popup/utils/string';

import { AddressContainer, ContentContainer, LabelContainer, ValueContainer } from './styled';
import type { TxMessageProps } from '../../../..';
import Container from '../../../../components/Container';
import CopyButton from '../../../../components/CopyButton';

type ERC1155SafeTransferFromProps = TxMessageProps;

export default function ERC1155SafeTransferFrom({ tx, determineTxType }: ERC1155SafeTransferFromProps) {
  const { t } = useTranslation();
  const { to } = tx;

  const contractAddress = useMemo(() => shorterAddress(to, 32), [to]);
  const fromAddress = useMemo(() => (determineTxType?.txDescription?.args?.[0] as undefined | string) || '', [determineTxType?.txDescription?.args]);
  const toAddress = useMemo(() => (determineTxType?.txDescription?.args?.[1] as undefined | string) || '', [determineTxType?.txDescription?.args]);
  return (
    <Container title="SafeTransferFrom (ERC1155)">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">
              {t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.NFT.ERC1155.SafeTransferFrom.index.contractAddress')}
            </Typography>
            <CopyButton text={to} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{contractAddress}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.8rem' }}>
          <LabelContainer>
            <Typography variant="h5">
              {t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.NFT.ERC1155.SafeTransferFrom.index.fromAddress')}
            </Typography>
            <CopyButton text={fromAddress} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(fromAddress, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.4rem' }}>
          <LabelContainer>
            <Typography variant="h5">
              {t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.NFT.ERC1155.SafeTransferFrom.index.toAddress')}
            </Typography>
            <CopyButton text={toAddress} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(toAddress, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>
      </ContentContainer>
    </Container>
  );
}
