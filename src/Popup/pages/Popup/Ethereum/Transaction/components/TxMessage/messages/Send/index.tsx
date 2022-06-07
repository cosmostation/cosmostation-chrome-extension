import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { toChecksumAddress } from 'ethereumjs-util';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { toHex } from '~/Popup/utils/common';
import { shorterAddress } from '~/Popup/utils/string';

import {
  AddressContainer,
  AmountInfoContainer,
  ContentContainer,
  CopyButton,
  LabelContainer,
  LeftContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightContainer,
  RightValueContainer,
  ValueContainer,
} from './styled';
import Container from '../../components/Container';
import type { TxMessageProps } from '../../index';

import Copy16Icon from '~/images/icons/Copy16.svg';

type SendProps = TxMessageProps;

export default function Send({ tx }: SendProps) {
  const { chromeStorage } = useChromeStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { currentNetwork } = useCurrentEthereumNetwork();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const { currency } = chromeStorage;
  const { displayDenom, coinGeckoId } = currentNetwork;
  const price = (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0;

  const { from, to } = tx;

  const fromAddress = toChecksumAddress(toHex(from, { addPrefix: true }));
  const toAddress = toChecksumAddress(toHex(to, { addPrefix: true }));

  const amount = toHex(tx.value, { addPrefix: true });

  const displayAmount = useMemo(() => {
    try {
      return toDisplayDenomAmount(BigInt(amount).toString(10), currentNetwork.decimals);
    } catch {
      return '0';
    }
  }, [amount, currentNetwork]);

  const value = times(displayAmount, price);

  return (
    <Container title="Send">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Send.index.fromAddress')}</Typography>

            <CopyButton
              type="button"
              onClick={() => {
                if (copy(fromAddress)) {
                  enqueueSnackbar(t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Send.index.copied'));
                }
              }}
            >
              <Copy16Icon />
            </CopyButton>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(fromAddress, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.4rem', paddingBottom: '1.2rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Send.index.toAddress')}</Typography>

            <CopyButton
              type="button"
              onClick={() => {
                if (copy(toAddress)) {
                  enqueueSnackbar(t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Send.index.copied'));
                }
              }}
            >
              <Copy16Icon />
            </CopyButton>
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
