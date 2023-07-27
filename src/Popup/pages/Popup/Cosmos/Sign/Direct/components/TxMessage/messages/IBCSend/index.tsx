import { useMemo } from 'react';
import YAML from 'js-yaml';
import { Typography } from '@mui/material';

import { CURRENCY_DECIMALS } from '~/constants/currency';
import Number from '~/Popup/components/common/Number';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { isJsonString } from '~/Popup/utils/common';
import { isEqualsIgnoringCase, shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { Msg, MsgTransfer } from '~/types/cosmos/proto';

import {
  AddressContainer,
  AmountInfoContainer,
  ContentContainer,
  DenomContainer,
  LabelContainer,
  LeftContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightContainer,
  RightValueContainer,
  ValueContainer,
} from './styled';
import Container from '../../components/Container';

type IBCSendProps = {
  msg: Msg<MsgTransfer>;
  chain: CosmosChain;
  isMultipleMsgs: boolean;
};

export default function IBCSend({ msg, chain, isMultipleMsgs }: IBCSendProps) {
  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { coins, ibcCoins } = useCoinListSWR(chain);
  const { t } = useTranslation();

  const { currency } = extensionStorage;
  const { displayDenom, baseDenom, decimals, coinGeckoId } = chain;

  const { value } = msg;

  const { sender, receiver, token, memo, source_channel } = value;

  const itemBaseAmount = useMemo(() => token.amount, [token.amount]);
  const itemBaseDenom = useMemo(() => token.denom, [token.denom]);

  const assetCoinInfo = useMemo(() => coins.find((coin) => isEqualsIgnoringCase(coin.baseDenom, itemBaseDenom)), [coins, itemBaseDenom]);
  const ibcCoinInfo = useMemo(() => ibcCoins.find((coin) => coin.baseDenom === itemBaseDenom), [ibcCoins, itemBaseDenom]);

  const memoData = useMemo(() => {
    if (isJsonString(memo)) {
      const parsedMemo = JSON.parse(memo) as string;
      return YAML.dump(parsedMemo, { indent: 4 });
    }
    return '';
  }, [memo]);

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

    return itemBaseAmount || '0';
  }, [assetCoinInfo?.decimals, baseDenom, decimals, ibcCoinInfo?.decimals, itemBaseAmount, itemBaseDenom]);

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

    return itemBaseDenom.length > 5 ? `${itemBaseDenom.substring(0, 5)}...` : itemBaseDenom;
  }, [assetCoinInfo?.displayDenom, baseDenom, displayDenom, ibcCoinInfo?.displayDenom, itemBaseDenom]);

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
    <Container title="IBC Send" isMultipleMsgs={isMultipleMsgs}>
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Direct.components.TxMessage.messages.IBCSend.index.fromAddress')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(sender, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>
        <AddressContainer sx={{ marginTop: '0.4rem', paddingBottom: '1.2rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Direct.components.TxMessage.messages.IBCSend.index.toAddress')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(receiver, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AmountInfoContainer key={itemBaseDenom}>
          <LeftContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Direct.components.TxMessage.messages.IBCSend.index.amount')}</Typography>
          </LeftContainer>
          <RightContainer>
            <RightColumnContainer>
              <RightAmountContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                  {itemDisplayAmount}
                </Number>
                &nbsp;
                <DenomContainer>
                  <Typography variant="h5n">{itemDisplayDenom}</Typography>
                </DenomContainer>
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
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Direct.components.TxMessage.messages.IBCSend.index.sourceChannel')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{source_channel}</Typography>
          </ValueContainer>
        </AddressContainer>

        {memoData && (
          <AddressContainer sx={{ marginTop: '0.4rem', paddingBottom: '1.2rem' }}>
            <LabelContainer>
              <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Direct.components.TxMessage.messages.IBCSend.index.memo')}</Typography>
            </LabelContainer>
            <ValueContainer>
              <Typography variant="h5">{memoData}</Typography>
            </ValueContainer>
          </AddressContainer>
        )}
      </ContentContainer>
    </Container>
  );
}
