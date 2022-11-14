import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { CURRENCY_DECIMALS } from '~/constants/currency';
import Number from '~/Popup/components/common/Number';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { isEqualsIgnoringCase, shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { Msg, MsgTransfer } from '~/types/cosmos/amino';

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

type IBCSendProps = { msg: Msg<MsgTransfer>; chain: CosmosChain };

export default function IBCSend({ msg, chain }: IBCSendProps) {
  const { chromeStorage } = useChromeStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { coins, ibcCoins } = useCoinListSWR(chain);
  const { t } = useTranslation();

  const { currency } = chromeStorage;
  const { displayDenom, baseDenom, decimals, coinGeckoId } = chain;

  const { value } = msg;

  const { receiver, sender, source_channel, token } = value;

  const itemBaseAmount = token.amount;
  const itemBaseDenom = token.denom;

  const assetCoinInfo = coins.find((coin) => isEqualsIgnoringCase(coin.baseDenom, itemBaseDenom));
  const ibcCoinInfo = ibcCoins.find((coin) => coin.baseDenom === itemBaseDenom);

  const itemDisplayAmount = useMemo(() => {
    if (itemBaseDenom === baseDenom) {
      return toDisplayDenomAmount(itemBaseAmount, decimals);
    }

    if (assetCoinInfo?.decimals) {
      return toDisplayDenomAmount(itemBaseAmount, assetCoinInfo.decimals);
    }

    if (ibcCoinInfo?.decimals) {
      return toDisplayDenomAmount(itemBaseAmount, ibcCoinInfo.decimals);
    }

    if (chain.baseDenom === baseDenom) {
      return toDisplayDenomAmount(itemBaseAmount, chain.decimals);
    }

    return itemBaseAmount || '0';
  }, [assetCoinInfo?.decimals, baseDenom, chain.baseDenom, chain.decimals, decimals, ibcCoinInfo?.decimals, itemBaseAmount, itemBaseDenom]);

  const itemDisplayDenom = useMemo(() => {
    if (itemBaseDenom === baseDenom) {
      return displayDenom.toUpperCase();
    }

    if (assetCoinInfo?.displayDenom) {
      return assetCoinInfo.displayDenom;
    }

    if (ibcCoinInfo?.displayDenom) {
      return ibcCoinInfo.displayDenom;
    }

    if (chain.baseDenom === baseDenom) {
      return chain.displayDenom;
    }

    return itemBaseDenom.length > 5 ? `${itemBaseDenom.substring(0, 5)}...` : itemBaseDenom;
  }, [assetCoinInfo?.displayDenom, baseDenom, chain.baseDenom, chain.displayDenom, displayDenom, ibcCoinInfo?.displayDenom, itemBaseDenom]);

  const itemDisplayValue = useMemo(() => {
    if (itemBaseDenom === baseDenom) {
      const chainPrice = (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0;
      return times(itemDisplayAmount, chainPrice);
    }

    if (assetCoinInfo?.coinGeckoId) {
      const chainPrice = coinGeckoPrice.data?.[assetCoinInfo.coinGeckoId]?.[currency] || 0;

      return times(itemDisplayAmount, chainPrice, CURRENCY_DECIMALS[currency]);
    }

    if (ibcCoinInfo?.coinGeckoId) {
      const chainPrice = coinGeckoPrice.data?.[ibcCoinInfo.coinGeckoId]?.[currency] || 0;
      return times(itemDisplayAmount, chainPrice, CURRENCY_DECIMALS[currency]);
    }

    return '0';
  }, [assetCoinInfo?.coinGeckoId, baseDenom, coinGeckoId, coinGeckoPrice.data, currency, ibcCoinInfo?.coinGeckoId, itemBaseDenom, itemDisplayAmount]);

  return (
    <Container title="IBC Send">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.IBCSend.index.sender')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(sender, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.4rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.IBCSend.index.receiver')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(receiver, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AmountInfoContainer key={itemBaseDenom}>
          <LeftContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.IBCSend.index.amount')}</Typography>
          </LeftContainer>
          <RightContainer>
            <RightColumnContainer>
              <RightAmountContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                  {itemDisplayAmount}
                </Number>
                &nbsp;
                <Typography variant="h5n">{itemDisplayDenom}</Typography>
              </RightAmountContainer>
              <RightValueContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                  {itemDisplayValue}
                </Number>
              </RightValueContainer>
            </RightColumnContainer>
          </RightContainer>
        </AmountInfoContainer>

        <AddressContainer sx={{ marginTop: '0.4rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.IBCSend.index.sourceChannel')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{source_channel}</Typography>
          </ValueContainer>
        </AddressContainer>
      </ContentContainer>
    </Container>
  );
}
