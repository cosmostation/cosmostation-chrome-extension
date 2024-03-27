import { useMemo } from 'react';
import type { BigNumber } from 'bignumber.js';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import { useTokensSWR } from '~/Popup/hooks/SWR/ethereum/useTokensSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { isEqualsIgnoringCase, shorterAddress } from '~/Popup/utils/string';

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

type TransferFromProps = TxMessageProps;

export default function TransferFrom({ tx, determineTxType }: TransferFromProps) {
  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const tokens = useTokensSWR();
  const { t } = useTranslation();

  const { currency } = extensionStorage;

  const { to } = tx;

  const token = useMemo(() => tokens.data.find((item) => isEqualsIgnoringCase(to, item.address)), [to, tokens.data]);

  const price = useMemo(
    () => (token?.coinGeckoId && coinGeckoPrice.data?.[token.coinGeckoId]?.[currency]) || 0,
    [coinGeckoPrice.data, currency, token?.coinGeckoId],
  );

  const tokenAddress = useMemo(() => token?.displayDenom || shorterAddress(to, 32), [to, token?.displayDenom]);
  const fromAddress = useMemo(() => (determineTxType?.txDescription?.args?.[0] as undefined | string) || '', [determineTxType?.txDescription?.args]);
  const toAddress = useMemo(() => (determineTxType?.txDescription?.args?.[1] as undefined | string) || '', [determineTxType?.txDescription?.args]);
  const amount = useMemo(
    () => (determineTxType?.txDescription?.args?.[2] as BigNumber | undefined)?.toString(10) || '',
    [determineTxType?.txDescription?.args],
  );

  const displayAmount = useMemo(() => {
    try {
      return toDisplayDenomAmount(BigInt(amount).toString(10), token?.decimals || 0);
    } catch {
      return '0';
    }
  }, [amount, token?.decimals]);

  const value = useMemo(() => times(displayAmount, price), [displayAmount, price]);

  return (
    <Container title="TransferFrom (ERC20)">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.TransferFrom.index.tokenAddress')}</Typography>
            <CopyButton text={to} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{tokenAddress}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.8rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.TransferFrom.index.fromAddress')}</Typography>
            <CopyButton text={fromAddress} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(fromAddress, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.4rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.TransferFrom.index.toAddress')}</Typography>
            <CopyButton text={toAddress} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(toAddress, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AmountInfoContainer sx={{ marginTop: '0.4rem' }}>
          <LeftContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.TransferFrom.index.amount')}</Typography>
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
        </AmountInfoContainer>
      </ContentContainer>
    </Container>
  );
}
