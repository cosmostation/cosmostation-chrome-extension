import { useMemo } from 'react';
import { toChecksumAddress } from 'ethereumjs-util';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { shorterAddress, toHex } from '~/Popup/utils/string';

import {
  AddressContainer,
  AmountInfoContainer,
  ContentContainer,
  LabelContainer,
  LeftContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightContainer,
  RightValueContainer,
  ValueContainer,
} from './styled';
import Container from '../../components/Container';
import CopyButton from '../../components/CopyButton';
import type { TxMessageProps } from '../../index';

type SendProps = TxMessageProps;

export default function Send({ tx }: SendProps) {
  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { t } = useTranslation();

  const { currency } = extensionStorage;
  const { displayDenom, coinGeckoId } = currentEthereumNetwork;
  const price = useMemo(() => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0, [coinGeckoId, coinGeckoPrice.data, currency]);

  const { from, to } = tx;

  const fromAddress = useMemo(() => toChecksumAddress(toHex(from, { addPrefix: true })), [from]);
  const toAddress = useMemo(() => toChecksumAddress(toHex(to, { addPrefix: true })), [to]);

  const amount = useMemo(() => toHex(tx.value, { addPrefix: true }), [tx.value]);

  const displayAmount = useMemo(() => {
    try {
      return toDisplayDenomAmount(BigInt(amount).toString(10), currentEthereumNetwork.decimals);
    } catch {
      return '0';
    }
  }, [amount, currentEthereumNetwork.decimals]);

  const value = times(displayAmount, price);

  return (
    <Container title="Send">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Send.index.fromAddress')}</Typography>
            <CopyButton text={fromAddress} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(fromAddress, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.4rem', paddingBottom: '1.2rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Send.index.toAddress')}</Typography>
            <CopyButton text={toAddress} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(toAddress, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AmountInfoContainer>
          <LeftContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Send.index.amount')}</Typography>
          </LeftContainer>
          <RightContainer>
            <RightColumnContainer>
              <RightAmountContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                  {displayAmount}
                </Number>
                &nbsp;
                <Typography variant="h5n">{displayDenom}</Typography>
              </RightAmountContainer>
              <RightValueContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                  {value}
                </Number>
              </RightValueContainer>
            </RightColumnContainer>
          </RightContainer>
        </AmountInfoContainer>
      </ContentContainer>
    </Container>
  );
}
