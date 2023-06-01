import { Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import { shorterAddress } from '~/Popup/utils/string';

import { AddressContainer, ContentContainer, LabelContainer, ValueContainer } from './styled';
import type { TxMessageProps } from '../../../..';
import Container from '../../../../components/Container';
import CopyButton from '../../../../components/CopyButton';

type TransferFromProps = TxMessageProps;

export default function ERC721TransferFrom({ tx, determineTxType }: TransferFromProps) {
  const { t } = useTranslation();
  const { to } = tx;

  const contractAddress = shorterAddress(to, 32);
  const fromAddress = (determineTxType?.txDescription?.args?.[0] as undefined | string) || '';
  const toAddress = (determineTxType?.txDescription?.args?.[1] as undefined | string) || '';

  return (
    <Container title="TransferFrom (ERC721)">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">
              {t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.NFT.ERC721.TransferFrom.index.contractAddress')}
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
              {t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.NFT.ERC721.TransferFrom.index.fromAddress')}
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
              {t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.NFT.ERC721.TransferFrom.index.toAddress')}
            </Typography>
            <CopyButton text={toAddress} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(toAddress, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>
        {/* 
        <AmountInfoContainer sx={{ marginTop: '0.4rem' }}>
          <LeftContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.NFT.ERC721.TransferFrom.index.amount')}</Typography>
          </LeftContainer>
          <RightContainer>
            <RightColumnContainer>
              <RightAmountContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                  {displayAmount}
                </Number>
                &nbsp;
                <Typography variant="h5n">{token?.displayDenom}</Typography>
              </RightAmountContainer>
              <RightValueContainer>
                {value !== '0' && (
                  <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                    {value}
                  </Number>
                )}
              </RightValueContainer>
            </RightColumnContainer>
          </RightContainer>
        </AmountInfoContainer> */}
      </ContentContainer>
    </Container>
  );
}
