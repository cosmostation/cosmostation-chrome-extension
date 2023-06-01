import { Typography } from '@mui/material';

import { CURRENCY_DECIMALS } from '~/constants/currency';
import Number from '~/Popup/components/common/Number';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { isEqualsIgnoringCase, shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { Msg, MsgSend } from '~/types/cosmos/amino';

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

type SendProps = {
  msg: Msg<MsgSend>;
  chain: CosmosChain;
  isMultipleMsgs: boolean;
};

export default function Send({ msg, chain, isMultipleMsgs }: SendProps) {
  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { coins, ibcCoins } = useCoinListSWR(chain);
  const { t } = useTranslation();

  const { currency } = extensionStorage;
  const { displayDenom, baseDenom, decimals, coinGeckoId } = chain;

  const { value } = msg;

  const { amount, from_address, to_address } = value;

  return (
    <Container title="Send" isMultipleMsgs={isMultipleMsgs}>
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Send.index.fromAddress')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(from_address, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.4rem', paddingBottom: '1.2rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Send.index.toAddress')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(to_address, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>
        {amount.map((item, idx) => {
          const itemBaseAmount = item.amount;
          const itemBaseDenom = item.denom;

          const assetCoinInfo = coins.find((coin) => isEqualsIgnoringCase(coin.baseDenom, item.denom));
          const ibcCoinInfo = ibcCoins.find((coin) => coin.baseDenom === item.denom);

          const itemDisplayAmount = (() => {
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
          })();

          const itemDisplayDenom = (() => {
            if (itemBaseDenom === baseDenom) {
              return displayDenom.toUpperCase();
            }

            if (assetCoinInfo?.displayDenom) {
              return assetCoinInfo.displayDenom;
            }

            if (ibcCoinInfo?.displayDenom) {
              return ibcCoinInfo.displayDenom;
            }

            return item.denom.length > 5 ? `${item.denom.substring(0, 5)}...` : item.denom;
          })();

          const itemDisplayValue = (() => {
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
          })();

          return (
            // eslint-disable-next-line react/no-array-index-key
            <AmountInfoContainer key={`${item.denom}${idx}`}>
              <LeftContainer>
                <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Send.index.amount')}</Typography>
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
          );
        })}
      </ContentContainer>
    </Container>
  );
}
