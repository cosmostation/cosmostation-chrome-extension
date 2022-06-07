import { useMemo } from 'react';
import type { BigNumber } from 'bignumber.js';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import { useAssetsSWR } from '~/Popup/hooks/SWR/ethereum/useAssetsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { isEqualsIgnoringCase, shorterAddress } from '~/Popup/utils/string';

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

type TransferProps = TxMessageProps;

export default function Transfer({ tx, determineTxType }: TransferProps) {
  const { chromeStorage } = useChromeStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const assets = useAssetsSWR();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { currency } = chromeStorage;

  const { to } = tx;

  const token = assets.data.find((item) => isEqualsIgnoringCase(to, item.address));

  const price = (token?.coinGeckoId && coinGeckoPrice.data?.[token.coinGeckoId]?.[currency]) || 0;

  const tokenAddress = token?.displayDenom || shorterAddress(to, 32);
  const grantedAddress = (determineTxType?.erc20?.args?.[0] as undefined | string) || '';
  const amount = (determineTxType?.erc20?.args?.[1] as BigNumber | undefined)?.toString(10) || '';

  const displayAmount = useMemo(() => {
    try {
      return toDisplayDenomAmount(BigInt(amount).toString(10), token?.decimals || 0);
    } catch {
      return '0';
    }
  }, [amount, token]);

  const value = times(displayAmount, price);

  return (
    <Container title="Transfer (ERC20)">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Transfer.index.tokenAddress')}</Typography>

            <CopyButton
              type="button"
              onClick={() => {
                if (to && copy(to)) {
                  enqueueSnackbar(t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Transfer.index.copied'));
                }
              }}
            >
              <Copy16Icon />
            </CopyButton>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{tokenAddress}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.8rem', marginBottom: '0.4rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Transfer.index.toAddress')}</Typography>

            <CopyButton
              type="button"
              onClick={() => {
                if (grantedAddress && copy(grantedAddress)) {
                  enqueueSnackbar(t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Transfer.index.copied'));
                }
              }}
            >
              <Copy16Icon />
            </CopyButton>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(grantedAddress, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AmountInfoContainer>
          <LeftContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Transfer.index.amount')}</Typography>
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
